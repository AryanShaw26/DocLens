import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()


def get_engine():
    db_url = settings.DATABASE_URL

    logger.info(
        "Initializing database connection: %s",
        db_url.split("@")[-1] if "@" in db_url else db_url
    )

    if not db_url.startswith("postgresql"):
        raise RuntimeError(
            f"DocLens requires PostgreSQL. Invalid DATABASE_URL: {db_url.split('@')[-1] if '@' in db_url else db_url}"
        )

    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=1800,
        )

        # Force an actual connection test
        with engine.connect() as connection:
            connection.execute(__import__("sqlalchemy").text("SELECT 1"))

        logger.info("Successfully connected to PostgreSQL.")

        return engine

    except Exception as e:
        logger.error("PostgreSQL connection failed: %s", e)
        raise RuntimeError(
            "Could not connect to PostgreSQL. "
            "Make sure PostgreSQL is running and DATABASE_URL is correct."
        ) from e


engine = get_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()