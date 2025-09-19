"use client";

import React from "react";
import { List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { MemoizedSummaryCard } from "@components/summary-card";
import type { AddressIdentifier } from "@stores/addressStore";

interface MultiAddressOutputProps {
	addresses: AddressIdentifier[];
	onRemoveAddress: (address: AddressIdentifier) => void;
	onSelectAddress: (address: AddressIdentifier) => void;
	isAnyModalOpen: boolean;
}

export function MultiAddressOutput({
	addresses,
	onRemoveAddress,
	onSelectAddress,
	isAnyModalOpen,
}: MultiAddressOutputProps) {
	if (addresses.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
				<div className="mx-auto w-fit rounded-full bg-secondary p-4">
					<List className="h-10 w-10 text-muted-foreground" />
				</div>
				<h2 className="mt-6 text-2xl font-semibold">
					Address List is Empty
				</h2>
				<p className="mt-2 max-w-sm text-muted-foreground">
					Use the panel on the right to add one or more addresses.
					Once added, they will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<Card className="flex h-full flex-col">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Address Data ({addresses.length})</CardTitle>
				</CardHeader>
				<CardContent className="flex-grow overflow-auto p-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
						{addresses.map((addr) => (
							<MemoizedSummaryCard
								key={addr.id}
								addressIdentifier={addr}
								onRemove={onRemoveAddress}
								onSelect={onSelectAddress}
								isAnyModalOpen={isAnyModalOpen}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
