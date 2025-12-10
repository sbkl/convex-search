import z from "zod";

export const organisationSchema = z.object({
  name: z.string(),
});
