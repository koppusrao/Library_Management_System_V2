# backend/server/db.py

import os
from sqlalchemy import (
    create_engine, Column, Integer, String, Text,
    DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from dotenv import load_dotenv

# ---------------------------------------------------------
# Load .env (for DATABASE_URL)
# ---------------------------------------------------------
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "❌ DATABASE_URL not set. Please add it in your .env file:\n"
        "DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/library_db"
    )

# ---------------------------------------------------------
# Database Engine (SAFE connection pooling)
# ---------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

# ---------------------------------------------------------
# MODELS (unchanged — no breaking changes)
# ---------------------------------------------------------
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


class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)

    borrowed_at = Column(DateTime, default=datetime.utcnow)
    returned_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="borrowed")

    # Keeping the same type (DateTime) to avoid breaking BorrowBook logic
    due_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---------------------------------------------------------
# DB Helper
# ---------------------------------------------------------
class DB:
    def __init__(self):
        self.session = SessionLocal()

    def get_all_loans(self):
        return self.session.query(Loan).all()

    def get_loans_for_member(self, member_id: int):
        return self.session.query(Loan).filter(Loan.member_id == member_id).all()

    def create_book(self, book: Book):
        self.session.add(book)
        self.session.commit()
        self.session.refresh(book)
        return book

    def create_member(self, member: Member):
        self.session.add(member)
        self.session.commit()
        self.session.refresh(member)
        return member