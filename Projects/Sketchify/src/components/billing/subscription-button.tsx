"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const SubscriptionButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/checkout");
      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Could not create checkout session.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} disabled={isLoading} className="w-full">
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Subscribe
    </Button>
  );
};