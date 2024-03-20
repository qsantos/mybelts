from __future__ import annotations

from contextlib import contextmanager
from typing import TYPE_CHECKING, Iterator, TypeVar

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

    def deferred(_x: U) -> U:
        ...
else:
    from sqlalchemy.orm import deferred


@contextmanager
def session_context() -> Iterator[scoped_session]:
    """
    (straight from SQLAlchemy's documentation)
    Provides a transactional scope around a series of operations.
    The session is committed on exit : DON'T DO IT YOURSELF
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

    def json(self) -> dict:
        return {
            'id': self.id,
            'created': self.created,
            'username': self.username,
            'is_admin': self.is_admin,
            'last_login': self.last_login,
        }


class Level(Base):
    __tablename__ = 'level'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    name = Column(String, nullable=False, index=True)

    classes: list[Class] = relationship(  # type: ignore
        'Class',
        foreign_keys='Class.level_id',
        back_populates='level',
    )

    exams: list[Exam] = relationship(  # type: ignore
        'Exam',
        foreign_keys='Exam.level_id',
        back_populates='level',
    )

    def json(self) -> dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'name': self.name,
        }


class Class(Base):
    __tablename__ = 'class'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    level_id = Column(Integer, ForeignKey(Level.id, ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False, index=True)

    level = relationship(
        'Level',
        foreign_keys=level_id,
        back_populates='classes',
    )

    students: list[Student] = relationship(  # type: ignore
        'Student',
        foreign_keys='Student.class_id',
        back_populates='class_',
    )

    def json(self) -> dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'level_id': self.level_id,
            'name': self.name,
        }


class Student(Base):
    __tablename__ = 'student'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    user_id = Column(Integer, ForeignKey('user.id', ondelete='CASCADE'), unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey('class.id', ondelete='CASCADE'), nullable=False)
    display_name = Column(String, nullable=False, index=True)
    rank = Column(Integer, nullable=False, index=True, server_default='0')
    can_register_to_waitlist = Column(Boolean, index=True, nullable=False)

    user = relationship(
        'User',
        foreign_keys=user_id,
        back_populates='student',
    )

    class_ = relationship(
        'Class',
        foreign_keys=class_id,
        back_populates='students',
    )

    def json(self) -> dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'user_id': self.user_id,
            'username': self.user.username,
            'last_login': self.user.last_login,
            'class_id': self.class_id,
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

    def json(self) -> dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'rank': self.rank,
            'name': self.name,
            'color': self.color,
            'code': self.code,
        }

    def exchange_ranks(self, other: Belt) -> None:
        self.rank, other.rank = other.rank, self.rank


class SkillDomain(Base):
    __tablename__ = 'skill_domain'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    name = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False, index=True, server_default='')

    def json(self) -> dict:
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

    def json(self) -> dict:
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

    def json(self) -> dict:
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
    level_id = Column(Integer, ForeignKey('level.id', ondelete='CASCADE'), nullable=False)
    belt_id = Column(Integer, ForeignKey('belt.id', ondelete='CASCADE'), nullable=False)
    skill_domain_id = Column(Integer, ForeignKey('skill_domain.id', ondelete='CASCADE'), nullable=False)
    filename = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False, index=True, server_default='')
    file = deferred(Column(LargeBinary, nullable=False))

    level = relationship(
        'Level',
        foreign_keys=level_id,
        back_populates='exams',
    )
    skill_domain = relationship('SkillDomain', foreign_keys=skill_domain_id)
    belt = relationship('Belt', foreign_keys=belt_id)

    def json(self) -> dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'level_id': self.level_id,
            'skill_domain_id': self.skill_domain_id,
            'belt_id': self.belt_id,
            'code': self.code,
            'filename': self.filename,
        }
