import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * gh#249 — `<Avatar shape="square">` is the entity-header organization/service mark: a compact
 * ROUNDED square on the brand surface, as opposed to the round person avatar. Browser evidence
 * (Chromium, /frame/data-display-avatar at 1440/1024/390): square → border-radius 6px
 * (`--radius-lg`), 32×32 box (`--control-height`), background rgb(0,119,199) (`--primary`),
 * colour rgb(253,253,252) (`--primary-foreground`) — contrast 4.65:1, WCAG AA. Circle avatars on
 * the same page stayed 9999px / rgb(244,243,240) / rgb(112,110,102): the default is inert.
 */
const dataDisplayCss = readFileSync(
  resolve(process.cwd(), "src/styles/data-display-layout.css"),
  "utf8",
)
  .replace(/\s+/g, " ")
  .trim();
const dataDisplayTokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/data-display.css"),
  "utf8",
);

/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "size-12";

describe("Avatar shape (gh#249)", () => {
  it("is inert by default — no shape attribute, byte-identical to the pre-#249 avatar", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).not.toHaveAttribute("data-shape");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it('shape="circle" is the explicit spelling of the same inert default', () => {
    const { container } = render(
      <Avatar shape="circle">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).not.toHaveAttribute("data-shape");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it('shape="square" opts into the entity mark and never leaks the prop to the DOM', () => {
    const { container } = render(
      <Avatar shape="square">
        <AvatarFallback>山</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(root).toHaveAttribute("data-shape", "square");
    expect(root).not.toHaveAttribute("shape");
    // The square appearance is CSS/token-owned — no extra class, so `className` stays the
    // consumer's own escape hatch rather than something the shape has to fight.
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it("still forwards ref, className and arbitrary props on a square avatar", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = render(
      <Avatar ref={ref} shape="square" className={CONSUMER_CLASS} data-testid="entity">
        <AvatarImage src="/org.png" alt="組織ロゴ" />
        <AvatarFallback>山</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass(CONSUMER_CLASS);
    expect(root).toHaveAttribute("data-testid", "entity");
    expect(root).toHaveAttribute("data-shape", "square");
  });

  it("has no axe violations as an entity header mark", async () => {
    await expectNoA11yViolations(
      <Avatar shape="square">
        <AvatarFallback>山</AvatarFallback>
      </Avatar>,
    );
  });
});

describe("Avatar square appearance — token-owned (gh#249)", () => {
  it("declares every knob, with the brand colours as role-mirror `initial`", () => {
    expect(dataDisplayTokens).toMatch(/--avatar-square-radius:\s*var\(--radius-lg\);/);
    expect(dataDisplayTokens).toMatch(/--avatar-square-size:\s*var\(--control-height\);/);
    // `initial` (NOT `var(--primary)`) so a scoped [data-tenant]/.dark override of the role
    // still reaches the mark — a :root binding to a role var freezes at the :root value.
    expect(dataDisplayTokens).toMatch(/--avatar-square-background:\s*initial;/);
    expect(dataDisplayTokens).toMatch(/--avatar-square-foreground:\s*initial;/);
  });

  it("reads the tokens with the role defaults at the CALL SITE", () => {
    expect(dataDisplayCss).toContain(
      '.ui-avatar[data-shape="square"] { inline-size: var(--avatar-square-size); ' +
        "block-size: var(--avatar-square-size); border-radius: var(--avatar-square-radius); " +
        "--avatar-background: var(--avatar-square-background, hsl(var(--primary))); " +
        "color: var(--avatar-square-foreground, hsl(var(--primary-foreground))); }",
    );
  });

  it("leaves the circle avatar rule untouched (--radius-pill, muted surface)", () => {
    expect(dataDisplayCss).toContain("border-radius: var(--radius-pill);");
    expect(dataDisplayCss).toContain("var(--avatar-background, hsl(var(--muted)))");
  });
});
