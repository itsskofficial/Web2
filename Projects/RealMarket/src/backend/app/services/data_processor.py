import math
from typing import Dict, List, Any, Optional, Union
import numpy as np
from fastapi import HTTPException
from loguru import logger

from app.schemas.population import (
    PopulationDataResponse, AgeDistribution, Demographics, Coordinates,
    GrowthMetrics, PopulationDensity, PopulationTrend,
    PopulationTrendPoint, BenchmarkData, SexDistribution, HousingMetrics,
    HouseholdComposition, RaceAndEthnicity, EconomicContext, ValueWithMoe
)

LATEST_ACS_YEAR = 2023

class DataProcessor:
    """Contains business logic for calculations, projections, and data formatting."""

    def _create_value_with_moe(self, estimate: Optional[Union[int, float]], moe: Optional[Union[int, float]]) -> ValueWithMoe:
        """Creates a ValueWithMoe object and calculates the relative MOE."""
        relative_moe = None
        if estimate is not None and moe is not None and estimate != 0:
            # Per Census guidance, use absolute value of estimate for RMOE calculation
            relative_moe = round((abs(moe) / abs(estimate)) * 100, 1)
        return ValueWithMoe(value=estimate, relative_moe=relative_moe)

    def _create_sum_with_moe(self, acs_data: Dict[str, Any], e_vars: List[str]) -> ValueWithMoe:
        """Calculates a sum and its combined MOE from a list of ACS variables."""
        estimate = sum(acs_data.get(v, 0) or 0 for v in e_vars)

        moe_sum_sq = 0
        for var_e in e_vars:
            var_m = var_e[:-1] + 'M'
            moe = acs_data.get(var_m)
            if moe is not None:
                moe_sum_sq += moe**2

        moe = math.sqrt(moe_sum_sq) if moe_sum_sq > 0 else None
        return self._create_value_with_moe(estimate, moe)

    def project_tract_population(
        self, latest_tract_data: Optional[Dict[str, Any]], county_trend: List[PopulationTrendPoint]
    ) -> List[PopulationTrendPoint]:
        """Projects future tract population based on historical county growth rates."""
        logger.info("Starting tract population projection.")
        if not latest_tract_data or not latest_tract_data.get("B01003_001E") or len(county_trend) < 2:
            logger.warning("Not enough historical data to perform projection. Returning empty list.")
            return []

        base_population = latest_tract_data.get("B01003_001E") or 0
        county_growth_rates = [
            county_trend[i].population / county_trend[i-1].population
            for i in range(1, len(county_trend)) if county_trend[i-1].population > 0
        ]
        
        if not county_growth_rates:
            logger.warning("Could not calculate any county growth rates. Returning empty projection.")
            return []

        avg_growth_factor = np.mean(county_growth_rates)
        projections = []
        current_pop = float(base_population)
        
        for year in range(LATEST_ACS_YEAR + 1, LATEST_ACS_YEAR + 4):
            current_pop *= avg_growth_factor
            projections.append(PopulationTrendPoint(year=year, population=int(round(current_pop)), is_projection=True))
        
        logger.info(f"Tract population projection finished with {len(projections)} data points.")
        return projections

    def _calculate_growth_metrics(self, trend: List[PopulationTrendPoint]) -> GrowthMetrics:
        """Calculates CAGR, YoY growth, and absolute change from a trend line."""
        metrics = GrowthMetrics(period_years=5)
        if len(trend) < 2:
            return metrics

        end_pop, start_pop = trend[-1].population, trend[0].population
        periods = trend[-1].year - trend[0].year
        if start_pop > 0 and periods > 0:
            metrics.cagr = round((((end_pop / start_pop) ** (1 / periods)) - 1) * 100, 2)
        
        if len(trend) > 1:
            prev_pop = trend[-2].population
            if prev_pop > 0:
                metrics.yoy_growth = round(((end_pop - prev_pop) / prev_pop) * 100, 2)
        
        metrics.absolute_change = end_pop - start_pop
        return metrics

    def format_response_data(self, **kwargs: Any) -> PopulationDataResponse:
        """Assembles all processed data into the final API response model."""
        acs_data = kwargs.get("acs_data")
        if not acs_data:
            raise HTTPException(status_code=404, detail=f"No ACS demographic data found for this area.")

        subject_data = kwargs.get("subject_data", {}) or {}
        profile_data = kwargs.get("profile_data", {}) or {}
        all_census_data = {**acs_data, **subject_data, **profile_data}

        trend = kwargs.get("trend", [])
        projection = kwargs.get("projection", [])
        total_pop_estimate = (trend[-1].population if trend else all_census_data.get("B01003_001E", 0))
        
        # Helper for safe division and rounding
        def safe_div_percent(numerator, denominator):
            if denominator is None or denominator == 0 or numerator is None:
                return None
            return round((numerator / denominator) * 100, 1)

        # Age and Sex Distribution
        age_distribution = AgeDistribution(
            under_18=self._create_sum_with_moe(all_census_data, ["B01001_003E", "B01001_004E", "B01001_005E", "B01001_006E", "B01001_027E", "B01001_028E", "B01001_029E", "B01001_030E"]),
            _18_to_34=self._create_sum_with_moe(all_census_data, ["B01001_007E", "B01001_008E", "B01001_009E", "B01001_010E", "B01001_011E", "B01001_012E", "B01001_031E", "B01001_032E", "B01001_033E", "B01001_034E", "B01001_035E", "B01001_036E"]),
            _35_to_64=self._create_sum_with_moe(all_census_data, ["B01001_013E", "B01001_014E", "B01001_015E", "B01001_016E", "B01001_017E", "B01001_018E", "B01001_019E", "B01001_037E", "B01001_038E", "B01001_039E", "B01001_040E", "B01001_041E", "B01001_042E", "B01001_043E"]),
            over_65=self._create_sum_with_moe(all_census_data, ["B01001_020E", "B01001_021E", "B01001_022E", "B01001_023E", "B01001_024E", "B01001_025E", "B01001_044E", "B01001_045E", "B01001_046E", "B01001_047E", "B01001_048E", "B01001_049E"])
        )
        male_total = all_census_data.get("B01001_002E")
        female_total = all_census_data.get("B01001_026E")
        sex_distribution = SexDistribution(
            male=self._create_value_with_moe(male_total, all_census_data.get("B01001_002M")),
            female=self._create_value_with_moe(female_total, all_census_data.get("B01001_026M")),
            percent_male=safe_div_percent(male_total, (male_total or 0) + (female_total or 0)),
            percent_female=safe_div_percent(female_total, (male_total or 0) + (female_total or 0))
        )

        # Demographics
        bachelors_or_higher = sum(all_census_data.get(k, 0) or 0 for k in ["B15003_022E", "B15003_023E", "B15003_024E", "B15003_025E"])
        total_pop_25_over = all_census_data.get("B15003_001E")
        
        # Household Comp
        total_households = all_census_data.get("B11001_001E")
        household_comp = HouseholdComposition(
            total_households=self._create_value_with_moe(total_households, all_census_data.get("B11001_001M")),
            percent_family_households=safe_div_percent(all_census_data.get("B11001_002E"), total_households),
            percent_married_couple_family=safe_div_percent(all_census_data.get("B11001_003E"), total_households),
            percent_non_family_households=safe_div_percent(all_census_data.get("B11001_007E"), total_households)
        )

        # Race/Ethnicity
        race_total = all_census_data.get("B03002_001E")
        other_non_hispanic = sum(all_census_data.get(k, 0) or 0 for k in ["B03002_005E", "B03002_007E", "B03002_008E", "B03002_009E"])
        race_ethnicity = RaceAndEthnicity(
            percent_white_non_hispanic=safe_div_percent(all_census_data.get("B03002_003E"), race_total),
            percent_black_non_hispanic=safe_div_percent(all_census_data.get("B03002_004E"), race_total),
            percent_asian_non_hispanic=safe_div_percent(all_census_data.get("B03002_006E"), race_total),
            percent_hispanic=safe_div_percent(all_census_data.get("B03002_012E"), race_total),
            percent_other_non_hispanic=safe_div_percent(other_non_hispanic, race_total)
        )

        demographics = Demographics(
            median_household_income=self._create_value_with_moe(all_census_data.get("B19013_001E"), all_census_data.get("B19013_001M")),
            percent_bachelors_or_higher=safe_div_percent(bachelors_or_higher, total_pop_25_over),
            avg_household_size=self._create_value_with_moe(all_census_data.get("B25010_001E"), all_census_data.get("B25010_001M")),
            household_composition=household_comp,
            race_and_ethnicity=race_ethnicity
        )

        # Economic Context
        lf_total_pop = all_census_data.get("B23025_001E")
        in_labor_force = all_census_data.get("B23025_002E")
        economic_context = EconomicContext(
            poverty_rate=all_census_data.get("S1701_C03_001E"),
            labor_force_participation_rate=safe_div_percent(in_labor_force, lf_total_pop),
            mean_commute_time_minutes=self._create_value_with_moe(all_census_data.get("DP03_0025E"), all_census_data.get("DP03_0025M"))
        )

        # Housing
        housing_metrics = HousingMetrics(
            percent_renter_occupied=safe_div_percent(all_census_data.get("B25003_003E"), all_census_data.get("B25003_001E")),
            median_home_value=self._create_value_with_moe(all_census_data.get("B25077_001E"), all_census_data.get("B25077_001M")),
            median_gross_rent=self._create_value_with_moe(all_census_data.get("B25064_001E"), all_census_data.get("B25064_001M")),
            median_year_structure_built=self._create_value_with_moe(all_census_data.get("B25035_001E"), all_census_data.get("B25035_001M")),
            vacancy_rate=safe_div_percent(all_census_data.get("B25002_003E"), all_census_data.get("B25002_001E")),
            rental_vacancy_rate=safe_div_percent(all_census_data.get("B25004_002E"), (all_census_data.get("B25003_003E", 0) or 0) + (all_census_data.get("B25004_002E", 0) or 0)),
            homeowner_vacancy_rate=safe_div_percent(all_census_data.get("B25004_004E"), (all_census_data.get("B25003_002E", 0) or 0) + (all_census_data.get("B25004_004E", 0) or 0))
        )
        
        # Final Assembly
        return PopulationDataResponse(
            search_address=kwargs["address"],
            data_year=LATEST_ACS_YEAR,
            geography_name=all_census_data.get("NAME", "N/A"),
            fips=kwargs["fips"],
            geography_level=kwargs["geo_level"],
            coordinates=kwargs["coordinates"],
            tract_area_sq_meters=kwargs["aland"],
            total_population=self._create_value_with_moe(total_pop_estimate, all_census_data.get("B01003_001M")),
            median_age=self._create_value_with_moe(all_census_data.get("B01002_001E"), all_census_data.get("B01002_001M")),
            growth=self._calculate_growth_metrics(trend),
            migration=kwargs.get("migration"),
            natural_increase=kwargs.get("natural_increase"),
            population_density=kwargs.get("population_density"),
            age_distribution=age_distribution,
            sex_distribution=sex_distribution,
            demographics=demographics,
            housing=housing_metrics,
            economic_context=economic_context,
            walkability=kwargs.get("walkability"),
            population_trends=PopulationTrend(trend=trend, projection=projection, benchmark=kwargs.get("benchmarks"))
        )
