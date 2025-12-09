"use client";

import { createSearchProviderFactory } from "@sbkl/convex-search/providers/react";
import { DataModel } from "../../convex/_generated/dataModel";

// const host = import.meta.env.VITE_MEILISEARCH_HOST;
// const apiKey = import.meta.env.VITE_MEILISEARCH_SEARCH_API_KEY;

const {
  SearchProvider,
  useInfiniteHits,
  useHierarchicalMenu,
  useRefinementList,
  useClearAll,
  useClearCache,
  useSearch,
  useMenu,
} = createSearchProviderFactory<DataModel, "materials">({
  sortBy: "inventory:desc",
  query: {
    urlKey: "q",
  },
  filters: [
    {
      attribute: "productHierarchy",
      kind: "hierarchicalMenu",
      urlKey: "category",
    },
    {
      attribute: "team",
      kind: "refinementList",
      urlKey: "team",
    },
    {
      attribute: "sport",
      kind: "menu",
      urlKey: "sport",
    },
  ],
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
        // host,
        // apiKey,
      }}
    >
      {children}
    </SearchProvider>
  );
}

export {
  useInfiniteHits,
  useHierarchicalMenu,
  useRefinementList,
  useClearAll,
  useClearCache,
  useSearch,
  useMenu,
};
