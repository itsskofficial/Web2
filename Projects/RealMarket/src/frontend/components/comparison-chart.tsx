import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";
import type { AddressEntry } from "@lib/types";
import type { TooltipProps } from "recharts";

const COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

const formatPopulation = (value: number) => {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
	return value.toString();
};

const transformDataForChart = (addresses: AddressEntry[]) => {
	const yearMap = new Map<number, Record<string, number | number>>();

	addresses.forEach((addr) => {
		if (!addr.data || !addr.data.population_trends) return;
		const seriesKey = addr.data.geography_name;

		const allPoints = [
			...addr.data.population_trends.trend,
			...addr.data.population_trends.projection,
		];

		allPoints.forEach((point: { year: number; population: number }) => {
			if (!yearMap.has(point.year)) {
				yearMap.set(point.year, { year: point.year });
			}
			yearMap.get(point.year)![seriesKey] = point.population;
		});
	});

	return Array.from(yearMap.values()).sort(
		(a, b) => (a.year as number) - (b.year as number)
	);
};

const transformDataForBarChart = (
	addresses: AddressEntry[],
	metric: "demographics" | "housing"
) => {
	if (metric === "demographics") {
		return [
			{
				metric: "Median Income",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.demographics?.median_household_income?.value,
					])
				),
			},
			{
				metric: "Median Age",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.median_age?.value,
					])
				),
			},
			{
				metric: "Avg. Household Size",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.demographics?.avg_household_size?.value,
					])
				),
			},
			{
				metric: "% Bachelor's+",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.demographics?.percent_bachelors_or_higher,
					])
				),
			},
			{
				metric: "Poverty Rate",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.economic_context?.poverty_rate,
					])
				),
			},
			{
				metric: "Mean Commute (min)",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.economic_context?.mean_commute_time_minutes
							?.value,
					])
				),
			},
		];
	}
	if (metric === "housing") {
		return [
			{
				metric: "% Renter Occupied",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.housing?.percent_renter_occupied,
					])
				),
			},
			{
				metric: "Median Home Value",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.housing?.median_home_value?.value,
					])
				),
			},
			{
				metric: "Median Gross Rent",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.housing?.median_gross_rent?.value,
					])
				),
			},
			{
				metric: "Median Year Built",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.housing?.median_year_structure_built?.value,
					])
				),
			},
			{
				metric: "Vacancy Rate (%)",
				...Object.fromEntries(
					addresses.map((addr) => [
						addr.data?.geography_name,
						addr.data?.housing?.vacancy_rate,
					])
				),
			},
		];
	}
	return [];
};

const CustomTooltip = ({
	active,
	payload,
	label,
}: TooltipProps<number, string>) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border bg-background p-2 shadow-sm">
				<p className="text-sm font-medium">{label}</p>
				{payload.map((pld) => (
					<div
						key={pld.dataKey}
						style={{ color: pld.color }}
						className="text-sm"
					>
						{pld.dataKey}: {pld.value?.toLocaleString()}
					</div>
				))}
			</div>
		);
	}
	return null;
};

export function ComparisonChart({
	addresses,
	metric,
}: {
	addresses: AddressEntry[];
	metric: "population_trend" | "demographics" | "housing";
}) {
	if (addresses.length < 1) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground">
				Select at least one address to see charts.
			</div>
		);
	}

	const seriesKeys = addresses
		.map((addr) => addr.data?.geography_name)
		.filter(Boolean) as string[];

	if (metric === "population_trend") {
		const chartData = transformDataForChart(addresses);
		let allTicks: number[] | undefined = undefined;
		if (chartData.length > 0) {
			const allYearsOnChart = chartData.map((d) => d.year as number);
			const minYear = Math.min(...allYearsOnChart);
			const maxYear = Math.max(...allYearsOnChart);
			if (isFinite(minYear) && isFinite(maxYear)) {
				allTicks = Array.from(
					{ length: maxYear - minYear + 1 },
					(_, i) => minYear + i
				);
			}
		}

		return (
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={chartData}
					margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="var(--border)"
					/>
					<XAxis
						dataKey="year"
						stroke="var(--muted-foreground)"
						tick={{ fill: "var(--foreground)" }}
						type="number"
						domain={["dataMin", "dataMax"]}
						allowDecimals={false}
						fontSize={12}
						ticks={allTicks}
					/>
					<YAxis
						tickFormatter={formatPopulation}
						stroke="var(--muted-foreground)"
						tick={{ fill: "var(--foreground)" }}
						fontSize={12}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Legend />
					{seriesKeys.map((key, index) => (
						<Line
							key={key}
							type="monotone"
							dataKey={key}
							connectNulls
							stroke={COLORS[index % COLORS.length]}
							strokeWidth={2}
							dot={{ r: 2 }}
							activeDot={{ r: 6 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		);
	}

	const barChartData = transformDataForBarChart(addresses, metric);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
			{barChartData.map((data, idx) => (
				<div key={idx} className="flex flex-col">
					<h3 className="text-center font-semibold mb-2">
						{data.metric}
					</h3>
					<div className="flex-grow">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={[data]}
								layout="vertical"
								margin={{
									top: 5,
									right: 20,
									left: 10,
									bottom: 5,
								}}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="var(--border)"
								/>
								<XAxis
									type="number"
									stroke="var(--muted-foreground)"
									tick={{ fill: "var(--foreground)" }}
									fontSize={12}
								/>
								<YAxis type="category" dataKey="metric" hide />
								<Tooltip content={<CustomTooltip />} />
								<Legend />
								{seriesKeys.map((key, index) => (
									<Bar
										key={key}
										dataKey={key}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			))}
		</div>
	);
}
