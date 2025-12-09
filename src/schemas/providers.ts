import { zodToConvex } from "convex-helpers/server/zod4";
import z from "zod";

export const searchConfigSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("meilisearch"),
    host: z.string(),
    apiKey: z.string(),
  }),
  z.object({
    provider: z.literal("algolia"),
    appId: z.string(),
    apiKey: z.string(),
  }),
  z.object({
    provider: z.literal("typesense"),
    host: z.string(),
    apiKey: z.string(),
  }),
]);

export const searchOptionsSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("meilisearch"),
    host: z.string().optional(),
    apiKey: z.string().optional(),
  }),
  z.object({
    provider: z.literal("algolia"),
    appId: z.string().optional(),
    apiKey: z.string().optional(),
  }),
  z.object({
    provider: z.literal("typesense"),
    host: z.string().optional(),
    apiKey: z.string().optional(),
  }),
]);

export const searchConfigValidator = zodToConvex(searchConfigSchema);

export type SearchConfig = z.infer<typeof searchConfigSchema>;

export type SearchOptions = z.infer<typeof searchOptionsSchema>;
