"use client";

import { createSearchProviderFactory } from "@sbkl/convex-search/providers/react";
import { DataModel, Id } from "../../convex/_generated/dataModel";
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
} = createSearchProviderFactory<DataModel, typeof searchSchema>()({
  schema: searchSchema,
  tableName: "materials",
});

export function MaterialSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider
      config={{
        provider: "meilisearch",
      }}
      scope={{
        organisationId:
          "kh73ny98b2yjdr0200baft2vyx7v6pr3" as Id<"organisations">,
      }}
      initialSortBy="inventory:desc"
    >
      {children}
    </SearchProvider>
  );
}
