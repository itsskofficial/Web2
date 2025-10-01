import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Generate a short-lived upload URL for a file
export const generateUploadUrl = mutation({
  args: {
    // You can customize this to ask for a specific file type, size, etc.
  },
  handler: async (ctx) => {
    // See https://docs.convex.dev/file-storage#generate-upload-url
    return await ctx.storage.generateUploadUrl();
  },
});

// Save the storage ID of an uploaded file to a project
export const saveStorageId = mutation({
    args: {
        storageId: v.string(),
        projectId: v.id("projects"),
        type: v.union(v.literal("moodboard"), v.literal("inspiration")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error("Project not found");
        }

        const url = await ctx.storage.getUrl(args.storageId);
        if (!url) {
            throw new Error("Could not get file URL");
        }

        if (args.type === "moodboard") {
            const currentImages = project.moodboardImages || [];
            await ctx.db.patch(args.projectId, {
                moodboardImages: [...currentImages, { storageId: args.storageId, url }],
            });
        } else {
            const currentImages = project.inspirationImages || [];
            await ctx.db.patch(args.projectId, {
                inspirationImages: [...currentImages, { storageId: args.storageId, url }],
            });
        }
    },
});

// Delete a file from storage and remove it from the project
export const deleteFile = mutation({
    args: {
        storageId: v.string(),
        projectId: v.id("projects"),
        type: v.union(v.literal("moodboard"), v.literal("inspiration")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error("Project not found");
        }

        // Delete the file from storage
        await ctx.storage.delete(args.storageId);

        // Remove the file reference from the project document
        if (args.type === "moodboard") {
            const currentImages = project.moodboardImages || [];
            await ctx.db.patch(args.projectId, {
                moodboardImages: currentImages.filter(img => img.storageId !== args.storageId),
            });
        } else {
            const currentImages = project.inspirationImages || [];
            await ctx.db.patch(args.projectId, {
                inspirationImages: currentImages.filter(img => img.storageId !== args.storageId),
            });
        }
    },
});