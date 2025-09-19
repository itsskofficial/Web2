"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/AuthContext";
import { AuthForm } from "@components/auth/auth-form";

export default function LoginPage() {
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push("/");
		}
	}, [user, router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<AuthForm />
		</div>
	);
}
