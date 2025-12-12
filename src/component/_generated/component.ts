/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    indexes: {
      action: {
        createIndex: FunctionReference<
          "action",
          "internal",
          {
            config:
              | { apiKey: string; host: string; provider: "meilisearch" }
              | { apiKey: string; appId: string; provider: "algolia" }
              | { apiKey: string; host: string; provider: "typesense" };
            schema: {
              filters?: Array<{
                attribute: string;
                kind: "refinementList" | "hierarchicalMenu" | "menu";
                urlKey?: string;
              }>;
              primaryKey?: string;
              query?: { searchableAttributes: Array<string>; urlKey?: string };
              scope?: Array<string>;
              sortableAttributes?: Array<string>;
            };
            scopeValues?: Record<string, any>;
            tableName: string;
          },
          any,
          Name
        >;
        listIndexes: FunctionReference<
          "action",
          "internal",
          {
            config:
              | { apiKey: string; host: string; provider: "meilisearch" }
              | { apiKey: string; appId: string; provider: "algolia" }
              | { apiKey: string; host: string; provider: "typesense" };
          },
          any,
          Name
        >;
      };
    };
    lib: {
      add: FunctionReference<
        "mutation",
        "internal",
        { targetId: string; text: string; userId: string },
        string,
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { limit?: number; targetId: string },
        Array<{
          _creationTime: number;
          _id: string;
          targetId: string;
          text: string;
          userId: string;
        }>,
        Name
      >;
      translate: FunctionReference<
        "action",
        "internal",
        { baseUrl: string; commentId: string },
        string,
        Name
      >;
    };
  };
