import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, over } from "../../../tokens/__tests__/wcag-contrast";

/**
 * The ruled day grid draws in `--input` at half alpha, and that is a MEASURED choice — made twice.
 *
 * The ruling shipped in `hsl(var(--border))`, the decorative tier: 1.15:1 on --background, --card
 * and --popover (the picker popup), 1.05:1 on the --muted weekday header — a 1px line that is not
 * there, which is exactly the "very hard to read" the owner reported once the grid was switched
 * on. Candidates measured from these tokens, light / dark, on the popover surface:
 *
 *   --border            1.15 / 1.27   invisible
 *   --accent            1.19 / 1.43   also the range-middle fill → 1.00 on it
 *   --secondary-active  1.27 / 1.68   a pressed-fill role, still faint
 *   --text-disabled     2.15 / 2.97   a TEXT role meaning "disabled"
 *   --input             3.47 / 3.88   the ≥3:1 boundary tier  ← chosen in 25.3.0
 *
 * Then the owner reported the opposite on real screens: "màu border của gantt và date picker đang
 * bị đậm quá cho mờ đi" — the Gantt and date-picker lines are too dark, make them lighter. So the
 * answer lies BETWEEN the two. Grid lines are decorative (no WCAG minimum), so the target is
 * legibility, roughly 1.5–2.0:1: the grid still reads but no longer dominates. Measured in Chromium
 * on the open DatePicker popover (surface / --muted weekday header), light / dark:
 *
 *   --input / 0.35      1.45 / 1.57   header 1.42 / 1.50   borderline faint in light
 *   --input / 0.5       1.74 / 1.95   header 1.68 / 1.80   ← chosen
 *   --input / 0.65      2.10 / 2.41   header 2.01 / 2.14   past the band in dark
 *
 * An alpha of the boundary role, not a new role, so a theme that retints --input moves the grid
 * with it. RangeTimeline's grid uses the same value, so the Gantt and the picker match.
 */
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const control = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/control.css"), "utf8");

function block(selector: string): string {
  const start = foundation.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
}

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

describe.each(THEMES)("calendar grid line ($theme)", ({ selector }) => {
  const body = block(selector);
  const rgb = (name: string) => hslToRgb(hsl(body, name));
  const line = (surface: string) => over(rgb("input"), rgb(surface), 0.5);

  it.each(["background", "card", "popover", "muted"])(
    "reads but does not dominate on --%s (1.5–2.0:1)",
    (surface) => {
      const ratio = contrast(line(surface), rgb(surface));
      expect(ratio).toBeGreaterThanOrEqual(1.5);
      expect(ratio).toBeLessThanOrEqual(2);
    },
  );

  it("is lighter than the full --input line the owner found too dark", () => {
    expect(contrast(line("popover"), rgb("popover"))).toBeLessThan(
      contrast(rgb("input"), rgb("popover")),
    );
  });

  it("the old --border line really was invisible on the popover (the bug)", () => {
    expect(contrast(rgb("border"), rgb("popover"))).toBeLessThan(1.5);
  });

  it("stays quieter than the selected day's --primary fill", () => {
    expect(contrast(line("popover"), rgb("popover"))).toBeLessThan(
      contrast(rgb("primary"), rgb("popover")),
    );
  });
});

describe("calendar grid line — stylesheet wiring", () => {
  const css = control.replace(/\/\*[\s\S]*?\*\//g, "");
  const ruled = [...css.matchAll(/\.ui-calendar\[data-bordered="true"\][^{]*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .filter((b) => /border-(?:inline|block)-(?:start|end)\s*:/.test(b));

  it("every ruling declaration reads the knob with the --input / 0.5 fallback", () => {
    expect(ruled.length).toBeGreaterThanOrEqual(4);
    for (const b of ruled) {
      for (const decl of b.match(/border-(?:inline|block)-(?:start|end)\s*:[^;]*;/g) ?? []) {
        expect(decl).toContain("var(--calendar-grid-border-color, hsl(var(--input) / 0.5))");
      }
    }
  });

  it("the ruled day cell owns its column width, so the 100%-wide button cannot collapse it", () => {
    // Measured in Chromium with the rule absent: cells 16.5px wide, the week ragged against a
    // 225px header. jsdom does no layout, so what is pinned is the rule that prevents it.
    const cell = [
      ...css.matchAll(/\.ui-calendar\[data-bordered="true"\] \.ui-calendar-day\s*\{([^}]*)\}/g),
    ];
    expect(cell.some((m) => /inline-size:\s*var\(--control-height\);/.test(m[1]))).toBe(true);
  });

  it("the knob is an `initial` role-mirror, so a scoped theme retints it live", () => {
    expect(tokens).toMatch(/--calendar-grid-border-color:\s*initial;/);
  });
});
