import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/cafe-apokalypso/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Main game shell plus the standalone Lookbook reference page.
        // Paths are resolved relative to the Vite project root.
        main: "index.html",
        lookbook: "lookbook.html"
      }
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  }
});
