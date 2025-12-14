# backend/server/constants/status.py

# Canonical loan status values used across the backend.
STATUS_BORROWED = "borrowed"
STATUS_RETURNED = "returned"

# If more statuses are needed later, add here.
VALID_STATUSES = {
    STATUS_BORROWED,
    STATUS_RETURNED,
}

__all__ = [
    "STATUS_BORROWED",
    "STATUS_RETURNED",
    "VALID_STATUSES",
]