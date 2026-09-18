import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/*
 * A test file that installs fake timers and never puts them back leaves them installed for every
 * test declared AFTER it in the same file — `vi.useFakeTimers()` replaces the shared global clock,
 * not something scoped to the `it` that called it.
 *
 * Found in `avatar-aspect-ratio.test.tsx`: two `delayMs` tests installed fake timers, and the
 * seven tests below them — including an entire `AspectRatio` describe — ran on a clock that never
 * advanced unless something called `advanceTimersByTime`. They all passed, which is exactly the
 * problem. A test that passes under a frozen clock has not shown it would pass under a real one,
 * and nothing in the output says which clock it ran on.
 *
 * This gate is deliberately textual and deliberately generous about HOW the restore happens
 * (`useRealTimers` in an `afterEach`, at the end of the test, or `restoreAllMocks` where the
 * project treats that as its reset) — it asks only that the file says so somewhere, because the
 * failure this catches is forgetting entirely, not choosing the wrong idiom.
 */
describe("every test file that installs fake timers puts them back", () => {
  it("has no file calling useFakeTimers without a restore", () => {
    const files = globSync("src/**/*.test.{ts,tsx}", { cwd: root }).map((file) =>
      resolve(root, file),
    );

    // The glob must actually find the suite: an empty list would make `offenders` empty too,
    // and this gate would pass forever while checking nothing.
    expect(files.length).toBeGreaterThan(100);

    const offenders = files
      .map((file) => ({ file, source: readFileSync(file, "utf8") }))
      .filter(({ source }) => source.includes("useFakeTimers"))
      .filter(({ source }) => !/useRealTimers|restoreAllMocks/.test(source))
      .map(({ file }) => relative(root, file));

    expect(offenders).toEqual([]);
  });
});
