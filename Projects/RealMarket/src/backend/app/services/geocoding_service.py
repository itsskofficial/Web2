from typing import Dict, Any
from httpx import AsyncClient, HTTPStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from fastapi import HTTPException
from loguru import logger

from app.schemas.population import FipsCode
from app.core.config import settings

# Use the latest available ACS 5-year data release year for geocoding vintages.
LATEST_ACS_YEAR = 2023

# Define a retry strategy for network-related or server-side errors
retry_strategy = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(HTTPStatusError),
)


class GeocodingService:
    """
    Handles geocoding addresses to find Census FIPS codes.
    Includes a fallback mechanism for increased reliability.
    """
    def __init__(self, http_client: AsyncClient):
        self.http_client = http_client

    async def geocode_address(self, address: str) -> Dict[str, Any]:
        """
        Geocodes an address, trying the primary hybrid geocoder first and falling
        back to the Census oneline geocoder if the primary fails.
        """
        try:
            logger.info(f"Attempting to geocode '{address}' with primary hybrid geocoder.")
            return await self._hybrid_geocode_nominatim_first(address)
        except Exception as e:
            logger.warning(f"Primary hybrid geocoder failed for '{address}': {e}. Attempting fallback.")
            try:
                return await self._oneline_address_geocode_fallback(address)
            except Exception as final_e:
                logger.error(f"All geocoding attempts failed for '{address}': {final_e}")
                raise HTTPException(status_code=404, detail="Address could not be geocoded. Please check for typos or try a more specific address.")

    @retry_strategy
    async def _hybrid_geocode_nominatim_first(self, address: str) -> Dict[str, Any]:
        """
        Geocodes an address using a hybrid approach for maximum accuracy.
        1. Use Nominatim (OpenStreetMap) to get reliable latitude/longitude.
        2. Use the Census Geocoder with these coordinates to get FIPS codes.
        3. Use Census GEOINFO API to fetch reliable tract land area (AREALAND).
        """
        logger.info(f"Starting hybrid geocoding for address: '{address}'")

        # Step 1: Get coordinates from Nominatim
        nominatim_url = "https://nominatim.openstreetmap.org/search"
        params1 = {"q": address, "format": "json", "addressdetails": 1, "limit": 1}
        headers = {"User-Agent": "CapMatch/1.0"}
        try:
            res1 = await self.http_client.get(nominatim_url, params=params1, headers=headers)
            res1.raise_for_status()
            data1 = res1.json()
            if not data1:
                raise ValueError(f"No address matches found by Nominatim for '{address}'")
            lat = float(data1[0]['lat'])
            lon = float(data1[0]['lon'])
        except (HTTPStatusError, Exception) as e:
            logger.warning(f"Nominatim geocoder step failed for '{address}': {e}")
            raise ValueError("Nominatim geocoding failed.") from e

        # Step 2: Get geographies (FIPS) using coordinates from Census API
        geo_url = "https://geocoding.geo.census.gov/geocoder/geographies/coordinates"
        vintage = f"ACS{LATEST_ACS_YEAR}_Current"
        params2 = {"format": "json", "benchmark": "Public_AR_Current", "vintage": vintage, "x": lon, "y": lat}

        res2 = await self.http_client.get(geo_url, params=params2)
        res2.raise_for_status()
        geos = res2.json().get("result", {}).get("geographies", {})

        county = next((g for g in geos.get("Counties", [])), None)
        tract = next((g for g in geos.get("Census Tracts", [])), None)

        if not county or not tract:
            raise ValueError(f"Could not find tract/county for coordinates ({lat}, {lon})")

        fips_dict = {"state": county["STATE"], "county": county["COUNTY"], "tract": tract["TRACT"]}
        aland = int(tract.get("ALAND", 0) or 0)

        # Step 3: Get tract land area (AREALAND) from Census GEOINFO API for better accuracy
        geo_info_url = f"https://api.census.gov/data/{LATEST_ACS_YEAR}/geoinfo"
        geo_params = {
            "get": "AREALAND",
            "for": f"tract:{fips_dict['tract']}",
            "in": f"state:{fips_dict['state']} county:{fips_dict['county']}",
            "key": settings.CENSUS_API_KEY
        }
        try:
            res3 = await self.http_client.get(geo_info_url, params=geo_params)
            res3.raise_for_status()
            geo_data = res3.json()
            if len(geo_data) > 1:
                headers, values = geo_data[0], geo_data[1]
                geo_record = dict(zip(headers, values))
                aland = int(geo_record.get("AREALAND", 0) or 0)
        except Exception as e:
            logger.warning(f"Could not fetch precise land area from GEOINFO API, using fallback. Error: {e}")

        fips_obj = FipsCode(**fips_dict)
        logger.info(f"Successfully geocoded '{address}' with hybrid method to FIPS {fips_obj.state}-{fips_obj.county}-{fips_obj.tract}")
        return {"fips": fips_obj, "coords": {"lat": lat, "lon": lon}, "aland": aland}

    @retry_strategy
    async def _oneline_address_geocode_fallback(self, address: str) -> Dict[str, Any]:
        """Fallback geocoder using the Census Geocoding API (onelineaddress)."""
        base_url = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
        params = {
            "address": address,
            "benchmark": "2020",
            "format": "json",
        }
        response = await self.http_client.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()

        if not data.get("result", {}).get("addressMatches"):
            raise ValueError("No match found by oneline address fallback geocoder.")

        match = data["result"]["addressMatches"][0]
        geographies = match.get("geographies", {})
        tracts = geographies.get("Census Tracts", [{}])

        if not tracts or not tracts[0].get("GEOID"):
            raise ValueError("Census tract information not found via oneline address fallback geocoder.")

        geoid = tracts[0]["GEOID"]
        fips = FipsCode(state=geoid[:2], county=geoid[2:5], tract=geoid[5:])
        coords = match.get("coordinates", {})
        aland = tracts[0].get("AREALAND", 0)

        logger.info(f"Successfully geocoded '{address}' with fallback to FIPS {fips.state}-{fips.county}-{fips.tract}")
        return {"fips": fips, "coords": {"lon": coords.get("x"), "lat": coords.get("y")}, "aland": aland}
