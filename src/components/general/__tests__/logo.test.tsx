import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";

import { Logo } from "../logo";

describe("Logo", () => {
  it("renders the default glyph at md size, decorative by default", () => {
    const { container } = render(<Logo />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(mark).toHaveTextContent("g");
    expect(mark).toHaveAttribute("data-size", "md");
    // No label → decorative: aria-hidden, no img role, no accessible name.
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).not.toHaveAttribute("role");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("accepts a custom glyph and size tier", () => {
    const { container } = render(<Logo glyph="MF" size="lg" />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(mark).toHaveTextContent("MF");
    expect(mark).toHaveAttribute("data-size", "lg");
  });

  it("supports a semantic success mark without changing the primary role", () => {
    const { container } = render(<Logo tone="success" />);
    expect(container.querySelector('[data-slot="logo"]')).toHaveAttribute("data-tone", "success");
  });

  it("renders the canonical GoDX vector mark without a boxed glyph", () => {
    const { container } = render(<Logo mark="godx" tone="success" />);
    const mark = container.querySelector('[data-slot="logo"]');
    expect(mark).toHaveAttribute("data-mark", "godx");
    expect(mark).not.toHaveTextContent("g");
    expect(mark?.querySelector('[data-slot="logo-artwork"]')).toBeInTheDocument();
  });

  // When the mark stands alone (no wordmark beside it) a label makes it a named image for AT.
  it("exposes an accessible image when label is provided", () => {
    render(<Logo label="CoreBooks" />);
    const img = screen.getByRole("img", { name: "CoreBooks" });
    expect(img).toBeInTheDocument();
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("forwards ref and merges className onto the mark", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Logo ref={ref} className="shadow-sm" />);
    const mark = container.querySelector('[data-slot="logo"]')!;
    expect(ref.current).toBe(mark);
    expect(mark).toHaveClass("ui-logo", "shadow-sm");
  });
});

/**
 * WORDMARK / LOCKUP (gh#214). The issue asks for a semantic brand-green GoDX mark AND wordmark
 * variant independent of `--primary`. `wordmark` turns Logo into the full lockup so a shell header
 * or auth brand bar never hand-rolls `inline-flex items-center gap-2` around a Logo + Text.
 */
describe("Logo wordmark lockup", () => {
  it("renders mark + readable wordmark as one lockup", () => {
    const { container } = render(<Logo mark="godx" tone="success" wordmark="GoDX" />);
    const lockup = container.querySelector('[data-slot="logo-lockup"]')!;
    expect(lockup).toHaveClass("ui-logo-lockup");
    expect(lockup).toHaveAttribute("data-mark", "godx");
    expect(lockup).toHaveAttribute("data-tone", "success");
    // The mark is INSIDE the lockup and the wordmark text is real, readable content.
    expect(lockup.querySelector('[data-slot="logo"]')).toBeInTheDocument();
    expect(lockup.querySelector('[data-slot="logo-wordmark"]')).toHaveTextContent("GoDX");
  });

  it("announces the lockup once — mark decorative, wordmark carries the name", () => {
    const { container } = render(<Logo mark="godx" wordmark="GoDX" />);
    // No role="img" without a label: the wordmark IS the accessible text.
    expect(container.querySelector('[data-slot="logo-lockup"]')).not.toHaveAttribute("role");
    expect(container.querySelector('[data-slot="logo"]')).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("GoDX")).toBeInTheDocument();
  });

  it("lets label override the lockup's accessible name", () => {
    render(<Logo mark="godx" wordmark="GoDX" label="GoDX ID" />);
    expect(screen.getByRole("img", { name: "GoDX ID" })).toBeInTheDocument();
  });

  it("accepts real logotype artwork as the wordmark node", () => {
    const { container } = render(
      <Logo mark="godx" wordmark={<svg data-testid="logotype" viewBox="0 0 64 16" />} />,
    );
    expect(container.querySelector('[data-slot="logo-wordmark"] svg')).toBeInTheDocument();
  });

  it("forwards ref and className to the lockup root (the element a consumer positions)", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Logo ref={ref} wordmark="GoDX" className="shadow-sm" />);
    const lockup = container.querySelector('[data-slot="logo-lockup"]')!;
    expect(ref.current).toBe(lockup);
    expect(lockup).toHaveClass("ui-logo-lockup", "shadow-sm");
    // …and the inner mark keeps its own class untouched.
    expect(container.querySelector('[data-slot="logo"]')).toHaveClass("ui-logo");
  });

  it("is fully backward compatible — no wordmark keeps the bare mark markup", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('[data-slot="logo-lockup"]')).toBeNull();
    expect(container.querySelector('[data-slot="logo"]')).toHaveClass("ui-logo");
  });
});

/**
 * Token contract — the canonical brand colour must survive a `--primary` re-theme with ZERO
 * consumer page CSS (gh#214 acceptance). jsdom does no cascade, so the contract is pinned on the
 * stylesheet source: no logo rule may reference `--primary` for the identity mark/wordmark, and
 * every role default lives at the CALL SITE (docs/TOKENS.md · role-mirror knobs).
 *
 * gh#250 corrected WHICH role: the identity now reads `--brand` (canonical GoDX emerald #009766),
 * not `--success` (若竹 status green). `src/tokens/__tests__/brand-identity-role.test.ts` owns the
 * full role-split contract.
 */
describe("Logo brand tokens", () => {
  const layout = readFileSync(resolve(process.cwd(), "src/styles/logo-layout.css"), "utf8");
  const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/logo.css"), "utf8");

  it("colours the identity mark and wordmark from --brand, never --primary or --success", () => {
    expect(layout).toContain("color: hsl(var(--logo-godx-color, var(--brand)))");
    expect(layout).toContain(
      "color: hsl(var(--logo-wordmark-color, var(--logo-godx-color, var(--brand))))",
    );
    // gh#250 — the mark must not borrow the 若竹 STATUS green again.
    expect(layout).not.toMatch(/var\(--success\b/);
    const identityRules = layout.match(/\[data-mark="godx"\][\s\S]*?\}/g) ?? [];
    expect(identityRules.length).toBeGreaterThan(0);
    for (const rule of identityRules) expect(rule).not.toContain("--primary");
  });

  it("declares every role-mirror knob `initial` (no :root freeze)", () => {
    for (const knob of [
      "--logo-success-background",
      "--logo-success-foreground",
      "--logo-godx-color",
      "--logo-wordmark-color",
      "--logo-wordmark-font-family",
    ]) {
      expect(tokens).toContain(`${knob}: initial;`);
    }
  });

  it("tokenizes every wordmark knob a service would retune (rule #45)", () => {
    for (const knob of [
      "--logo-wordmark-gap",
      "--logo-wordmark-font-size-xs",
      "--logo-wordmark-font-size-sm",
      "--logo-wordmark-font-size-md",
      "--logo-wordmark-font-size-lg",
      "--logo-wordmark-font-weight",
      "--logo-wordmark-letter-spacing",
    ]) {
      expect(tokens).toContain(knob);
    }
    // The wordmark is typeset in the design-system display face — no baked brand font.
    expect(layout).toContain(
      "font-family: var(--logo-wordmark-font-family, var(--font-family-display))",
    );
  });
});
