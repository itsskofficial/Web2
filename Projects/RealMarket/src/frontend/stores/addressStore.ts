import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

type Mode = "explore" | "compare";

// This interface now only contains the address string and a unique client-side ID.
// All server state (status, data, error) is handled by React Query.
export interface AddressIdentifier {
	id: string;
	value: string;
}

interface AppState {
	mode: Mode;
	addresses: AddressIdentifier[];
	comparisonSelectionIds: Set<string>; // Use a Set for efficient add/delete/check
	selectedAddress: AddressIdentifier | null; // Store the identifier, not the full data object

	setMode: (mode: Mode) => void;
	addAddress: (addressValue: string) => void;
	removeAddress: (id: string) => void;
	selectAddress: (address: AddressIdentifier | null) => void;
	toggleComparisonSelection: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
	mode: "explore",
	addresses: [],
	comparisonSelectionIds: new Set(),
	selectedAddress: null,

	setMode: (mode) => set({ mode }),

	selectAddress: (address) => set({ selectedAddress: address }),

	addAddress: (addressValue) => {
		const { addresses } = get();
		// Prevent duplicate addresses from being added to the list.
		if (
			addresses.some(
				(addr) =>
					addr.value.trim().toLowerCase() ===
					addressValue.trim().toLowerCase()
			)
		) {
			toast.info("This address is already in your list.");
			return;
		}

		const newAddress: AddressIdentifier = {
			id: uuidv4(),
			value: addressValue,
		};

		// The store's only job is to add the identifier to the list.
		// A React Query mutation will handle the actual data fetching.
		set((state) => ({ addresses: [...state.addresses, newAddress] }));
	},

	removeAddress: (id: string) => {
		set((state) => {
			const newComparisonIds = new Set(state.comparisonSelectionIds);
			newComparisonIds.delete(id);
			return {
				addresses: state.addresses.filter((addr) => addr.id !== id),
				comparisonSelectionIds: newComparisonIds,
				selectedAddress:
					state.selectedAddress?.id === id
						? null
						: state.selectedAddress,
			};
		});
		toast.info("Address removed from the list.");
	},

	toggleComparisonSelection: (id: string) => {
		set((state) => {
			const newSelection = new Set(state.comparisonSelectionIds);
			if (newSelection.has(id)) {
				newSelection.delete(id);
				toast.info("Address removed from comparison.");
			} else {
				if (newSelection.size >= 3) {
					toast.error(
						"You can only compare up to 3 addresses at a time."
					);
					return state; // Do not modify state
				}
				newSelection.add(id);
				toast.success("Address added to comparison.");
			}
			return { comparisonSelectionIds: newSelection };
		});
	},
}));
