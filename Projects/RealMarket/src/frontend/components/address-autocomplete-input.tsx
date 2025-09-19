"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@hooks/useDebounce";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";

interface Suggestion {
	description: string;
	place_id: string;
}
interface AddressAutocompleteInputProps {
	onAddressSelect: (address: string) => void;
}
export function AddressAutocompleteInput({
	onAddressSelect,
}: AddressAutocompleteInputProps) {
	const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");
	const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const debouncedSearchTerm = useDebounce(inputValue, 500); // 500ms delay

	React.useEffect(() => {
		if (debouncedSearchTerm.length < 3) {
			setSuggestions([]);
			return;
		}

		const fetchSuggestions = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/places?input=${debouncedSearchTerm}`
				);
				if (response.ok) {
					const data = await response.json();
					setSuggestions(data);
				} else {
					setSuggestions([]);
				}
			} catch (error) {
				console.error("Failed to fetch address suggestions:", error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuggestions();
	}, [debouncedSearchTerm]);

	const handleSelect = (suggestion: Suggestion) => {
		setInputValue(""); // Clear input after selection
		setSuggestions([]);
		onAddressSelect(suggestion.description);
		setIsPopoverOpen(false); // Explicitly close popover
	};

	const handleCustomAdd = () => {
		if (inputValue.trim().length > 2) {
			onAddressSelect(inputValue.trim());
			setInputValue("");
			setSuggestions([]);
			setIsPopoverOpen(false);
		}
	};

	// The popover should only be considered open if the parent Popover component allows it
	// AND there is input text to search for, AND there are suggestions or it's loading.
	const showPopover =
		isPopoverOpen &&
		inputValue.length > 2 &&
		(suggestions.length > 0 || isLoading);

	return (
		<div className="flex w-full items-start gap-2">
			<Command shouldFilter={false} className="flex-grow">
				<Popover open={showPopover} onOpenChange={setIsPopoverOpen}>
					<PopoverTrigger asChild>
						<div className="w-full">
							<CommandInput
								value={inputValue}
								onValueChange={setInputValue}
								placeholder="Search for an address..."
								className="h-9"
								onKeyDown={(e) => {
									// Allow Enter to add custom address if popover is closed
									if (e.key === "Enter" && !showPopover) {
										e.preventDefault();
										handleCustomAdd();
									}
								}}
							/>
						</div>
					</PopoverTrigger>
					<PopoverContent
						className="w-[--radix-popover-trigger-width] p-0"
						align="start"
					>
						<CommandList>
							{isLoading && (
								<div className="p-2 flex items-center justify-center">
									<Loader2 className="h-4 w-4 animate-spin" />
								</div>
							)}
							{!isLoading &&
								suggestions.length === 0 &&
								debouncedSearchTerm.length > 2 && (
									<CommandEmpty>
										No results found.
									</CommandEmpty>
								)}
							<CommandGroup>
								{suggestions.map((suggestion) => (
									<CommandItem
										key={suggestion.place_id}
										value={suggestion.description}
										onSelect={() =>
											handleSelect(suggestion)
										}
									>
										{suggestion.description}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</PopoverContent>
				</Popover>
			</Command>
			<Button
				type="button"
				className="h-9"
				disabled={inputValue.trim().length < 3}
				onClick={handleCustomAdd}
			>
				Add
			</Button>
		</div>
	);
}
