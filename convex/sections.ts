import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new section
export const createSection = mutation({
  args: {
    name: v.string(),
    managerId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sections", args);
  },
});

// Get all sections in organization
export const getAllSections = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Get manager details for each section
    const sectionsWithManagers = await Promise.all(
      sections.map(async (section) => {
        const manager = await ctx.db.get(section.managerId);
        return {
          ...section,
          manager,
        };
      })
    );

    return sectionsWithManagers;
  },
});

// Get sections by manager
export const getSectionsByManager = query({
  args: { managerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_manager", (q) => q.eq("managerId", args.managerId))
      .collect();
  },
});

// Update section
export const updateSection = mutation({
  args: {
    sectionId: v.id("sections"),
    name: v.string(),
    managerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { sectionId, ...updates } = args;
    await ctx.db.patch(sectionId, updates);
  },
});

// Delete section
export const deleteSection = mutation({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sectionId);
  },
});

// Get section summary for a date range
export const getSectionSummary = query({
  args: {
    sectionId: v.id("sections"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all workers in the section
    const workers = await ctx.db
      .query("workers")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    let totalQuantity = 0;
    let totalPay = 0;
    const styleSummaries: Record<
      string,
      { name: string; quantity: number; pay: number }
    > = {};

    for (const worker of workers) {
      const logs = await ctx.db
        .query("productionLogs")
        .withIndex("by_worker", (q) => q.eq("workerId", worker._id))
        .filter((q) =>
          q.and(
            q.gte(q.field("productionDate"), args.startDate),
            q.lte(q.field("productionDate"), args.endDate)
          )
        )
        .collect();

      for (const log of logs) {
        let logPay = 0;

        const rates = await ctx.db
          .query("styleRates")
          .withIndex("by_style", (q) => q.eq("styleId", log.styleId))
          .filter((q) =>
            q.and(
              q.lte(q.field("effectiveDate"), log.productionDate),
              q.or(
                q.eq(q.field("endDate"), undefined as any),
                q.gte(q.field("endDate"), log.productionDate)
              )
            )
          )
          .collect();
        const currentRate = rates.sort((a, b) =>
          b.effectiveDate.localeCompare(a.effectiveDate)
        )[0];
        if (currentRate) {
          logPay = log.quantity * currentRate.rate;
        }

        totalQuantity += log.quantity;
        totalPay += logPay;

        const style = await ctx.db.get(log.styleId);
        if (style) {
          if (!styleSummaries[style._id]) {
            styleSummaries[style._id] = {
              name: style.name,
              quantity: 0,
              pay: 0,
            };
          }
          styleSummaries[style._id].quantity += log.quantity;
          styleSummaries[style._id].pay += logPay;
        }
      }
    }

    return {
      totalQuantity,
      totalPay,
      styleSummaries: Object.values(styleSummaries),
    };
  },
});
