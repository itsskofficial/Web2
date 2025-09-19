# src/backend/app/models/population.py
from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.db.db_base_class import Base

class PopulationCache(Base):
    """SQLAlchemy model for the population data cache."""
    __tablename__ = "population_cache"

    id = Column(Integer, primary_key=True, index=True)
    # A normalized version of the address to act as the cache key.
    address_key = Column(String, unique=True, index=True, nullable=False)
    # The full JSON response from the service, stored for quick retrieval.
    response_data = Column(JSON, nullable=False)
    # Timestamp for when the record was created.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # Timestamp for when the record was last updated.
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)