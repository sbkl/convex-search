"use client";

import { InstantSearch } from "react-instantsearch";
import type { GenericDataModel } from "convex/server";
import {
  createCoreSearchProviderFactory,
  type SearchProviderFactoryProps,
  type QueryStateUpdate,
} from "../search-provider-core";
import type { SchemaFor } from "../../client";

export type { QueryStateUpdate };

export function createSearchProviderFactory<
  DataModel extends GenericDataModel,
  const TSchema extends SchemaFor<DataModel>,
  const TableName extends keyof TSchema & string,
>(
  props: Omit<
    SearchProviderFactoryProps<DataModel, TSchema, TableName>,
    "InstantSearchComponent" | "instantSearchProps" | "useQueryStatesOptions"
  >,
) {
  return createCoreSearchProviderFactory<DataModel, TSchema, TableName>({
    ...props,
    InstantSearchComponent: InstantSearch,
    useQueryStatesOptions: {
      history: "replace",
    },
  });
}
