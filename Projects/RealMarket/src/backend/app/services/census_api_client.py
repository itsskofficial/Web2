import asyncio
from typing import Dict, List, Any, Literal, Optional
from httpx import AsyncClient, HTTPStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from fastapi import HTTPException
from loguru import logger

from app.schemas.population import FipsCode
from app.core.config import settings

LATEST_PEP_YEAR = 2019 # NOTE: PEP data is not updated as frequently as ACS

# Define a retry strategy for network-related or server-side errors
retry_strategy = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((HTTPStatusError, HTTPException)),
)


class CensusAPIClient:
    """
    A client for interacting with various U.S. Census Bureau APIs.
    Handles request creation, error handling, and data parsing.
    """
    def __init__(self, http_client: AsyncClient):
        self.http_client = http_client
        self.api_key = settings.CENSUS_API_KEY

    @retry_strategy
    async def _make_request(self, url: str, params: Dict[str, Any]) -> List[List[Any]]:
        """A generic, retryable method to make requests to the Census API."""
        try:
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()

            # Handle 204 No Content response from Census API, which indicates no data is available.
            if response.status_code == 204:
                logger.warning(f"Census API returned 204 No Content for {response.request.url}, indicating no data available.")
                return []

            data = response.json()
            if not data or len(data) < 2:
                return []
            return data
        except HTTPStatusError as e:
            logger.error(f"HTTP error calling Census API at {e.request.url}: {e.response.status_code}")
            # Re-raise as HTTPException to be handled by FastAPI's error handling
            raise HTTPException(status_code=503, detail=f"Census API service is unavailable: {e.response.status_code}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during Census API request: {e}")
            raise HTTPException(status_code=500, detail="An internal error occurred while contacting the Census API.")

    def _get_geo_params(self, fips: FipsCode, geo_level: str) -> Dict[str, str]:
        """Constructs the geographic parameters for a Census API request."""
        if geo_level == 'tract':
            return {"for": f"tract:{fips.tract}", "in": f"state:{fips.state}+county:{fips.county}"}
        if geo_level == 'county':
            return {"for": f"county:{fips.county}", "in": f"state:{fips.state}"}
        raise ValueError(f"Unsupported geography level: {geo_level}")

    def _parse_census_value(self, value: str | None) -> int | float | None:
        """
        Safely converts a Census API string value to a number (int or float).
        Handles missing data indicators (negative values) and parsing errors.
        """
        if value is None:
            return None
        try:
            num = float(value)
            if num < 0:  # Census API uses negative values for missing/suppressed data
                return None
            if num.is_integer():
                return int(num)
            return num
        except (ValueError, TypeError):
            return None

    async def fetch_acs_data(
        self,
        fips: FipsCode,
        year: int,
        geo_level: Literal['tract', 'county'],
        variables: List[str],
        endpoint: Literal["acs/acs5", "acs/acs5/subject", "acs/acs5/profile"] = "acs/acs5"
    ) -> Dict[str, Any]:
        base_url = f"https://api.census.gov/data/{year}/{endpoint}"
        params = {
            "get": ",".join(('NAME', *variables)),
            **self._get_geo_params(fips, geo_level),
            "key": self.api_key,
        }

        logger.info(
            f"Fetching {endpoint} data for year {year}, geo: {geo_level}, fips: {fips.state}{fips.county}, vars: {len(variables)}"
        )

        data = await self._make_request(base_url, params)
        if not data:
            # If no data is found (e.g., 204 response), return an empty dict
            # instead of raising an error. This allows processing to continue
            # with partial data, which is crucial for historical trend analysis.
            return {}
        header, values = data[0], data[1]

        # Create a dictionary with raw string values first
        raw_data = dict(zip(header, values))

        processed_data = {}
        # Handle the 'NAME' field separately to keep it as a string
        processed_data['NAME'] = raw_data.get('NAME')

        # Now, parse only the actual census variables as numbers
        for var in variables:
            processed_data[var] = self._parse_census_value(raw_data.get(var))
        return processed_data

    async def fetch_large_acs_dataset(
        self, fips: FipsCode, year: int, geo_level: str, all_vars: List[str]
    ) -> Dict[str, Any]:
        """Fetches a large number of ACS variables by splitting them into multiple requests."""
        merged_results = {}
        # Census API variable limit is around 50
        chunk_size = 45
        for i in range(0, len(all_vars), chunk_size):
            chunk = all_vars[i:i + chunk_size]
            try:
                result = await self.fetch_acs_data(fips, year, geo_level, chunk)
                if result:
                    merged_results.update(result)
            except HTTPException as e:
                # If one chunk fails, log it but continue if possible
                logger.warning(f"Failed to fetch a chunk of ACS data: {e.detail}")
        return merged_results

    async def fetch_pep_county_components(self, fips: FipsCode) -> Optional[Dict[str, Any]]:
        """
        Fetches county-level population and components of change from the Census PEP datasets.
        This requires two separate API calls as POP and components are in different datasets.
        """
        # --- Population ---
        pop_url = f"https://api.census.gov/data/{LATEST_PEP_YEAR}/pep/population"
        pop_params = {
            "get": "POP",
            "for": f"county:{fips.county}", "in": f"state:{fips.state}", "key": self.api_key
        }

        # --- Components ---
        comp_url = f"https://api.census.gov/data/{LATEST_PEP_YEAR}/pep/components"
        comp_vars = "BIRTHS,DEATHS,DOMESTICMIG,INTERNATIONALMIG,NATURALINC"
        comp_params = {
            "get": comp_vars,
            "for": f"county:{fips.county}", "in": f"state:{fips.state}", "key": self.api_key
        }

        try:
            # Run both requests concurrently for efficiency
            pop_task = self._make_request(pop_url, pop_params)
            comp_task = self._make_request(comp_url, comp_params)

            results = await asyncio.gather(pop_task, comp_task, return_exceptions=True)
            pop_result, comp_result = results

            merged_data = {}

            # Process population result
            if isinstance(pop_result, Exception):
                logger.warning(f"Failed to fetch PEP population data: {pop_result}")
            elif pop_result:
                header, values = pop_result[0], pop_result[1]
                merged_data.update(dict(zip(header, [self._parse_census_value(v) for v in values])))

            # Process components result
            if isinstance(comp_result, Exception):
                logger.warning(f"Failed to fetch PEP components data: {comp_result}")
            elif comp_result:
                header, values = comp_result[0], comp_result[1]
                merged_data.update(dict(zip(header, [self._parse_census_value(v) for v in values])))

            # Clean up geo keys from the final dictionary
            merged_data.pop('state', None)
            merged_data.pop('county', None)

            return merged_data if merged_data else None
        except Exception as e:
            logger.error(f"An unexpected error occurred during concurrent PEP fetch: {e}")
            return None

    async def fetch_migration_flows(self, fips: FipsCode) -> Optional[Dict[str, Any]]:
        """Fetches county-to-county migration flow data."""
        base_url = f"https://api.census.gov/data/2022/acs/flows"
        variables = "MOVEDIN,MOVEDOUT,MOVEDNET"
        # Note: This API requires querying for the specific county
        params = {"get": variables, "for": f"county:{fips.county}", "in": f"state:{fips.state}", "key": self.api_key}
        data = await self._make_request(base_url, params)
        if not data: return None
        header, values = data[0], data[1]
        return dict(zip(header, [self._parse_census_value(v) for v in values]))

    async def fetch_walkability_scores(self, address: str, lat: float, lon: float) -> Dict[str, Any] | None:
        if not settings.WALKSCORE_API_KEY:
            logger.warning("WALKSCORE_API_KEY not set. Skipping walkability scores.")
            return None
        base_url = "https://api.walkscore.com/score"
        params = {
            "format": "json",
            "address": address,
            "lat": lat,
            "lon": lon,
            "transit": 1,
            "wsapikey": settings.WALKSCORE_API_KEY,
        }
        try:
            # Note: Tenacity retry is not applied here as it's a non-critical, third-party API
            response = await self.http_client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
            return {
                "walk_score": data.get("walkscore", None),
                "walk_score_description": data.get("description", None),
                "transit_score": data.get("transit", {}).get("score", None),
                "transit_score_description": data.get("transit", {}).get("description", None),
            }
        except (HTTPStatusError, Exception) as e:
            logger.error(f"Could not fetch Walk Score data: {e}")
            return None

    async def fetch_tract_geojson(self, state: str, county: str, tract: str) -> Dict[str, Any]:
        """Fetches the GeoJSON boundary for a specific census tract from the Census TIGERweb API."""
        base_url = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/2/query"
        params = {
            "where": f"STATE='{state}' AND COUNTY='{county}' AND TRACT='{tract}'",
            "outFields": "STATE,COUNTY,TRACT",
            "f": "geojson"
        }
        try:
            response = await self.http_client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
            # The TIGERweb API returns a FeatureCollection. If no features are found, it's a valid but empty collection.
            if not data.get("features"):
                logger.warning(f"No GeoJSON features found for {state}-{county}-{tract}. Returning empty collection.")
                return {"type": "FeatureCollection", "features": []}
            return data
        except HTTPStatusError as e:
            logger.error(f"Failed to fetch GeoJSON for {state}-{county}-{tract}: Client error '{e.response.status_code} {e.response.reason_phrase}' for url '{e.request.url}'")
            raise HTTPException(status_code=503, detail="Could not retrieve geographic data for the tract.")
        except Exception as e:
            logger.error(f"An unexpected error occurred while fetching GeoJSON for {state}-{county}-{tract}: {e}")
            raise HTTPException(status_code=503, detail="Could not retrieve geographic data for the tract.")
