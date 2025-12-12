import type { Index } from "meilisearch";

export interface SearchClient {
  /** Add documents to an index */
  index(indexName: string, documents: Record<string, any>[]): Promise<any>;
  /** Search an index */
  search(indexName: string, query: string, options?: any): Promise<any>;
  /** Create or configure an index with settings */
  createIndex(indexName: string, settings: any): Promise<any>;
  /** Delete an index */
  deleteIndex(indexName: string): Promise<any>;
  /** List all indexes */
  listIndexes(): Promise<{ name: string }[]>;
}
