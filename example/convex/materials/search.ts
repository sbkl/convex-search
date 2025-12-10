import { Search } from "@sbkl/convex-search";

import { components } from "../_generated/api";
import { DataModel, Id } from "../_generated/dataModel";
import { searchSchema } from "../../search";

export const search = new Search<DataModel, typeof searchSchema>(
  components.search,
  {
    provider: "meilisearch",
  },
  searchSchema,
);

const indexName = search.createIndex("materials", {
  organisationId: "123" as Id<"organisations">,
  team: "Hello",
});

console.log("indexName", indexName);
