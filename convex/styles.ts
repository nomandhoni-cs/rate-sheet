import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new style
export const createStyle = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    sectionId: v.optional(v.id("sections")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("styles", args);
  },
});

// Get all styles in organization
export const getAllStyles = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("styles")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});

// Get style summary for a section and date range
export const getStyleSummaryForSection = query({
  args: {
    styleId: v.id("styles"),
    sectionId: v.id("sections"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const workers = await ctx.db
      .query("workers")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    let totalQuantity = 0;
    let totalPay = 0;

    for (const worker of workers) {
      const logs = await ctx.db
        .query("productionLogs")
        .withIndex("by_worker", (q) => q.eq("workerId", worker._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("styleId"), args.styleId),
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
      }
    }

    return {
      totalQuantity,
      totalPay,
    };
  },
});

// Update style
export const updateStyle = mutation({
  args: {
    styleId: v.id("styles"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { styleId, ...updates } = args;
    await ctx.db.patch(styleId, updates);
  },
});

// Delete style
export const deleteStyle = mutation({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.styleId);
  },
});

// Create or update style rate
export const createStyleRate = mutation({
  args: {
    styleId: v.id("styles"),
    organizationId: v.id("organizations"),
    rate: v.number(),
    effectiveDate: v.string(),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("styleRates", args);
  },
});

// Update style rate
export const updateStyleRate = mutation({
  args: {
    styleRateId: v.id("styleRates"),
    rate: v.number(),
    effectiveDate: v.string(),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { styleRateId, ...updates } = args;
    await ctx.db.patch(styleRateId, updates);
  },
});

// Delete style rate
export const deleteStyleRate = mutation({
  args: {
    styleRateId: v.id("styleRates"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.styleRateId);
  },
});

// Get current rate for a style on a specific date
export const getStyleRate = query({
  args: {
    styleId: v.id("styles"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all rates for this style that are active on the specified date
    const rates = await ctx.db
      .query("styleRates")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .filter((q) =>
        q.and(
          q.lte(q.field("effectiveDate"), args.date),
          q.or(q.eq(q.field("endDate"), undefined as any), q.gte(q.field("endDate"), args.date))
        )
      )
      .collect();

    // Return the most recent effective rate among active ones
    return rates.sort((a, b) =>
      b.effectiveDate.localeCompare(a.effectiveDate)
    )[0];
  },
});

// Get all rates for a style
export const getStyleRates = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("styleRates")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();
  },
});
