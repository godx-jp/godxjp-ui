import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE BAR ROW HAD NO BLUR KNOB, SO A GLASS THEME HAD TO PAINT THE INSET COMPONENT (gh#895).
 *
 * Reported as "topbar sao vẫn bị 2 khoảng trống khác màu nhau 2 bên" — two strips at the bar's
 * edges, each a different colour from the bar and from each other.
 *
 * There are TWO elements, and four `--topbar-*` knobs that do not paint the same one:
 *
 *     .app-topbar   x=256  w=1184   --app-shell-bar-background · --topbar-gradient
 *                                   padding-inline: --app-shell-bar-inset = 24px
 *     .ui-topbar    x=280  w=1136   --topbar-background-alpha · --topbar-backdrop-blur-size
 *
 * The component is inset by exactly the row's padding, so a theme that fills the component leaves
 * the row showing through both gutters. Scanning the painted pixels along the top of the bar at
 * 1440px, largest single-pixel jump in 1184px and where it sits:
 *
 *     seed      before  at x      after
 *     citron      52      24        0      (right gutter 34 -> 1)
 *     violet      49      24        0      (33 -> 0)
 *     coral       47      24        0      (35 -> 0)
 *     azure       49      24        0      (35 -> 0)
 *     navy        47      24        0      (35 -> 0)
 *
 * `x=24` is the gutter boundary in every case. The worst jump anywhere in the bar is now 2, which
 * is the gradient's own dithering.
 *
 * It was never a sloppy theme: `--topbar-backdrop-blur-size` was the ONLY blur a theme could reach
 * for the bar, and it lives on the inset element, so the artefact followed automatically. The
 * sidebar has had `--sidebar-backdrop-blur-size` since gh#880; the row beside it had none.
 *
 * A CSS-TEXT TEST because jsdom performs no layout and applies no filter — the pixel scan above is
 * the browser half. What this holds is the contract whose absence was the defect: the row has the
 * knob, it is `initial` so the shipped bar creates no backdrop root, and it carries the shared
 * saturate companion that every other blurred surface in this package already pairs with.
 */
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const shell = read("src/styles/shell-layout.css");
const tokens = read("src/tokens/components/shell.css");

const rule = (css: string, selector: string) =>
  css.match(new RegExp(`\\n\\s*\\${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

describe("The bar ROW can blur, so a theme never has to paint the inset component (gh#895)", () => {
  it("declares the knob in the shell tier, `initial` like every other opt-in blur", () => {
    expect(tokens).toMatch(/--app-shell-bar-backdrop-blur-size:\s*initial/);
  });

  it("reads it on `.app-topbar` — the element that reaches both edges", () => {
    const row = rule(shell, ".app-topbar");
    expect(row).toMatch(/backdrop-filter:\s*blur\(var\(--app-shell-bar-backdrop-blur-size\)\)/);
    // The row is the full-width one precisely BECAUSE it owns the inset.
    expect(row).toMatch(/padding-inline:\s*var\(--app-shell-bar-inset\)/);
  });

  it("pairs it with the shared saturate companion — blur alone is the grey mush", () => {
    // docs/GLASSMORPHISM-STANDARD.md §1. The Topbar used to be the one blur call site without it,
    // which `measure-glass.mjs` printed as `sat NO` against `sat yes` everywhere else.
    expect(rule(shell, ".app-topbar")).toMatch(
      /saturate\(var\(--surface-backdrop-saturate,\s*160%\)\)/,
    );
  });

  it("stays `initial` and never `0`, so the shipped bar is not a backdrop root", () => {
    // A literal `blur(0px)` still promotes the element and makes it the containing block for its
    // fixed descendants — the trap documented on the app-launcher scrim in the same file.
    expect(tokens).not.toMatch(/--app-shell-bar-backdrop-blur-size:\s*0/);
    const row = rule(shell, ".app-topbar");
    expect(row).not.toMatch(/blur\(\s*0(px)?\s*\)/);
  });

  it("mirrors `.app-sidebar`, which got the same pair in gh#880", () => {
    const sidebar = rule(shell, ".app-sidebar");
    expect(sidebar).toMatch(/backdrop-filter:\s*blur\(var\(--sidebar-backdrop-blur-size\)\)/);
    expect(sidebar).toMatch(/saturate\(var\(--surface-backdrop-saturate,\s*160%\)\)/);
  });

  it("leaves `.ui-topbar` a layout-only wrapper in the glass theme", () => {
    // The theme may still set the component's knobs for a STANDALONE Topbar outside AppShell —
    // this asserts only that the shipped glass theme does not, which is what caused the strips.
    const theme = read("docs/themes/glassmorphism.css");
    const declarations = [
      ...theme.matchAll(/^\s*(--topbar-(?:background-alpha|backdrop-blur-size)):/gm),
    ];
    expect(declarations.map((m) => m[1])).toEqual([]);
    expect(theme).toMatch(/--app-shell-bar-backdrop-blur-size:\s*var\(--blur-lg\)/);
  });
});
