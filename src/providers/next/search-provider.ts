"use client";

import {
  InstantSearchNext,
  createInstantSearchNextInstance,
} from "react-instantsearch-nextjs";
import type { GenericDataModel } from "convex/server";
import {
  createCoreSearchProviderFactory,
  type SearchProviderFactoryProps,
  type QueryStateUpdate,
} from "../search-provider-core";
import type { SchemaFor } from "../../types/client";

const instantSearchInstance = createInstantSearchNextInstance();

export type { QueryStateUpdate };

export function createNextSearchProviderFactory<
  DataModel extends GenericDataModel,
  const TSchema extends SchemaFor<DataModel>,
>() {
  return function <const TableName extends keyof TSchema & string>(
    props: Omit<
      SearchProviderFactoryProps<DataModel, TSchema, TableName>,
      "InstantSearchComponent" | "instantSearchProps" | "useQueryStatesOptions"
    >,
  ) {
    return createCoreSearchProviderFactory<DataModel, TSchema, TableName>({
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
  };
}
