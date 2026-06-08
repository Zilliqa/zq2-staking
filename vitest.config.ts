// ABOUTME: Vitest config for unit tests of pure helpers (no React/DOM needed)
// ABOUTME: Mirrors the tsconfig "@/*" -> "./src/*" path alias used across the app
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
})
