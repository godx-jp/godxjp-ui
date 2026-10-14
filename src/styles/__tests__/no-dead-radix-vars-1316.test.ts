import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#1316 — `.ui-dropdown-menu-content` capped its height with
 * `var(--radix-dropdown-menu-content-available-height)`, a variable nothing has set since the menu
 * moved to react-aria. A `--radix-*` read in the stylesheet is only alive when a component writes
 * that name (Popover replays three of them onto its react-aria panel), so every one read must be
 * written somewhere in `src/components`.
 */
const ROOT = path.resolve(__dirname, "../../..");

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : files(p, ext);
    return ext.test(e.name) ? [p] : [];
  });
}

describe("no dead --radix-* variable in the stylesheet (gh#1316)", () => {
  it("every var(--radix-*) the CSS reads is written by a component", () => {
    const css = files(path.join(ROOT, "src/styles"), /\.css$/).map((f) => readFileSync(f, "utf8"));
    const read = new Set(
      css.flatMap((s) => [...s.matchAll(/var\((--radix-[\w-]+)/g)].map((m) => m[1]!)),
    );
    const tsx = files(path.join(ROOT, "src/components"), /\.tsx?$/)
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    const dead = [...read].filter((name) => !tsx.includes(`"${name}":`));
    expect(read.size).toBeGreaterThan(0);
    expect(dead).toEqual([]);
  });
});
