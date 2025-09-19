"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";
import dynamic from "next/dynamic";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import {
	Compass,
	BarChartHorizontal,
	AreaChart,
	Users,
	Home,
} from "lucide-react";
import { PopulationMetricsCard } from "@components/population-metrics-card";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@components/ui/resizable";
import { ScrollArea } from "@components/ui/scroll-area";
import { FloatingDock } from "@components/floating-dock";
import { MultiAddressInput } from "@components/multi-address-input";
import { ComparisonPanel } from "@components/comparison-panel";
import { MultiAddressOutput } from "@components/multi-address-output";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useAppStore, type AddressIdentifier } from "@stores/addressStore";
import {
	useCachedAddresses,
	useDeleteCachedAddress,
	useMarketData,
	fetchMarketData,
} from "@hooks/useMarketData";
import { UserNav } from "@components/auth/user-nav";
import type { AddressEntry } from "@lib/types";
import type { PopulationDataResponse } from "@lib/schemas";
import { ThemeToggle } from "@components/theme-toggle";

const ComparisonChart = dynamic(
	() =>
		import("@components/comparison-chart").then(
			(mod) => mod.ComparisonChart
		),
	{ ssr: false }
);

export default function HomePage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// If loading is finished and there's no user, redirect to login
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	const {
		mode,
		addresses,
		comparisonSelectionIds,
		selectedAddress,
		setMode,
		addAddress,
		removeAddress,
		selectAddress,
	} = useAppStore();
	const { data: cachedAddresses } = useCachedAddresses();
	const deleteFromCacheMutation = useDeleteCachedAddress();
	const queryClient = useQueryClient();

	const comparisonAddresses = useMemo(() => {
		return addresses.filter((addr) => comparisonSelectionIds.has(addr.id));
	}, [addresses, comparisonSelectionIds]);

	const handleAddAddress = useCallback(
		(address: string) => {
			addAddress(address);
		},
		[addAddress]
	);

	const handleRemoveAddress = useCallback(
		(address: AddressIdentifier) => {
			// Invalidate the specific query for this address when it's removed
			queryClient.invalidateQueries({
				queryKey: ["marketData", "detail", address.value],
			});
			removeAddress(address.id);
		},
		[removeAddress, queryClient]
	);

	const handleSelectAddress = useCallback(
		(address: AddressIdentifier) => {
			selectAddress(address);
		},
		[selectAddress]
	);

	const handleDeselectAddress = useCallback(() => {
		selectAddress(null);
	}, [selectAddress]);

	const queries = useQueries({
		queries: comparisonAddresses.map((address) => ({
			queryKey: ["marketData", "detail", address.value],
			queryFn: () => fetchMarketData({ address: address.value }),
			enabled: mode === "compare",
			staleTime: 1000 * 60 * 5,
		})),
	});

	const successfulAddresses = useMemo((): AddressEntry[] => {
		return queries
			.filter((query) => query.isSuccess && query.data)
			.map((query, index) => ({
				id: comparisonAddresses[index].id,
				value: comparisonAddresses[index].value,
				status: "success",
				data: query.data as PopulationDataResponse, // Cast because we know it's successful
			}));
	}, [queries, comparisonAddresses]);

	const {
		data: selectedAddressData,
		isLoading: isSelectedLoading,
		isError: isSelectedError,
		error: selectedError,
	} = useMarketData(selectedAddress?.value ?? "", !!selectedAddress);

	const dockItems = [
		{ title: "explore" as const, icon: <Compass /> },
		{ title: "compare" as const, icon: <BarChartHorizontal /> },
	];

	return (
		<div className="flex min-h-screen w-full bg-muted/40">
			<aside className="fixed inset-y-0 left-0 z-10 hidden w-24 flex-col border-r bg-background sm:flex">
				<div className="flex h-16 shrink-0 items-center justify-center border-b px-2">
					{/* CapMatch Logo */}
					<svg
						className="h-8 w-8 text-primary"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
				</div>
				<FloatingDock
					items={dockItems}
					activeMode={mode}
					onModeChange={setMode}
				/>
				<div className="mt-auto flex flex-col items-center gap-4 p-4">
					{user && (
						<>
							<ThemeToggle />
							<UserNav />
						</>
					)}
				</div>
			</aside>

			<div className="w-full sm:pl-24">
				<ResizablePanelGroup
					direction="horizontal"
					className="w-full flex-col md:flex-row min-h-screen"
				>
					<ResizablePanel
						defaultSize={65}
						minSize={40}
						className="min-h-[50vh] md:min-h-0"
					>
						<main className="h-full overflow-auto p-4 md:p-6 lg:p-8">
							{mode === "explore" && (
								<MultiAddressOutput
									addresses={addresses}
									onRemoveAddress={handleRemoveAddress}
									onSelectAddress={handleSelectAddress}
									isAnyModalOpen={!!selectedAddress}
								/>
							)}
							{mode === "compare" && (
								<Card className="flex h-full flex-col">
									<CardHeader>
										<CardTitle>Comparison View</CardTitle>
										<CardDescription>
											Population trends for selected
											addresses. Select up to 3 addresses
											from the panel to compare.
										</CardDescription>
									</CardHeader>
									<CardContent className="flex-grow">
										<Tabs
											defaultValue="growth"
											className="h-full flex flex-col"
										>
											<TabsList className="grid w-full grid-cols-3">
												<TabsTrigger value="growth">
													<AreaChart className="mr-2 h-4 w-4" />
													Population Growth
												</TabsTrigger>
												<TabsTrigger value="demographics">
													<Users className="mr-2 h-4 w-4" />
													Demographics
												</TabsTrigger>
												<TabsTrigger value="housing">
													<Home className="mr-2 h-4 w-4" />
													Housing
												</TabsTrigger>
											</TabsList>
											<TabsContent
												value="growth"
												className="flex-grow mt-4"
											>
												<ComparisonChart
													addresses={
														successfulAddresses
													}
													metric="population_trend"
												/>
											</TabsContent>
											<TabsContent
												value="demographics"
												className="flex-grow mt-4"
											>
												<ComparisonChart
													addresses={
														successfulAddresses
													}
													metric="demographics"
												/>
											</TabsContent>
											<TabsContent
												value="housing"
												className="flex-grow mt-4"
											>
												<ComparisonChart
													addresses={
														successfulAddresses
													}
													metric="housing"
												/>
											</TabsContent>
										</Tabs>
									</CardContent>
								</Card>
							)}
						</main>
					</ResizablePanel>
					<ResizableHandle withHandle className="hidden md:flex" />
					<ResizablePanel
						defaultSize={35}
						minSize={25}
						maxSize={40}
						className="bg-background min-h-[50vh] md:min-h-0"
					>
						<aside className="h-full">
							<ScrollArea className="h-full">
								<div className="p-4 md:p-6 lg:p-8">
									{mode === "explore" ? (
										<MultiAddressInput
											onAddAddress={handleAddAddress}
											addresses={addresses}
											onRemoveAddress={
												handleRemoveAddress
											}
											cachedAddresses={
												cachedAddresses ?? []
											}
											onRemoveFromCache={
												deleteFromCacheMutation.mutate
											}
										/>
									) : (
										<ComparisonPanel />
									)}
								</div>
							</ScrollArea>
						</aside>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>

			<Dialog
				open={!!selectedAddress}
				onOpenChange={(isOpen) => !isOpen && handleDeselectAddress()}
			>
				<DialogContent className="sm:max-w-7xl w-full h-[90vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>{selectedAddress?.value}</DialogTitle>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto">
						<PopulationMetricsCard
							isLoading={isSelectedLoading}
							isError={isSelectedError}
							error={selectedError}
							data={selectedAddressData}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
