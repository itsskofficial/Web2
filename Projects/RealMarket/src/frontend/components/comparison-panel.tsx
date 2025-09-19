"use client";

import { useAppStore } from "@stores/addressStore";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { ScrollArea } from "@components/ui/scroll-area";

export function ComparisonPanel() {
	const { addresses, comparisonSelectionIds, toggleComparisonSelection } =
		useAppStore();

	return (
		<Card className="border-none shadow-none">
			<CardHeader>
				<CardTitle>Select for Comparison</CardTitle>
				<CardDescription>
					Choose up to 3 addresses to compare side-by-side.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{addresses.length > 0 ? (
					<ScrollArea className="h-96">
						<ul className="space-y-2 pr-4">
							{addresses.map((address) => (
								<li
									key={address.id}
									className="flex items-center justify-between rounded-md border bg-muted/50 p-2 text-sm"
								>
									<label
										htmlFor={`compare-${address.id}`}
										className="flex-grow cursor-pointer truncate pr-2"
									>
										{address.value}
									</label>
									<Checkbox
										id={`compare-${address.id}`}
										checked={comparisonSelectionIds.has(
											address.id
										)}
										onCheckedChange={() =>
											toggleComparisonSelection(
												address.id
											)
										}
										disabled={
											!comparisonSelectionIds.has(
												address.id
											) &&
											comparisonSelectionIds.size >= 3
										}
									/>
								</li>
							))}
						</ul>
					</ScrollArea>
				) : (
					<p className="text-sm text-muted-foreground">
						Add addresses in the Explore view first.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
