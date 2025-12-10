"use client";

import { createSearchProviderFactory } from "@sbkl/convex-search/providers/react";
import { DataModel } from "../../convex/_generated/dataModel";
import { searchSchema } from "../../search";

export const {
  SearchProvider,
  useInfiniteHits,
  useHierarchicalMenu,
  useRefinementList,
  useClearAll,
  useClearCache,
  useSearch,
  useMenu,
} = createSearchProviderFactory<DataModel, typeof searchSchema, "materials">({
  schema: searchSchema,
  tableName: "materials",
  sortBy: "inventory:desc",
});

export function MaterialSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider
      indexName="materials_kh73ny98b2yjdr0200baft2vyx7v6pr3"
      config={{
        provider: "meilisearch",
      }}
    >
      {children}
    </SearchProvider>
  );
}
