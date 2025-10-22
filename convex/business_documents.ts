import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/* ============================================================
   BUSINESS DOCUMENTS QUERIES & MUTATIONS (Multi-file support)
   ============================================================ */

/** ✅ List all documents (admin only, typically) */
export const listAllBusinessDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("businessDocuments").collect();
  },
});

/** ✅ List documents by user */
export const listBusinessDocumentsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("businessDocuments")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

/** ✅ Get document by ID */
export const getBusinessDocumentById = query({
  args: { documentId: v.id("businessDocuments") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    return doc || null;
  },
});

/** ✅ Upload multiple documents (action + mutation pair) */
export const uploadBusinessDocument = action({
  args: {
    userId: v.id("users"),
    businessProfileId: v.id("business_profiles"),
    title: v.string(),
    type: v.union(
      v.literal("permit"),
      v.literal("license"),
      v.literal("id"),
      v.literal("contract"),
      v.literal("other")
    ),
    files: v.array(v.bytes()), // ✅ multiple files
  },
  handler: async (
    ctx,
    { userId, businessProfileId, title, type, files }
  ): Promise<Id<"businessDocuments">> => {
    // ✅ Upload all files to Convex storage
    const fileIds: Id<"_storage">[] = [];
    for (const fileBytes of files) {
      const blob = new Blob([new Uint8Array(fileBytes)], { type: "application/octet-stream" });
      const storageId = await ctx.storage.store(blob);
      fileIds.push(storageId);
    }

    // ✅ Create document in DB with multiple file IDs
    const documentId: Id<"businessDocuments"> = await ctx.runMutation(
      api.business_documents.createBusinessDocument,
      {
        businessProfileId,
        title,
        userId,
        type,
        files: fileIds,
      }
    );

    return documentId;
  },
});

/** ✅ Add an image/file to an existing document */
export const saveBusinessDocumentImage = action({
  args: {
    documentId: v.id("businessDocuments"),
    fileBytes: v.bytes(),
  },
  handler: async (ctx, { documentId, fileBytes }): Promise<Id<"businessDocuments">> => {
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "image/png" });
    const storageId = await ctx.storage.store(blob);

    // ✅ Append file reference
    return await ctx.runMutation(api.business_documents.insertBusinessDocumentImage, {
      documentId,
      storageId,
    });
  },
});

/** ✅ Attach an additional file to the document (push to array) */
export const insertBusinessDocumentImage = mutation({
  args: {
    documentId: v.id("businessDocuments"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { documentId, storageId }): Promise<Id<"businessDocuments">> => {
    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");

    const updatedFiles = doc.files ? [...doc.files, storageId] : [storageId];

    await ctx.db.patch(documentId, {
      files: updatedFiles,
      uploadedAt: Date.now(),
    });
    return documentId;
  },
});

/** ✅ Create a document record in DB */
export const createBusinessDocument = mutation({
  args: {
    businessProfileId: v.id("business_profiles"),
    title: v.string(),
    userId: v.id("users"),
    type: v.union(
      v.literal("permit"),
      v.literal("license"),
      v.literal("id"),
      v.literal("contract"),
      v.literal("other")
    ),
    files: v.array(v.id("_storage")), // ✅ array instead of single file
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("businessDocuments", {
      ...args,
      status: "pending",
      uploadedAt: Date.now(),
    });
    return documentId;
  },
});

/** ✅ Approve a document */
export const approveBusinessDocument = mutation({
  args: {
    documentId: v.id("businessDocuments"),
    reviewedBy: v.id("users"),
  },
  handler: async (ctx, { documentId, reviewedBy }) => {
    await ctx.db.patch(documentId, {
      status: "verified",
      reviewedBy,
      reviewedAt: Date.now(),
    });
  },
});

/** ✅ Reject a document */
export const rejectBusinessDocument = mutation({
  args: {
    documentId: v.id("businessDocuments"),
    reviewedBy: v.id("users"),
  },
  handler: async (ctx, { documentId, reviewedBy }) => {
    await ctx.db.patch(documentId, {
      status: "rejected",
      reviewedBy,
      reviewedAt: Date.now(),
    });
  },
});

/** ✅ Delete a document and all its files */
export const deleteBusinessDocument = mutation({
  args: { documentId: v.id("businessDocuments") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");

    // ✅ Delete all associated files
    if (doc.files && Array.isArray(doc.files)) {
      for (const fileId of doc.files) {
        await ctx.storage.delete(fileId);
      }
    }

    await ctx.db.delete(documentId);
  },
});

/** ✅ List only pending documents */
export const listPendingBusinessDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("businessDocuments")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

/** ✅ List only approved documents */
export const listApprovedBusinessDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("businessDocuments")
      .filter((q) => q.eq(q.field("status"), "verified"))
      .collect();
  },
});

/** ✅ List only rejected documents */
export const listRejectedBusinessDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("businessDocuments")
      .filter((q) => q.eq(q.field("status"), "rejected"))
      .collect();
  },
});

/** ✅ Update document type */
export const updateBusinessDocumentType = mutation({
  args: {
    documentId: v.id("businessDocuments"),
    newType: v.union(
      v.literal("permit"),
      v.literal("license"),
      v.literal("id"),
      v.literal("contract"),
      v.literal("other")
    ),
  },
  handler: async (ctx, { documentId, newType }) => {
    await ctx.db.patch(documentId, { type: newType });
  },
});
