import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Avatar, AvatarFallback } from "../avatar";

/**
 * `<Avatar size>` — the mark on the shared control ladder (gh#716).
 *
 * WHAT WAS MEASURED, AND WHY THIS FILE EXISTS. `.ui-avatar` was welded to `--control-height`, so a
 * person's mark could not enter a row whose height was already decided. Chromium, dev preview at
 * 1440 and 1024, before the change:
 *
 *   · `<Button size="icon-sm">` = 28.00×28.00, the `<Avatar>` inside it = 32.00×32.00 →
 *     4.00px of the mark hung OUTSIDE the trigger on each axis (overflow measured on the bounding
 *     rects, identical at both widths).
 *   · There was no `size` prop at all: `size="sm"` rendered a 32px mark, so the only legal move a
 *     consumer had was to raise the whole row to 32px.
 *
 * After, at 1440 AND 1024 (bounding rects, `getBoundingClientRect()`):
 *
 *   step   avatar box     Button of the same step   initials font-size
 *   xs     24.00×24.00    24.00 (size="xs")         11.10px
 *   sm     28.00×28.00    28.00 (size="sm")         12.47px
 *   md     32.00×32.00    32.00 (default)           14.00px
 *   lg     36.00×36.00    36.00 (size="lg")         17.65px
 *
 *   · `<Avatar size="sm">` inside `<Button size="icon-sm">`: 28.00 inside 28.00 → overflow 0.00.
 *   · `shape="square"` measured the same four boxes (the entity mark never drifts from the person
 *     mark), and the tinted medallion's glyph stepped 12 / 14 / 16 / 20px with it.
 *   · Initials contrast, `--muted-foreground` on `--muted`: 4.87:1 at every step (WCAG 2.2 AA),
 *     centred to within 0.5px of the box centre on both axes at every step.
 *   · Defaults unchanged: an `<Avatar>` with no `size` measured 32.00×32.00 / 14.00px, and a
 *     `className="size-12"` avatar still measured 48.00×48.00 — the utility still wins.
 *
 * jsdom applies no author cascade and does no layout, so the numbers above cannot be re-measured
 * here. What IS asserted here is the two things that produce them: the attribute contract on the
 * DOM, and the token graph in the stylesheet that the browser resolved.
 */
const dataDisplayCss = readFileSync(
  resolve(process.cwd(), "src/styles/data-display-layout.css"),
  "utf8",
)
  .replace(/\s+/g, " ")
  .trim();
/* Read with prettier's wrapping normalised away: a declaration long enough to wrap is written
 * `var(\n  --token,\n  calc(…)\n)`, and these assertions compare the TEXT. The wiring is the same
 * either way — letting the line width decide whether a test passes is how gh#834's call-site
 * fallbacks broke three unrelated suites in one commit. */
const dataDisplayTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/data-display.css"),
  "utf8",
)
  .replace(/\s+/g, " ")
  .replace(/\(\s+/g, "(")
  .replace(/\s+\)/g, ")");

/** A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE. */
const CONSUMER_CLASS = "size-12";

/** step → the `--control-height` tier it must read. The ladder, written once. */
const LADDER = [
  ["xs", "--control-height-xs"],
  ["sm", "--control-height-sm"],
  ["lg", "--control-height-lg"],
] as const;

