import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MarketDataRequest, PopulationDataResponse } from "@lib/schemas";
import { populationDataResponseSchema } from "@lib/schemas";
import { auth } from "@lib/firebase";

// --- Query Keys ---
const marketDataKeys = {
  all: ['marketData'] as const,
  lists: () => [...marketDataKeys.all, 'list'] as const,
  list: (filters: string) => [...marketDataKeys.lists(), { filters }] as const,
  details: () => [...marketDataKeys.all, 'detail'] as const,
  detail: (address: string) => [...marketDataKeys.details(), address] as const,
  cacheList: ['cachedAddresses'] as const,
  geojson: (fips: { state: string; county: string; tract: string } | null) => ['geojson', fips] as const,
};

// --- Fetcher Functions ---
const getAuthHeader = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

// Fetches market data for a single address
export const fetchMarketData = async (request: MarketDataRequest): Promise<PopulationDataResponse> => {
  const authHeader = await getAuthHeader();
  const response = await fetch("/api/v1/market-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorBody = await response.json();
    // Attach status for better error handling in components
    const error = new Error(errorBody.detail || "Failed to fetch market data.") as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  return populationDataResponseSchema.parse(data);
};

// Fetches the list of cached addresses from the server
const fetchCachedAddresses = async (): Promise<string[]> => {
  const authHeader = await getAuthHeader();
  const response = await fetch("/api/v1/market-data/cache", {
    method: "GET",
    headers: authHeader,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cached addresses.");
  }
  return response.json();
};

// Deletes an address from the server-side cache
const deleteCachedAddress = async (address: string): Promise<void> => {
  const authHeader = await getAuthHeader();
  const response = await fetch("/api/v1/market-data/cache", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ address }),
  });
  if (response.status !== 204) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to delete address from cache.");
  }
};

// Fetches GeoJSON data for a tract
const fetchTractGeoJSON = async (fips: { state: string; county: string; tract: string }) => {
    const authHeader = await getAuthHeader();
    const params = new URLSearchParams(fips);
    const response = await fetch(`/api/v1/tract-geojson?${params.toString()}`, {
      method: "GET",
      headers: authHeader,
    });
    if (!response.ok) {
        throw new Error('Failed to fetch GeoJSON data');
    }
    return response.json();
};


// --- React Query Hooks ---

export const useMarketData = (address: string, isEnabled: boolean = true) => {
  return useQuery({
    queryKey: marketDataKeys.detail(address),
    queryFn: () => fetchMarketData({ address }),
    enabled: isEnabled && !!address, // Only run query if address is provided and enabled
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 404 (Not Found) errors
      if (error.message.includes("not found")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCachedAddresses = () => {
    return useQuery({
        queryKey: marketDataKeys.cacheList,
        queryFn: fetchCachedAddresses,
    });
};

export const useDeleteCachedAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCachedAddress,
        onSuccess: (_, deletedAddress) => {
            toast.success(`"${deletedAddress}" removed from cache.`);
            // Invalidate the cache list query to refetch it
            queryClient.invalidateQueries({ queryKey: marketDataKeys.cacheList });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};

export const useTractGeoJSON = (fips: { state: string; county: string; tract: string } | null) => {
  return useQuery({
    queryKey: marketDataKeys.geojson(fips),
    queryFn: () => {
      // The `enabled` flag ensures fips is not null here, but this check makes it type-safe
      if (!fips) {
        return Promise.reject(new Error("FIPS codes are required to fetch GeoJSON."));
      }
      return fetchTractGeoJSON(fips);
    },
    enabled: !!fips, // Only run if FIPS codes are available
    staleTime: Infinity, // GeoJSON data is static, cache it forever
  });
};