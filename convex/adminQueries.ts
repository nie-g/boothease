import { query } from "./_generated/server";

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const [docs, users, events, booths] = await Promise.all([
      ctx.db.query("businessDocuments").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("events").collect(),
      ctx.db.query("booths").collect(),
    ]);

    return {
      businessDocCount: docs.length,
      userCount: users.length,
      eventCount: events.length,
      boothCount: booths.length,
    };
  },
});
