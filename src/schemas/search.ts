import z from "zod";

export const searchSchema = z.object({
  primaryKey: z.string().optional(),
  scope: z.array(z.string()).optional(),
  query: z
    .object({
      searchableAttributes: z.array(z.string()),
      urlKey: z.string().optional(),
    })
    .optional(),
  filters: z
    .array(
      z.object({
        kind: z.enum(["refinementList", "hierarchicalMenu", "menu"]),
        attribute: z.string(),
        urlKey: z.string().optional(),
      }),
    )
    .optional(),
  sortableAttributes: z.array(z.string()).optional(),
});
