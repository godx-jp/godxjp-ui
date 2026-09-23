import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sidebar } from "../sidebar";

/**
 * THE BRAND MARK'S INITIAL WAS WHITE ON ORANGE IN EVERY CELL (gh#884, second half).
 *
 * gh#884 turned `.sb-logo-mark`'s literal `color: white` into the knob
 * `--sidebar-logo-mark-color`, so a consumer could reach it. The knob was the right shape and the
 * DEFAULT was still wrong: measured on `/showcase/theme-lab` across 3 themes x 5 seeds, white on
 * the default `--attention` fill (#eb6101) is 3.38:1 — under SC 1.4.3's 4.5:1 in 15 of 15 cells,
 * and after every other ink was fixed it was the one string that still failed in every one.
 *
 * The stylesheet could not fix it: the fill is the CALLER's (`product.color`), and CSS cannot
 * measure a value to choose an ink against it. Only the component knows both, so the component
 * resolves it — with the same black-or-white pivot `tenantTheme` uses for `--primary-foreground`,
 * and for the default fill with `--attention-foreground`, the pairing gh#643 already computed at
 * 4.68:1 for every other `--attention` surface.
 *
 * AS A FALLBACK, NEVER AS AN ASSIGNMENT. `--sidebar-logo-mark-color` is the consumer's channel;
 * assigning it inline here would outrank the `[data-tenant]` scope it exists for, which is the
 * freeze rule in docs/TOKENS.md turned inside out. That is what the last case holds.
 */
const markOf = (ui: React.ReactElement) =>
  render(ui).container.querySelector(".sb-logo-mark") as HTMLElement;

describe("Sidebar brand mark — the ink follows the fill (gh#884)", () => {
  it("pairs the DEFAULT --attention fill with --attention-foreground, not white", () => {
    const mark = markOf(<Sidebar product={{ name: "Tenkai" }} sections={[]} activeId="" />);
    expect(mark.style.background).toContain("var(--attention)");
    // The literal `white` at 3.38:1 is what this replaces.
    expect(mark.style.color).toBe(
      "var(--sidebar-logo-mark-color, hsl(var(--attention-foreground)))",
    );
  });

  it("picks BLACK on a light caller colour — the pivot tenantTheme uses for the brand label", () => {
    // #FFD400, L≈0.68, far above the 0.179 pivot: white here measures 1.4:1.
    const mark = markOf(
      <Sidebar product={{ name: "Tenkai", color: "#FFD400" }} sections={[]} activeId="" />,
    );
    expect(mark.style.color).toBe("var(--sidebar-logo-mark-color, black)");
  });

  it("picks WHITE on a dark caller colour", () => {
    const mark = markOf(
      <Sidebar product={{ name: "Tenkai", color: "#0A1F44" }} sections={[]} activeId="" />,
    );
    expect(mark.style.color).toBe("var(--sidebar-logo-mark-color, white)");
  });

  it("keeps `white` for a colour CSS accepts but we cannot measure", () => {
    // A `var()`, a named colour or `oklch()` is legal here and unparseable; the honest answer is
    // the value that shipped, not a guess.
    for (const color of ["var(--brand)", "rebeccapurple", "oklch(0.7 0.1 30)"]) {
      const mark = markOf(
        <Sidebar product={{ name: "Tenkai", color }} sections={[]} activeId="" />,
      );
      expect(mark.style.color, color).toBe("var(--sidebar-logo-mark-color, white)");
    }
  });

  it("resolves it as the FALLBACK, so a consumer's knob still wins", () => {
    const mark = markOf(
      <Sidebar product={{ name: "Tenkai", color: "#FFD400" }} sections={[]} activeId="" />,
    );
    // An assignment — `--sidebar-logo-mark-color: black` — would beat a `[data-tenant]` rule.
    expect(mark.style.getPropertyValue("--sidebar-logo-mark-color")).toBe("");
    expect(mark.style.color.startsWith("var(--sidebar-logo-mark-color,")).toBe(true);
  });
});
