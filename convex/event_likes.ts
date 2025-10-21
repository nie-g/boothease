import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLikedEventsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("event_likes")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();

    const events = await Promise.all(
      likes.map(async like => ({
        ...like,
        event: await ctx.db.get(like.eventId),
      }))
    );

    return events;
  },
});
