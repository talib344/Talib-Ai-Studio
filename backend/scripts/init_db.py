# Database initialization helper script
# Usage: python -m backend.scripts.init_db

from app.db import init_db
import asyncio

if __name__ == '__main__':
    asyncio.run(init_db())
