import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Toggle } from "../../ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

/**
 * The CHIP: `Toggle variant="soft"` + `shape` (gh#734).
 *
 * The reported defect was that a tag-filter panel's chips "look transparent": `variant="default"`
 * is a 1px TRANSPARENT border with no fill at all and `variant="outline"` is a hairline on
 * `--background`, so an unpressed chip painted nothing. The consumer's fallback,
 * `<Button variant="secondary" shape="pill" aria-pressed>`, has the fill but no pressed branch, so
 * the chip then looked identical selected and unselected.
 *
 * MEASURED in Chromium (dev preview :6194, /isolate/data-entry-toggle{,-count}) at 1440,
 * `getComputedStyle` + `getBoundingClientRect`, light theme on the `--card` surface:
 *
 *   variant   rest background        vs card   label on it   pressed background   label on it
 *   default   rgba(0, 0, 0, 0)       —         —             rgb(122,0,255)       6.31:1
 *   outline   rgb(253,253,252)       1.00:1    —             rgb(122,0,255)       6.31:1
 *   soft      rgb(244,243,240)       1.09:1    14.19:1       rgb(122,0,255)       6.31:1
 *
 *   · `rgb(244,243,240)` IS `hsl(var(--secondary))` — the same fill `Badge variant="secondary"`
 *     and `.ui-button--secondary` paint, so the three read as one family.
 *   · hover `rgb(235,234,229)` = `--secondary-hover`, opaque: 1.18:1 on the card, label 13.07:1.
 *   · dark theme: rest `rgb(49,47,43)` on card `rgb(33,32,28)` = 1.22:1, label 12.44:1;
 *     pressed `rgb(220,188,255)` = 9.85:1 on the card, label on it 10.72:1.
 *   · the soft chip's counter pill is `--background` on `--foreground`: 1.09:1 against the chip
 *     (as quiet as the default pill is on its own surface) with 15.46:1 on the digits. It cannot
 *     inherit the generic `--muted` pill: `--muted` and `--secondary` are the same value in the
 *     shipped theme, which would have measured 1.00:1 — an invisible pill.
 *   · HIT TARGET (WCAG 2.2 SC 2.5.8, 24px floor): xs 24.00 · sm 28.00 · md 32.00 · lg 36.00, and
 *     at 390px the coarse-pointer tier lifts the xs chip to 44.39. Narrowest chip box measured
 *     34.94 x 24.00.
 *
 * jsdom does no layout and no cascade, so what is pinned here is the class/ARIA contract and the
 * CSS those numbers were resolved from.
 */
const controlCss = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
const toggleCss = readFileSync(resolve(process.cwd(), "src/styles/toggle.css"), "utf8");
const toggleTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/toggle.css"),
  "utf8",
);
const flat = (css: string) => css.replace(/\s+/g, " ").trim();

