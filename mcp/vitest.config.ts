import { defineConfig } from "vitest/config";

// The MCP server is plain Node (no DOM/React). The default `threads` pool
// segfaults under this Node/vitest combo, so pin a single child-process fork
// (mirrors the library's vitest config, minus the jsdom/react setup).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    pool: "forks",
    fileParallelism: false,
    maxWorkers: 1,
  },
});
