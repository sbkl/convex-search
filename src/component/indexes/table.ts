import { zodToConvex } from "convex-helpers/server/zod4";
import { indexSchema } from "../../schemas/indexes";
import { Table } from "convex-helpers/server";

export const Indexes = Table("indexes", zodToConvex(indexSchema).fields);
