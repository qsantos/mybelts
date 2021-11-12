from contextlib import contextmanager
from typing import Dict, Iterator

from sqlalchemy import Column, DateTime, Integer, String, create_engine, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

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
        session_factory.remove()


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
