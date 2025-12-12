import { algoliasearch } from "algoliasearch";
import type { SearchClient } from "./types";

export class AlgoliaAdapter implements SearchClient {
  private client: ReturnType<typeof algoliasearch>;

  constructor(appId: string, apiKey: string) {
    this.client = algoliasearch(appId, apiKey);
  }

  async index(indexName: string, documents: Record<string, any>[]) {
    // Algolia v5 usage
    return await this.client.saveObjects({ indexName, objects: documents });
  }

  async search(indexName: string, query: string, options?: any) {
    const response = await this.client.search({
      requests: [{ indexName, query, ...options }],
    });
    return response.results[0];
  }

  async createIndex(indexName: string, settings: any) {
    // Algolia creates indexes implicitly when you add objects or set settings
    // Just set the settings
    return await this.client.setSettings({
      indexName,
      indexSettings: settings,
    });
  }

  async deleteIndex(indexName: string) {
    return await this.client.deleteIndex({ indexName });
  }

  async listIndexes() {
    const response = await this.client.listIndices();
    return response.items.map((index) => ({ name: index.name }));
  }
}
