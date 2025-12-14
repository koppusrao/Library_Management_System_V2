from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database.db import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(Text, nullable=False)
    author = Column(Text, nullable=False)
    isbn = Column(String(32))
    published_year = Column(Integer)
    copies_total = Column(Integer, default=1)
    copies_available = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)