describe("Toggle soft (gh#734) — the chip has a REST fill", () => {
  it("paints hsl(var(--secondary)) at rest, through a role-mirror knob", () => {
    const rule = flat(controlCss).match(/\.ui-toggle-soft \{([^}]*)\}/)?.[1];
    expect(rule, "no .ui-toggle-soft rule").toBeDefined();
    expect(rule).toContain("background: var(--toggle-soft-background, hsl(var(--secondary)));");
    expect(rule).toContain("color: var(--toggle-soft-color, hsl(var(--secondary-foreground)));");
    // Transparent border, exactly like `default` — the fill is the whole difference, so the two
    // variants have the same box and a chip row does not jump when it changes variant.
    expect(rule).toContain("border: 1px solid transparent;");
  });

  it("is the SAME fill Badge/Button secondary already paint (one family, one token)", () => {
    /* Both now read the role through a knob and its opacity companion (gh#901). What this pins
     * is unchanged and is the point of the test: ONE role, read by both, neither hard-coding a
     * colour. The knob spelling is asserted loosely so the next token change does not read as a
     * behaviour change. */
    expect(flat(controlCss)).toMatch(
      /\.ui-button--secondary \{ background: var\( --button-secondary-background, hsl\(var\(--secondary\)/,
    );
    // The two read the same role; neither hard-codes a colour.
    expect(flat(controlCss)).toMatch(/\.ui-toggle-soft \{[^}]*hsl\(var\(\s*--secondary\)\)/);
  });

  it("documents the defect it closes: `default` declares NO background at all", () => {
    const rule = flat(controlCss).match(/\.ui-toggle-default \{([^}]*)\}/)?.[1];
    expect(rule).toBe(" border: 1px solid transparent; ");
    expect(rule).not.toContain("background");
  });

  it("hovers to the OPAQUE --secondary-hover, and loses to the pressed rule", () => {
    const css = flat(controlCss);
    const hoverAll = css.indexOf(".ui-toggle:hover");
    const hoverSoft = css.indexOf(".ui-toggle-soft:hover");
    const pressed = css.indexOf('.ui-toggle[data-state="on"]');
    expect(hoverSoft).toBeGreaterThan(hoverAll); // same specificity — source order decides
    expect(pressed).toBeGreaterThan(hoverSoft); // …so a pressed chip keeps its pressed fill
    expect(css).toContain(
      ".ui-toggle-soft:hover { background: var( --toggle-soft-hover-background, hsl(var(--secondary-hover) / var(--secondary-hover-alpha, 100%)) );",
    );
    // NOT Button's translucent `--secondary / 0.8`: a chip row sits on the page AND in a Card.
    expect(css).not.toMatch(/\.ui-toggle-soft:hover \{[^}]*--secondary\s*\/\s*0\.8/);
  });

  it("gives the soft chip its own counter pill, because --muted IS --secondary here", () => {
    expect(flat(toggleCss)).toContain(
      ".ui-toggle-soft .ui-toggle-count { background: var(--toggle-soft-count-background, hsl(var(--background))); color: var(--toggle-soft-count-color, hsl(var(--foreground))); }",
    );
    // The PRESSED pill still out-specifies it (0,3,0 vs 0,2,0), so pressing still inverts.
    expect(flat(toggleCss)).toContain('.ui-toggle[data-state="on"] .ui-toggle-count {');
  });

  it("declares all five knobs as role-mirror knobs (`initial` at :root)", () => {
    for (const knob of [
      "--toggle-soft-background",
      "--toggle-soft-color",
      "--toggle-soft-hover-background",
      "--toggle-soft-count-background",
      "--toggle-soft-count-color",
    ]) {
      expect(toggleTokens).toContain(`${knob}: initial;`);
    }
  });
});

describe("Toggle soft (gh#734) — the rendered chip", () => {
  it("wears the soft class instead of the transparent default one", () => {
    render(<Toggle variant="soft">設計</Toggle>);
    const chip = screen.getByRole("button", { name: "設計" });
    expect(chip).toHaveClass("ui-toggle-soft");
    expect(chip).not.toHaveClass("ui-toggle-default");
    // A standalone Toggle deliberately emits NO `data-variant`/`data-shape`: its DOM is held to
    // Radix's by src/components/ui/__tests__/toggle-rac.test.tsx, and the class already says
    // everything an attribute would. Inside a group the attributes DO exist, because there the
    // class alone cannot say whether the value came from the item or from the row's context.
    expect(chip).not.toHaveAttribute("data-variant");
  });

  it("carries the pressed state in ARIA and in data-state, not in colour alone", async () => {
    const user = userEvent.setup();
    render(
      <Toggle variant="soft" shape="pill">
        設計
      </Toggle>,
    );
    const chip = screen.getByRole("button", { name: "設計" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveAttribute("data-state", "off");

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveAttribute("data-state", "on");

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveAttribute("data-state", "off");
  });

  it("folds the count into the accessible name via countLabel", () => {
    render(
      <Toggle variant="soft" shape="pill" count={12} countLabel="ページ">
        設計
      </Toggle>,
    );
    // The name is "設計, 12 ページ" — NOT the "設計12" the digits would glue on by themselves.
    // (Chromium's accessibility tree joins the two chunks with a space: "設計 , 12 ページ";
    // dom-accessibility-api concatenates them. Both exclude the aria-hidden pill, which is the
    // property under test, so the assertion is anchored on the parts, not on the joiner.)
    const chip = screen.getByRole("button", { name: /^設計\s*, 12 ページ$/ });
    expect(chip.querySelector('[data-slot="toggle-count"]')).toHaveAttribute("aria-hidden", "true");
    expect(chip.querySelector(".sr-only")).toHaveTextContent(", 12 ページ");
  });

  it("folds it into aria-label instead when the chip's content is an icon", () => {
    render(
      <Toggle variant="soft" shape="pill" aria-label="設計" count={12} countLabel="ページ">
        <svg aria-hidden="true" />
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "設計, 12 ページ" })).toBeInTheDocument();
  });
});

describe("Toggle shape (gh#734) — parity with Button and Badge", () => {
  it("maps the same three values to the same two radius tokens", () => {
    const { container } = render(
      <>
        <Toggle shape="default">a</Toggle>
        <Toggle shape="pill">b</Toggle>
        <Toggle shape="sharp">c</Toggle>
      </>,
    );
    const [a, b, c] = [...container.querySelectorAll('[data-slot="toggle"]')];
    // `default` adds nothing: `.ui-toggle`'s own --radius-md stands, exactly as on Badge.
    expect(a.className).not.toMatch(/rounded-/);
    expect(b).toHaveClass("rounded-[var(--radius-pill)]");
    expect(c).toHaveClass("rounded-[var(--radius-sharp)]");
  });

  it("reaches every item of a group through context, like variant and size", () => {
    const { container } = render(
      <ToggleGroup
        type="multiple"
        variant="soft"
        shape="pill"
        size="xs"
        defaultValue={["design"]}
        aria-label="タグで絞り込み"
      >
        <ToggleGroupItem value="design" count={12} countLabel="ページ">
          設計
        </ToggleGroupItem>
        <ToggleGroupItem value="runbook" count={148} countLabel="ページ">
          運用手順
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const items = [...container.querySelectorAll('[data-slot="toggle-group-item"]')];
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item).toHaveClass("ui-toggle-soft", "ui-toggle-xs", "rounded-[var(--radius-pill)]");
      expect(item).toHaveAttribute("data-shape", "pill");
      expect(item).toHaveAttribute("data-variant", "soft");
    }
    expect(items[0]).toHaveAttribute("aria-pressed", "true");
    expect(items[1]).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /^運用手順\s*, 99\+ ページ$/ })).toBeInTheDocument();
  });

  it("lets one item opt out of the row's shape", () => {
    const { container } = render(
      <ToggleGroup type="single" shape="pill" defaultValue="a" aria-label="形">
        <ToggleGroupItem value="a">a</ToggleGroupItem>
        <ToggleGroupItem value="b" shape="sharp">
          b
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const items = [...container.querySelectorAll('[data-slot="toggle-group-item"]')];
    expect(items[0]).toHaveClass("rounded-[var(--radius-pill)]");
    expect(items[1]).toHaveClass("rounded-[var(--radius-sharp)]");
  });
});
