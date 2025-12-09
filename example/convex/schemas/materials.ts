import { zid } from "convex-helpers/server/zod4";
import z from "zod";

export const materialSchema = z.object({
  organisationId: zid("organisations"),
  identifier: z.string(),
  description: z.string(),
  sport: z.string(),
  team: z.string(),
  productHierarchy: z.object({
    lvl0: z.string(),
    lvl1: z.string(),
    lvl2: z.string(),
  }),
  inventory: z.number().optional(),
  articleCount: z.number().optional(),
});

export const materialUploadSchema = z.array(
  materialSchema.pick({
    identifier: true,
    description: true,
    productHierarchy: true,
    sport: true,
    team: true,
  }),
);
