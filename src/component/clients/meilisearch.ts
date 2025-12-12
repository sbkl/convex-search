import { Index, Meilisearch, type IndexesResults } from "meilisearch";
import type { SearchClient } from "./types";
import type z from "zod";
import type { searchSchema } from "../../schemas/search";

export class MeilisearchAdapter implements SearchClient {
  private client: Meilisearch;

  constructor(host: string, apiKey: string) {
    this.client = new Meilisearch({ host, apiKey });
  }

  async index(indexName: string, documents: Record<string, any>[]) {
    const index = this.client.index(indexName);
    // Meilisearch async index add
    return await index.addDocuments(documents);
  }

  async search(indexName: string, query: string, options?: any) {
    return await this.client.index(indexName).search(query, options);
  }

  async createIndex(indexName: string, settings: z.infer<typeof searchSchema>) {
    // Create the index with primary key
    await this.client
      .createIndex(indexName, {
        primaryKey: settings.primaryKey ?? "_id",
      })
      .waitTask();

    const searchableAttributes = settings.query?.searchableAttributes;
    if (searchableAttributes) {
      await this.client
        .index(indexName)
        .updateSearchableAttributes(searchableAttributes)
        .waitTask();
    }

    const filterableAttributes = settings.filters?.map(
      (filter) => filter.attribute,
    );

    if (filterableAttributes) {
      await this.client
        .index(indexName)
        .updateFilterableAttributes(filterableAttributes)
        .waitTask();
    }

    const sortableAttributes = settings.sortableAttributes;

    if (sortableAttributes) {
      await this.client
        .index(indexName)
        .updateSortableAttributes(sortableAttributes)
        .waitTask();
    }
    return indexName;
  }

  async deleteIndex(indexName: string) {
    return await this.client.deleteIndex(indexName).waitTask();
  }

  async listIndexes() {
    let offset = 0;
    let limit = 24;

    const indexes: Index[] = [];

    while (true) {
      const response = await this.client.getIndexes({
        limit,
        offset,
      });
      indexes.push(...response.results);
      if (offset + response.results.length >= response.total) {
        break;
      }
      offset += limit;
    }
    return indexes.map((index) => ({ name: index.uid }));
  }
}