describe("Avatar size (gh#716) — the DOM contract", () => {
  it("is inert by default: no size attribute, and the class is still bare `ui-avatar`", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).not.toHaveAttribute("data-size");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it('size="md" is the explicit spelling of the same inert default', () => {
    const { container } = render(
      <Avatar size="md">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).not.toHaveAttribute("data-size");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it.each(LADDER.map(([step]) => step))("size=%s opts into that step and nothing else", (step) => {
    const { container } = render(
      <Avatar size={step}>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveAttribute("data-size", step);
    // `size` is a styling decision, not a DOM attribute of <span> — it must not leak as one.
    expect(root).not.toHaveAttribute("size");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it("is orthogonal to shape, appearance and presence", () => {
    const { container } = render(
      <Avatar size="sm" shape="square" appearance="tinted" presence="online">
        <AvatarFallback>山</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveAttribute("data-size", "sm");
    expect(root).toHaveAttribute("data-shape", "square");
    expect(root).toHaveAttribute("data-appearance", "tinted");
    expect(root).toHaveAttribute("data-presence", "online");
  });

  it("still forwards className — a size OFF the ladder stays the consumer's to set", () => {
    const { container } = render(
      <Avatar size="sm" className={CONSUMER_CLASS}>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveClass("ui-avatar");
    expect(root).toHaveClass(CONSUMER_CLASS);
  });
});

describe("Avatar size (gh#716) — the token graph behind the measurements", () => {
  it("the default box and type read the avatar knobs, not a baked value", () => {
    expect(dataDisplayCss).toMatch(
      /\.ui-avatar \{[^}]*width: var\(\s*--avatar-size\); height: var\(\s*--avatar-size\);/,
    );
    expect(dataDisplayCss).toMatch(/\.ui-avatar \{[^}]*font-size: var\(\s*--avatar-font-size\);/);
  });

  it.each(LADDER)("--avatar-size-%s IS the %s tier — never a px, never an offset", (step, tier) => {
    expect(dataDisplayTokens).toContain(`--avatar-size-${step}: var(${tier});`);
  });

  it("the md default is byte-identical to the pre-#716 box", () => {
    expect(dataDisplayTokens).toContain("--avatar-size: var(--control-height);");
    expect(dataDisplayTokens).toContain("--avatar-font-size: var(--font-size-base);");
  });

  it.each(LADDER.map(([step]) => step))(
    "the %s rule moves the person box, the square box, the type step and the glyph together",
    (step) => {
      const rule = dataDisplayCss.match(
        new RegExp(`\\.ui-avatar\\[data-size="${step}"\\] \\{([^}]*)\\}`),
      )?.[1];
      expect(rule, `no rule for size="${step}"`).toBeDefined();
      expect(rule).toContain(`--avatar-size: var(--avatar-size-${step});`);
      // The square mark is re-declared ON THE ELEMENT, not at :root: a var() over a custom
      // property is substituted where it is DECLARED, so a :root alias would freeze at :root.
      expect(rule).toContain(`--avatar-square-size: var(--avatar-size-${step});`);
      expect(rule).toContain(`--avatar-font-size: var(--avatar-font-size-${step});`);
      expect(rule).toContain(`--avatar-glyph-size: var(--avatar-glyph-size-${step});`);
      expect(rule).toContain(`--avatar-tinted-glyph-size: var(--avatar-glyph-size-${step});`);
    },
  );

  it("the type step is one step of the type scale per step of the box", () => {
    expect(dataDisplayTokens).toContain(
      "--avatar-font-size-xs: var(--font-size-2xs, calc(var(--font-size-base) / var(--font-size-ratio) / var(--font-size-ratio)));",
    );
    expect(dataDisplayTokens).toContain(
      "--avatar-font-size-sm: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)));",
    );
    expect(dataDisplayTokens).toContain(
      "--avatar-font-size-lg: var(--font-size-lg, calc(var(--font-size-base) * var(--font-size-ratio) * var(--font-size-ratio)));",
    );
  });

  it("the glyph step rides the --icon-size-* scale and tracks density, like every control glyph", () => {
    expect(dataDisplayTokens).toContain(
      "--avatar-glyph-size-xs: calc(var(--icon-size-xs) * var(--scaling));",
    );
    expect(dataDisplayTokens).toContain(
      "--avatar-glyph-size-sm: calc(var(--icon-size-sm) * var(--scaling));",
    );
    expect(dataDisplayTokens).toContain(
      "--avatar-glyph-size-lg: calc(var(--icon-size-lg) * var(--scaling));",
    );
  });

  it("sizes the glyph ONLY on a sized avatar — a bare `.ui-avatar svg` would outrank call sites", () => {
    expect(dataDisplayCss).toMatch(
      /\.ui-avatar\[data-size\] svg \{[^}]*inline-size: var\(\s*--avatar-glyph-size\)/,
    );
    expect(dataDisplayCss).not.toMatch(/\.ui-avatar svg \{/);
  });
});
