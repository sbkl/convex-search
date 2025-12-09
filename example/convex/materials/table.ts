import { materialSchema } from "../schemas/materials";
import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod4";

export const Materials = Table("materials", zodToConvex(materialSchema).fields);
