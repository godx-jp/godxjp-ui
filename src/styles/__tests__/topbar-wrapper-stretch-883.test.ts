import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A WRAPPER IN A TOPBAR SLOT BROKE THE STRETCH CHAIN (gh#883).
 *
 * `.ui-topbar-item` carries `align-self: stretch` and the rule above it states its contract with no
 * condition — "full bar height". It held for exactly one item per slot. Every real topbar has two
 * in `end` (notifications and account), you reach for a `<Flex>` to group them, and a `<Flex>` is a
 * REAL element with the initial `align-self: auto`: it collapses to its own content height and the
 * items stretch to THAT instead of to the bar.
 *
 * Measured in Chromium on `/showcase/theme-lab`, a 47px bar:
 *
 *     bare TopbarItem (direct slot child)     47
 *     wrapper (<Flex> in the same slot)       24
 *     both TopbarItems inside it              24
 *
 * which paints the hover as a pill floating in the middle of the bar, and is under WCAG 2.2
 * SC 2.5.8's 24x24 target floor once the ring is inset.
 *
 * THE SWEEP THE ISSUE ASKED FOR, before choosing between "stretch every slot child" and a larger
 * API change: 38 routes x 4 widths (1280/1024/768/390) = 80 topbar slot children. With the rule
 * scoped by `:has(.ui-topbar-item)`, 16 moved (32 -> 47) and every one of them was a TopbarItem
 * wrapper; 0 were not. Unscoped, the same rule would also stretch an Avatar, a Badge or a string a
 * consumer centred on purpose, which is why the scope is the fix and not an optimisation.
 *
 * A CSS-TEXT TEST because jsdom performs no layout — `align-self` has no observable effect there,
 * so the browser half of this evidence is the measurement above and `check:frame-overflow`. What a
 * unit test CAN hold is the thing whose absence was the defect: that the rule exists, that it is
 * scoped to a wrapper containing a TopbarItem rather than to every slot child, and that it is not
 * behind a query.
 */
describe("Topbar slot wrappers keep the stretch chain (gh#883)", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
  const SELECTOR =
    ":is(.ui-topbar-start, .ui-topbar-center, .ui-topbar-end) > *:has(.ui-topbar-item)";

  it("stretches a slot child that wraps a TopbarItem", () => {
    const rule = css.match(
      /:is\(\.ui-topbar-start, \.ui-topbar-center, \.ui-topbar-end\) > \*:has\(\.ui-topbar-item\)\s*\{([^}]*)\}/,
    );
    expect(rule, `${SELECTOR} has no rule`).not.toBeNull();
    expect(rule![1]).toMatch(/align-self:\s*stretch/);
  });

  it("gives it HEIGHT only — the wrapper's own alignment still centres its content", () => {
    const rule = css.match(
      /:is\(\.ui-topbar-start, \.ui-topbar-center, \.ui-topbar-end\) > \*:has\(\.ui-topbar-item\)\s*\{([^}]*)\}/,
    )![1];
    // `align-items` here would re-align the group; `block-size`/`height` would pin it off the bar.
    expect(rule).not.toMatch(/align-items\s*:/);
    expect(rule).not.toMatch(/(?:^|[\s;{])(?:block-size|height)\s*:/);
  });

  it("never stretches EVERY slot child — that is what the :has() scope buys", () => {
    // The unscoped shape is the one the sweep ruled out: it moves an Avatar or a centred string.
    for (const slot of [".ui-topbar-start", ".ui-topbar-center", ".ui-topbar-end"]) {
      const unscoped = new RegExp(`\\${slot}\\s*>\\s*\\*\\s*\\{[^}]*align-self:\\s*stretch`);
      expect(css, `${slot} > * must not stretch unconditionally`).not.toMatch(unscoped);
    }
  });

  it("is not behind a media or container query, so it holds at every bar height", () => {
    const index = css.indexOf(SELECTOR);
    expect(index).toBeGreaterThan(-1);
    const before = css.slice(0, index);
    const depth = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
    // Depth 1 is the `@layer components` wrapper every rule in this file lives in.
    expect(depth).toBe(1);
  });

  it("keeps the item's own stretch — the wrapper rule is the missing LINK, not a replacement", () => {
    const item = css.match(/\n\s*\.ui-topbar-item\s*\{([^}]*)\}/);
    expect(item).not.toBeNull();
    expect(item![1]).toMatch(/align-self:\s*stretch/);
  });
});
