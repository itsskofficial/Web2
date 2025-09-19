import re
import json
from typing import List, Optional

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError
from loguru import logger

from app.models.population import PopulationCache
from app.schemas.population import PopulationDataResponse

class CacheManager:
    """Handles all database interactions for caching market data."""

    def _generate_cache_key(self, address: str) -> str:
        """Generates a consistent, normalized cache key for an address."""
        normalized_address = re.sub(r'\s+', ' ', address).strip().lower()
        # Versioning the cache key is good practice for when the response schema changes.
        return f"{normalized_address}|tract|5_year_projected_v3"

    async def get_cached_response(self, address: str, db: AsyncSession) -> Optional[PopulationDataResponse]:
        """
        Retrieves and validates a cached response from the database.
        Returns None if not found or if data is invalid.
        """
        cache_key = self._generate_cache_key(address)
        logger.info(f"Checking cache for key: {cache_key}")

        stmt = select(PopulationCache).where(PopulationCache.address_key == cache_key)
        result = await db.execute(stmt)
        cached_data = result.scalars().first()

        if not cached_data:
            logger.info(f"Cache MISS for key: {cache_key}")
            return None

        try:
            # Validate the cached JSON against the current Pydantic model.
            # This prevents serving stale data if the schema has changed.
            validated_response = PopulationDataResponse.model_validate(cached_data.response_data)
            logger.success(f"Cache HIT and validation successful for key: {cache_key}")
            return validated_response
        except ValidationError as e:
            logger.warning(f"Cache data for key '{cache_key}' is invalid. Refetching will be required. Error: {e}")
            # The data is corrupt or outdated, so we treat it as a cache miss.
            return None

    async def set_cached_response(self, address: str, response_data: PopulationDataResponse, db: AsyncSession) -> None:
        """Saves a new response to the cache."""
        cache_key = self._generate_cache_key(address)
        logger.info(f"Saving new data to cache with key: {cache_key}")
        
        # The response_data is a Pydantic model, so we need to dump it to a dict
        # that can be serialized to JSON.
        response_dict = json.loads(response_data.model_dump_json(by_alias=True))

        new_cache_entry = PopulationCache(
            address_key=cache_key,
            response_data=response_dict
        )
        db.add(new_cache_entry)
        await db.commit()
        logger.success(f"Successfully saved data to cache for key: {cache_key}")

    async def get_all_cached_addresses(self, db: AsyncSession) -> List[str]:
        """Retrieves a distinct list of all user-facing addresses from the cache."""
        logger.info("Fetching all cached addresses from the database.")
        
        # JSONB query to extract the 'search_address' field from the response_data column.
        address_column = PopulationCache.response_data['search_address'].as_string().label("search_address")
        
        stmt = select(address_column).distinct().order_by(address_column)
        
        result = await db.execute(stmt)
        addresses = result.scalars().all()
        
        logger.success(f"Found {len(addresses)} unique cached addresses.")
        return addresses

    async def delete_cache_for_address(self, address: str, db: AsyncSession) -> None:
        """Deletes a cache entry for a specific address."""
        cache_key = self._generate_cache_key(address)
        logger.info(f"Attempting to delete cache entry for key: {cache_key}")

        stmt = delete(PopulationCache).where(PopulationCache.address_key == cache_key)
        result = await db.execute(stmt)
        await db.commit()

        if result.rowcount > 0:
            logger.success(f"Successfully deleted {result.rowcount} cache entry for key: {cache_key}")
        else:
            logger.warning(f"No cache entry found for key '{cache_key}' to delete.")