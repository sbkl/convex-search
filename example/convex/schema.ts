import { defineSchema } from "convex/server";
import { Materials } from "./materials/table";

export default defineSchema({
  materials: Materials.table
    .index("organisationId", ["organisationId"])
    .index("organisationId_identifier", ["organisationId", "identifier"]),
});
