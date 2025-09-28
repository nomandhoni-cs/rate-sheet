import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new worker
export const createWorker = mutation({
  args: {
    name: v.string(),
    sectionId: v.id("sections"),
    organizationId: v.id("organizations"),
    manualId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If manualId is provided, ensure it's unique within the organization
    if (args.manualId) {
      const existing = await ctx.db
        .query("workers")
        .withIndex("by_org_manualId", (q) =>
          q.eq("organizationId", args.organizationId).eq("manualId", args.manualId!)
        )
        .unique();

      if (existing) {
        throw new Error(
          "A worker with this manual ID already exists in the organization."
        );
      }
    }

    return await ctx.db.insert("workers", args);
  },
});

// Get all workers in organization
export const getAllWorkers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const workers = await ctx.db
      .query("workers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Get section details for each worker
    const workersWithSections = await Promise.all(
      workers.map(async (worker) => {
        const section = await ctx.db.get(worker.sectionId);
        return {
          ...worker,
          section,
        };
      })
    );

    return workersWithSections;
  },
});

// Get workers by section
export const getWorkersBySection = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workers")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();
  },
});

// Update worker
export const updateWorker = mutation({
  args: {
    workerId: v.id("workers"),
    name: v.string(),
    sectionId: v.id("sections"),
    manualId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workerId, manualId, ...updates } = args;

    // If manualId provided, ensure uniqueness within the organization
    if (typeof manualId !== 'undefined') {
      const existing = await ctx.db.get(workerId);
      if (!existing) throw new Error("Worker not found");

      if (manualId) {
        const dup = await ctx.db
          .query("workers")
          .withIndex("by_org_manualId", (q) =>
            q.eq("organizationId", existing.organizationId).eq("manualId", manualId)
          )
          .unique();

        if (dup && dup._id !== workerId) {
          throw new Error("A worker with this manual ID already exists in the organization.");
        }
      }

      await ctx.db.patch(workerId, { ...updates, manualId: manualId || undefined });
      return;
    }

    await ctx.db.patch(workerId, updates);
  },
});

// Delete worker
export const deleteWorker = mutation({
  args: { workerId: v.id("workers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.workerId);
  },
});
