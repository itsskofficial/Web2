import { ingest } from "./client";
import { internal } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";

// This is the Ingest function that will process the Polar webhook
export const handlePolarWebhook = ingest.createFunction(
  { id: "handle-polar-webhook" },
  { event: "polar/webhook.received" },
  async ({ event, step }) => {
    const { type, data } = event.data.payload;
    const polarSubscriptionId = data.id;

    const user = await step.run("Find User", async () => {
      // Logic to find the user associated with the subscription
      // This is simplified. In a real app, you might use metadata from the checkout.
      // For now, we assume the customer email in Polar matches a user email in Convex.
      const customerEmail = data.customer.email;
      // You'd need a Convex query to find a user by email.
      // Let's assume you have one: `api.users.getUserByEmail`
      // const user = await fetchQuery(api.users.getUserByEmail, { email: customerEmail });
      // return user;
      return null; // Placeholder
    });
    
    // For the demo, we'll assume we get the userId from metadata
    const userId = data.metadata?.userId as Id<"users">;

    if (!userId) {
        return { status: "error", message: "User ID not found in webhook metadata." };
    }

    if (type === "subscription.updated" || type === "subscription.created") {
      await step.run("Create or Update Subscription", async () => {
        await fetchMutation(internal.subscriptions.createOrUpdateSubscription, {
          userId: userId,
          polarSubscriptionId: polarSubscriptionId,
          endsOn: data.current_period_end,
          plan: data.price.product.name.toLowerCase(),
          status: data.status,
        });
      });

      return { status: "success", message: `Subscription ${polarSubscriptionId} processed.` };
    }

    return { status: "ignored", message: `Event type ${type} not handled.` };
  }
);