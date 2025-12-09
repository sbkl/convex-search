import { defineApp } from "convex/server";
import search from "@sbkl/convex-search/convex.config.js";

const app = defineApp();
app.use(search);

export default app;
