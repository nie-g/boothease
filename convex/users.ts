import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";


export const storeClerkUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("owner"), v.literal("renter"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    console.log("storeClerkUser called with:", args);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    let userId;
    if (existing) {
      console.log("🔄 Existing user found, patching _id:", existing._id);
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: args.role,
      });
      userId = existing._id;
      console.log("✅ Patch complete");
    } else {
      console.log("🆕 No existing user — inserting new user");
      userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: args.role,
        status: "active",
        createdAt: Date.now(),
      });
      console.log("✅ Insert complete");
    }

     if (args.role === "owner") {
      // Check if this user already has a business profile
      const existingProfile = await ctx.db
        .query("business_profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

      // Create new business profile if none exists
      if (!existingProfile) {
        await ctx.db.insert("business_profiles", {
          userId: userId,
          businessName: "",
          category: "",
          description: "",
          email: args.email, // you can prefill from users table if needed
          phone: "",
          website: "",
          social_links: [],
          address: "",
          city: "",
          province: "",
          postalCode: "",
          country: "Philippines",
          createdAt: Date.now(),
        });
      }
    }



  },
});

// quick debug query (frontend can call this)
