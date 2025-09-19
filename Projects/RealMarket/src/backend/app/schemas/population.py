from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union

# --- Request and Foundational Schemas (Largely Unchanged) ---
class MarketDataRequest(BaseModel):
    """Schema for the incoming market data POST request."""
    address: str = Field(..., description="A full U.S. address.")

class CacheDeleteRequest(BaseModel):
    """Schema for the cache deletion request."""
    address: str = Field(..., description="The exact address to remove from the cache.")

class PopulationTrendPoint(BaseModel):
    year: int
    population: int
    is_projection: bool = False

class Coordinates(BaseModel):
    lat: float
    lon: float

class WalkabilityScores(BaseModel):
    walk_score: Optional[int] = None
    walk_score_description: Optional[str] = None
    transit_score: Optional[int] = None
    transit_score_description: Optional[str] = None

class BenchmarkData(BaseModel):
    county_trend: List[PopulationTrendPoint]

class ErrorResponse(BaseModel):
    detail: str

# --- NEW: FIPS Code Schema ---
class FipsCode(BaseModel):
    state: str
    county: str
    tract: str

# --- NEW: Schema for a metric with Margin of Error ---
class ValueWithMoe(BaseModel):
    value: Optional[Union[int, float]] = None
    relative_moe: Optional[float] = Field(None, description="Relative Margin of Error (%)")

# --- Core Data Schemas (Modified & New) ---
class GrowthMetrics(BaseModel):
    """Flexible growth metrics based on the requested time period."""
    period_years: int
    cagr: Optional[float] = Field(None, description="Compound Annual Growth Rate (%)")
    yoy_growth: Optional[float] = Field(None, description="Year-over-Year Growth Rate (%) for the most recent year.")
    absolute_change: Optional[int] = Field(None, description="Absolute population change over the period.")

class MigrationData(BaseModel):
    """Data on population change from migration."""
    net_migration: int
    net_migration_rate: float = Field(..., description="Net migration as a percentage of the population.")
    domestic_migration: int
    international_migration: int
    inflows: int
    outflows: int
    gross_migration: int

class NaturalIncreaseData(BaseModel):
    """Data on population change from births and deaths."""
    births: int
    deaths: int
    natural_change: int
    natural_increase_rate: float = Field(..., description="Natural increase (births - deaths) per 1,000 people.")

class PopulationDensity(BaseModel):
    """Population density and its change over time."""
    people_per_sq_mile: float
    change_over_period: Optional[float] = Field(None, description="Change in people per sq mile over the period.")

class PopulationTrend(BaseModel):
    """Historical population trend with projections and benchmarks."""
    trend: List[PopulationTrendPoint]
    projection: List[PopulationTrendPoint]
    benchmark: Optional[BenchmarkData] = None

class AgeDistribution(BaseModel):
    """Schema for the age distribution data."""
    under_18: ValueWithMoe
    age_18_to_34: ValueWithMoe = Field(..., alias="_18_to_34")
    age_35_to_64: ValueWithMoe = Field(..., alias="_35_to_64")
    over_65: ValueWithMoe
    class Config:
        populate_by_name = True


class SexDistribution(BaseModel):
    male: ValueWithMoe
    female: ValueWithMoe
    percent_male: Optional[float] = None
    percent_female: Optional[float] = None

class HouseholdComposition(BaseModel):
    """Metrics related to household types."""
    total_households: Optional[ValueWithMoe] = None
    percent_family_households: Optional[float] = None
    percent_married_couple_family: Optional[float] = None
    percent_non_family_households: Optional[float] = None

class RaceAndEthnicity(BaseModel):
    """Metrics on the racial and ethnic diversity of the area."""
    percent_white_non_hispanic: Optional[float] = None
    percent_black_non_hispanic: Optional[float] = None
    percent_asian_non_hispanic: Optional[float] = None
    percent_hispanic: Optional[float] = None
    percent_other_non_hispanic: Optional[float] = None

class Demographics(BaseModel):
    """Socio-economic and household composition metrics."""
    median_household_income: Optional[ValueWithMoe] = None
    percent_bachelors_or_higher: Optional[float] = None
    avg_household_size: Optional[ValueWithMoe] = None
    household_composition: Optional[HouseholdComposition] = None
    race_and_ethnicity: Optional[RaceAndEthnicity] = None

class EconomicContext(BaseModel):
    """Metrics related to the economic health and lifestyle of the area."""
    poverty_rate: Optional[float] = None
    labor_force_participation_rate: Optional[float] = None
    mean_commute_time_minutes: Optional[ValueWithMoe] = None

class HousingMetrics(BaseModel):
    """Housing market and tenure metrics."""
    percent_renter_occupied: Optional[float] = None
    median_home_value: Optional[ValueWithMoe] = None
    median_gross_rent: Optional[ValueWithMoe] = None
    median_year_structure_built: Optional[ValueWithMoe] = None
    vacancy_rate: Optional[float] = None
    rental_vacancy_rate: Optional[float] = None
    homeowner_vacancy_rate: Optional[float] = None



# --- Main Response Schema (Heavily Modified) ---
class PopulationDataResponse(BaseModel):
    """Final schema for the growth-focused market data response."""
    search_address: str
    data_year: int
    geography_name: str
    geography_level: Literal['tract', 'county']
    fips: FipsCode # <-- UPDATED
    tract_area_sq_meters: int
    coordinates: Coordinates

    # Foundational Metrics
    total_population: ValueWithMoe
    median_age: Optional[ValueWithMoe]

    # Growth Metrics
    growth: GrowthMetrics

    # Driver Metrics
    migration: Optional[MigrationData] = None
    natural_increase: Optional[NaturalIncreaseData] = None

    # Effects / Implications
    population_density: PopulationDensity

    # Composition Metrics
    age_distribution: AgeDistribution
    sex_distribution: Optional[SexDistribution] = None
    demographics: Demographics

    # Housing Metrics
    housing: HousingMetrics

    # Economic Context
    economic_context: Optional[EconomicContext] = None

    # Ancillary Metrics
    walkability: Optional[WalkabilityScores] = None

    # Trend Data
    population_trends: PopulationTrend

    class Config:
        populate_by_name = True
