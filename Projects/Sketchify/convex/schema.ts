import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		image: v.string(),
		tokenIdentifier: v.string(),
	}).index("by_token", ["tokenIdentifier"]),

	projects: defineTable({
		userId: v.id("users"),
		name: v.string(),
		description: v.optional(v.string()),
		styleGuide: v.optional(v.any()), // Store generated style guide JSON
		sketchesData: v.optional(v.string()), // Store Redux state for shapes
		viewportData: v.optional(v.string()), // Store Redux state for viewport
		moodboardImages: v.optional(
			v.array(v.object({ storageId: v.string(), url: v.string() }))
		),
		inspirationImages: v.optional(
			v.array(v.object({ storageId: v.string(), url: v.string() }))
		),
		isPublic: v.boolean(),
		tags: v.optional(v.array(v.string())),
		projectNumber: v.number(),
	}).index("by_user", ["userId"]),

	subscriptions: defineTable({
		userId: v.id("users"),
		polarSubscriptionId: v.string(),
		endsOn: v.optional(v.number()),
		plan: v.string(),
		status: v.string(), // e.g., "active", "canceled"
		creditBalance: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_polar_subscription_id", ["polarSubscriptionId"]),

	creditLedger: defineTable({
		userId: v.id("users"),
		subscriptionId: v.id("subscriptions"),
		amount: v.number(), // can be positive (grant) or negative (consumption)
		reason: v.string(), // "grant", "generation", "workflow"
		idempotencyKey: v.string(),
	})
		.index("by_user", ["userId"])
		.index("by_idempotency_key", ["idempotencyKey"]),
});
