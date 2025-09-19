"use client";

import { useState } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
} from "firebase/auth";
import { auth } from "@lib/firebase";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
	<svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
		<path
			fill="#EA4335"
			d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
		></path>
		<path
			fill="#4285F4"
			d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
		></path>
		<path
			fill="#FBBC05"
			d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
		></path>
		<path
			fill="#34A853"
			d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
		></path>
		<path fill="none" d="M0 0h48v48H0z"></path>
	</svg>
);

export function AuthForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			if (isSignUp) {
				await createUserWithEmailAndPassword(auth, email, password);
				toast.success(
					"Account created successfully! You are now logged in."
				);
			} else {
				await signInWithEmailAndPassword(auth, email, password);
				toast.success("Signed in successfully!");
			}
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "An unexpected error occurred.";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
			toast.success("Signed in with Google successfully!");
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "An unexpected error occurred.";
			toast.error(message);
		} finally {
			setIsGoogleLoading(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-sm">
			<div className="text-center mb-6">
				<h1 className="text-3xl font-bold">
					{isSignUp ? "Create an Account" : "Sign In"}
				</h1>
				<p className="text-muted-foreground">
					Enter your credentials to continue
				</p>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						placeholder="m@example.com"
					/>
				</div>
				<div>
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						placeholder="••••••••"
					/>
				</div>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					{isSignUp ? "Sign Up" : "Sign In"}
				</Button>
			</form>
			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<Button
				variant="outline"
				className="w-full"
				onClick={handleGoogleSignIn}
				disabled={isGoogleLoading}
			>
				{isGoogleLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<GoogleIcon />
				)}
				Google
			</Button>
			<p className="mt-4 text-center text-sm text-muted-foreground">
				{isSignUp
					? "Already have an account?"
					: "Don't have an account?"}{" "}
				<button
					onClick={() => setIsSignUp(!isSignUp)}
					className="font-semibold text-primary hover:underline"
				>
					{isSignUp ? "Sign In" : "Sign Up"}
				</button>
			</p>
		</div>
	);
}
