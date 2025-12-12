import { Search } from "@sbkl/convex-search";

import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { searchSchema } from "../search";

export const search = new Search<DataModel, typeof searchSchema>(
  components.search,
  {
    provider: "meilisearch",
  },
  searchSchema,
);
