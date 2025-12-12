import { action, internalAction } from "../_generated/server";
import { search } from "../search";

export const listIndexes = action({
  async handler(ctx) {
    const indexes = await search.listIndexes(ctx);
    return indexes;
  },
});
