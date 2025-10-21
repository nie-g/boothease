import { query, mutation,action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const listAllBooths = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("booths").collect();
  },
});

export const listAllBoothsByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.query("booths")
      .filter(q => q.eq(q.field("ownerId"), args.ownerId))
      .collect();
  },
});

/** ✅ Create Booth Mutation */
export const createBooth = mutation({
  args: {
    eventId: v.id("events"),
    ownerId: v.id("users"),
    name: v.string(),
    size: v.string(),
    price: v.number(),
    dailyOperatingHours: v.number(),
    location: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined")
    ),
    availability_status: v.union(
      v.literal("available"),
      v.literal("reserved"),
      v.literal("unavailable")
    ),
    preview_image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const boothId = await ctx.db.insert("booths", {
      ...args,
      createdAt: Date.now(),
    });
    return boothId;
  },
});

export const saveBoothThumbnail = action({
  args: {
    boothId: v.id("booths"),
    fileBytes: v.bytes(),
  },
  handler: async (ctx, { boothId, fileBytes }): Promise<Id<"booths">> => {
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    // ✅ Correct mutation reference
    return await ctx.runMutation(api.booths.insertBoothThumbnail, {
      boothId,
      storageId,
    });
  },
});

export const insertBoothThumbnail = mutation({
  args: {
    boothId: v.id("booths"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<Id<"booths">> => {
    await ctx.db.patch(args.boothId, {
      thumbnail: args.storageId,
    });
    return args.boothId;
  },
});

export const saveBoothLayout = action({
  args: {
    boothId: v.id("booths"),
    fileBytes: v.bytes(),
  },
  handler: async (ctx, { boothId, fileBytes }): Promise<Id<"booths">> => {
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    // ✅ Correct mutation reference
    return await ctx.runMutation(api.booths.insertBoothLayout, {
      boothId: boothId,
      storageId,
    });
  },
});

export const insertBoothLayout = mutation({
  args: {
    boothId: v.id("booths"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<Id<"booths">> => {
    await ctx.db.patch(args.boothId, {
      booth_layout: args.storageId,
    });
    return args.boothId;
  },
});

export const approveBooth = mutation({
  args: { boothId: v.id("booths") },
  handler: async (ctx, { boothId }) => {
    await ctx.db.patch(boothId, { status: "approved" });
  },
});

export const declineBooth = mutation({
  args: { boothId: v.id("booths") },
  handler: async (ctx, { boothId }) => {
    await ctx.db.patch(boothId, { status: "declined" });
  },
});

export const listApprovedBooths = query({
  args: {},
  handler: async (ctx) => {
    const booths = await ctx.db
      .query("booths")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();
    return booths;
  },
});

export const getById = query({
  args: { boothId: v.id("booths") },
  handler: async (ctx, { boothId }) => {
    const booth = await ctx.db.get(boothId);
    if (!booth) return null;
    return booth;
  },
});

export const cancelBooth = mutation({
  args: { boothId: v.id("booths") },
  handler: async (ctx, { boothId }) => {
    const booth = await ctx.db.get(boothId);
    if (!booth) throw new Error("Booth not found");

    await ctx.db.patch(boothId, {
      status: "cancelled",
      availability_status: "available",
    });
  },
});

export const updateBooth = mutation({
  args: {
    boothId: v.id("booths"),
    name: v.string(),
    size: v.string(),
    price: v.number(),
    dailyOperatingHours: v.optional(v.number()),
    location: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, { boothId, ...data }) => {
    await ctx.db.patch(boothId, data);
  },
});