import {
  actionGeneric,
  httpActionGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import type { Auth, GenericDataModel, HttpRouter } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component";
import type { SearchConfig, SearchOptions } from "../schemas/providers";
import {
  type SchemaFor,
  type ScopeValuesExactFor,
  type TablesWithoutScope,
  type TablesWithScope,
} from "../types/client";
import {
  assertNoDuplicatesInSchema,
  isActionCtx,
  isMutationCtx,
  resolveSearchConfig,
  type ActionCtx,
  type MutationCtx,
} from "./utils";
import { internal } from "../component/_generated/api";

export class Search<
  DataModel extends GenericDataModel,
  const TSchema extends SchemaFor<DataModel>,
> {
  private config: SearchConfig;

  constructor(
    public component: ComponentApi,
    providerOptions: SearchOptions,
    private readonly schema: TSchema,
  ) {
    this.config = this.resolveConfig(providerOptions);
    assertNoDuplicatesInSchema(this.schema);
  }

  public async listIndexes(ctx: ActionCtx) {
    console.log("here", this.config);
    return await ctx.runAction(this.component.indexes.action.listIndexes, {
      config: this.config,
    });
  }

  public async createIndex<TableName extends TablesWithoutScope<TSchema>>(
    ctx: ActionCtx | MutationCtx,
    tableName: TableName,
  ): Promise<string>;
  public async createIndex<TableName extends TablesWithScope<TSchema>>(
    ctx: ActionCtx | MutationCtx,
    tableName: TableName,
    scopeValues: ScopeValuesExactFor<DataModel, TSchema, TableName>,
  ): Promise<string>;
  public async createIndex<TableName extends TablesWithScope<TSchema>>(
    ctx: ActionCtx | MutationCtx,
    tableName: TableName,
    scopeValues?: ScopeValuesExactFor<DataModel, TSchema, TableName>,
  ): Promise<string> {
    const tableSchema = this.schema[tableName];

    if (!tableSchema) {
      throw new ConvexError(`Table schema not found for table: ${tableName}`);
    }
    if (isActionCtx(ctx)) {
      await ctx.runAction(this.component.indexes.action.createIndex, {
        config: this.config,
        schema: tableSchema,
        tableName,
        scopeValues,
      });

      return "success";
    }

    if (isMutationCtx(ctx)) {
      await ctx.scheduler.runAfter(
        0,
        this.component.indexes.action.createIndex,
        {
          config: this.config,
          schema: tableSchema,
          tableName,
          scopeValues,
        },
      );
      return "success";
    }

    throw new Error("Invalid context");
  }
  /**
   * Resolve provider options to a complete SearchConfig, using environment variables as fallback.
   */
  private resolveConfig(options: SearchOptions): SearchConfig {
    return resolveSearchConfig(options);
  }
}
// See the example/convex/example.ts file for how to use this component.

/**
 *
 * @param ctx
 * @param targetId
 */
export function translate(
  ctx: ActionCtx,
  component: ComponentApi,
  commentId: string,
) {
  // By wrapping the function call, we can read from environment variables.
  const baseUrl = getDefaultBaseUrlUsingEnv();
  return ctx.runAction(component.lib.translate, { commentId, baseUrl });
}

/**
 * For re-exporting of an API accessible from React clients.
 * e.g. `export const { list, add, translate } =
 * exposeApi(components.search, {
 *   auth: async (ctx, operation) => { ... },
 * });`
 * See example/convex/example.ts.
 */
export function exposeApi(
  component: ComponentApi,
  options: {
    /**
     * It's very important to authenticate any functions that users will export.
     * This function should return the authorized user's ID.
     */
    auth: (
      ctx: { auth: Auth },
      operation:
        | { type: "read"; targetId: string }
        | { type: "create"; targetId: string }
        | { type: "update"; commentId: string },
    ) => Promise<string>;
    baseUrl?: string;
  },
) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrlUsingEnv();
  return {
    list: queryGeneric({
      args: { targetId: v.string() },
      handler: async (ctx, args) => {
        await options.auth(ctx, { type: "read", targetId: args.targetId });
        return await ctx.runQuery(component.lib.list, {
          targetId: args.targetId,
        });
      },
    }),
    add: mutationGeneric({
      args: { text: v.string(), targetId: v.string() },
      handler: async (ctx, args) => {
        const userId = await options.auth(ctx, {
          type: "create",
          targetId: args.targetId,
        });
        return await ctx.runMutation(component.lib.add, {
          text: args.text,
          userId: userId,
          targetId: args.targetId,
        });
      },
    }),
    translate: actionGeneric({
      args: { commentId: v.string() },
      handler: async (ctx, args) => {
        await options.auth(ctx, {
          type: "update",
          commentId: args.commentId,
        });
        return await ctx.runAction(component.lib.translate, {
          commentId: args.commentId,
          baseUrl,
        });
      },
    }),
  };
}

/**
 * Register HTTP routes for the component.
 * This allows you to expose HTTP endpoints for the component.
 * See example/convex/http.ts for an example.
 */
export function registerRoutes(
  http: HttpRouter,
  component: ComponentApi,
  { pathPrefix = "/comments" }: { pathPrefix?: string } = {},
) {
  http.route({
    path: `${pathPrefix}/last`,
    method: "GET",
    // Note we use httpActionGeneric here because it will be registered in
    // the app's http.ts file, which has a different type than our `httpAction`.
    handler: httpActionGeneric(async (ctx, request) => {
      const targetId = new URL(request.url).searchParams.get("targetId");
      if (!targetId) {
        return new Response(
          JSON.stringify({ error: "targetId parameter required" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
      const comments = await ctx.runQuery(component.lib.list, {
        targetId,
      });
      const lastComment = comments[0] ?? null;
      return new Response(JSON.stringify(lastComment), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }),
  });
}

function getDefaultBaseUrlUsingEnv() {
  return process.env.BASE_URL ?? "https://pirate.monkeyness.com";
}

// Convenient types for `ctx` args, that only include the bare minimum.
