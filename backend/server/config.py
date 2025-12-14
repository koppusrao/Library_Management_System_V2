import os
from dotenv import load_dotenv

load_dotenv()

# -----------------------------
# gRPC Server
# -----------------------------
GRPC_PORT = int(os.getenv("GRPC_PORT", 50051))

# -----------------------------
# Database
# -----------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "❌ DATABASE_URL not set. Add it to backend/.env"
    )

POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 10))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", 20))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", 1800))