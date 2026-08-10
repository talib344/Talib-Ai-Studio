from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/db.sqlite3")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Ensure models are imported so metadata is populated before create_all
try:
    from . import models  # noqa: F401
except Exception:
    # in some execution contexts models may not be available yet
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    """Create database tables based on SQLAlchemy models."""
    # Ensure parent directory exists (in case the DATABASE_URL points to a file)
    if DATABASE_URL.startswith("sqlite"):
        # extract file path
        try:
            path = DATABASE_URL.split("///", 1)[1]
            parent = os.path.dirname(path)
            if parent:
                os.makedirs(parent, exist_ok=True)
        except Exception:
            pass

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
