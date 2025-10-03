// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

/*....................users...................*/
  users: defineTable({
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.union(v.literal("renter"), v.literal("owner"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),


/*....................business profiles...................*/
business_profiles: defineTable({
  userId: v.id("users"), 
  businessName: v.string(),
  category: v.string(), 
  description: v.optional(v.string()),

  // Contact Information
  email: v.string(),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  social_links: v.optional(
      v.array(
        v.object({
          platform: v.string(), 
          url: v.string(),
        })
      )
    ),
  // Address
  address: v.optional(v.string()),
  city: v.string(),
  province: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.string(),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_category", ["category"]),


/*....................business documents...................*/
  businessDocuments: defineTable({
    userId: v.id("users"), 
    type: v.union(
      v.literal("permit"),
      v.literal("license"),
      v.literal("id"),
      v.literal("contract"),
      v.literal("other")
    ),
    fileUrl: v.string(),    
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    uploadedAt: v.number(),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),


/*....................events...................*/
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(), 
    endDate: v.string(),
    location: v.string(),
    createdBy: v.id("users"), 
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

/*....................booths...................*/

  booths: defineTable({
    eventId: v.id("events"), // link booth to event
    ownerId: v.id("users"),  // booth owner
    name: v.string(),
    size: v.string(), // e.g. "3x3m"
    price: v.number(),
    location: v.string(), // e.g. "Hall A - Booth 12"
    status: v.union(
      v.literal("available"),
      v.literal("reserved"),
      v.literal("unavailable")
    ),
    preview_image: v.optional(v.id("_storage")), // single preview image
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

/*....................reservations...................*/

  reservations: defineTable({
    boothId: v.id("booths"),
    renterId: v.id("users"),
    status: v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("cancelled")
    ),
    startDate: v.string(), // ISO date format e.g. "2025-10-01"
    endDate: v.string(),   // ISO date format
    totalPrice: v.number(),
    paymentStatus: v.union(
        v.literal("unpaid"),
        v.literal("paid"),
        v.literal("refunded")
    ),
    createdAt: v.number(),
    })
    .index("by_booth", ["boothId"])
    .index("by_renter", ["renterId"])
    .index("by_dates", ["startDate", "endDate"]),

/*....................payments...................*/

    payments: defineTable({
        reservationId: v.id("reservations"),
        amount: v.number(),
        method: v.union(
        v.literal("card"),
        v.literal("cash"),
        v.literal("bank_transfer")
        ),
        status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded")
        ),
        transactionDate: v.string(), // ISO format
    }).index("by_reservation", ["reservationId"]),


/*....................notifications...................*/

  notifications: defineTable({
    recipient_user_id: v.id("users"),
    recipient_user_type: v.union(
      v.literal("admin"),
      v.literal("owner"),
      v.literal("renter")
    ),
    notif_content: v.string(),
    created_at: v.optional(v.number()),
    is_read: v.optional(v.boolean()),
  }),

  /*....................booth images...................*/
  booth_images: defineTable({
    storageId: v.id("_storage"), // convex storage reference
    boothId: v.optional(v.id("booths")), // can attach to booth
    uploadedBy: v.id("users"), // track uploader
    createdAt: v.number(),
    isPreview: v.optional(v.boolean()), // mark as preview image
  })
    .index("by_booth", ["boothId"])
    .index("by_uploader", ["uploadedBy"]),

  /*....................event images...................*/
   event_images: defineTable({
    storageId: v.id("_storage"), // convex storage reference
    eventId: v.optional(v.id("events")), // can attach to booth
    uploadedBy: v.id("users"), // track uploader
    createdAt: v.number(),
    isPreview: v.optional(v.boolean()), // mark as preview image
  })
    .index("by_event", ["eventId"])
    .index("by_uploader", ["uploadedBy"]),


  
});

