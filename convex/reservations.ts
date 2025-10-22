import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import dayjs from "dayjs";
/* =====================
   📋 QUERY
===================== */
export const listAllReservations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reservations").collect();
  },
});

export const getById = query({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reservationId);
  },
});

export const getUserReservations = query({
  args: { renterId: v.id("users") },
  handler: async (ctx, { renterId }) => {
    const reservations = await ctx.db
      .query("reservations")
      .filter((q) => q.eq(q.field("renterId"), renterId))
      .collect();

    return reservations;
  },
});


export const getOwnerReservations = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    // Step 1: Fetch all booths for this owner
    const booths = await ctx.db
      .query("booths")
      .filter((q) => q.eq(q.field("ownerId"), ownerId))
      .collect();

    const boothIds = booths.map((b) => b._id);
    if (boothIds.length === 0) return [];

    // Step 2: Fetch all reservations for all booths in parallel
    const reservationsArrays = await Promise.all(
      boothIds.map((boothId) =>
        ctx.db
          .query("reservations")
          .filter((q) => q.eq(q.field("boothId"), boothId))
          .collect()
      )
    );

    // Flatten the arrays into a single array
    const reservations = reservationsArrays.flat();

    return reservations;
  },
});


export const getByRenter = query({
  args: { renterId: v.id("users") },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_renter", q => q.eq("renterId", args.renterId))
      .collect();

    return await Promise.all(
      reservations.map(async r => {
        const booth = await ctx.db.get(r.boothId);
        const event = booth ? await ctx.db.get(booth.eventId) : null;
        return { ...r, booth: { ...booth, event } };
      })
    );
  },
});
export const createReservation = mutation({
  args: {
    boothId: v.id("booths"),
    renterId: v.id("users"),
    startDate: v.string(), // e.g. "2025-12-01"
    endDate: v.string(),   // e.g. "2025-12-04"
    totalPrice: v.number(),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Step 1️⃣: Get booth and event details
    const booth = await ctx.db.get(args.boothId);
    if (!booth) throw new Error("Booth not found");

    const event = booth.eventId ? await ctx.db.get(booth.eventId) : null;
    if (!event) throw new Error("Associated event not found");

    // Step 2️⃣: Validate date range
    if (args.startDate < event.startDate || args.endDate > event.endDate) {
      throw new Error("Reservation dates are outside the event schedule.");
    }

    // Step 3️⃣: Check for conflicts
    const existingReservations = await ctx.db
      .query("reservations")
      .filter((q: any) => q.eq(q.field("boothId"), args.boothId))
      .collect();

    const hasConflict = existingReservations.some((r: any) => {
      if (r.status === "cancelled" || r.status === "rejected") return false;
      return args.startDate <= r.endDate && args.endDate >= r.startDate;
    });

    if (hasConflict) {
      throw new Error("Booth is already reserved for part of those dates.");
    }

    // Step 4️⃣: Create reservation
    const reservationId = await ctx.db.insert("reservations", {
      boothId: args.boothId,
      renterId: args.renterId,
      startDate: args.startDate,
      endDate: args.endDate,
      totalPrice: args.totalPrice,
      status: "pending",
      createdAt: Date.now(),
    });

    // Step 5️⃣: Update booth availability
    await updateBoothAvailability(ctx, args.boothId);

    // Step 6️⃣: Notify the owner
    if (booth.ownerId) {
      await ctx.db.insert("notifications", {
        recipient_user_id: booth.ownerId,
        recipient_user_type: "owner",
        notif_content: `New reservation created for your booth "${booth.name}" from ${args.startDate} to ${args.endDate}.`,
        created_at: Date.now(),
        is_read: false,
      });
    }

    return reservationId;
  },
});


