/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as example from "../example.js";
import type * as http from "../http.js";
import type * as materials_action from "../materials/action.js";
import type * as materials_table from "../materials/table.js";
import type * as organisations_mutation from "../organisations/mutation.js";
import type * as organisations_table from "../organisations/table.js";
import type * as schemas_materials from "../schemas/materials.js";
import type * as schemas_organisations from "../schemas/organisations.js";
import type * as search from "../search.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  example: typeof example;
  http: typeof http;
  "materials/action": typeof materials_action;
  "materials/table": typeof materials_table;
  "organisations/mutation": typeof organisations_mutation;
  "organisations/table": typeof organisations_table;
  "schemas/materials": typeof schemas_materials;
  "schemas/organisations": typeof schemas_organisations;
  search: typeof search;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  search: import("@sbkl/convex-search/_generated/component.js").ComponentApi<"search">;
};
