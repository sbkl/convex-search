import { zodToConvex } from "convex-helpers/server/zod4";
import { internalMutation } from "../../_generated/server";
import { searchSchema } from "../../../schemas/search";
import { v } from "convex/values";

export const createIndex = internalMutation({
  args: {
    schema: zodToConvex(searchSchema),
    tableName: v.string(),
    name: v.string(),
    scopeValues: v.optional(v.record(v.string(), v.any())),
  },
  async handler(ctx, args) {
    await ctx.db.insert("indexes", {
      name: args.name,
      tableName: args.tableName,
      primaryKey: args.schema.primaryKey ?? "_id",
      scope: args.scopeValues,
      searchableAttributes: args.schema.query?.searchableAttributes ?? [],
      filterableAttributes:
        args.schema.filters?.map((filter) => filter.attribute) ?? [],
      sortableAttributes: args.schema.sortableAttributes ?? [],
    });
  },
});
