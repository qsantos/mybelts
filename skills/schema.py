from sqlalchemy import Column, DateTime, Integer, String, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

from skills.config import POSTGRES_URI

engine = create_engine(POSTGRES_URI)
session_factory = scoped_session(sessionmaker(bind=engine))
Base = declarative_base(bind=engine)


class Belt(Base):  # type: ignore
    __tablename__ = 'belt'
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    rank = Column(Integer, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
