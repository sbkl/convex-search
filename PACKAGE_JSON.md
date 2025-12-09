providers:

```typescript
import { createSearchProviderFactory } from "@sbkl/convex-search/providers/react";
import { createSearchProviderFactory } from "@sbkl/convex-search/providers/next";
```

dependencies:

```json
{
  "optionalDependencies": {
    "@meilisearch/instant-meilisearch": "^0.29.0",
    "algoliasearch": "^5.46.0",
    "react-instantsearch-nextjs": "^1.0.7",
    "typesense-instantsearch-adapter": "^2.9.0"
  },
  "peerDependencies": {
    "convex": "^1.30.0",
    "nuqs": "^2.8.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-instantsearch": "^7.20.1",
    "zod": "^4.1.13"
  }
}
```

ui:

```typescript
import {
  ClearCacheButton,
  HierarchicalMenu,
  Menu,
  RefinementList,
  SearchClearAllButton,
  SearchInput,
  SearchResults,
} from "@sbkl/convex-search/ui";
```

dependencies:

```json
{
  "peerDependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.556.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.4.0",
    "zod": "^4.1.13"
  }
}
```

convex component

```typescript
import search from "@sbkl/convex-search/convex.config.js";
import { Search } from "@sbkl/convex-search";
```

dependencies:

```json
{
  "peerDependencies": {
    "convex": "^1.30.0",
    "react": "^19.0.0"
  },
  "optionalDependencies": {
    "algoliasearch": "^5.46.0",
    "meilisearch": "^0.54.0",
    "typesense": "^2.1.0"
  }
}
```
