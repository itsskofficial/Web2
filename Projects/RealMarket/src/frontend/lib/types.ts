import type { PopulationDataResponse } from "@lib/schemas";

export type AddressStatus = "idle" | "loading" | "success" | "error";
export type GeographyLevel = "tract" | "county";

export interface AddressEntry {
	id: string;
	value: string;
	status: AddressStatus;
	data?: PopulationDataResponse;
	error?: string;
}
