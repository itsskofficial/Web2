"use client";

import { signOut } from "firebase/auth";
import { auth } from "@lib/firebase";
import { useAuth } from "@context/AuthContext";
import { Button } from "@components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { toast } from "sonner";

export function UserNav() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			toast.success("Signed out successfully.");
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred.");
			}
		}
	};

	const getInitials = (name: string | null | undefined) => {
		if (!name) return "U";
		const names = name.split(" ");
		if (names.length > 1) {
			return `${names[0][0]}${names[1][0]}`;
		}
		return name[0];
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-8 w-8 rounded-full"
				>
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.photoURL ?? ""}
							alt={user.displayName ?? "User"}
						/>
						<AvatarFallback>
							{getInitials(user.displayName)}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{user.displayName ?? "User"}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{/* Add more items here like Profile, Settings etc. */}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
