import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* -------------------- CREATE BILLING -------------------- */
export const createBilling = mutation({
  args: {
    reservationId: v.id("reservations"),
    clientId: v.id("users"), // renter or client who booked
    numberOfDays: v.number(),
    amount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded")
    ),
    transactionDate: v.optional(v.string()), // ISO format
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("billing", {
      reservationId: args.reservationId,
      clientId: args.clientId,
      numberOfDays: args.numberOfDays,
      amount: args.amount,
      paymentStatus: args.paymentStatus,
      transactionDate: args.transactionDate ?? new Date().toISOString(),
    });
  },
});

/* -------------------- GET BILLINGS BY CLIENT -------------------- */
export const getByRenter = query({
  args: { renterId: v.id("users") },
  handler: async (ctx, args) => {
    const billings = await ctx.db
      .query("billing")
      .filter((q) => q.eq(q.field("clientId"), args.renterId))
      .collect();

    // Optionally join reservation info
    const withReservation = await Promise.all(
      billings.map(async (b) => {
        const reservation = await ctx.db.get(b.reservationId);
        return { ...b, reservation };
      })
    );

    return withReservation;
  },
});

/* -------------------- UPDATE BILLING STATUS -------------------- */
export const updateBillingStatus = mutation({
  args: {
    billingId: v.id("billing"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded")
    ),
    transactionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.billingId, {
      paymentStatus: args.paymentStatus,
      transactionDate: args.transactionDate ?? new Date().toISOString(),
    });
  },
});

/* -------------------- LIST ALL BILLINGS -------------------- */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const billings = await ctx.db.query("billing").collect();

    return await Promise.all(
      billings.map(async (b) => {
        const client = await ctx.db.get(b.clientId);
        const reservation = await ctx.db.get(b.reservationId);
        return { ...b, client, reservation };
      })
    );
  },
});

export const getInvoiceCount = query({
  handler: async (ctx) => {
    const invoices = await ctx.db.query("billing").collect(); // or your invoice table
    return invoices.length;
  },
});

/* -------------------- GET BILLINGS BY CLIENT WITH BREAKDOWN -------------------- */
export const getByBillingRenter = query({
  args: { renterId: v.id("users") },
  handler: async (ctx, args) => {
    const billings = await ctx.db
      .query("billing")
      .filter((q) => q.eq(q.field("clientId"), args.renterId))
      .collect();

    const withReservationAndBreakdown = await Promise.all(
      billings.map(async (b) => {
        const reservation = await ctx.db.get(b.reservationId);
        const client = await ctx.db.get(b.clientId);

        // Construct breakdown array for modal
        const breakdown = [
          {
            item: "Reservation Fee",
            numberOfDays: b.numberOfDays,
            amount: b.amount,
          },
        ];

        return { ...b, client, reservation, breakdown };
      })
    );

    return withReservationAndBreakdown;
  },
});
