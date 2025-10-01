import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getProjectById = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		return project;
	},
});

export const updateStyleGuide = mutation({
	args: {
		projectId: v.id("projects"),
		styleGuide: v.any(), // Assuming styleGuide is a JSON object
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}

		await ctx.db.patch(args.projectId, { styleGuide: args.styleGuide });
	},
});

export const createProject = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error("Unauthorized");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier)
			)
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		// Simple counter for project number (can be improved in production)
		const userProjects = await ctx.db
			.query("projects")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();
		const projectNumber = userProjects.length + 1;

		const project = await ctx.db.insert("projects", {
			userId: user._id,
			name: args.name,
			description: args.description,
			isPublic: false,
			projectNumber: projectNumber,
			// Initialize other fields as needed
			styleGuide: null,
			sketchesData: null,
			viewportData: null,
			moodboardImages: [],
			inspirationImages: [],
		});

		return project;
	},
});

export const getProjectsForUser = query({
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return [];
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier)
			)
			.unique();

		if (!user) {
			return [];
		}

		const projects = await ctx.db
			.query("projects")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.order("desc")
			.collect();
		return projects;
	},
});
