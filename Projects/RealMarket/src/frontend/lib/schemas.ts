import { z } from "zod";

// Schema for the form validation
export const marketDataRequestSchema = z.object({
	address: z.string().min(10, { message: "Please enter a valid address." }),
});
export type MarketDataRequest = z.infer<typeof marketDataRequestSchema>;

// --- API Response Schemas ---

const valueWithMoeSchema = z.object({
	value: z.union([z.number(), z.null()]).optional(),
	relative_moe: z.number().nullable().optional(),
});

const populationTrendPointSchema = z.object({
	year: z.number(),
	population: z.number(),
	is_projection: z.boolean().optional().default(false),
});

const ageDistributionSchema = z.object({
	under_18: valueWithMoeSchema,
	_18_to_34: valueWithMoeSchema,
	_35_to_64: valueWithMoeSchema,
	over_65: valueWithMoeSchema,
});

const sexDistributionSchema = z.object({
	male: valueWithMoeSchema,
	female: valueWithMoeSchema,
	percent_male: z.number().nullable(),
	percent_female: z.number().nullable(),
});

const walkabilityScoresSchema = z
	.object({
		walk_score: z.number().nullable().optional(),
		walk_score_description: z.string().nullable().optional(),
		transit_score: z.number().nullable().optional(),
		transit_score_description: z.string().nullable().optional(),
	})
	.nullable()
	.optional();

const benchmarkDataSchema = z
	.object({
		county_trend: z.array(populationTrendPointSchema),
	})
	.nullable()
	.optional();

const householdCompositionSchema = z
	.object({
		total_households: valueWithMoeSchema.nullable(),
		percent_family_households: z.number().nullable(),
		percent_married_couple_family: z.number().nullable(),
		percent_non_family_households: z.number().nullable(),
	})
	.nullable()
	.optional();

const raceAndEthnicitySchema = z
	.object({
		percent_white_non_hispanic: z.number().nullable(),
		percent_black_non_hispanic: z.number().nullable(),
		percent_asian_non_hispanic: z.number().nullable(),
		percent_hispanic: z.number().nullable(),
		percent_other_non_hispanic: z.number().nullable(),
	})
	.nullable()
	.optional();

const demographicsSchema = z.object({
	median_household_income: valueWithMoeSchema.nullable(),
	percent_bachelors_or_higher: z.number().nullable(),
	avg_household_size: valueWithMoeSchema.nullable(),
	household_composition: householdCompositionSchema,
	race_and_ethnicity: raceAndEthnicitySchema,
});

const economicContextSchema = z
	.object({
		poverty_rate: z.number().nullable(),
		labor_force_participation_rate: z.number().nullable(),
		mean_commute_time_minutes: valueWithMoeSchema.nullable(),
	})
	.nullable()
	.optional();

const housingMetricsSchema = z.object({
	percent_renter_occupied: z.number().nullable(),
	median_home_value: valueWithMoeSchema.nullable(),
	median_gross_rent: valueWithMoeSchema.nullable(),
	median_year_structure_built: valueWithMoeSchema.nullable(),
	vacancy_rate: z.number().nullable(),
	rental_vacancy_rate: z.number().nullable(),
	homeowner_vacancy_rate: z.number().nullable(),
});

const coordinatesSchema = z.object({
	lat: z.number(),
	lon: z.number(),
});

const growthMetricsSchema = z.object({
	period_years: z.number(),
	cagr: z.number().nullable(),
	yoy_growth: z.number().nullable(),
	absolute_change: z.number().nullable(),
});

const migrationDataSchema = z
	.object({
		net_migration: z.number(),
		net_migration_rate: z.number(),
		domestic_migration: z.number(),
		international_migration: z.number(),
		inflows: z.number(),
		outflows: z.number(),
		gross_migration: z.number(),
	})
	.nullable()
	.optional();

const naturalIncreaseDataSchema = z
	.object({
		births: z.number(),
		deaths: z.number(),
		natural_change: z.number(),
		natural_increase_rate: z.number(),
	})
	.nullable()
	.optional();

const populationDensitySchema = z.object({
	people_per_sq_mile: z.number(),
	change_over_period: z.number().nullable(),
});

const populationTrendSchema = z.object({
	trend: z.array(populationTrendPointSchema),
	projection: z.array(populationTrendPointSchema),
	benchmark: benchmarkDataSchema,
});

// --- NEW: FIPS Code Schema ---
const fipsCodeSchema = z.object({
	state: z.string(),
	county: z.string(),
	tract: z.string(),
});

export const populationDataResponseSchema = z.object({
	search_address: z.string(),
	data_year: z.number(),
	geography_name: z.string(),
	geography_level: z.enum(["tract", "county"]),
	fips: fipsCodeSchema, // <-- UPDATED
	coordinates: coordinatesSchema,
	tract_area_sq_meters: z.number(),
	total_population: valueWithMoeSchema,
	median_age: valueWithMoeSchema.nullable(),
	growth: growthMetricsSchema,
	migration: migrationDataSchema,
	natural_increase: naturalIncreaseDataSchema,
	population_density: populationDensitySchema,
	age_distribution: ageDistributionSchema,
	sex_distribution: sexDistributionSchema.nullable().optional(),
	demographics: demographicsSchema,
	housing: housingMetricsSchema,
	economic_context: economicContextSchema,
	walkability: walkabilityScoresSchema,
	population_trends: populationTrendSchema,
});
export type PopulationDataResponse = z.infer<
	typeof populationDataResponseSchema
>;
