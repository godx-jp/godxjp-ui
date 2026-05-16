// @godxjp/ui — shared Vitest config base.
//
// Consume in a service frontend:
//
//   // vitest.config.ts
//   import base from "@godxjp/ui/vitest-config"
//   import { mergeConfig } from "vitest/config"
//   export default mergeConfig(base, { test: { /* service overrides */ } })

import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "dist/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 75,
        branches: 70,
      },
    },
  },
})
