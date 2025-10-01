import { SubscriptionButton } from "@/components/billing/subscription-button";
import { Check } from "lucide-react";
import React from "react";

const BillingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="border rounded-lg p-8 bg-card text-card-foreground shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">Standard Plan</h1>
          <p className="text-center text-muted-foreground mb-6">
            Unlock all AI features.
          </p>
          <div className="text-center mb-8">
            <span className="text-4xl font-bold">$10</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3" />
              <span>10 AI Credits per month</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3" />
              <span>Unlimited Projects</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3" />
              <span>Full Access to AI Tools</span>
            </li>
          </ul>
          <SubscriptionButton />
        </div>
      </div>
    </div>
  );
};

export default BillingPage;