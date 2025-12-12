import type { SchemaFor } from "@sbkl/convex-search/types";
import type { DataModel } from "./convex/_generated/dataModel";

export const searchSchema = {
  materials: {
    scope: ["organisationId"],
    query: {
      searchableAttributes: ["identifier", "description"],
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
    sortableAttributes: ["inventory", "articleCount"],
  },
} as const satisfies SchemaFor<DataModel>;
