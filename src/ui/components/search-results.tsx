import { cn } from "../lib/utils";

interface SearchResultsProps extends React.ComponentProps<"div"> {
  stats: {
    /**
     * The maximum number of hits per page returned by Algolia.
     */
    hitsPerPage?: number;
    /**
     * The number of hits in the result set.
     */
    nbHits: number;
    /**
     * The number of sorted hits in the result set (when using Relevant sort).
     */
    nbSortedHits?: number;
    /**
     * Indicates whether the index is currently using Relevant sort and is displaying only sorted hits.
     */
    areHitsSorted: boolean;
    /**
     * The number of pages computed for the result set.
     */
    nbPages: number;
    /**
     * The current page.
     */
    page: number;
    /**
     * The time taken to compute the results inside the Algolia engine.
     */
    processingTimeMS: number;
    /**
     * The query used for the current search.
     */
    query: string;
  };
}
export function SearchResults({
  className,
  stats,
  ...props
}: SearchResultsProps) {
  const { nbHits, processingTimeMS } = stats;
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      Results: {nbHits} in {processingTimeMS} ms
    </div>
  );
}
