import { defineSchema } from "convex/server";
import { Materials } from "./materials/table";
import { Organisations } from "./organisations/table";

export default defineSchema({
  materials: Materials.table
    .index("organisationId", ["organisationId"])
    .index("organisationId_identifier", ["organisationId", "identifier"]),
  organisations: Organisations.table,
});
