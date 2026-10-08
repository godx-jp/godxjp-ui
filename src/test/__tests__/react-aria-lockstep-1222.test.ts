import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#1222 — react-aria-components pins react-aria / react-stately EXACTLY in each of its releases,
 * and this package imports all three. With `react-aria-components: "^1.21.1"` next to exact
 * `react-aria: 3.52.1`, a fresh consumer install resolved RAC 1.22.0, whose own react-aria is
 * 3.53.0, so the consumer got TWO react-aria copies and two react-stately copies (measured with
 * `npm ls` on @godxjp/ui@31.31.7). The three must move together: RAC pinned exactly, and our two
 * pins equal what that RAC release declares.
 */
const ROOT = process.cwd();
const own = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
  dependencies: Record<string, string>;
};
const require = createRequire(path.join(ROOT, "package.json"));
const rac = JSON.parse(
  readFileSync(require.resolve("react-aria-components/package.json"), "utf8"),
) as { version: string; dependencies: Record<string, string> };

describe("react-aria family moves in lockstep (gh#1222)", () => {
  it("pins react-aria-components to an exact version, so a fresh install cannot drift ahead", () => {
    expect(own.dependencies["react-aria-components"]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(own.dependencies["react-aria-components"]).toBe(rac.version);
  });

  for (const dep of ["react-aria", "react-stately"]) {
    it(`pins ${dep} to exactly what that react-aria-components release declares`, () => {
      expect(own.dependencies[dep]).toBe(rac.dependencies[dep]);
    });
  }
});
