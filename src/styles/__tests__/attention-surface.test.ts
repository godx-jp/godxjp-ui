import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The two attention surfaces the canonical redesign needed and could not reach (gh#12).
 *
 * 1. A FULL-PERIMETER attention border in a semantic tone. `Card`'s `accent` was a leading-edge
 *    stripe by definition, and the only perimeter in the system — `variant="featured"` — hard-coded
 *    `--primary`. A consumer wanting "action required" around the whole card had exactly one route
 *    left: page CSS.
 * 2. The CAPABILITY MEDALLION. It is a composition (`Avatar` + a Lucide glyph, per
 *    docs/COMPOSITION-VS-COMPONENT.md) — but its tint had no token, so consumers were re-deriving
 *    `hsl(var(--primary) / 0.1)` themselves or rendering a bare glyph.
 *
 * jsdom resolves no `var()`, so these assert the shipped CASCADE CONTRACT out of the stylesheets:
 * which declaration exists, in which order, and that every colour still comes from a role.
 */
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const cardTokens = read("src/tokens/components/card.css");
const foundationTokens = read("src/tokens/foundation.css");
const cardStyles = read("src/styles/card-layout.css");
const displayTokens = read("src/tokens/components/data-display.css");
const displayStyles = read("src/styles/data-display-layout.css");

const rule = (css: string, selector: string) =>
  css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{[^}]*\\}`))?.[0] ??
  "";

describe("Card accentPlacement=perimeter — the semantic attention border (gh#12)", () => {
  it("resolves ONE accent colour per tone, shared by both placements", () => {
    // Six tones x two placements would be twelve rules; the resolved custom property keeps it at
    // six, and guarantees the perimeter can never drift from the rail it replaces.
    for (const tone of ["primary", "success", "warning", "info", "attention", "destructive"]) {
      expect(rule(cardStyles, `[data-slot="card"][data-accent="${tone}"]`)).toMatch(
        new RegExp(`--card-accent-color:\\s*hsl\\(var\\(--${tone}\\)\\)`),
      );
    }
    expect(rule(cardStyles, '[data-slot="card"][data-accent]')).toMatch(
      /border-inline-start-color:\s*var\(--card-accent-color\)/,
    );
  });

  it("paints the whole edge in the accent tone, at token-owned weights", () => {
    const perimeter = rule(
      cardStyles,
      '[data-slot="card"][data-accent][data-accent-placement="perimeter"]',
    );
    expect(perimeter).toMatch(/border-width:\s*var\(--card-accent-perimeter-width\)/);
    expect(perimeter).toMatch(/border-color:\s*var\(--card-accent-color\)/);
    expect(perimeter).toMatch(
      /box-shadow:\s*0 0 0 var\(--card-accent-perimeter-ring-width\) var\(--card-accent-color\)/,
    );
    // The card's own elevation and opt-in glow survive the ring — a perimeter card must not lose
    // the surface treatment every other card on the page has.
    expect(perimeter).toMatch(/var\(--card-shadow\)/);
    expect(perimeter).toMatch(/var\(--card-glow\)/);
    // The two weights read the hairline step since gh#324 (`--stroke-hairline` IS 1px), so assert
    // the step rather than a literal the file no longer carries.
    expect(cardTokens).toContain("--card-accent-perimeter-width: var(--stroke-hairline);");
    expect(cardTokens).toContain("--card-accent-perimeter-ring-width: var(--stroke-hairline);");
    expect(foundationTokens).toContain("--stroke-hairline: 1px;");
  });

  it("undoes the rail's slot-padding compensation so the body text never shifts", () => {
    // The rail steals 6px from the inline-start inset and gives it back as slot padding. With no
    // rail there is nothing to give back — leaving that rule on would inset the text by 6px.
    const compensation = cardStyles.indexOf(
      '[data-slot="card"][data-accent] > [data-slot="card-header"]',
    );
    const reset = cardStyles.indexOf(
      '[data-slot="card"][data-accent][data-accent-placement="perimeter"] > [data-slot="card-header"]',
    );
    expect(compensation).toBeGreaterThan(-1);
    // Higher specificity AND later in source — either alone would be fragile.
    expect(reset).toBeGreaterThan(compensation);
    expect(cardStyles.slice(reset)).toMatch(/padding-inline-start:\s*var\(--card-space-inset\)/);
  });

  it("stops variant=featured hard-coding --primary", () => {
    // Same perimeter geometry, brand tone — but now retintable, and role-mirrored so a scoped
    // [data-tenant]/.dark override of --primary still reaches it.
    const featured = rule(cardStyles, '[data-slot="card"][data-variant="featured"]');
    expect(featured).toMatch(
      /border-color:\s*var\(--card-featured-border-color,\s*hsl\(var\(--primary\)\)\)/,
    );
    expect(featured).not.toMatch(/border-color:\s*hsl\(var\(--primary\)\);/);
    expect(cardTokens).toMatch(/--card-featured-border-color:\s*initial;/);
  });
});

describe("Avatar appearance=tinted — the capability medallion (gh#12)", () => {
  it("washes the role instead of filling it, and tints the glyph to match", () => {
    const tinted = rule(displayStyles, '.ui-avatar[data-appearance="tinted"]');
    expect(tinted).toMatch(
      /--avatar-background:\s*var\(--avatar-tinted-background,\s*hsl\(var\(--primary\) \/ 0\.1\)\)/,
    );
    expect(tinted).toMatch(/color:\s*var\(--avatar-tinted-foreground,\s*hsl\(var\(--primary\)\)\)/);
    // Role-mirror: `initial` at :root so both defaults resolve at the call site above.
    expect(displayTokens).toMatch(/--avatar-tinted-background:\s*initial;/);
    expect(displayTokens).toMatch(/--avatar-tinted-foreground:\s*initial;/);
  });

  it("is declared after the square mark so it retints either shape", () => {
    // Equal specificity (0,2,0) — source order is the whole mechanism that makes
    // `shape="square" appearance="tinted"` the canonical rounded-square medallion.
    const square = displayStyles.indexOf('.ui-avatar[data-shape="square"]');
    const tinted = displayStyles.indexOf('.ui-avatar[data-appearance="tinted"]');
    expect(square).toBeGreaterThan(-1);
    expect(tinted).toBeGreaterThan(square);
  });

  it("sizes its own glyph, scoped to the medallion only", () => {
    // The component sizes its icons (docs/DEVELOPMENT.md §3) — but a global `.ui-avatar svg` rule
    // would outrank the per-call-site icon classes existing avatars already carry
    // (e.g. `.ui-auth-account-fallback-icon`), so the rule is scoped to the new appearance.
    expect(displayStyles).toMatch(
      /\.ui-avatar\[data-appearance="tinted"\] svg\s*\{[^}]*inline-size:\s*var\(--avatar-tinted-glyph-size\)/,
    );
    expect(displayStyles).not.toMatch(/^\s*\.ui-avatar svg\s*\{/m);
    expect(displayTokens).toContain("--avatar-tinted-glyph-size: var(--control-icon-size);");
  });
});
