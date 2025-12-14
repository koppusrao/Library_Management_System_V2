import logging
import grpc
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("grpc-backend")

def db_action(session, func, context, reqId):
    """
    Safely execute DB logic:
    - catches SQLAlchemy errors
    - rolls back session
    - logs exception
    - aborts with INTERNAL gRPC error
    """
    try:
        return func()
    except SQLAlchemyError as e:
        session.rollback()
        logger.error("Database error", {"reqId": reqId, "error": str(e)})
        context.abort(grpc.StatusCode.INTERNAL, "Database error occurred")
    except Exception as e:
        session.rollback()
        logger.error("Unexpected error", {"reqId": reqId, "error": str(e)})
        context.abort(grpc.StatusCode.INTERNAL, "Unexpected server error")