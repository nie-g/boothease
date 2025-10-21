// convex/businessProfiles.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch a business profile by the user ID
 */
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("business_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/**
 * Update a business profile
 */
export const updateProfile = mutation({
  args: {
    profileId: v.id("business_profiles"),
    businessName: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    social_links: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
  },
  handler: async (
    ctx,
    {
      profileId,
      businessName,
      category,
      description,
      email,
      phone,
      website,
      address,
      city,
      province,
      postalCode,
      country,
      social_links,
    }
  ) => {
    await ctx.db.patch(profileId, {
      businessName,
      category,
      description,
      email,
      phone,
      website,
      address,
      city,
      province,
      postalCode,
      country,
      social_links,
      updatedAt: Date.now(),
    });
  },
});
