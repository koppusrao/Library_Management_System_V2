# backend/server/database/db.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load .env (DATABASE_URL, pool settings, etc.)
load_dotenv()

# ----------------------------------------
# Database URL (mandatory)
# ----------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "❌ DATABASE_URL not set. Add it inside backend/.env\n"
        "Example:\n"
        "DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/library_db"
    )

# ----------------------------------------
# Optional Pool Config (with defaults)
# ----------------------------------------
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 10))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", 20))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", 1800))

# ----------------------------------------
# Create SQLAlchemy Engine (safe + optimized)
# ----------------------------------------
engine = create_engine(
    DATABASE_URL,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_recycle=POOL_RECYCLE,
    pool_pre_ping=True,      # validates connections before use
)

# ----------------------------------------
# Session Factory
# ----------------------------------------
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

# Base class for models
Base = declarative_base()