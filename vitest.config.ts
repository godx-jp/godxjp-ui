import { defineConfig } from "vitest/config"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
import { fileURLToPath } from "node:url"

const dirname = fileURLToPath(new URL(".", import.meta.url))

/**
 * Vitest is the single test runner for `@godxjp/ui`.
 *
 * Two project shapes share the config:
 *
 *   1. **unit** — plain Vitest specs (`src/**\/*.test.ts(x)`) that run in
 *      Node. For pure logic (formatters, hooks without DOM, helpers).
 *
 *   2. **storybook** — every story file's `play()` is converted into a
 *      Vitest test via `@storybook/addon-vitest`. Runs in a real
 *      Chromium browser via Playwright so Radix / cmdk / focus / portal
 *      behaviour matches what users see. This is the regression gate
 *      for interactive primitives (AutoComplete focus, Collapse panel,
 *      Carousel nav, Dialog overlay, …).
 *
 * Run:
 *   pnpm test                 # both projects, headless, single pass
 *   pnpm test:watch           # watch + browser UI
 *   pnpm test -- --project storybook  # only play() tests
 */
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          globals: false,
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: `${dirname}/.storybook` })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
})
