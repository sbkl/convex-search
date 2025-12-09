import * as React from "react";

import z from "zod";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import { InstantSearch } from "react-instantsearch";

import type { SearchOptions } from "../schemas/providers";

type InstantSearchProps = React.ComponentProps<typeof InstantSearch>;
type SearchClient = NonNullable<InstantSearchProps["searchClient"]>;

/**
 * Gets an environment variable value, checking both process.env (Node.js) and import.meta.env (Vite)
 * In Vite, also checks for VITE_ prefixed versions of the key
 */
function getEnv(key: string): string | undefined {
  // Check for Node.js environment
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  // Check for Vite environment
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // In Vite, try both the original key and VITE_ prefixed version
    return import.meta.env[key] ?? import.meta.env[`VITE_${key}`];
  }
  return undefined;
}

type ConfigRequirement = {
  envKey: string;
  configValue: string | undefined;
  configKey: string;
};

/**
 * Validates multiple required configurations and throws a single grouped error if any are missing
 */
function validateRequiredConfigs(
  provider: string,
  requirements: ConfigRequirement[],
): Record<string, string> {
  const isVite = typeof import.meta !== "undefined" && import.meta.env;
  const missing: Array<{ configKey: string; envVarName: string }> = [];
  const values: Record<string, string> = {};

  // First pass: collect missing configs
  for (const req of requirements) {
    const envValue = getEnv(req.envKey);
    const value = envValue ?? req.configValue;

    if (!value) {
      const envVarName = isVite ? `VITE_${req.envKey}` : req.envKey;
      missing.push({ configKey: req.configKey, envVarName });
    } else {
      values[req.configKey] = value;
    }
  }

  // If any are missing, throw a comprehensive error
  if (missing.length > 0) {
    const missingList = missing
      .map(
        (m) =>
          `  - ${m.configKey} (env: ${m.envVarName} or config: ${m.configKey})`,
      )
      .join("\n");

    throw new Error(
      `Missing required configuration for ${provider}:\n${missingList}\n\n` +
        `Please provide the missing configuration above.`,
    );
  }

  // Second pass: validate all values with Zod
  const validated: Record<string, string> = {};
  for (const req of requirements) {
    validated[req.configKey] = z.string().parse(values[req.configKey]);
  }

  return validated;
}

export function createSearchClient(config: SearchOptions): SearchClient {
  switch (config.provider) {
    case "meilisearch": {
      const validated = validateRequiredConfigs("meilisearch", [
        {
          envKey: "MEILISEARCH_HOST",
          configValue: config.host,
          configKey: "host",
        },
        {
          envKey: "MEILISEARCH_SEARCH_API_KEY",
          configValue: config.apiKey,
          configKey: "apiKey",
        },
      ]);

      return instantMeiliSearch(validated.host, validated.apiKey).searchClient;
    }
    case "algolia": {
      const validated = validateRequiredConfigs("algolia", [
        {
          envKey: "ALGOLIA_APPLICATION_ID",
          configValue: config.appId,
          configKey: "appId",
        },
        {
          envKey: "ALGOLIA_SEARCH_API_KEY",
          configValue: config.apiKey,
          configKey: "apiKey",
        },
      ]);

      return algoliasearch(validated.appId, validated.apiKey);
    }
    case "typesense":
      const validated = validateRequiredConfigs("typesense", [
        {
          envKey: "TYPESENSE_HOST",
          configValue: config.host,
          configKey: "host",
        },
        {
          envKey: "TYPESENSE_SEARCH_API_KEY",
          configValue: config.apiKey,
          configKey: "apiKey",
        },
      ]);
      let protocol = "https";
      let port = 443;
      let hostName = z
        .string()
        .parse(process.env.TYPESENSE_HOST ?? config.host);

      try {
        if (validated.host.includes("://")) {
          const url = new URL(validated.host);
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
          hostName = validated.host;
        }
      } catch (e) {
        console.warn(
          "Failed to parse Typesense host URL, using as hostname:",
          e,
        );
      }
      const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
        server: {
          apiKey: validated.apiKey,
          nodes: [
            {
              host: hostName,
              port,
              protocol,
            },
          ],
        },
        additionalSearchParameters: {
          // query_by: "title,authors",
        },
      });
      return typesenseInstantsearchAdapter.searchClient;
    default:
      // @ts-expect-error - config.provider is not typed
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
