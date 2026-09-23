import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#884 — the two hard-coded INKS no token could reach.
 *
 * A design system may hold a literal where the value is structural (a hairline width, a transition
 * opacity). A colour that CARRIES TEXT is never structural, and both of these failed WCAG 2.2 AA at
 * seeds a real brand would pick. Measured on the theme lab (gh#882) across 3 themes x 5 seeds:
 *
 *   .sb-logo-mark   `color: white`               3.38:1 in 15/15 cells
 *   .ui-button--link `color: hsl(var(--primary))` 5.60 violet · 5.08 azure · 3.64 coral ·
 *                                                 1.41 #FFD400 · 15.96 navy (base theme), and
 *                                                 1.10-3.33 in ALL FIVE glass cells — 9/15 under 4.5
 *
 * Each becomes a knob declared `initial` in its component tier and resolved AT THE CALL SITE, so a
 * scoped `[data-tenant]` override reaches it (docs/TOKENS.md, the freeze rule) and the default is
 * byte-identical. jsdom resolves no `var()`, so this asserts the shipped cascade contract: which
 * declaration exists, with which fallback, and that the literal is gone from the call site.
 */
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const shellStyles = read("src/styles/shell-layout.css");
const shellTokens = read("src/tokens/components/shell.css");
const controlStyles = read("src/styles/control.css");
const controlTokens = read("src/tokens/components/control.css");

const rule = (css: string, selector: string) =>
  css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{[^}]*\\}`))?.[0] ??
  "";

describe("gh#884 · .sb-logo-mark — the brand mark's initial", () => {
  const mark = rule(shellStyles, ".sb-logo-mark");

  it("reads --sidebar-logo-mark-color with `white` as the call-site fallback", () => {
    expect(mark).toMatch(/color:\s*var\(\s*--sidebar-logo-mark-color,\s*white\s*\)/);
  });

  it("no longer paints the bare literal", () => {
    // The whole point: a `color: white` a theme cannot reach. The fallback above keeps the DEFAULT
    // identical — what changes is that it is now overridable.
    expect(mark).not.toMatch(/color:\s*white\s*;/);
  });

  it("declares the knob `initial` in the component tier, never bound at :root", () => {
    // A `:root` binding would freeze on the root value and a scoped [data-tenant] override would
    // never reach the mark — the freeze rule this repo states in docs/TOKENS.md.
    expect(shellTokens).toMatch(/--sidebar-logo-mark-color:\s*initial;/);
  });

  it("records WHY no token can derive this ink — the fill is the caller's", () => {
    // `product.color` comes from the consumer, so the library never sees the background the glyph
    // sits on and cannot compute a legible ink for it. That reasoning has to survive in the file,
    // or the next reader "fixes" it by deriving from a role that is not the mark's background.
    expect(mark).toMatch(/caller/i);
  });
});

describe("gh#884 · .ui-button--link — brand colour used as INK, not as a FILL", () => {
  const link = rule(controlStyles, ".ui-button--link");

  it("reads --button-link-foreground with hsl(var(--primary)) as the call-site fallback", () => {
    expect(link).toMatch(
      /color:\s*var\(\s*--button-link-foreground,\s*hsl\(\s*var\(\s*--primary\)\s*\)\s*\)/,
    );
  });

  it("no longer paints --primary unconditionally", () => {
    expect(link).not.toMatch(/color:\s*hsl\(\s*var\(\s*--primary\)\s*\);/);
  });

  it("declares the knob `initial` in the component tier", () => {
    expect(controlTokens).toMatch(/--button-link-foreground:\s*initial;/);
  });

  it("carries no `text-primary` UTILITY, which is what made the knob unreachable", () => {
    // The issue named `control.css:268` as the defect, and a knob there alone would have changed
    // NOTHING: the `link` variant also carried `text-primary`, and Tailwind v4 layers utilities
    // AFTER components, so the utility out-ranked `.ui-button--link`'s own `color` and no token
    // could reach this ink. Measured: with the knob added and the utility still present, setting
    // `--button-link-foreground` moved the computed colour not at all. Same shape as the Sheet's
    // `bg-background` (gh#880) and the Checkbox's `data-[state=checked]:bg-primary`.
    const button = readFileSync(resolve(process.cwd(), "src/components/general/button.tsx"), "utf8");
    const linkVariant = button.match(/^\s*link:\s*"([^"]*)"/m)?.[1] ?? "";
    expect(linkVariant).toContain("ui-button--link");
    expect(linkVariant.split(/\s+/)).not.toContain("text-primary");
  });

  it("states the verdict at the declaration: --primary is NOT a safe ink default", () => {
    // The knob alone does not close gh#884. `tenantTheme()` guarantees --primary against
    // --primary-foreground and nothing else, so a consumer who never sets this token still gets an
    // illegible link at a light seed. A knob nobody knows to set is not a fix, and the measurement
    // has to sit next to the token or the next reader will assume the default is sound.
    const decl = controlTokens.match(/[^]{0,700}--button-link-foreground:\s*initial;/)?.[0] ?? "";
    expect(decl).toMatch(/--primary-foreground/);
    expect(decl).toMatch(/1\.43:1|1\.10:1/);
  });
});
