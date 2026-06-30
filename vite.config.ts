import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Read PORT without depending on @types/node (the project ships no Node types,
// and tsconfig typechecks this file). Lets the preview harness pin a port via
// the PORT env var; falls back to Vite's default otherwise.
const envPort = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.PORT;

export default defineConfig({
  base: "/cafe-apokalypso/",
  plugins: [react()],
  server: envPort ? { port: Number(envPort), strictPort: true } : undefined,
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  }
});
