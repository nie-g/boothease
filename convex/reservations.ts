import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
/* =====================
   📋 QUERY
===================== */
export const listAllReservations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reservations").collect();
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
      paymentStatus: "unpaid",
      createdAt: Date.now(),
    });

    // Step 5️⃣: Update booth availability
    await updateBoothAvailability(ctx, args.boothId);

    return reservationId;
  },
});


/** ✅ Cancel Reservation Mutation */
export const cancelReservation = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx: MutationCtx, { reservationId }) => {
    const reservation = await ctx.db.get(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    // Cancel the reservation
    await ctx.db.patch(reservationId, { status: "cancelled" });

    // Recalculate booth availability
    await updateBoothAvailability(ctx, reservation.boothId);

    return true;
  },
});


/** 🧠 Helper: Recalculate Booth Availability */
async function updateBoothAvailability(ctx: MutationCtx, boothId: Id<"booths">) {
  const booth = await ctx.db.get(boothId);
  if (!booth) return;

  const event = booth.eventId ? await ctx.db.get(booth.eventId) : null;
  if (!event) return;

  const reservations = await ctx.db
    .query("reservations")
    .filter((q: any) => q.eq(q.field("boothId"), boothId))
    .collect();

  // Convert event and reservation dates to day lists
  const eventDays = getDaysBetween(event.startDate, event.endDate);
  const reservedDays = new Set<string>();

  reservations.forEach((r: any) => {
    if (r.status === "cancelled" || r.status === "rejected") return;
    const days = getDaysBetween(r.startDate, r.endDate);
    days.forEach(d => reservedDays.add(d));
  });

  const allReserved = eventDays.every(day => reservedDays.has(day));
  const partiallyReserved = reservedDays.size > 0 && !allReserved;

  let newStatus: "available" | "reserved" | "unavailable" = "available";
  if (allReserved) newStatus = "unavailable";
  else if (partiallyReserved) newStatus = "reserved";

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
    await ctx.db.patch(reservationId, {
      status,
      updatedAt: Date.now(),
    });
  },
});
