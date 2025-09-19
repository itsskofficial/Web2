"use client";

import { XIcon, PlusIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { ScrollArea } from "@components/ui/scroll-area";
import type { AddressIdentifier } from "@stores/addressStore";
// Import the new component
import { AddressAutocompleteInput } from "./address-autocomplete-input";

interface MultiAddressInputProps {
	onAddAddress: (address: string) => void; // The prop now just takes a string
	addresses: AddressIdentifier[];
	onRemoveAddress: (address: AddressIdentifier) => void;
	cachedAddresses: string[];
	onRemoveFromCache: (address: string) => void;
}

export function MultiAddressInput({
	onAddAddress,
	addresses,
	onRemoveAddress,
	cachedAddresses,
	onRemoveFromCache,
}: MultiAddressInputProps) {
	// We no longer need react-hook-form for this simple input
	const handleAddFromCache = (address: string) => {
		onAddAddress(address);
	};

	return (
		<div className="space-y-6">
			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle>Add Address</CardTitle>
					<CardDescription>
						Enter an address to fetch its market data.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Replace the form with our new component */}
					<AddressAutocompleteInput
						onAddressSelect={onAddAddress}
					/>
				</CardContent>
			</Card>
			<Separator />
			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle>Address List</CardTitle>
					<CardDescription>
						Manage the addresses you&#39;ve added.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{addresses.length > 0 ? (
						<ul className="space-y-2">
							{addresses.map((address) => (
								<li
									key={address.id}
									className="flex items-center justify-between rounded-md border bg-muted/50 p-2"
								>
									<span className="truncate pr-2 text-sm">
										{address.value}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 shrink-0"
										onClick={() => onRemoveAddress(address)}
									>
										<XIcon className="h-4 w-4" />
									</Button>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">
							No addresses added yet.
						</p>
					)}
				</CardContent>
			</Card>
			<Separator />
			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle>Cached Addresses</CardTitle>
					<CardDescription>
						Previously searched addresses. Click to add or remove
						from cache.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{cachedAddresses.length > 0 ? (
						<ScrollArea className="h-48">
							<ul className="space-y-2 pr-4">
								{cachedAddresses.map((address) => (
									<li
										key={address}
										className="group flex items-center justify-between rounded-md border bg-muted/50 p-2 text-sm"
									>
										<span className="truncate pr-2">
											{address}
										</span>
										<div className="flex shrink-0 items-center">
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() =>
													handleAddFromCache(address)
												}
											>
												<PlusIcon className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 text-destructive/70 hover:text-destructive"
												onClick={() =>
													onRemoveFromCache(address)
												}
											>
												<XIcon className="h-4 w-4" />
											</Button>
										</div>
									</li>
								))}
							</ul>
						</ScrollArea>
					) : (
						<p className="text-sm text-muted-foreground">
							No cached addresses found.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
