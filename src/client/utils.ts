import { z } from "zod";
import type { SearchConfig, SearchOptions } from "../schemas/providers";
import type {
  GenericDataModel,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  TableNamesInDataModel,
} from "convex/server";
import { SCHEMA_PROPS, type SchemaFor } from "../types";

export type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
export type MutationCtx = Pick<
  GenericMutationCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "scheduler"
>;
export type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;

export function isActionCtx(ctx: ActionCtx | MutationCtx): ctx is ActionCtx {
  return "runAction" in ctx;
}

export function isMutationCtx(
  ctx: ActionCtx | MutationCtx,
): ctx is MutationCtx {
  return "scheduler" in ctx;
}

export function resolveSearchConfig(options: SearchOptions): SearchConfig {
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
