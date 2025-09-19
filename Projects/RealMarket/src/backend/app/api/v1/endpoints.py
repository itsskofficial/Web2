# src/backend/app/api/v1/endpoints.py
from fastapi import APIRouter, Depends, HTTPException, Request, Response, Query, Security
from typing import Annotated, List, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
import time

from app.schemas.population import MarketDataRequest, PopulationDataResponse, ErrorResponse, CacheDeleteRequest
from app.services.census_service import CensusService
from app.db.session import get_db_session
from app.api.deps import get_current_user

# --- Dependency Injection Setup ---
# By creating service instances here, FastAPI can manage their lifecycle.
# This is a placeholder for a more robust dependency injection system if needed.
from httpx import AsyncClient
from app.services.cache_manager import CacheManager
from app.services.geocoding_service import GeocodingService
from app.services.census_api_client import CensusAPIClient
from app.services.data_processor import DataProcessor

# Create a single HTTP client to be shared across services for connection pooling
http_client = AsyncClient(timeout=20.0)

def get_cache_manager(): return CacheManager()
def get_data_processor(): return DataProcessor()
def get_geocoding_service(): return GeocodingService(http_client)
def get_census_api_client(): return CensusAPIClient(http_client)

# The main CensusService depends on the other services
def get_census_service(
    cache: CacheManager = Depends(get_cache_manager),
    geocoder: GeocodingService = Depends(get_geocoding_service),
    api_client: CensusAPIClient = Depends(get_census_api_client),
    processor: DataProcessor = Depends(get_data_processor)
) -> CensusService:
    return CensusService(cache, geocoder, api_client, processor)

router = APIRouter()
CensusServiceDep = Annotated[CensusService, Depends(get_census_service)]
DBSessionDep = Annotated[AsyncSession, Depends(get_db_session)]

@router.post(
    "/market-data",
    response_model=PopulationDataResponse,
    summary="Get Population Metrics by Address",
    description="Accepts an address and returns key population metrics for the census tract.",
    responses={
        404: {"model": ErrorResponse, "description": "Address or data not found"},
        503: {"model": ErrorResponse, "description": "External service unavailable"},
    },
)
async def get_market_data(
    fastapi_request: Request,
    request: MarketDataRequest,
    service: CensusServiceDep,
    db_session: DBSessionDep,
    current_user: dict = Security(get_current_user),
):
    start_time = time.time()
    client_host = fastapi_request.client.host if fastapi_request.client else "unknown"
    logger.info(f"Received /market-data request from {client_host} for address: '{request.address}'")
    
    try:
        result = await service.get_market_data_for_address(
            address=request.address,
            db=db_session
        )
        process_time = (time.time() - start_time) * 1000
        logger.info(f"Successfully processed request for '{request.address}' in {process_time:.2f}ms.")
        return result
    except HTTPException as e:
        process_time = (time.time() - start_time) * 1000
        logger.warning(f"HTTPException for '{request.address}': Status={e.status_code}, Detail='{e.detail}'. Processed in {process_time:.2f}ms.")
        raise e
    except Exception:
        process_time = (time.time() - start_time) * 1000
        logger.exception(f"An unexpected error occurred for '{request.address}'. Processed in {process_time:.2f}ms.")
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred.")

@router.get(
    "/tract-geojson",
    response_model=Dict[str, Any],
    summary="Get Census Tract GeoJSON Boundary",
    description="Fetches the GeoJSON polygon for a given census tract.",
    responses={
        404: {"model": ErrorResponse, "description": "Tract not found"},
        503: {"model": ErrorResponse, "description": "External service unavailable"},
    },
)
async def get_tract_geojson(
    service: CensusServiceDep,
    state: str = Query(..., description="State FIPS code"),
    county: str = Query(..., description="County FIPS code"),
    tract: str = Query(..., description="Tract code"),
    current_user: dict = Security(get_current_user),
):
    """
    Provides the GeoJSON boundary for a specific census tract.
    """
    logger.info(f"Received /tract-geojson request for state={state}, county={county}, tract={tract}")
    return await service.get_tract_geojson(state, county, tract)


@router.get(
    "/market-data/cache",
    response_model=List[str],
    summary="Get all cached addresses",
    description="Retrieves a list of all addresses currently in the server-side cache.",
)
async def get_all_cached_data(
    service: CensusServiceDep,
    db_session: DBSessionDep,
    current_user: dict = Security(get_current_user),
):
    """Returns a list of all cached search addresses."""
    logger.info("Received request to list all cached addresses.")
    addresses = await service.get_all_cached_addresses(db=db_session)
    return addresses

@router.delete(
    "/market-data/cache",
    status_code=204,
    summary="Delete a cached address",
    description="Removes a specific address from the server-side cache.",
)
async def delete_cached_data(
    request: CacheDeleteRequest,
    service: CensusServiceDep,
    db_session: DBSessionDep,
    current_user: dict = Security(get_current_user),
):
    """Deletes a cache entry for a given address."""
    logger.info(f"Received request to delete cache for address: '{request.address}'")
    await service.delete_cache_for_address(address=request.address, db=db_session)
    return Response(status_code=204)