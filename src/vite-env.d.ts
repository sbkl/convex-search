// Extend ImportMeta to include env property for Vite compatibility
// This allows the library to work in both Node.js and Vite environments
interface ImportMeta {
  readonly env?: Record<string, string | undefined>;
}


