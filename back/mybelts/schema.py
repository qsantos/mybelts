from contextlib import contextmanager
from typing import TYPE_CHECKING, Dict, Iterator, List, TypeVar

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    UniqueConstraint,
    create_engine,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker
from sqlalchemy_utils.types.password import PasswordType  # type: ignore

from mybelts.config import POSTGRES_URI

engine = create_engine(POSTGRES_URI)
session_factory = scoped_session(sessionmaker(bind=engine))
Base = declarative_base(bind=engine)


if TYPE_CHECKING:
    # deferred() is not properly typed in sqlalchemy-stubs
    U = TypeVar('U')

    def deferred(x: U) -> U:
        ...
else:
    from sqlalchemy.orm import deferred


@contextmanager
def session_context() -> Iterator[scoped_session]:
    """
    (straight from SQLAlchemy's documentation)
    Provides a transactional scope around a series of operations.
    The session is commited on exit : DON'T DO IT YOURSELF
    """
    session = session_factory()
    try:
        yield session
        session.commit()
    except SQLAlchemyError:
        session.rollback()
        raise
    finally:
        session_factory.remove()  # type: ignore


class HTTPRequest(Base):
    __tablename__ = 'http_request'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    request_remote_addr = Column(String, nullable=False, index=True)
    request_method = Column(String, nullable=False, index=True)
    request_url = Column(String, nullable=False, index=True)
    request_path = Column(String, nullable=False, index=True)
    request_headers = Column(JSONB, nullable=False, index=True)
    request_body = Column(LargeBinary)
    response_status_code = Column(Integer, nullable=False, index=True)
    response_status = Column(String, nullable=False, index=True)
    response_headers = Column(JSONB, nullable=False, index=True)
    response_body = Column(LargeBinary)


class MissingI18nKey(Base):
    __tablename__ = 'missing_i18n_key'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    language = Column(String, nullable=False, index=True)
    namespace = Column(String, nullable=False, index=True)
    key = Column(String, nullable=False, index=True)


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    username = Column(String, nullable=False, index=True, unique=True)
    password = Column(PasswordType(schemes=['pbkdf2_sha512']), nullable=False)
    is_admin = Column(Boolean, nullable=False, index=True, default=False)
    last_login = Column(DateTime(timezone=True), index=True)

    student = relationship(
        'Student',
        foreign_keys='Student.user_id',
        back_populates='user',
        uselist=False,
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created,
            'username': self.username,
            'is_admin': self.is_admin,
            'last_login': self.last_login,
        }


class ClassLevel(Base):
    __tablename__ = 'class_level'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    prefix = Column(String, nullable=False, index=True)

    school_classes: List['SchoolClass'] = relationship(  # type: ignore
        'SchoolClass',
        foreign_keys='SchoolClass.class_level_id',
        back_populates='class_level',
    )

    exams: List['Exam'] = relationship(  # type: ignore
        'Exam',
        foreign_keys='Exam.class_level_id',
        back_populates='class_level',
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'prefix': self.prefix,
        }


class SchoolClass(Base):
    __tablename__ = 'school_class'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    class_level_id = Column(Integer, ForeignKey(ClassLevel.id, ondelete='CASCADE'), nullable=False)
    suffix = Column(String, nullable=False, index=True)

    class_level = relationship(
        'ClassLevel',
        foreign_keys=class_level_id,
        back_populates='school_classes',
    )

    students: List['Student'] = relationship(  # type: ignore
        'Student',
        foreign_keys='Student.school_class_id',
        back_populates='school_class',
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'class_level_id': self.class_level_id,
            'suffix': self.suffix,
        }


