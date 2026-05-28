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
    pool: "forks",
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: ["src/components/**", "src/form/**", "src/lib/**"],
      exclude: ["**/*.test.*", "**/index.ts"],
    },
  },
});
