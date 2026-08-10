"""SQLAlchemy models."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON

from backend.app.db.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    status = Column(String, default="Draft")
    progress = Column(Integer, default=0)
    script = Column(Text, nullable=True)
    scenes = Column(JSON, nullable=True)
    seo = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
