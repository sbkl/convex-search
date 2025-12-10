import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod4";
import { organisationSchema } from "../schemas/organisations";

export const Organisations = Table(
  "organisations",
  zodToConvex(organisationSchema).fields,
);
