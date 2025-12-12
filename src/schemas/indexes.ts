import z from "zod";

/**
 * Zod schema for the runtime index metadata.
 * This defines the shape of records in the `indexes` table.
 */
export const indexSchema = z.object({
  /** Unique name for this index/collection (e.g., "products" or "products-org_123") */
  name: z.string(),
  /** The Convex table name being indexed */
  tableName: z.string(),
  /** The primary key field name for the index */
  primaryKey: z.string(),
  /** Unique attribute that can be used to scope multiple index/collections targeting the same convex table (e.g., for multitenancy: organisationId) */
  scope: z.record(z.string(), z.any()).optional(),
  /** Attributes from the convex table that are searchable (full-text search) */
  searchableAttributes: z.array(z.string()),
  /** Attributes from the convex table that can be used for faceting. filterableAttributes for Meilisearch, attributesForFaceting for Algolia... */
  filterableAttributes: z.array(z.string()),
  /** Attributes from the convex table that can be used for sorting */
  sortableAttributes: z.array(z.string()),
});

export type IndexSchema = z.infer<typeof indexSchema>;

export const searchIndexSyncKindSchema = z.union([
  z.literal("create"),
  z.literal("update"),
  z.literal("delete"),
]);

export const searchIndexSyncStatusSchema = z.enum([
  "queued",
  "pending",
  "completed",
  "failed",
]);

export const searchIndexSyncSchema = z.object({
  scope: z.string(),
  kind: searchIndexSyncKindSchema,
  tableName: z.string(),
  recordsSynced: z.number(),
  recordsTotal: z.number(),
  progress: z.number(),
  status: searchIndexSyncStatusSchema,
  lastSyncedAt: z.number().optional(),
  workflowId: z.string().optional(),
});

export type SearchIndexSyncSchema = z.infer<typeof searchIndexSyncSchema>;
