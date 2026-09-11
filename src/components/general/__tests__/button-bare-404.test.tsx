/**
 * gh#404 — a control that must wrap non-text content.
 *
 * 1. `variant="bare"` is a real Button with NO geometry, so `className="h-auto p-0"` (an audit
 *    error with no legal replacement) is no longer the only way to wrap a chip or a title.
 * 2. The Badge-flattening rule is scoped to the variants that actually have a box, and routed
 *    through the Badge's own knobs so a call site can opt out honestly.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Button } from "../button";
import { Badge } from "../../data-display/badge";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const control = read("../../../styles/control.css");

describe("Button variant=bare (gh#404)", () => {
  it("is a real button with the variant reflected", () => {
    renderWithUi(
      <Button variant="bare" aria-label="ステータスを変更">
        <Badge tone="warning">保留</Badge>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "ステータスを変更" });
    expect(button).toHaveAttribute("data-variant", "bare");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("ui-button", "ui-button--bare");
  });

  it("drops the size tier's geometry with two-class specificity, not with a utility", () => {
    // A utility would sit in @layer utilities and could not be overridden by a consumer theme.
    expect(control).toMatch(
      /\.ui-button\.ui-button--bare \{[^}]*height: auto;[^}]*padding: 0;[^}]*\}/s,
    );
    // Type and colour inherit — a bare button must not promote a document title to control weight.
    expect(control).toMatch(/\.ui-button\.ui-button--bare \{[^}]*font: inherit;/s);
  });

  it("keeps a ≥24px target on a pseudo-element, on logical/direction-neutral properties", () => {
    const at = control.indexOf(".ui-button.ui-button--bare::after {");
    expect(at).toBeGreaterThan(-1);
    const rule = control.slice(at, control.indexOf("}", at));
    // The knob is read WITH the live ladder step as its fallback, not as a bare `var()`. The
    // reason is in mobile-shell-control-ladder.test.ts: an alias declared at :root freezes there,
    // and this is the one token in that shape that is a touch target.
    expect(rule).toContain(
      "min-inline-size: var(--button-bare-target-size, var(--control-height-xs));",
    );
    expect(rule).toContain(
      "min-block-size: var(--button-bare-target-size, var(--control-height-xs));",
    );
    // `inset: 0` + `margin: auto` centres on both axes with no physical offset and no translate.
    expect(rule).toContain("inset: 0;");
    expect(rule).toContain("margin: auto;");
    expect(rule).not.toMatch(/translate:|\bleft:|\bright:/);
    // The target measure is the tier this package documents as its WCAG 2.2 SC 2.5.8 floor, and
    // the knob is declared `initial` so that tier re-resolves at the button rather than at :root.
    expect(read("../../../tokens/components/control.css")).toMatch(
      /--button-bare-target-size:\s*initial;/,
    );
  });
});

describe("Badge nested in a Button (gh#404)", () => {
  it("flattens the chip only in the variants that HAVE a box", () => {
    const at = control.indexOf(".ui-button:is(");
    expect(at).toBeGreaterThan(-1);
    const selector = control.slice(at, control.indexOf("{", at));
    for (const boxed of ["default", "destructive", "outline", "dashed", "secondary"]) {
      expect(selector).toContain(`.ui-button--${boxed}`);
    }
    // ghost / link / bare have no frame for a chip to fight — the rule collapsed the chip there
    // from 19.1px to 11.1px with no escape from the call site.
    for (const boxless of ["ghost", "link", "bare"]) {
      expect(selector).not.toContain(`.ui-button--${boxless}`);
    }
  });

  it("restates the Badge's OWN knobs instead of writing constants", () => {
    const at = control.indexOf(".ui-button:is(");
    const rule = control.slice(at, control.indexOf("}", at));
    expect(rule).toContain("--badge-space-y: 0;");
    expect(rule).toContain("--badge-radius: var(--radius-sm);");
    expect(rule).not.toMatch(/padding-block:|border-radius:/);
    // The knob it now writes through has to be the one the Badge actually reads.
    expect(read("../../../styles/badge-layout.css")).toContain(
      "border-radius: var(--badge-radius);",
    );
    expect(read("../../../tokens/components/badge.css")).toMatch(
      /--badge-radius:\s*var\(--radius-md\);/,
    );
  });

  it("still renders one badge node inside a ghost button, untouched", () => {
    const { container } = renderWithUi(
      <Button variant="ghost" aria-label="通知">
        <Badge tone="destructive">3</Badge>
      </Button>,
    );
    const badges = container.querySelectorAll('[data-slot="badge"]');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent("3");
  });
});
