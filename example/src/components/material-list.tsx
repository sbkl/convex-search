"use client";

import {
  ClearCacheButton,
  HierarchicalMenu,
  Menu,
  RefinementList,
  SearchClearAllButton,
  SearchInput,
  SearchResults,
} from "@sbkl/convex-search/ui";

import {
  useClearAll,
  useClearCache,
  useHierarchicalMenu,
  useInfiniteHits,
  useMenu,
  useRefinementList,
  useSearch,
} from "../providers/material-search-provider";
import { useStats } from "react-instantsearch";

export function MaterialList() {
  const stats = useStats();
  const { items } = useInfiniteHits();
  const search = useSearch();
  const teamRefinementList = useRefinementList({
    attribute: "team",
    label: "Team",
    sortBy: ["name", "count:desc"],
    limit: 50,
  });

  const sportMenu = useMenu({
    attribute: "sport",
    label: "Sport",
    sortBy: ["name", "count:desc"],
    limit: 50,
  });
  const clearAll = useClearAll();
  const clearCache = useClearCache();
  const hierarchicalMenu = useHierarchicalMenu({
    label: "Category",
    attributes: [
      "productHierarchy.lvl0",
      "productHierarchy.lvl1",
      "productHierarchy.lvl2",
    ],
    sortBy: ["name", "count:desc"],
  });

  return (
    <div className={"flex flex-col gap-6 bg-background"}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <SearchResults stats={stats} />
          <ClearCacheButton {...clearCache} className="ml-auto" size="sm">
            Clear Cache & Refresh
          </ClearCacheButton>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput {...search} />
          <HierarchicalMenu {...hierarchicalMenu} />
          <RefinementList {...teamRefinementList} />
          <Menu {...sportMenu} />
          <SearchClearAllButton {...clearAll} />
        </div>
      </div>
      <div className="flex flex-col border rounded-md divide-y bg-muted/50">
        {items.map((material) => (
          <div
            key={material._id}
            className="flex gap-2 p-4 flex-col items-start"
          >
            <div className="flex w-full">
              <div>
                {material.identifier} - {material.description}
              </div>
              <div className="flex gap-2 ml-auto text-sm text-muted-foreground">
                <div>Articles: {material.articleCount}</div>
                <div>Inventory: {material.inventory}</div>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="text-sm text-muted-foreground">
                {material.productHierarchy.lvl2}
              </div>
              <div className="h-3 w-px bg-primary" />
              <div className="text-sm text-muted-foreground">
                {material.team}
              </div>
              <div className="h-3 w-px bg-primary" />
              <div className="text-sm text-muted-foreground">
                {material.sport}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
