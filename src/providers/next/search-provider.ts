"use client";

import {
  InstantSearchNext,
  createInstantSearchNextInstance,
} from "react-instantsearch-nextjs";
import type { GenericDataModel, TableNamesInDataModel } from "convex/server";
import {
  createCoreSearchProviderFactory,
  type SearchProviderFactoryProps,
  type QueryStateUpdate,
  type CoreSearchProviderFactoryReturn,
} from "../search-provider-core";

const instantSearchInstance = createInstantSearchNextInstance();

export type { QueryStateUpdate };

export type NextSearchProviderFactoryReturn<
  DataModel extends GenericDataModel,
  TableName extends TableNamesInDataModel<DataModel>[number],
> = Omit<
  CoreSearchProviderFactoryReturn<DataModel, TableName>,
  "SearchProvider"
> & {
  NextSearchProvider: CoreSearchProviderFactoryReturn<
    DataModel,
    TableName
  >["SearchProvider"];
};

export function createNextSearchProviderFactory<
  DataModel extends GenericDataModel,
  TableName extends TableNamesInDataModel<DataModel>[number],
>(
  props: Omit<
    SearchProviderFactoryProps<DataModel, TableName>,
    "InstantSearchComponent" | "instantSearchProps" | "useQueryStatesOptions"
  >,
): NextSearchProviderFactoryReturn<DataModel, TableName> {
  const { SearchProvider, ...rest } = createCoreSearchProviderFactory({
    ...props,
    InstantSearchComponent: InstantSearchNext,
    instantSearchProps: {
      instance: instantSearchInstance,
    },
    useQueryStatesOptions: {
      history: "replace",
      shallow: false,
    },
  });

  return {
    NextSearchProvider: SearchProvider,
    ...rest,
  };
}
