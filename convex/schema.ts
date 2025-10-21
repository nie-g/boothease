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
  status: v.union(v.literal("active"), v.literal("deactivated")),
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
  fileUrl: v.id("_storage"),
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
  event_thumbnail: v.optional(v.id("_storage")),
  status: v.union(
    v.literal("upcoming"),
    v.literal("ongoing"),
    v.literal("ended")
  ),
  startDate: v.string(), // e.g. "2025-10-01"
  endDate: v.string(),   // e.g. "2025-10-05"
  numberOfDays: v.number(),          // computed difference between startDate and endDate
  location: v.object({
    address: v.optional(v.string()), // e.g. "SM Mall of Asia, Pasay City"
    lat: v.number(),
    lng: v.number(),
  }),
  createdBy: v.id("users"),
  createdAt: v.number(),
}).index("by_creator", ["createdBy"]),


/*....................booths...................*/
/*....................booths...................*/
booths: defineTable({
  eventId: v.id("events"),
  ownerId: v.id("users"),
  thumbnail: v.optional(v.id("_storage")),
  booth_layout: v.optional(v.id("_storage")),
  name: v.string(),
  size: v.string(), // e.g. "3x3m"
  price: v.number(),
  dailyOperatingHours: v.number(),
  location: v.string(), // e.g. "Hall A - Booth 12"
  status: v.union(  // ✅ fixed spelling
    v.literal("pending"),
    v.literal("approved"),
    v.literal("declined"),
    v.literal("cancelled")
  ),
  availability_status: v.union(  // ✅ fixed spelling
    v.literal("available"),
    v.literal("reserved"),
    v.literal("unavailable")
  ),
  createdAt: v.number(),
})
  .index("by_event", ["eventId"])
  .index("by_owner", ["ownerId"])
  .index("by_availability_status", ["availability_status"]),// ✅ consistent index name



/*....................reservations...................*/
reservations: defineTable({
  boothId: v.id("booths"),
  renterId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("declined"),
    v.literal("cancelled")
  ),
  // 🗓 Date-based booking (always required)
  startDate: v.string(), // "2025-10-01"
  endDate: v.string(),   // "2025-10-03"
  // 🕒 Optional time-based booking (only used for hourly rentals)
  // 💰 Pricing & Payment
  totalPrice: v.number(),
  paymentStatus: v.union(
    v.literal("unpaid"),
    v.literal("paid"),
    v.literal("refunded")
  ),

  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_booth", ["boothId"])
  .index("by_renter", ["renterId"])
  .index("by_dates", ["startDate", "endDate"]),


/*....................payments...................*/
billing: defineTable({
  reservationId: v.id("reservations"),
  amount: v.number(),
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
  storageId: v.id("_storage"),
  boothId: v.optional(v.id("booths")),
  uploadedBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_booth", ["boothId"])
  .index("by_uploader", ["uploadedBy"]),


/*....................event images...................*/
event_images: defineTable({
  storageId: v.id("_storage"),
  eventId: v.optional(v.id("events")),
  uploadedBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_event", ["eventId"])
  .index("by_uploader", ["uploadedBy"]),



/*....................event likes...................*/

event_likes: defineTable({
  eventId: v.id("events"),  // The event that was liked
  userId: v.id("users"),    // The user who liked the event
  createdAt: v.number(),    // Timestamp for when the like happened
})
  .index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_event_user", ["eventId", "userId"]), // helpful for checking if already liked

});
