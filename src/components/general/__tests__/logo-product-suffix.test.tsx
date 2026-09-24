import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "../logo";

/**
 * "GoDX | ID" — the brand lockup plus ONE product name (gh#649).
 *
 * The defect this replaces: a consumer either typeset the suffix beside the artwork (no divider,
 * spacing that is not the lockup's token) or inlined the kit's flattened "GoDX | ID" file — a
 * SECOND master in its own coordinate system (`0 0 1234 242` against the package's
 * `30 30 871.29 182`), carrying `id="title"`/`id="desc"` that collide across instances, a
 * hardcoded `#0B0F3B` ink with no working dark variant, and a hardcoded `#C5C8D6` rule.
 *
 * So every assertion below is about the suffix living in the SAME master and the SAME token
 * system as the "GoDX" half: one artwork, one id-namespacing mechanism, one light/dark pair, one
 * size scale, and a rule whose colour is a token.
 */
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

describe("Logo productSuffix", () => {
  it("turns the lockup on by itself — no wordmark required", () => {
    const { container } = render(<Logo mark="godx-lockup" productSuffix="ID" />);
    const lockup = container.querySelector('[data-slot="logo-lockup"]')!;
    expect(lockup).toHaveClass("ui-logo-lockup");
    expect(lockup).toHaveAttribute("data-mark", "godx-lockup");
    expect(lockup.querySelector('[data-slot="logo-product-suffix"]')).toHaveTextContent("ID");
    // No wordmark was passed, so no typeset wordmark element is emitted at all.
    expect(lockup.querySelector('[data-slot="logo-wordmark"]')).toBeNull();
  });

  it("renders ONE master — the same godx-lockup artwork, both variants, no second file", () => {
    const { container } = render(<Logo mark="godx-lockup" productSuffix="ID" />);
    const artworks = [...container.querySelectorAll('[data-slot="logo-artwork"]')];
    // Exactly the light/dark pair the bare lockup already renders — the suffix adds no artwork.
    expect(artworks.map((a) => a.getAttribute("data-scheme"))).toEqual(["light", "dark"]);
    for (const artwork of artworks) {
      expect(artwork).toHaveAttribute("data-artwork", "godx-lockup");
      // The kit's suffix master is `0 0 1234 242`; the package's construction is untouched.
      expect(artwork.getAttribute("viewBox")).toBe("30 30 871.285714 182.000000");
    }
  });

  it("keeps the id namespacing — two suffixed lockups on one page collide on nothing", () => {
    const { container } = render(
      <>
        <Logo mark="godx-lockup" productSuffix="ID" />
        <Logo mark="godx-lockup" productSuffix="Console" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((n) => n.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    // The kit file's global `id="title"` / `id="desc"` are the exact pair that collided.
    expect(ids).not.toContain("title");
    expect(ids).not.toContain("desc");
  });

  /*
   * THE NAME. The master DRAWS "GoDX" as paths, so without help the only readable text in the
   * lockup is "ID" and the brand is announced as a two-letter product. The package restores the
   * drawn word as visually-hidden TEXT rather than `role="img"` + `aria-label`, because a role on
   * a borrowed `<a>` replaces the link role.
   *
   * Asserted THROUGH `asChild` + `<a>` — a lockup in a topbar is a link, and a link has a role, so
   * `getByRole(…, { name })` runs the platform's own accessible-name computation over it. A bare
   * `<span>` lockup has no role, so a test could only re-implement that algorithm; the markup
   * case below covers what the span emits.
   */
  it('announces "GoDX ID", not "ID" — and stays a LINK while doing it', () => {
    render(
      <Logo asChild mark="godx-lockup" productSuffix="ID">
        <a href="/" />
      </Logo>,
    );
    // Two regressions in one query: a name of "ID" (the drawn word never reaching AT), and
    // `role="img"` on the borrowed <a> deleting the link role to get the name right.
    const link = screen.getByRole("link", { name: "GoDX ID" });
    expect(link).toHaveAttribute("data-slot", "logo-lockup");
    expect(link).not.toHaveAttribute("role");
    expect(link).not.toHaveAttribute("aria-label");
  });

  it("puts the drawn word in the DOM as hidden text, not as a label", () => {
    const { container } = render(<Logo mark="godx-lockup" productSuffix="ID" />);
    const lockup = container.querySelector('[data-slot="logo-lockup"]')!;
    expect(lockup).not.toHaveAttribute("role");
    expect(lockup).not.toHaveAttribute("aria-label");
    // The mark itself stays decorative; the hidden node carries the brand half AND the word break.
    // `display: block` is that break: the name algorithm separates children only where one is not
    // inline, so a trailing space in the text is flattened away and names the lockup "GoDXID".
    expect(lockup.querySelector('[data-slot="logo"]')).toHaveAttribute("aria-hidden", "true");
    const hidden = lockup.querySelector(".sr-only") as HTMLElement;
    expect(hidden.textContent).toBe("GoDX");
    expect(hidden.style.display).toBe("block");
  });

  it("lets `label` override the composed name", () => {
    render(<Logo mark="godx-lockup" productSuffix="ID" label="GoDX ID ホーム" />);
    expect(screen.getByRole("img", { name: "GoDX ID ホーム" })).toBeInTheDocument();
  });

  it("does not invent a brand word when the logotype is NOT drawn", () => {
    // A typeset wordmark is already readable, so the hidden node carries only the word break.
    // Hardcoding "GoDX" here would have named a CoreBooks lockup after GoDX.
    render(
      <Logo asChild glyph="c" wordmark="CoreBooks" productSuffix="Admin">
        <a href="/" />
      </Logo>,
    );
    const link = screen.getByRole("link", { name: "CoreBooks Admin" });
    // The node is still there — it is the word break — but it contributes no brand word.
    expect(link.querySelector(".sr-only")?.textContent).toBe("");
  });

  it("accepts a node suffix and still names the lockup", () => {
    render(
      <Logo asChild mark="godx-lockup" productSuffix={<span data-testid="suffix-node">ID</span>}>
        <a href="/" />
      </Logo>,
    );
    // Hidden text joins the name computation whatever the suffix node is — an `aria-label` built
    // by string-sniffing the prop could only ever have handled the string case.
    const link = screen.getByRole("link", { name: "GoDX ID" });
    expect(link.querySelector('[data-slot="logo-product-suffix"] span')).toHaveAttribute(
      "data-testid",
      "suffix-node",
    );
  });

  it("is inert when absent — the existing lockup and bare-mark markup do not move", () => {
    const { container } = render(
      <>
        <Logo mark="godx-lockup" />
        <Logo mark="godx" wordmark="GoDX" />
      </>,
    );
    expect(container.querySelector('[data-slot="logo-product-suffix"]')).toBeNull();
    expect(container.querySelector(".sr-only")).toBeNull();
    // A bare `mark` with no wordmark and no suffix is still the decorative single-element form.
    expect(container.querySelectorAll('[data-slot="logo-lockup"]')).toHaveLength(1);
  });

  it("carries the size tier onto the lockup so the suffix scales with the master", () => {
    for (const size of ["xs", "sm", "md", "lg"] as const) {
      const { container, unmount } = render(
        <Logo mark="godx-lockup" productSuffix="ID" size={size} />,
      );
      expect(container.querySelector('[data-slot="logo-lockup"]')).toHaveAttribute(
        "data-size",
        size,
      );
      unmount();
    }
  });
});

/**
 * TOKEN CONTRACT. jsdom resolves no cascade, so — like the sibling `Logo brand tokens` suite —
 * the contract is pinned on the stylesheet source: every knob the handoff hardcoded must exist
 * as a `--logo-*` token, and the call site must read it.
 */
describe("Logo productSuffix tokens", () => {
  const layout = read("src/styles/logo-layout.css");
  const tokens = read("src/tokens/components/logo.css");

  it("declares every knob the kit's file hardcoded (rule #45)", () => {
    for (const [knob, value] of [
      ["--logo-divider-width", "initial"],
      // 1em of the SUFFIX's own type: the rule is as tall as the word it separates at every tier,
      // with no per-tier ramp to keep in step (12.5 / 14 / 14 / 17.6px).
      ["--logo-divider-height", "1em"],
      ["--logo-divider-alpha", "0.25"],
      ["--logo-product-suffix-gap", "var(--space-2)"],
      ["--logo-product-suffix-font-weight", "500"],
    ] as const) {
      expect(tokens).toContain(`${knob}: ${value};`);
    }
  });

  it("declares the two colour knobs `initial` (role default at the call site)", () => {
    for (const knob of ["--logo-divider-color", "--logo-product-suffix-color"]) {
      expect(tokens).toContain(`${knob}: initial;`);
    }
  });

  it("paints the rule from the LOGOTYPE ink, so it flips with the theme", () => {
    /*
     * The kit hardcodes `#C5C8D6`, which has no dark counterpart — the third defect gh#649 names.
     * --logo-godx-ink-color already flips (#0B0F3B light / #F7FAF8 dark), so at 0.25 alpha the
     * rule lands on the kit's own grey in light (#c1c2cb, 1.74:1 against #c5c8d6's 1.64:1) and
     * gets a real dark value for free (#515150, 2.30:1). ALPHA rather than a mix with
     * --background, so the rule is still right on a coloured topbar.
     */
    expect(layout).toContain(
      "var(--logo-divider-color, var(--logo-godx-ink-color)) / var(--logo-divider-alpha)",
    );
    expect(layout).not.toMatch(/#[cC]5[cC]8[dD]6/);
    // --border is the table-grid hairline (1.15:1 on the page, by its own note in foundation.css)
    // and disappears at 1px × 1em between two words.
    expect(layout).not.toMatch(/product-suffix[^}]*var\(\s*--border\)/);
  });

  it("gives the rule no DOM node — it is decoration, not content", () => {
    expect(layout).toContain(".ui-logo-product-suffix::before");
    expect(read("src/components/general/logo.tsx")).not.toContain('data-slot="logo-divider"');
  });

  it("sets the suffix in the wordmark's ramp at every tier, in UI ink at its own weight", () => {
    // Whitespace-collapsed: the tier rule and its first declaration are one FACT, and where
    // Prettier put the line break between them is not part of it (gh#769).
    const flat = layout.replace(/\s+/g, " ");
    for (const tier of ["xs", "sm", "lg"]) {
      expect(flat).toContain(
        `.ui-logo-lockup[data-size="${tier}"] .ui-logo-product-suffix { font-size: var(--logo-wordmark-font-size-${tier});`,
      );
    }
    expect(layout).toContain("font-size: var(--logo-wordmark-font-size-md);");
    expect(layout).toContain("font-weight: var(--logo-product-suffix-font-weight);");
    expect(layout).toContain("color: hsl(var(--logo-product-suffix-color, var(--foreground)));");
  });

  it("uses LOGICAL box properties, so an RTL lockup flips", () => {
    const rule = /\.ui-logo-lockup \.ui-logo-product-suffix::before \{[^}]*\}/.exec(layout)?.[0];
    expect(rule).toBeTruthy();
    expect(rule).toContain("inline-size:");
    expect(rule).toContain("block-size:");
    expect(rule).not.toMatch(/(^|[^-])(width|height|left|right|margin-left|margin-right):/);
  });
});
