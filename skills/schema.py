from contextlib import contextmanager
from typing import Dict, Iterator, List

from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer, LargeBinary, String,
    create_engine, func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker
from sqlalchemy_utils.types.password import PasswordType  # type: ignore

from skills.config import POSTGRES_URI

engine = create_engine(POSTGRES_URI)
session_factory = scoped_session(sessionmaker(bind=engine))
Base = declarative_base(bind=engine)


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


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    name = Column(String, nullable=False, index=True, unique=True)
    password = Column(PasswordType(schemes=['pbkdf2_sha512']), nullable=False)
    is_admin = Column(Boolean, nullable=False, index=True, default=False)

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created,
            'name': self.name,
            'is_admin': self.is_admin,
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
    school_class_id = Column(Integer, ForeignKey('school_class.id', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False, index=True)

    school_class = relationship(
        'SchoolClass',
        foreign_keys=school_class_id,
        back_populates='students',
    )

    belt_attempts = relationship(
        'BeltAttempt',
        foreign_keys='BeltAttempt.student_id',
        back_populates='student',
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'school_class_id': self.school_class_id,
            'name': self.name,
        }


class Belt(Base):
    __tablename__ = 'belt'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    rank = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    color = Column(String, nullable=False, index=True, server_default='')

    belt_attempts = relationship(
        'BeltAttempt',
        foreign_keys='BeltAttempt.belt_id',
        back_populates='belt',
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'rank': self.rank,
            'name': self.name,
            'color': self.color,
        }

    def exchange_ranks(self, other: 'Belt') -> None:
        self.rank, other.rank = other.rank, self.rank


class SkillDomain(Base):
    __tablename__ = 'skill_domain'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    name = Column(String, index=True, nullable=False)

    belt_attempts = relationship(
        'BeltAttempt',
        foreign_keys='BeltAttempt.skill_domain_id',
        back_populates='skill_domain',
    )

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'name': self.name,
        }


class BeltAttempt(Base):
    __tablename__ = 'belt_attempt'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    student_id = Column(Integer, ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    skill_domain_id = Column(Integer, ForeignKey('skill_domain.id', ondelete='CASCADE'), nullable=False)
    belt_id = Column(Integer, ForeignKey('belt.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False, index=True, server_default=func.current_date())
    success = Column(Boolean, index=True, nullable=False)

    student = relationship(
        'Student',
        foreign_keys=student_id,
        back_populates='belt_attempts',
    )

    skill_domain = relationship(
        'SkillDomain',
        foreign_keys=skill_domain_id,
        back_populates='belt_attempts',
    )

    belt = relationship(
        'Belt',
        foreign_keys=belt_id,
        back_populates='belt_attempts',
    )

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
