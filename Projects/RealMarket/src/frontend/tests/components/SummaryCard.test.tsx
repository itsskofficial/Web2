import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoizedSummaryCard } from "@components/summary-card";
import { useMarketData } from "@hooks/useMarketData";
import { toast } from "sonner";
import type { PopulationDataResponse } from "@lib/schemas";

// Mock the dynamic map component
vi.mock("@components/dynamic-map", () => ({
	__esModule: true,
	default: () => <div data-testid="mock-map"></div>,
}));

// Mock the useMarketData hook
vi.mock("@hooks/useMarketData");

// Mock sonner
vi.mock("sonner", () => ({
	toast: { error: vi.fn() },
}));

const mockedUseMarketData = useMarketData as Mock;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false, // Disable retries for tests
		},
	},
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("SummaryCard", () => {
	const baseProps = {
		addressIdentifier: { id: "1", value: "123 Main St, Anytown, USA" },
		onRemove: vi.fn(),
		onSelect: vi.fn(),
		isAnyModalOpen: false,
	};

	it("renders loading state correctly", () => {
		mockedUseMarketData.mockReturnValue({
			isLoading: true,
			isError: false,
			data: undefined,
			error: null,
		});

		render(<MemoizedSummaryCard {...baseProps} />, { wrapper });
		expect(screen.getByText("Fetching data...")).toBeInTheDocument();
		expect(screen.getByTestId("skeleton")).toBeInTheDocument();
	});

	it("renders success state correctly", () => {
		const mockData = {
			geography_name: "Census Tract 101, Example County",
			coordinates: { lat: 40, lon: -70 },
			fips: { state: "01", county: "001", tract: "010100" },
		};

		mockedUseMarketData.mockReturnValue({
			isLoading: false,
			isError: false,
			data: mockData as PopulationDataResponse,
			error: null,
		});

		render(<MemoizedSummaryCard {...baseProps} />, { wrapper });

		expect(
			screen.getByText(baseProps.addressIdentifier.value)
		).toBeInTheDocument();
		expect(screen.getByText(mockData.geography_name!)).toBeInTheDocument();
		expect(screen.getByTestId("mock-map")).toBeInTheDocument();
	});

	it("calls onRemove and shows toast for 404 errors", () => {
		const onRemoveMock = vi.fn();
		const error404 = new Error(
			"Address could not be geocoded."
		) as Error & { status: number };
		error404.status = 404;
		mockedUseMarketData.mockReturnValue({
			isLoading: false,
			isError: true,
			data: undefined,
			error: error404,
		});

		render(<MemoizedSummaryCard {...baseProps} onRemove={onRemoveMock} />, {
			wrapper,
		});

		expect(onRemoveMock).toHaveBeenCalledTimes(1);
		expect(onRemoveMock).toHaveBeenCalledWith(baseProps.addressIdentifier);
		expect(toast.error).toHaveBeenCalledWith(
			`Address not found: "${baseProps.addressIdentifier.value}"`,
			expect.any(Object)
		);
	});

	it("renders persistent error state for non-404 errors", () => {
		const error500 = new Error("Server Error") as Error & {
			status: number;
		};
		error500.status = 500;
		mockedUseMarketData.mockReturnValue({
			isLoading: false,
			isError: true,
			data: undefined,
			error: error500,
		});

		render(<MemoizedSummaryCard {...baseProps} />, { wrapper });

		expect(screen.getByText("Error: Server Error")).toBeInTheDocument();
		expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
	});
});
