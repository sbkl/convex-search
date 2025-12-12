/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clients_algolia from "../clients/algolia.js";
import type * as clients_index from "../clients/index.js";
import type * as clients_meilisearch from "../clients/meilisearch.js";
import type * as clients_types from "../clients/types.js";
import type * as clients_typesense from "../clients/typesense.js";
import type * as indexes_action from "../indexes/action.js";
import type * as indexes_internal_mutation from "../indexes/internal/mutation.js";
import type * as indexes_table from "../indexes/table.js";
import type * as lib from "../lib.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  "clients/algolia": typeof clients_algolia;
  "clients/index": typeof clients_index;
  "clients/meilisearch": typeof clients_meilisearch;
  "clients/types": typeof clients_types;
  "clients/typesense": typeof clients_typesense;
  "indexes/action": typeof indexes_action;
  "indexes/internal/mutation": typeof indexes_internal_mutation;
  "indexes/table": typeof indexes_table;
  lib: typeof lib;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
