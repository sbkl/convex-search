import z from "zod";

export const facetItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number(),
  isRefined: z.boolean(),
});

export const hierarchicalMenuFacetItemSchema = facetItemSchema.extend({
  get data() {
    return z.array(hierarchicalMenuFacetItemSchema).nullable();
  },
});

export const facetSchema = facetItemSchema.extend({
  href: z.string(),
});

export const hierarchicalMenuFacetSchema = facetSchema.extend({
  get data() {
    return z.array(hierarchicalMenuFacetSchema).nullable();
  },
});