/** ✅ Cancel Reservation Mutation */
export const cancelReservation = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx: MutationCtx, { reservationId }) => {
    const reservation = await ctx.db.get(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const booth = await ctx.db.get(reservation.boothId);
    if (!booth) throw new Error("Booth not found");

    // Cancel the reservation
    await ctx.db.patch(reservationId, { status: "cancelled" });

    // Recalculate booth availability
    await updateBoothAvailability(ctx, reservation.boothId);


    // Notify the owner
    if (booth.ownerId) {
      await ctx.db.insert("notifications", {
        recipient_user_id: booth.ownerId,
        recipient_user_type: "owner",
        notif_content: `Reservation for your booth "${booth.name}" from ${reservation.startDate} to ${reservation.endDate} has been cancelled.`,
        created_at: Date.now(),
        is_read: false,
      });
    }

    return true;
  },
});


/** 🧠 Helper: Recalculate Booth Availability */
async function updateBoothAvailability(ctx: MutationCtx, boothId: Id<"booths">) {
  const booth = await ctx.db.get(boothId);
  if (!booth) return;

  // Skip if manually set to unavailable (e.g. maintenance)
  if (booth.availability_status === "unavailable") return;

  const event = booth.eventId ? await ctx.db.get(booth.eventId) : null;
  if (!event) return;

  // Get all approved reservations for this booth
  const approvedReservations = await ctx.db
    .query("reservations")
    .filter((q) =>
      q.and(q.eq(q.field("boothId"), boothId), q.eq(q.field("status"), "approved"))
    )
    .collect();

  const eventDays = getDaysBetween(event.startDate, event.endDate);
  const reservedDays = new Set<string>();

  // Collect all reserved days from approved reservations
  approvedReservations.forEach((r) => {
    const days = getDaysBetween(r.startDate, r.endDate);
    days.forEach((d) => reservedDays.add(d));
  });

  // Determine booth status
  const allReserved = eventDays.every((d) => reservedDays.has(d));
  const anyReserved = reservedDays.size > 0;

  let newStatus: "available" | "reserved" | "unavailable" = "available";

  if (allReserved) {
    newStatus = "reserved"; // fully booked
  } else if (anyReserved) {
    newStatus = "available"; // partially booked → still has open days
  } else {
    newStatus = "available"; // no bookings yet
  }

  await ctx.db.patch(boothId, { availability_status: newStatus });
}


/** 🔧 Helper: Generate all dates between two YYYY-MM-DD strings */
function getDaysBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export const updateStatus = mutation({
  args: {
    reservationId: v.id("reservations"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, { reservationId, status }) => {
    const reservation = await ctx.db.get(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    // 1️⃣ Update the reservation status
    await ctx.db.patch(reservationId, {
      status,
      updatedAt: Date.now(),
    });

    // 2️⃣ Prepare notification content
    let notifContent = "";

    if (status === "approved") {
      // Calculate number of days
      const start = dayjs(reservation.startDate);
      const end = dayjs(reservation.endDate);
      const numberOfDays = end.diff(start, "day") + 1;

      // Create billing record
      await ctx.db.insert("billing", {
        reservationId,
        clientId: reservation.renterId,
        numberOfDays,
        amount: reservation.totalPrice,
        transactionDate: new Date().toISOString(),
      });

      notifContent = `Your reservation for booth ${reservation.boothId} has been approved. A billing has been created for ₱${reservation.totalPrice.toLocaleString()}.`;

      // Update booth availability
      await updateBoothAvailability(ctx, reservation.boothId);
    } else if (status === "declined") {
      notifContent = `Your reservation for booth ${reservation.boothId} has been declined.`;
    } else if (status === "cancelled") {
      notifContent = `Your reservation for booth ${reservation.boothId} has been cancelled.`;
    }

    // 3️⃣ Send notification
    if (notifContent) {
      await ctx.db.insert("notifications", {
        recipient_user_id: reservation.renterId,
        recipient_user_type: "renter",
        notif_content: notifContent,
        created_at: Date.now(),
        is_read: false,
      });
    }

    return true;
  },
});