import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const getSubscriptionByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
        return subscription;
    },
});

export const getCreditBalance = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
        if (!user) return null;

        const subscription = await getSubscriptionByUserId(ctx, { userId: user._id });
        return subscription?.creditBalance ?? 0;
    }
});

// Internal mutation to create or update a subscription from a webhook
export const createOrUpdateSubscription = internalMutation({
    args: {
        userId: v.id("users"),
        polarSubscriptionId: v.string(),
        endsOn: v.number(),
        plan: v.string(),
        status: v.string(),
    },
    handler: async (ctx, { userId, polarSubscriptionId, ...rest }) => {
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_polar_subscription_id", (q) => q.eq("polarSubscriptionId", polarSubscriptionId))
            .first();

        const creditGrant = 10; // Grant 10 credits on new subscription/renewal

        if (existing) {
            // Update existing subscription
            await ctx.db.patch(existing._id, { ...rest });
            // If renewing, grant credits
            if (rest.status === 'active') {
                await ctx.db.patch(existing._id, { creditBalance: (existing.creditBalance || 0) + creditGrant });
            }
        } else {
            // Create new subscription
            await ctx.db.insert("subscriptions", {
                userId,
                polarSubscriptionId,
                creditBalance: creditGrant,
                ...rest,
            });
        }
    },
});

// Internal mutation to decrement credits
export const consumeCredit = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const subscription = await getSubscriptionByUserId(ctx, { userId: args.userId });

        if (!subscription || subscription.creditBalance <= 0) {
            throw new Error("Insufficient credits");
        }

        await ctx.db.patch(subscription._id, {
            creditBalance: subscription.creditBalance - 1,
        });
    },
});