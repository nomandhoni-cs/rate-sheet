import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(), // Clerk ID
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique invite code
    let inviteCode: string;
    let isUnique = false;

    do {
      inviteCode = generateInviteCode();
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .unique();
      isUnique = !existing;
    } while (!isUnique);

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      inviteCode,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      city: args.city,
      state: args.state,
      postalCode: args.postalCode,
      country: args.country,
    });

    return { organizationId, inviteCode };
  },
});

// Get organization by invite code
export const getOrganizationByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();
  },
});

// Get organization by ID
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

// Get user's organization
export const getUserOrganization = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user || !user.organizationId) {
      return null;
    }

    return await ctx.db.get(user.organizationId);
  },
});

// Update organization
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...updates } = args;
    await ctx.db.patch(organizationId, updates);
  },
});

// Regenerate invite code
export const regenerateInviteCode = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    let inviteCode: string;
    let isUnique = false;

    do {
      inviteCode = generateInviteCode();
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .unique();
      isUnique = !existing;
    } while (!isUnique);

    await ctx.db.patch(args.organizationId, { inviteCode });
    return inviteCode;
  },
});
