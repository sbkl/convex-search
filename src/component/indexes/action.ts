import { zodToConvex } from "convex-helpers/server/zod4";
import { action } from "../_generated/server";
import { searchSchema } from "../../schemas/search";
import { searchConfigSchema } from "../../schemas/providers";
import { v } from "convex/values";
import { getSearchClient } from "../clients";
import { internal } from "../_generated/api";

export const createIndex = action({
  args: {
    config: zodToConvex(searchConfigSchema),
    schema: zodToConvex(searchSchema),
    tableName: v.string(),
    scopeValues: v.optional(v.record(v.string(), v.any())),
  },
  async handler(ctx, args) {
    const searchClient = getSearchClient(args.config);
    const indexName =
      args.schema.scope?.reduce<string>((acc, scopeKey) => {
        if (!args.scopeValues)
          throw new Error(
            `Scope values are required for table: ${args.tableName}`,
          );
        const scopeValue = args.scopeValues[scopeKey];
        acc = `${acc}_${scopeValue}`;
        return acc;
      }, args.tableName) ?? args.tableName;

    await searchClient.createIndex(indexName, args.schema);

    await ctx.runMutation(internal.indexes.internal.mutation.createIndex, {
      schema: args.schema,
      tableName: args.tableName,
      name: indexName,
      scopeValues: args.scopeValues,
    });

    return indexName;
  },
});

export const listIndexes = action({
  args: {
    config: zodToConvex(searchConfigSchema),
  },
  async handler(_ctx, args) {
    const searchClient = getSearchClient(args.config);
    return await searchClient.listIndexes();
  },
});
