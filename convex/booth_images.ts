import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

/* ------------------- MUTATION: Insert Booth Image ------------------- */
export const insertBoothImages = mutation({
  args: {
    boothId: v.id("booths"),
    uploadedBy: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { boothId, uploadedBy, storageId }): Promise<Id<"booth_images">> => {
    const now = Date.now();
    return await ctx.db.insert("booth_images", {
      boothId,
      uploadedBy,
      storageId,
      createdAt: now,
    });
  },
});

/* ------------------- ACTION: Save Booth Image ------------------- */
export const saveBoothImages = action({
  args: {
    boothId: v.id("booths"),
    userId: v.id("users"),
    fileBytes: v.bytes(), // ArrayBuffer from client
  },
  handler: async (ctx, { boothId, userId, fileBytes }): Promise<Id<"booth_images">> => {
    // 1. Convert ArrayBuffer -> Blob
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });

    // 2. Store in Convex storage
    const storageId = await ctx.storage.store(blob);

    // 3. Save DB record
    return await ctx.runMutation(api.booth_images.insertBoothImages, {
      boothId,
      uploadedBy: userId,
      storageId,
    });
  },
});

export const getByBoothId = query({
  args: { boothId: v.id("booths") },
  handler: async (ctx, { boothId }) => {
   return await ctx.db
    .query("booth_images")
    .filter((q) => q.eq(q.field("boothId"), boothId))
    .collect();

  },
});

export const deleteBoothImages = mutation({
  args: {
    boothId: v.id("booths"),
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, { boothId, storageIds }) => {
    // Fetch all booth images
    const allImages = await ctx.db
      .query("booth_images")
      .filter((q) => q.eq(q.field("boothId"), boothId))
      .collect();

    // Decide which images to delete
    const imagesToDelete = storageIds
      ? allImages.filter((img) => storageIds.includes(img.storageId))
      : allImages; // delete all if no storageIds

    for (const img of imagesToDelete) {
      if (img.storageId) await ctx.storage.delete(img.storageId);
      await ctx.db.delete(img._id);
    }
  },
});



/* ------------------- 🆕 ACTION: Edit Booth Images ------------------- */
export const editBoothImages = action({
  args: {
    boothId: v.id("booths"),
    userId: v.id("users"),
    fileBytes: v.bytes(), // New image bytes
  },
  handler: async (ctx, { boothId, userId, fileBytes }): Promise<Id<"booth_images">> => {
    // Step 1️⃣ Delete old booth images
    await ctx.runMutation(api.booth_images.deleteBoothImages, { boothId });

    // Step 2️⃣ Upload the new image and insert record
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    // Step 3️⃣ Insert new record
    const newImageId = await ctx.runMutation(api.booth_images.insertBoothImages, {
      boothId,
      uploadedBy: userId,
      storageId,
    });

    return newImageId;
  },
});

export const uploadSingleBoothImage = action({
  args: {
    boothId: v.id("booths"),
    userId: v.id("users"),
    fileBytes: v.bytes(),
  },
  handler: async (ctx, { boothId, userId, fileBytes }): Promise<Id<"booth_images">> => {
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    return await ctx.runMutation(api.booth_images.insertBoothImages, {
      boothId,
      uploadedBy: userId,
      storageId,
    });
  },
});