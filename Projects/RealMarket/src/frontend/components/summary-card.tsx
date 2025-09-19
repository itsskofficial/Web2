import React, { useEffect } from "react";
import {
	XIcon,
	Loader2,
	AlertTriangle,
	BarChartHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import DynamicMap from "@components/dynamic-map";
import { cn } from "@lib/utils";
import { useMarketData } from "@hooks/useMarketData";
import { useAppStore, type AddressIdentifier } from "@stores/addressStore";

interface SummaryCardProps {
	addressIdentifier: AddressIdentifier;
	onRemove: (address: AddressIdentifier) => void;
	onSelect: (address: AddressIdentifier) => void;
	isAnyModalOpen: boolean;
}

export function SummaryCard({
	addressIdentifier,
	onRemove,
	onSelect,
	isAnyModalOpen,
}: SummaryCardProps) {
	const { data, isLoading, isError, error } = useMarketData(
		addressIdentifier.value
	);
	const { toggleComparisonSelection, comparisonSelectionIds } = useAppStore();

	const isAddressInComparison = comparisonSelectionIds.has(
		addressIdentifier.id
	);
	const isComparisonFull = comparisonSelectionIds.size >= 3;

	useEffect(() => {
		const typedError = error as Error & { status?: number };
		if (isError && typedError?.status === 404) {
			toast.error(`Address not found: "${addressIdentifier.value}"`, {
				description:
					"The address could not be geocoded. It has been removed from your list.",
			});
			onRemove(addressIdentifier);
		}
	}, [isError, error, addressIdentifier, onRemove]);

	const renderStatus = () => {
		if (isLoading) {
			return (
				<div className="flex items-center text-sm text-blue-500">
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Fetching data...
				</div>
			);
		}
		const typedError = error as Error & { status?: number };
		if (isError && typedError?.status !== 404) {
			return (
				<p
					className="truncate text-sm text-red-500 dark:text-red-400"
					title={error.message}
				>
					Error: {typedError.message}
				</p>
			);
		}
		if (data) {
			return (
				<p className="truncate text-sm text-green-600 dark:text-green-400">
					{data.geography_name}
				</p>
			);
		}
		return null;
	};

	return (
		<Card
			className={cn(
				"group relative transition-all hover:shadow-md overflow-hidden p-0 gap-0",
				data && "cursor-pointer"
			)}
			onClick={data ? () => onSelect(addressIdentifier) : undefined}
		>
			<div className="absolute top-1 right-1 z-10 flex flex-col space-y-1 opacity-0 group-hover:opacity-100">
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 bg-background/50 hover:bg-background/80"
					onClick={(e) => {
						e.stopPropagation();
						toggleComparisonSelection(addressIdentifier.id);
					}}
					disabled={isAddressInComparison || isComparisonFull}
					title={
						isAddressInComparison
							? "Already in comparison"
							: isComparisonFull
							? "Comparison list is full"
							: "Add to comparison"
					}
				>
					<BarChartHorizontal className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 bg-background/50 hover:bg-background/80"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(addressIdentifier);
					}}
				>
					<XIcon className="h-4 w-4" />
				</Button>
			</div>
			<div className="h-32 w-full">
				{(isLoading || (isAnyModalOpen && data)) && (
					<Skeleton className="h-full w-full rounded-none" />
				)}
				{isError && (error as { status?: number })?.status !== 404 && (
					<div className="flex h-full w-full items-center justify-center bg-destructive/10">
						<AlertTriangle
							data-testid="alert-triangle-icon"
							className="h-8 w-8 text-destructive"
						/>
					</div>
				)}
				{data && !isAnyModalOpen && (
					<DynamicMap
						lat={data.coordinates.lat}
						lon={data.coordinates.lon}
						fips={data.fips} // <-- UPDATED
					/>
				)}
			</div>
			<CardContent className="p-4">
				<p className="truncate pr-6 font-medium">
					{addressIdentifier.value}
				</p>
				<div className="mt-1">{renderStatus()}</div>
			</CardContent>
		</Card>
	);
}

export const MemoizedSummaryCard = React.memo(SummaryCard);