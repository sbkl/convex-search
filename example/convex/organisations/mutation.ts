import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { search } from "../search";

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    const organisationId = await ctx.db.insert("organisations", {
      name: args.name,
    });

    await search.createIndex(ctx, "materials", {
      organisationId,
    });

    return organisationId;
  },
});
