from contextlib import contextmanager
from typing import Dict, Iterator, List

from sqlalchemy import (
    Column, DateTime, ForeignKey, Integer, String, create_engine, func,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker

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


class ClassLevel(Base):  # type: ignore
    __tablename__ = 'class_level'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    prefix = Column(String, nullable=False, index=True)

    school_classes: List['SchoolClass'] = relationship(  # type: ignore
        'SchoolClass',
        foreign_keys='SchoolClass.class_level_id',
        back_populates='class_level',
    )


class SchoolClass(Base):  # type: ignore
    __tablename__ = 'school_class'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    class_level_id = Column(Integer, ForeignKey(ClassLevel.id, ondelete='CASCADE'), nullable=False)
    suffix = Column(String, nullable=False, index=True)

    class_level = relationship(  # type: ignore
        'ClassLevel',
        foreign_keys=class_level_id,
        back_populates='school_classes',
    )

    students: List['Student'] = relationship(  # type: ignore
        'Student',
        foreign_keys='Student.school_class_id',
        back_populates='school_class',
    )


class Student(Base):  # type: ignore
    __tablename__ = 'student'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    school_class_id = Column(Integer, ForeignKey('school_class.id', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False, index=True)

    school_class: SchoolClass = relationship(  # type: ignore
        'SchoolClass',
        foreign_keys=school_class_id,
        back_populates='students',
    )


class Belt(Base):  # type: ignore
    __tablename__ = 'belt'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    rank = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)

    def json(self) -> Dict:
        return {
            'id': self.id,
            'created': self.created.isoformat(),
            'rank': self.rank,
            'name': self.name,
        }

    def exchange_ranks(self, other: 'Belt') -> None:
        self.rank, other.rank = other.rank, self.rank
