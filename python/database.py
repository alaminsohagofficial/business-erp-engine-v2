"""
Database & Redis Configuration
File: python/database.py

Description:
Establishes SQLAlchemy database sessions and Redis client instances
for background workers and async sync workflows.
"""

import os
import redis
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Retrieve database connection URLs from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vatone_erp.db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# SQLAlchemy Engine and Session Initialization
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis Connection Initialization
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def get_db():
    """
    Dependency generator function that yields an active database session
    and ensures proper teardown after request execution.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
