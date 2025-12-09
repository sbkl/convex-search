import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cjsInterop } from "vite-plugin-cjs-interop";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "../",
  plugins: [
    react(),
    tailwindcss(),
    cjsInterop({
      dependencies: [
        "typesense-instantsearch-adapter",
        "typesense",
        "axios",
        "follow-redirects",
      ],
    }),
  ],
  resolve: {
    conditions: ["@convex-dev/component-source"],
    alias: {
      url: "./builtins_placeholder.tsx",
      stream: "./builtins_placeholder.tsx",
      "follow-redirects": "./builtins_placeholder.tsx",
      axios: "./builtins_placeholder.tsx",
    },
  },
});
