# backend/server/app.py

import grpc
from concurrent import futures
import time
import logging

# =========================================================
# Load DB + Models (NEW folder structure)
# =========================================================
from database.db import Base, engine
from models.book import Book
from models.member import Member
from models.loan import Loan

# =========================================================
# gRPC Proto + Handler
# =========================================================
import library_pb2_grpc
from handlers import LibraryService

# =========================================================
# Configuration (avoid magic values)
# =========================================================
GRPC_PORT = "50051"

# Basic logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("grpc-server")


# =========================================================
# Initialize Database Schema
# =========================================================
def init_database():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)  # Creates tables if missing
    logger.info("Database ready.")


# =========================================================
# gRPC Server Startup
# =========================================================
def serve():
    init_database()

    # Create gRPC server with thread pool
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    # Register service
    library_pb2_grpc.add_LibraryServicer_to_server(
        LibraryService(),
        server
    )

    # Bind port
    server.add_insecure_port(f"[::]:{GRPC_PORT}")

    logger.info(f"Python gRPC Server running on port {GRPC_PORT}...")
    server.start()

    try:
        # Keep server running (required for gRPC)
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        logger.info("Shutting down gRPC server...")
        server.stop(0)


# =========================================================
# Entrypoint
# =========================================================
if __name__ == "__main__":
    serve()