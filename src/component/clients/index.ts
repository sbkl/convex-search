import type { SearchConfig } from "../../schemas/providers";
import type { SearchClient } from "./types";
import { MeilisearchAdapter } from "./meilisearch";
import { AlgoliaAdapter } from "./algolia";
import { TypesenseAdapter } from "./typesense";

/**
 * Get a search client based on the configuration.
 * @param config - The search configuration.
 * @returns A search client.
 */
export function getSearchClient(config: SearchConfig): SearchClient {
  switch (config.provider) {
    case "meilisearch":
      config;
      return new MeilisearchAdapter(config.host, config.apiKey);
    case "algolia":
      return new AlgoliaAdapter(config.appId, config.apiKey);
    case "typesense":
      return new TypesenseAdapter(config.host, config.apiKey);
    default:
      // @ts-expect-error - exhaustive check
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
