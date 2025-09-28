import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a production log entry
export const createProductionLog = mutation({
  args: {
    workerId: v.id("workers"),
    styleId: v.id("styles"),
    organizationId: v.id("organizations"),
    quantity: v.number(),
    productionDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("productionLogs", args);
  },
});

// Get production logs by worker and date range
export const getProductionLogsByWorker = query({
  args: {
    workerId: v.id("workers"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("productionLogs")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId));

    if (args.startDate && args.endDate) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("productionDate"), args.startDate!),
          q.lte(q.field("productionDate"), args.endDate!)
        )
      );
    }

    const logs = await query.collect();

    // Get style and worker details for each log
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const [style, worker] = await Promise.all([
          ctx.db.get(log.styleId),
          ctx.db.get(log.workerId),
        ]);
        return {
          ...log,
          style,
          worker,
        };
      })
    );

    return logsWithDetails;
  },
});

// Get production logs by date for organization
export const getProductionLogsByDate = query({
  args: {
    date: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("productionLogs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("productionDate"), args.date))
      .collect();

    // Get style and worker details for each log
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const [style, worker] = await Promise.all([
          ctx.db.get(log.styleId),
          ctx.db.get(log.workerId),
        ]);

        // Get section for worker
        const section = worker ? await ctx.db.get(worker.sectionId) : null;

        return {
          ...log,
          style,
          worker: worker ? { ...worker, section } : null,
        };
      })
    );

    return logsWithDetails;
  },
});

// Calculate payroll for a worker in a date range
export const calculateWorkerPayroll = query({
  args: {
    workerId: v.id("workers"),
    startDate: v.string(),
    endDate: v.string(),
    bonusRuleId: v.optional(v.id("bonusRules")),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("productionLogs")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .filter((q) =>
        q.and(
          q.gte(q.field("productionDate"), args.startDate),
          q.lte(q.field("productionDate"), args.endDate)
        )
      )
      .collect();

    let totalPay = 0;
    const payrollDetails: any[] = [];

    // Aggregates for potential bonus scoping
    let scopedQuantity = 0;
    let scopedWage = 0;

    // Preload bonus rule if provided
    const bonusRule = args.bonusRuleId ? await ctx.db.get(args.bonusRuleId) : null;

    for (const log of logs) {
      // Get the rate for this style on the production date (within active period)
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
        const logPay = log.quantity * currentRate.rate;
        totalPay += logPay;

        const [style, worker] = await Promise.all([
          ctx.db.get(log.styleId),
          ctx.db.get(log.workerId),
        ]);

        // For bonus scoping, include this log if it matches filters (if any)
        const matchesStyle = !bonusRule?.styleId || bonusRule.styleId === log.styleId;
        const matchesSection = !bonusRule?.sectionId || (worker && worker.sectionId === bonusRule.sectionId);
        if (matchesStyle && matchesSection) {
          scopedQuantity += log.quantity;
          scopedWage += logPay;
        }

        payrollDetails.push({
          ...log,
          style,
          rate: currentRate.rate,
          pay: logPay,
        });
      }
    }

    // Compute bonus if a rule is provided
    let bonusAmount = 0;
    let criteriaValue = 0;
    let applied = false;

    if (bonusRule) {
      // Determine criteria value based on rule
      criteriaValue = bonusRule.criteriaType === "quantity" ? scopedQuantity : scopedWage;
      const withinDate = (
        (!bonusRule.effectiveDate || bonusRule.effectiveDate <= args.endDate) &&
        (!bonusRule.endDate || bonusRule.endDate >= args.startDate)
      );
      const isActive = bonusRule.active === true;
      if (isActive && withinDate && criteriaValue > bonusRule.threshold) {
        applied = true;
        // Determine basis for bonus amount
        const basis = bonusRule.applyOn === "wage" ? totalPay : scopedQuantity;
        if (bonusRule.bonusType === "percent") {
          bonusAmount = (basis * bonusRule.bonusValue) / 100;
        } else {
          bonusAmount = bonusRule.bonusValue;
        }
      }
    }

    const totalWithBonus = totalPay + bonusAmount;

    return {
      totalPay,
      details: payrollDetails,
      bonus: bonusRule
        ? {
            applied,
            ruleId: bonusRule._id,
            name: bonusRule.name,
            criteriaType: bonusRule.criteriaType,
            threshold: bonusRule.threshold,
            criteriaValue,
            bonusType: bonusRule.bonusType,
            bonusValue: bonusRule.bonusValue,
            applyOn: bonusRule.applyOn,
            scopedQuantity,
            scopedWage,
            bonusAmount,
            totalWithBonus,
          }
        : null,
      totalWithBonus,
    };
  },
});

// Update production log
export const updateProductionLog = mutation({
  args: {
    logId: v.id("productionLogs"),
    workerId: v.id("workers"),
    styleId: v.id("styles"),
    quantity: v.number(),
    productionDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { logId, ...updates } = args;
    await ctx.db.patch(logId, updates);
  },
});

// Delete production log
export const deleteProductionLog = mutation({
  args: { logId: v.id("productionLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.logId);
  },
});