class Student(Base):
    __tablename__ = 'student'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), unique=True, nullable=False)
    school_class_id = Column(Integer, ForeignKey('school_class.id', ondelete='CASCADE'), nullable=False)
    display_name = Column(String, nullable=False, index=True)
    rank = Column(Integer, nullable=False, index=True, server_default='0')
    can_register_to_waitlist = Column(Boolean, index=True, nullable=False)

    user = relationship(
        'User',
        foreign_keys=user_id,
        back_populates='student',
    )

    school_class = relationship(
        'SchoolClass',
        foreign_keys=school_class_id,
        back_populates='students',
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'user_id': self.user_id,
            'username': self.user.username,
            'last_login': self.user.last_login,
            'school_class_id': self.school_class_id,
            'display_name': self.display_name,
            'rank': self.rank,
            'can_register_to_waitlist': self.can_register_to_waitlist,
        }


class Belt(Base):
    __tablename__ = 'belt'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    rank = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False, index=True, server_default='')
    color = Column(String, nullable=False, index=True, server_default='')

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'rank': self.rank,
            'name': self.name,
            'color': self.color,
            'code': self.code,
        }

    def exchange_ranks(self, other: 'Belt') -> None:
        self.rank, other.rank = other.rank, self.rank


class SkillDomain(Base):
    __tablename__ = 'skill_domain'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    name = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False, index=True, server_default='')

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'name': self.name,
            'code': self.code,
        }


class Evaluation(Base):
    __tablename__ = 'evaluation'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    student_id = Column(Integer, ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    skill_domain_id = Column(Integer, ForeignKey('skill_domain.id', ondelete='CASCADE'), nullable=False)
    belt_id = Column(Integer, ForeignKey('belt.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True, server_default=func.current_date())
    success = Column(Boolean, index=True, nullable=False)

    student = relationship('Student', foreign_keys=student_id)
    skill_domain = relationship('SkillDomain', foreign_keys=skill_domain_id)
    belt = relationship('Belt', foreign_keys=belt_id)

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'student_id': self.student_id,
            'skill_domain_id': self.skill_domain_id,
            'belt_id': self.belt_id,
            'date': self.date.isoformat(),
            'success': self.success,
        }


class WaitlistEntry(Base):
    __tablename__ = 'waitlist_entry'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    student_id = Column(Integer, ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    skill_domain_id = Column(Integer, ForeignKey('skill_domain.id', ondelete='CASCADE'), nullable=False)
    belt_id = Column(Integer, ForeignKey('belt.id', ondelete='CASCADE'), nullable=False)
    last_printed = Column(DateTime(timezone=True), nullable=True, index=True)

    __table_args__ = (
        UniqueConstraint('student_id', 'skill_domain_id'),
    )

    student = relationship('Student', foreign_keys=student_id)
    skill_domain = relationship('SkillDomain', foreign_keys=skill_domain_id)
    belt = relationship('Belt', foreign_keys=belt_id)

    evaluations = relationship(
        'Evaluation',
        foreign_keys=(student_id, skill_domain_id, belt_id),
        primaryjoin=(
            (student_id == Evaluation.student_id) &
            (skill_domain_id == Evaluation.skill_domain_id) &
            (belt_id == Evaluation.belt_id)
        ),
        viewonly=True,
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'student_id': self.student_id,
            'skill_domain_id': self.skill_domain_id,
            'belt_id': self.belt_id,
            'last_printed': self.last_printed,
        }


class Exam(Base):
    __tablename__ = 'exam'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    class_level_id = Column(Integer, ForeignKey('class_level.id', ondelete='CASCADE'), nullable=False)
    belt_id = Column(Integer, ForeignKey('belt.id', ondelete='CASCADE'), nullable=False)
    skill_domain_id = Column(Integer, ForeignKey('skill_domain.id', ondelete='CASCADE'), nullable=False)
    filename = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False, index=True, server_default='')
    file = deferred(Column(LargeBinary, nullable=False))

    class_level = relationship(
        'ClassLevel',
        foreign_keys=class_level_id,
        back_populates='exams',
    )
    skill_domain = relationship('SkillDomain', foreign_keys=skill_domain_id)
    belt = relationship('Belt', foreign_keys=belt_id)

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'class_level_id': self.class_level_id,
            'skill_domain_id': self.skill_domain_id,
            'belt_id': self.belt_id,
            'code': self.code,
            'filename': self.filename,
        }
