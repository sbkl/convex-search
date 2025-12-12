import {
  actionGeneric,
  httpActionGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import type {
  Auth,
  DocumentByName,
  GenericActionCtx,
  GenericDataModel,
  HttpRouter,
  TableNamesInDataModel,
} from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component";
import type { SearchConfig, SearchOptions } from "../schemas/providers";
import z from "zod";
import {
  SCHEMA_PROPS,
  type SchemaFor,
  type ScopeValuesExactFor,
  type TablesWithoutScope,
  type TablesWithScope,
} from "../types/client";

function findDuplicates(arr: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();

  for (const item of arr) {
    if (seen.has(item)) dupes.add(item);
    else seen.add(item);
  }

  return [...dupes];
}

export function assertNoDuplicatesInSchema<DataModel extends GenericDataModel>(
  schema: SchemaFor<DataModel>,
): void {
  const issues: string[] = [];

  for (const [tableName, tableConfig] of Object.entries(schema) as Array<
    [
      TableNamesInDataModel<DataModel> & string,
      SchemaFor<DataModel>[TableNamesInDataModel<DataModel>],
    ]
  >) {
    for (const prop of SCHEMA_PROPS) {
      const arr = tableConfig?.[prop];
      if (
        typeof arr === "object" &&
        prop === "query" &&
        "searchableAttributes" in arr
      ) {
        const dupes = findDuplicates(
          arr.searchableAttributes as readonly string[],
        );
        if (dupes.length > 0) {
          issues.push(
            `${tableName}.${prop}.searchableAttributes: ${dupes.join(", ")}`,
          );
        }
        continue;
      }
      if (prop === "filters" && Array.isArray(arr) && prop === "filters") {
        const attributes = arr?.reduce<string[]>((acc, f) => {
          if (typeof f === "object" && "attribute" in f) {
            acc.push(f.attribute);
          }
          return acc;
        }, []);
        const dupes = findDuplicates(attributes);
        if (dupes.length > 0) {
          issues.push(`${tableName}.${prop}.filters: ${dupes.join(", ")}`);
        }
        continue;
      }

      if (Array.isArray(arr) && !arr?.length) continue;

      const dupes = findDuplicates(arr as readonly string[]);
      if (dupes.length > 0) {
        issues.push(`${tableName}.${prop}: ${dupes.join(", ")}`);
      }
    }
  }

  if (issues.length > 0) {
    throw new Error(
      [
        "Schema contains duplicate values.",
        ...issues.map((i) => `- ${i}`),
      ].join("\n"),
    );
  }
}

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

  public createIndex<TableName extends TablesWithoutScope<TSchema>>(
    tableName: TableName,
  ): string;
  public createIndex<TableName extends TablesWithScope<TSchema>>(
    tableName: TableName,
    scopeValues: ScopeValuesExactFor<DataModel, TSchema, TableName>,
  ): string;
  public createIndex(
    tableName: keyof TSchema & string,
    scopeValues?: Record<string, unknown>,
  ): string {
    const scopePart = scopeValues
      ? ":" +
        Object.entries(scopeValues)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(",")
      : "";

    const indexName = `${tableName}${scopePart}`;

    return indexName;
  }
  /**
   * Resolve provider options to a complete SearchConfig, using environment variables as fallback.
   */
  private resolveConfig(options: SearchOptions): SearchConfig {
    if (options.provider === "meilisearch") {
      const host = z
        .string()
        .safeParse(options.host ?? process.env.MEILISEARCH_HOST);
      const apiKey = z
        .string()
        .safeParse(options.apiKey ?? process.env.MEILISEARCH_ADMIN_API_KEY);

      if (host.success && apiKey.success) {
        return {
          provider: "meilisearch",
          host: host.data,
          apiKey: apiKey.data,
        };
      }
    } else if (options.provider === "algolia") {
      const appId = z
        .string()
        .safeParse(options.appId ?? process.env.ALGOLIA_APP_ID);
      const apiKey = z
        .string()
        .safeParse(options.apiKey ?? process.env.ALGOLIA_API_KEY);

      if (appId.success && apiKey.success) {
        return {
          provider: "algolia",
          appId: appId.data,
          apiKey: apiKey.data,
        };
      }
    } else if (options.provider === "typesense") {
      const host = z
        .string()
        .safeParse(options.host ?? process.env.TYPESENSE_HOST);
      const apiKey = z
        .string()
        .safeParse(options.apiKey ?? process.env.TYPESENSE_API_KEY);

      if (host.success && apiKey.success) {
        return {
          provider: "typesense",
          host: host.data,
          apiKey: apiKey.data,
        };
      }
    }

    const provider = options.provider;
    const envVars =
      provider === "meilisearch"
        ? "MEILISEARCH_HOST and MEILISEARCH_ADMIN_API_KEY"
        : provider === "algolia"
          ? "ALGOLIA_APP_ID and ALGOLIA_API_KEY"
          : "TYPESENSE_HOST and TYPESENSE_API_KEY";

    throw new Error(`Invalid provider options for ${provider}. You must either:
        - Provide the necessary credentials in the options to the Search constructor
        - Set the ${envVars} environment variables in the convex dashboard`);
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

// type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
// type MutationCtx = Pick<
//   GenericMutationCtx<GenericDataModel>,
//   "runQuery" | "runMutation"
// >;
type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;
