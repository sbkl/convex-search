import { Client as TypesenseClient } from "typesense";
import type { SearchClient } from "./types";

export class TypesenseAdapter implements SearchClient {
  private client: TypesenseClient;

  constructor(host: string, apiKey: string) {
    let protocol = "https";
    let port = 443;
    let hostName = host;

    try {
      if (host.includes("://")) {
        const url = new URL(host);
        protocol = url.protocol.replace(":", "");
        hostName = url.hostname;
        // Default ports if not specified
        if (url.port) {
          port = parseInt(url.port, 10);
        } else {
          port = protocol === "http" ? 80 : 443;
        }
      } else {
        // Assuming host is just hostname, default to https 443
        hostName = host;
      }
    } catch (e) {
      console.warn("Failed to parse Typesense host URL, using as hostname:", e);
    }

    this.client = new TypesenseClient({
      nodes: [{ host: hostName, port, protocol }],
      apiKey,
      connectionTimeoutSeconds: 2,
    });
  }

  async index(indexName: string, documents: Record<string, any>[]) {
    // Typesense import
    return await this.client
      .collections(indexName)
      .documents()
      .import(documents, { action: "upsert" });
  }

  async search(indexName: string, query: string, options?: any) {
    // Typesense search requires query_by.
    // If not provided in options, we might fail or default to "*"?
    // Typesense doesn't support "*" for query_by usually, needs explicit fields.
    // For now, we assume caller provides query_by in options or we handle error.
    return await this.client
      .collections(indexName)
      .documents()
      .search({ q: query, query_by: options?.query_by ?? "text", ...options });
  }

  async createIndex(indexName: string, settings: any) {
    // Typesense requires explicit schema creation
    // settings should contain { name, fields, default_sorting_field? }
    const schema = {
      name: indexName,
      ...settings,
    };
    return await this.client.collections().create(schema);
  }

  async deleteIndex(indexName: string) {
    return await this.client.collections(indexName).delete();
  }

  async listIndexes() {
    const response = await this.client.collections().retrieve();
    return response.map((collection) => ({ name: collection.name }));
  }
}
