from sqlalchemy import Column, Integer, String, DateTime, func, Text, Float
from sqlalchemy.dialects.sqlite import JSON
from .db import Base

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(64), nullable=False)  # e.g., pexels
    source_id = Column(String(128), nullable=True)  # original id from provider
    source_url = Column(Text, nullable=False)
    url_hash = Column(String(128), nullable=False, unique=True, index=True)
    asset_type = Column(String(32), nullable=False)  # image|video
    filename = Column(String(512), nullable=False)
    local_path = Column(String(1024), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class VideoJob(Base):
    __tablename__ = "video_jobs"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(32), nullable=False, default="queued")
    params = Column(Text, nullable=True)  # JSON string of job params
    output_path = Column(String(1024), nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
