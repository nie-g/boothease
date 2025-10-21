import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

/* ------------------- MUTATION: Insert Event Image ------------------- */
export const insertEventImages = mutation({
  args: {
    eventId: v.id("events"),
    uploadedBy: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { eventId, uploadedBy, storageId }): Promise<Id<"event_images">> => {
    const now = Date.now();
    return await ctx.db.insert("event_images", {
      eventId,
      uploadedBy,
      storageId,
      createdAt: now,
    });
  },
});

/* ------------------- ACTION: Save Event Image ------------------- */
export const saveEventImages = action({
  args: {
    eventId: v.id("events"), // ✅ should be "events" not "booths"
    userId: v.id("users"),
    fileBytes: v.bytes(), // ArrayBuffer from client
  },
  handler: async (ctx, { eventId, userId, fileBytes }): Promise<Id<"event_images">> => {
    // 1️⃣ Convert ArrayBuffer -> Blob
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });

    // 2️⃣ Store in Convex storage
    const storageId = await ctx.storage.store(blob);

    // 3️⃣ Save DB record
    return await ctx.runMutation(api.event_images.insertEventImages, {
      eventId,
      uploadedBy: userId,
      storageId,
    });
  },
});

export const getByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("event_images")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .collect();
  },
});