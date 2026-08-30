/// <reference types="vitest" />
import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const require = createRequire(import.meta.url);
const reactDir = path.dirname(require.resolve("react/package.json"));
const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: reactDir,
      "react/jsx-runtime": path.join(reactDir, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(reactDir, "jsx-dev-runtime.js"),
      "react-dom": reactDomDir,
      "react-dom/client": path.join(reactDomDir, "client.js"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 8_000,
    // `forks`, not `threads`: these are jsdom tests and several suites reach for process-level
    // globals (matchMedia stubs, IANA timezone, the i18n singleton). A forked child gets a real
    // fresh global object; a worker thread shares more than it looks like it does.
    pool: "forks",
    // Files run in PARALLEL. They did not, and that single line was where the suite's hour went:
    // 455 files x (a fresh module graph + a fresh jsdom) executed one at a time on a 10-core box.
    // The profile said so plainly — of 3409s, `import` was 2267s (67%) and `environment` 544s
    // (16%), while the tests themselves were 275s (8%). Almost none of the wall clock was spent
    // running assertions; it was spent rebuilding the world 455 times, in series.
    //
    // Measured on a 38-file / 160-test slice, same machine, same files, all passing:
    //     sequential  323s
    //     parallel     90s   (3.6x)
    //
    // `fileParallelism: false` arrived in the very first v6 snapshot commit with no rationale
    // recorded, so it was carried rather than chosen. It is the correct setting only for a suite
    // with cross-file state leakage; this one is isolated per file (pool: forks), which the full
    // parallel run verifies. If a future test does leak, fix that test's isolation — do not turn
    // this back off and pay an hour per run to hide one bad file.
    fileParallelism: true,
    // Leave a core for the OS and for whatever else is running; on CI this is capped by the
    // runner's own core count anyway.
    maxWorkers: "75%",
    coverage: {
      provider: "v8",
      include: ["src/components/**", "src/form/**", "src/lib/**"],
      exclude: ["**/*.test.*", "**/index.ts"],
    },
  },
});
