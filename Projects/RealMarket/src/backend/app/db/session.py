from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from loguru import logger

from app.core.config import settings

logger.info("Creating database engine...")
# Create an async engine instance. pool_pre_ping=True helps manage stale connections.
try:
    engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)
    # Log connection details without credentials for security
    db_connection_info = (
        f"DB Engine created for "
        f"host='{settings.POSTGRES_HOST}', "
        f"port='{settings.POSTGRES_PORT}', "
        f"database='{settings.POSTGRES_DB}'"
    )
    logger.info(db_connection_info)
except Exception as e:
    logger.critical(f"FATAL: Failed to create database engine: {e}")
    raise

# Create a configured "AsyncSession" class.
AsyncSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False, # Important for FastAPI
)
logger.info("AsyncSessionLocal session maker configured.")


async def get_db_session() -> AsyncSession:
    """
    FastAPI dependency that provides a database session for a single request.
    """
    logger.debug("Creating new database session.")
    async with AsyncSessionLocal() as session:
        try:
            yield session
            logger.debug("Database session committed and closed successfully.")
        except Exception as e:
            logger.error(f"An exception occurred during database session: {e}")
            await session.rollback()
            logger.warning("Database session rolled back due to exception.")
            raise
