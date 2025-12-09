import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { ThemeProvider } from "./theme-provider";

const address = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(address);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConvexProvider client={convex}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </ConvexProvider>
    </ThemeProvider>
  );
}
