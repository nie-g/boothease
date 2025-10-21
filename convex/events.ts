import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

/* =====================
   📋 QUERY
===================== */
export const listAllEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

/* =====================
   🏁 CREATE EVENT
===================== */
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    event_thumbnail: v.optional(v.id("_storage")),
    booth_layout: v.optional(v.id("_storage")), // ✅ Added field for layout
    status: v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("ended")
    ),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    numberOfDays: v.number(),
    location: v.object({
      address: v.optional(v.string()),
      lat: v.number(),
      lng: v.number(),
    }),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      ...args,
      createdAt: Date.now(),
    });
    return eventId;
  },
});

/* =====================
   🖼️ EVENT THUMBNAIL UPLOAD
===================== */
export const saveEventThumbnail = action({
  args: {
    eventId: v.id("events"),
    fileBytes: v.bytes(), // ArrayBuffer from client
  },
  handler: async (ctx, { eventId, fileBytes }): Promise<Id<"events">> => {
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    return await ctx.runMutation(api.events.insertEventThumbnail, {
      eventId,
      storageId,
    });
  },
});

export const insertEventThumbnail = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    await ctx.db.patch(args.eventId, {
      event_thumbnail: args.storageId,
    });
    return args.eventId;
  },
});

/* =====================
   🗺️ EVENT BOOTH LAYOUT UPLOAD
===================== */


export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return event;
  },
});