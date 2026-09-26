/// <reference types="vitest" />
import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const require = createRequire(import.meta.url);
const reactDir = path.dirname(require.resolve("react/package.json"));
const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

/* TESTS THAT START OTHER PROCESSES RUN LAST, ONE AT A TIME (gh#991).
 *
 * Measured on the CI runner, not assumed: each test job is a container with a CPU QUOTA of three
 * (`cgroup cpu.max = 300000 100000`, `availableParallelism() = 3`), so `maxWorkers: "75%"` is two
 * workers. A test that spawns `node`/`tsx` — a generator, `pnpm regen`, a release script — adds its
 * children to those two, the container goes over its quota, and the kernel throttles EVERY process
 * in it for the rest of each 100ms period. That is why the failures were never the same test twice
 * and never an assertion: across the last 15 `CI · code` runs, 24 timeouts and 0 wrong answers, in
 * the spawners themselves (regen 5, comment-ghost 4, release-plan 8, explain-token 2) and in
 * whatever pure test shared the box with them that minute (tenant-theme 3, popover-cascade 3 — 3.2s
 * and 1.5s locally, past 20s there).
 *
 * So the spawners are found by what they DO — the file calls a child-process API — rather than by
 * a list someone has to remember to extend, and they get a project of their own that runs after
 * the parallel one with a single worker: nothing else is in the container while they run. */
const SPAWNS = /\b(execFileSync|execSync|spawnSync|execFile|spawn|fork)\s*\(/;
const SPAWNING_TESTS = globSync("src/**/*.test.{ts,tsx}").filter((file) =>
  SPAWNS.test(readFileSync(file, "utf8")),
);

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
    // `include` lives on each project, never here: `extends: true` CONCATENATES arrays, so a root
    // include would be added to `spawns` too and every test would run in both projects.
    /* 8s was not enough on CI, and the reason is in the two comments below rather than in any
     * test. Four shards run AT THE SAME TIME on one self-hosted runner, and each one takes
     * `maxWorkers: "75%"` of that box — roughly 300% oversubscription. A `userEvent.type` inserts
     * a real macrotask between every keystroke, so a ten-character type is ten scheduler round
     * trips, and under that contention they stop being free.
     *
     * Measured today: `date-typing-regression`, `form-flow`, `label-select`, `date-range-picker`
     * and `picker-extended` all timed out at 8000ms on CI across several runs, always in a typing
     * case, always in whichever shard was unlucky — and every one of them completes locally in
     * well under a second. Nothing about them changed; the machine did.
     *
     * 20s is a load allowance, not a budget: no test here is expected to take more than a fraction
     * of it, and a genuine hang still fails.
     *
     * Correction, measured later (gh#991): each shard is its OWN container with a 3-CPU quota, and
     * `availableParallelism()` already reports 3 there, so "75% of the box" is two workers, not a
     * 300% oversubscription. The contention was real but came from tests that SPAWN processes
     * inside that quota — see SPAWNING_TESTS above for the measurement and the fix. */
    testTimeout: 20_000,
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
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: SPAWNING_TESTS,
          sequence: { groupOrder: 0 },
        },
      },
      {
        extends: true,
        test: {
          name: "spawns",
          include: SPAWNING_TESTS,
          maxWorkers: 1,
          sequence: { groupOrder: 1 },
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/components/**", "src/form/**", "src/lib/**"],
      exclude: ["**/*.test.*", "**/index.ts"],
    },
  },
});
