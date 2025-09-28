import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBonusRule = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    criteriaType: v.union(v.literal("quantity"), v.literal("wage")),
    threshold: v.number(),
    bonusType: v.union(v.literal("percent"), v.literal("fixed")),
    bonusValue: v.number(),
    applyOn: v.union(v.literal("wage"), v.literal("quantity")),
    styleId: v.optional(v.id("styles")),
    sectionId: v.optional(v.id("sections")),
    active: v.boolean(),
    effectiveDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bonusRules", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBonusRule = mutation({
  args: {
    ruleId: v.id("bonusRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    criteriaType: v.optional(v.union(v.literal("quantity"), v.literal("wage"))),
    threshold: v.optional(v.number()),
    bonusType: v.optional(v.union(v.literal("percent"), v.literal("fixed"))),
    bonusValue: v.optional(v.number()),
    applyOn: v.optional(v.union(v.literal("wage"), v.literal("quantity"))),
    styleId: v.optional(v.id("styles")),
    sectionId: v.optional(v.id("sections")),
    active: v.optional(v.boolean()),
    effectiveDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { ruleId, ...updates } = args;
    await ctx.db.patch(ruleId, { ...updates, updatedAt: Date.now() });
  },
});

export const deleteBonusRule = mutation({
  args: { ruleId: v.id("bonusRules") },
  handler: async (ctx, args) => {
    // Hard delete for now; could switch to soft delete by toggling active
    await ctx.db.delete(args.ruleId);
  },
});

export const listBonusRules = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bonusRules")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const listActiveBonusRules = query({
  args: { organizationId: v.id("organizations"), onDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const onDate = args.onDate;
    let q = ctx.db
      .query("bonusRules")
      .withIndex("by_active", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("active"), true));

    if (onDate) {
      q = q.filter((q) =>
        q.and(
          q.or(q.eq(q.field("effectiveDate"), undefined as any), q.lte(q.field("effectiveDate"), onDate)),
          q.or(q.eq(q.field("endDate"), undefined as any), q.gte(q.field("endDate"), onDate))
        )
      );
    }

    return await q.collect();
  },
});
