import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user from Clerk
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user info but keep existing role and onboarding status
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
      });
      return existingUser._id;
    } else {
      // Create new user with pending status
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        role: "pending",
        hasCompletedOnboarding: false,
      });
    }
  },
});

// Demote user to pending (admin only) without removing from organization
export const demoteUserToPending = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to change a user's role.");
    }

    const callingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!callingUser || callingUser.role !== "admin") {
      throw new Error("You must be an admin to change a user's role.");
    }

    const userToDemote = await ctx.db.get(args.userId);

    if (!userToDemote) {
      throw new Error("User not found.");
    }

    // Same organization enforcement
    if (userToDemote.organizationId !== callingUser.organizationId) {
      throw new Error("User is not in your organization.");
    }

    // If the user is a manager assigned to sections, prevent demotion until reassigned
    const assignedSections = await ctx.db
      .query("sections")
      .withIndex("by_manager", (q) => q.eq("managerId", args.userId))
      .collect();

    if (assignedSections.length > 0) {
      throw new Error(
        "This manager is assigned to one or more sections. Please re-assign them before changing the role to pending."
      );
    }

    await ctx.db.patch(args.userId, {
      role: "pending",
    });
  },
});

// Join organization with invite code
export const joinOrganization = mutation({
  args: {
    clerkId: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!organization) {
      throw new Error("Invalid invite code");
    }

    // Check if there's a pending invitation for this user
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), organization._id),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    let role = "manager"; // Default role
    if (invitation) {
      role = invitation.role;
      // Mark invitation as accepted
      await ctx.db.patch(invitation._id, { status: "accepted" });
    }

    // Update user with organization and role
    await ctx.db.patch(user._id, {
      organizationId: organization._id,
      role: role as any,
      hasCompletedOnboarding: true,
    });

    return { success: true, role };
  },
});

// Create organization and set user as admin
export const createOrganizationAndSetAdmin = mutation({
  args: {
    clerkId: v.string(),
    organizationName: v.string(),
    organizationDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate unique invite code
    let inviteCode: string;
    let isUnique = false;

    do {
      inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .unique();
      isUnique = !existing;
    } while (!isUnique);

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.organizationName,
      description: args.organizationDescription,
      inviteCode,
      createdBy: args.clerkId,
      createdAt: Date.now(),
    });

    // Update user as admin
    await ctx.db.patch(user._id, {
      organizationId,
      role: "admin",
      hasCompletedOnboarding: true,
    });

    return { organizationId, inviteCode };
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Get users in organization
export const getUsersInOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("manager")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

// Remove user from organization (admin only)
export const removeUserFromOrganization = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to remove a user.");
    }

    const callingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!callingUser || callingUser.role !== "admin") {
      throw new Error("You must be an admin to remove a user.");
    }

    const userToRemove = await ctx.db.get(args.userId);

    if (!userToRemove) {
      throw new Error("User to remove not found.");
    }

    // Check if the user to remove is in the same organization
    if (userToRemove.organizationId !== callingUser.organizationId) {
      throw new Error("User is not in your organization.");
    }

    // Check if the manager is assigned to any sections
    const assignedSections = await ctx.db
      .query("sections")
      .withIndex("by_manager", (q) => q.eq("managerId", args.userId))
      .collect();

    if (assignedSections.length > 0) {
      throw new Error(
        "This manager is still assigned to one or more sections. Please re-assign them before removing the manager."
      );
    }

    // Remove user from organization
    await ctx.db.patch(args.userId, {
      organizationId: undefined,
      role: "pending",
    });
  },
});

// Complete onboarding
export const completeOnboarding = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { hasCompletedOnboarding: true });
  },
});
