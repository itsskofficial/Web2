"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const BillingSuccessPage = () => {
    const router = useRouter();
    const hasEntitlement = useQuery(api.users.hasActiveSubscription);

    useEffect(() => {
        if (hasEntitlement === true) {
            // Redirect to dashboard after a short delay to ensure DB is updated
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        }
        // If hasEntitlement is false, we wait for the webhook to update it.
        // A timeout could be added here to handle webhook delays.
    }, [hasEntitlement, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">Finalizing your subscription...</h1>
            <p className="text-muted-foreground">
                Please wait while we confirm your payment. You will be redirected shortly.
            </p>
        </div>
    );
};

export default BillingSuccessPage;