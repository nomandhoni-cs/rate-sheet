import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    inviteCode: v.string(), // Unique code for joining organization
    createdBy: v.string(), // Clerk ID of creator
    createdAt: v.number(),
    // Organization address/location (optional)
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_creator", ["createdBy"]),

  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    organizationId: v.optional(v.id("organizations")),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("pending")
    ),
    hasCompletedOnboarding: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["organizationId"])
    .index("by_role", ["role"]),

  invitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager")),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired")
    ),
    token: v.string(), // Unique invitation token
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  sections: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    managerId: v.id("users"),
  })
    .index("by_organization", ["organizationId"])
    .index("by_manager", ["managerId"]),

  workers: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    sectionId: v.id("sections"),
    manualId: v.optional(v.string()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_section", ["sectionId"])
    .index("by_org_manualId", ["organizationId", "manualId"]),

  styles: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    sectionId: v.optional(v.id("sections")),
  })
    .index("by_organization", ["organizationId"])
    .index("by_section", ["sectionId"]),

  styleRates: defineTable({
    styleId: v.id("styles"),
    organizationId: v.id("organizations"),
    rate: v.number(),
    effectiveDate: v.string(), // Format: "YYYY-MM-DD"
    endDate: v.optional(v.string()), // Optional end date for custom period
  })
    .index("by_organization", ["organizationId"])
    .index("by_style", ["styleId"])
    .index("by_style_and_date", ["styleId", "effectiveDate"]),

  productionLogs: defineTable({
    workerId: v.id("workers"),
    styleId: v.id("styles"),
    organizationId: v.id("organizations"),
    quantity: v.number(),
    productionDate: v.string(), // Format: "YYYY-MM-DD"
  })
    .index("by_organization", ["organizationId"])
    .index("by_worker", ["workerId"])
    .index("by_style", ["styleId"])
    .index("by_date", ["productionDate"])
    .index("by_worker_and_date", ["workerId", "productionDate"]),

  // Organization-level bonus rules
  bonusRules: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    // criteriaType: how to evaluate threshold
    // - "quantity": total quantity in period (optionally filtered by style)
    // - "wage": total base wage in period
    criteriaType: v.union(v.literal("quantity"), v.literal("wage")),
    threshold: v.number(),
    // bonusType: how to compute bonus amount
    // - "percent": percentage of base
    // - "fixed": fixed amount added
    bonusType: v.union(v.literal("percent"), v.literal("fixed")),
    bonusValue: v.number(),
    // applyOn: the base used for percent bonus
    // - "wage": percent of total wage
    // - "quantity": percent of quantity (then multiplied by optional perUnitValue if provided client-side)
    applyOn: v.union(v.literal("wage"), v.literal("quantity")),
    // Optional scoping
    styleId: v.optional(v.id("styles")),
    sectionId: v.optional(v.id("sections")),
    active: v.boolean(),
    effectiveDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_active", ["organizationId", "active"]) 
    .index("by_effective", ["organizationId", "effectiveDate"]),
});
