import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";

import { Heading, Link, Paragraph, Text } from "../typography";

/**
 * gh#826 — the display type ramp had four tokens and NO public API, so every marketing page wrote
 * its own `font-size` class instead (58 bespoke classes across two showcases).
 *
 * The first thing measured was whether this was the `Input size="xs"` shape from 28.6.0, where
 * `.ui-control[data-size="xs"]` had existed all along and only the TypeScript union was missing.
 * It was NOT: the `[data-slot="text"][data-size=…]` scan genuinely stopped at `2xl`. So the CSS
 * steps are new, and the first test below is the regression guard for exactly that — a widened
 * union with no selector behind it renders at the inherited size and looks like nothing happened.
 *
 * Assertions are on `data-*` attributes and on the stylesheet's own text, never on a Tailwind
 * class (`check:no-tailwind-class-assertions`).
 */
const TEXT_LAYOUT = readFileSync("src/styles/text-layout.css", "utf8");
const DISPLAY_STEPS = ["3xl", "4xl", "5xl"] as const;
const UI_STEPS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;

describe("Text — the display ramp is reachable (gh#826)", () => {
  it.each(DISPLAY_STEPS)("size=%s emits the step AND has a CSS rule behind it", (size) => {
    const { container } = render(<Text size={size}>見出し</Text>);
    expect(container.querySelector('[data-slot="text"]')).toHaveAttribute("data-size", size);
    // The half that was missing. jsdom does no cascade, so the rule is asserted in the source.
    expect(TEXT_LAYOUT).toMatch(
      new RegExp(
        `\\[data-slot="text"\\]\\[data-size="${size}"\\]\\s*\\{\\s*font-size:\\s*var\\(\\s*--font-size-${size}[,)]`,
      ),
    );
  });

  it("gives the display steps a tight leading, so a headline needs no bespoke class", () => {
    // Body copy sits on --line-height-body (1.7). At 54px that is a 92px gap inside ONE headline,
    // which is what would send a consumer straight back to the class this step exists to remove.
    const rule = TEXT_LAYOUT.match(
      /\[data-slot="text"\]\[data-size="3xl"\],\s*\[data-slot="text"\]\[data-size="4xl"\],\s*\[data-slot="text"\]\[data-size="5xl"\]\s*\{[^}]*\}/,
    )?.[0];
    expect(rule).toMatch(/line-height:\s*var\(--line-height-tight\)/);
  });

  it("keeps the UI ramp exactly as it was", () => {
    for (const size of UI_STEPS) {
      const { container } = render(<Text size={size}>本文</Text>);
      expect(container.querySelector('[data-slot="text"]')).toHaveAttribute("data-size", size);
    }
  });

  it("reaches --font-size-display through 5xl rather than a `display` step of its own", () => {
    // --font-size-display is the ramp's BASE KNOB, not a member of it: 5xl IS the display size and
    // 3xl/4xl divide it. A size="display" would therefore be a second name for 5xl.
    //
    // WHERE THAT BINDING LIVES CHANGED IN gh#834, and this issue's own showcase is why. Written
    // `--font-size-5xl: var(--font-size-display)` on `:root`, it substituted ONCE on <html>, so
    // `docs/showcase/futurelastic-web.tsx` — which scoped --font-size-display for an "80px hero
    // via text-5xl" — measured 54px. The step is an `initial` knob now and the binding is the
    // CALL-SITE fallback, which is what makes it follow a scope.
    const foundation = readFileSync("src/tokens/foundation.css", "utf8");
    expect(foundation).toMatch(/--font-size-5xl:\s*initial;/);
    expect(TEXT_LAYOUT).toMatch(
      /\[data-slot="text"\]\[data-size="5xl"\]\s*\{\s*font-size:\s*var\(\s*--font-size-5xl,\s*var\(--font-size-display\)\);/,
    );
    const { container } = render(<Text size="5xl">hero</Text>);
    expect(container.querySelector('[data-slot="text"]')).toHaveAttribute("data-size", "5xl");
  });
});

