"use client";

import { InstantSearch } from "react-instantsearch";
import type { GenericDataModel, TableNamesInDataModel } from "convex/server";
import {
  createCoreSearchProviderFactory,
  type SearchProviderFactoryProps,
  type QueryStateUpdate,
} from "../search-provider-core";

export type { QueryStateUpdate };

export function createSearchProviderFactory<
  DataModel extends GenericDataModel,
  TableName extends TableNamesInDataModel<DataModel>[number],
>(
  props: Omit<
    SearchProviderFactoryProps<DataModel, TableName>,
    "InstantSearchComponent" | "instantSearchProps" | "useQueryStatesOptions"
  >,
) {
  return createCoreSearchProviderFactory({
    ...props,
    InstantSearchComponent: InstantSearch,
    useQueryStatesOptions: {
      history: "replace",
    },
  });
}
