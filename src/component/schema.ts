import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Indexes } from "./indexes/table";

export default defineSchema({
  indexes: Indexes.table.index("name", ["name"]),
  comments: defineTable({
    text: v.string(),
    userId: v.string(), // Note: you can't use v.id referring to external tables
    targetId: v.string(),
  }).index("targetId", ["targetId"]),
});