describe("Heading — `size` overrides the ramp, `level` keeps the outline (gh#826)", () => {
  it("renders a real <h1> at the display size", () => {
    const { container } = render(
      <Heading level={1} size="5xl">
        Ship it everywhere
      </Heading>,
    );
    const heading = container.querySelector('[data-slot="heading"]');
    // The whole point of the split: the document outline is untouched by the size decision.
    expect(heading?.tagName).toBe("H1");
    expect(heading).toHaveAttribute("data-level", "1");
    expect(heading).toHaveAttribute("data-size", "5xl");
  });

  it("emits NO data-size when none is asked for, so `level` still paints", () => {
    // `[data-level="2"]:not([data-size])` is the selector that hands the size back to `level`.
    // An always-emitted attribute would silently unstyle every existing Heading in the library.
    const { container } = render(<Heading level={2}>請求書一覧</Heading>);
    const heading = container.querySelector('[data-slot="heading"]');
    expect(heading).toHaveAttribute("data-level", "2");
    expect(heading).not.toHaveAttribute("data-size");
  });

  it("guards the override in the SELECTOR, not in source order", () => {
    // The antd-parity block re-opens `@layer components` further down this file, so a cascade
    // decided by block order would be decided by an edit in an unrelated section.
    for (const level of [1, 2, 3, 4]) {
      expect(TEXT_LAYOUT).toContain(
        `[data-slot="heading"][data-level="${level}"]:not([data-size])`,
      );
    }
    for (const size of DISPLAY_STEPS) {
      expect(TEXT_LAYOUT).toMatch(
        new RegExp(
          `\\[data-slot="heading"\\]\\[data-size="${size}"\\]\\s*\\{\\s*font-size:\\s*var\\(\\s*--font-size-${size}[,)]`,
        ),
      );
    }
  });

  it("reads the SAME ladder as Text, every step of it", () => {
    for (const size of [...UI_STEPS, ...DISPLAY_STEPS]) {
      const { container } = render(
        <Heading level={2} size={size}>
          節
        </Heading>,
      );
      expect(container.querySelector('[data-slot="heading"]')).toHaveAttribute("data-size", size);
    }
  });
});

describe("Paragraph / Link — the widened ladder reaches them too (gh#826)", () => {
  it.each(DISPLAY_STEPS)("Paragraph size=%s emits the step", (size) => {
    const { container } = render(<Paragraph size={size}>引用</Paragraph>);
    expect(container.querySelector('[data-slot="text"]')).toHaveAttribute("data-size", size);
  });

  it.each(DISPLAY_STEPS)("Link size=%s emits the step and stays a link", (size) => {
    const { container } = render(
      <Link href="#x" size={size}>
        詳しく
      </Link>,
    );
    const link = container.querySelector('[data-slot="text"]');
    expect(link).toHaveAttribute("data-size", size);
    expect(link).toHaveAttribute("data-link");
  });
});

describe(".ui-brand-glow is wired up, not shipped unreferenced (gh#826)", () => {
  it("is used by the showcases that used to hand-write a radial gradient", () => {
    // The defect this closes is a class that ships with a test, tokens and no call site while four
    // sections hand-wrote the gradient it paints. If the call sites go, so should the class.
    for (const file of ["docs/showcase/acme-website.tsx", "docs/showcase/futurelastic-web.tsx"]) {
      expect(readFileSync(file, "utf8")).toContain("ui-brand-glow");
    }
  });

  it("left no hand-written radial gradient behind in either showcase", () => {
    for (const file of ["docs/showcase/acme-website.tsx", "docs/showcase/futurelastic-web.tsx"]) {
      expect(readFileSync(file, "utf8")).not.toMatch(/background:\s*radial-gradient\(/);
    }
  });
});
