import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const shellTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const layoutStyles = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
const appShell = readFileSync(
  resolve(process.cwd(), "src/components/layout/app-shell.tsx"),
  "utf8",
);

/**
 * Collect the declarations of every rule whose selector LIST contains `selector` exactly — so a
 * grouped rule (`.ui-topbar-start, .ui-topbar-center, .ui-topbar-end { … }`) is matched for each
 * of its selectors, which a flat `.selector\s*\{` regex silently misses.
 */
function declarationsFor(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(stripped)) !== null) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

/**
 * Every `@media` block whose body mentions `needle`, returned as `{ condition, body }`. Brace-
 * matched (not regex-sliced) so a nested rule inside the block can't truncate it.
 */
function mediaBlocksMentioning(css: string, needle: string) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: { condition: string; body: string }[] = [];
  const open = /@media([^{]*)\{/g;
  let match: RegExpExecArray | null;
  while ((match = open.exec(stripped)) !== null) {
    let depth = 1;
    let index = open.lastIndex;
    while (index < stripped.length && depth > 0) {
      if (stripped[index] === "{") depth += 1;
      else if (stripped[index] === "}") depth -= 1;
      index += 1;
    }
    const body = stripped.slice(open.lastIndex, index - 1);
    if (body.includes(needle)) blocks.push({ condition: match[1].trim(), body });
  }
  return blocks;
}

describe("responsive shell geometry", () => {
  it("keeps the app grid and sidebar scroll regions inside the viewport", () => {
    expect(shellStyles).toMatch(
      /\.app-root\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100vw;[^}]*min-width:\s*0;/s,
    );
    expect(shellStyles).toMatch(
      /\.app-sidebar\s*\{[^}]*height:\s*100%;[^}]*min-width:\s*0;[^}]*min-height:\s*0;/s,
    );
    expect(shellStyles).toMatch(
      /\.sb-nav-scroll\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0;[^}]*overflow-y:\s*auto;/s,
    );
  });

  it("keeps every sidebar row and icon on one tokenized flex line", () => {
    for (const token of [
      "--sidebar-nav-icon-size",
      "--sidebar-nav-item-gap",
      "--sidebar-nav-item-padding-x",
      "--sidebar-nav-gap",
      "--sidebar-nav-scroll-padding",
      "--sidebar-section-gap",
      "--sidebar-section-label-padding-x",
      "--sidebar-section-label-padding-bottom",
    ]) {
      expect(shellTokens).toContain(`${token}:`);
    }

    expect(shellStyles).toMatch(
      /\.sb-nav-item\s*\{[^}]*display:\s*flex;[^}]*height:\s*var\(--sidebar-nav-item-height\);[^}]*flex:\s*0 0 auto;[^}]*align-items:\s*center;/s,
    );
    expect(shellStyles).toMatch(
      /\.sb-icon\s*\{[^}]*width:\s*var\(--sidebar-nav-icon-size\);[^}]*height:\s*var\(--sidebar-nav-icon-size\);[^}]*line-height:\s*0;/s,
    );
  });

  it("allows Topbar and its center slot to shrink without document overflow", () => {
    expect(shellStyles).toMatch(
      /\.ui-topbar\s*\{[^}]*width:\s*auto;[^}]*max-width:\s*100%;[^}]*min-width:\s*0;[^}]*flex:\s*1 1 0%;[^}]*overflow:\s*clip;/s,
    );
    expect(shellStyles).toMatch(/\.ui-topbar-center\s*\{[^}]*flex:\s*1 1 0%;/s);
  });

  it("clips intrinsic-width Topbar slot content inside its own slot (gh#226)", () => {
    // A hosted console packs an intrinsically wide brand/tenant string into `start` and a
    // fixed-width search trigger into `center`. Verified in a headless browser at 390 / 1024 /
    // 1440 (document scrollWidth === clientWidth at all three, `end` never leaves the bar);
    // jsdom does no layout, so the contract is pinned here declaration-by-declaration.
    const slots = declarationsFor(shellStyles, ".ui-topbar-start");

    // Every slot clips its OWN overflow, so a long string can never spill over a sibling cluster
    // or leak a document scroll. `clip` on BOTH axes (not `hidden`, not single-axis): a hidden box
    // is still a scroll container, and Chromium honours overflow-clip-margin ONLY when both axes
    // are `clip` — a single-axis clip silently drops the margin and a flush-edge control's ring
    // vanishes on the clipped axis (gh#291, measured). The 8px margin carries the 3px ring on
    // every side; Safari (no clip-margin) falls back to `visible` via @supports.
    expect(slots).toMatch(/overflow:\s*clip;/);
    expect(slots).not.toMatch(/overflow:\s*hidden;/);
    expect(shellStyles).toMatch(/@supports not \(overflow-clip-margin: 1px\)/);
    // …and the clip margin keeps an edge control's focus ring paintable (WCAG 2.4.11 / 2.4.13).
    // The dedicated 4px headroom token, consumed as a BARE var(): rings paint up to 3px while
    // --focus-ring-width is 2px, and Chromium rejects any calc() inside overflow-clip-margin at
    // parse time — a calc() here silently degrades the margin to 0 (gh#291 follow-up).
    expect(slots).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
    expect(slots).not.toMatch(/overflow-clip-margin:\s*calc\(/);
    expect(slots).toMatch(/min-width:\s*0;/);
    // The grouped rule covers all three clusters.
    for (const selector of [".ui-topbar-center", ".ui-topbar-end"]) {
      expect(declarationsFor(shellStyles, selector)).toContain("overflow: clip;");
    }

    // start absorbs the overflow; center yields its whole box first (flex-basis 0)…
    expect(declarationsFor(shellStyles, ".ui-topbar-start")).toMatch(/flex:\s*0 1 auto;/);
    expect(declarationsFor(shellStyles, ".ui-topbar-center")).toMatch(/flex:\s*1 1 0%;/);
    // …and `end` NEVER shrinks, so the user menu / settings stay visible, anchored inline-end.
    const end = declarationsFor(shellStyles, ".ui-topbar-end");
    expect(end).toMatch(/flex:\s*0 0 auto;/);
    expect(end).toMatch(/max-width:\s*100%;/);
    expect(end).toMatch(/margin-inline-start:\s*auto;/);
  });

  it("removes the optional Topbar center before it collides with long start/end content (gh#244)", () => {
    expect(shellTokens).toContain("--topbar-center-compact-display: none;");

    const collisionBlocks = mediaBlocksMentioning(shellStyles, ".ui-topbar-center").filter(
      ({ condition }) => condition.includes("width <= 68.75rem"),
    );
    expect(collisionBlocks).toHaveLength(1);
    expect(collisionBlocks[0].body).toMatch(
      /\.ui-topbar-center\s*\{[^}]*display:\s*var\(--topbar-center-compact-display\);/s,
    );

    const startTitle = declarationsFor(shellStyles, ".ui-topbar-start > :last-child");
    expect(startTitle).toMatch(/min-width:\s*0;/);
    expect(startTitle).toMatch(/flex:\s*0 1 auto;/);
    expect(startTitle).toMatch(/overflow:\s*hidden;/);
    expect(startTitle).toMatch(/text-overflow:\s*ellipsis;/);
    expect(startTitle).toMatch(/white-space:\s*nowrap;/);
  });

  it("owns canonical mobile drawer width, backdrop, safe areas and reduced motion", () => {
    expect(shellTokens).toContain("--app-shell-mobile-nav-width: 22.5rem;");
    // The scrim knob is `initial` at :root with the shared --overlay-background default resolved at
    // the CALL SITE, so a scoped [data-tenant]/.dark override reaches the portaled drawer
    // (docs/TOKENS.md · "Role-mirror knobs MUST be `initial`"). gh#215.
    expect(shellTokens).toContain("--app-shell-mobile-nav-background: initial;");
    expect(shellTokens).toContain("--app-shell-mobile-nav-alpha: 40%;");
    expect(shellStyles).toMatch(
      /\.app-mobile-nav-overlay\s*\{[^}]*background-color:\s*var\(\s*--app-shell-mobile-nav-background,\s*color-mix\(in srgb, var\(--overlay-background\) var\(--app-shell-mobile-nav-alpha\), transparent\)\s*\);/s,
    );
    expect(shellStyles).toMatch(
      /\.app-mobile-nav-drawer\s*\{[^}]*safe-area-inset-top[^}]*safe-area-inset-bottom[^}]*safe-area-inset-left[^}]*safe-area-inset-right[^}]*overscroll-behavior:\s*contain;/s,
    );
    expect(shellStyles).toMatch(
      /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.app-mobile-nav-overlay,[^}]*\.app-mobile-nav-drawer\s*\{[^}]*animation:\s*none;[^}]*transition:\s*none;/s,
    );
  });

  it("keeps the mobile drawer nav body edge-to-edge so the Sidebar owns its inset (gh#211)", () => {
    // The inset is a documented knob (rule #45), NOT a hard-coded value, and its default is the
    // quiet one: the nav inside the drawer (a <Sidebar> by default) already insets its rows with
    // --sidebar-nav-scroll-padding, so the generic 24px sheet chrome inset must not stack on top.
    expect(shellTokens).toContain("--app-shell-mobile-nav-inset: var(--space-1);");
    expect(shellTokens).toContain("--sidebar-nav-scroll-padding: var(--space-3) var(--space-2);");
    // AppShell applies the knob as a utility on the drawer body; a `padding-inline` rule here would
    // be dead code (this file is `@layer components`, where Tailwind utilities win).
    expect(appShell).toContain("px-[var(--app-shell-mobile-nav-inset)]");
    expect(shellStyles).not.toMatch(/\.app-mobile-nav-body\s*\{[^}]*padding-inline:/s);
  });

  it('topbarSpan="full" spans the bar across both tracks without touching their sizes', () => {
    expect(declarationsFor(shellStyles, '.app-root[data-topbar-span="full"]')).toMatch(
      /grid-template-areas:\s*"topbar topbar"\s*"sidebar main"\s*"sidebar footer";/,
    );
    // Row assignment only. Restating grid-template-columns here would fork the rail width away
    // from --app-shell-sidebar-width and silently break the collapsed rail (rule #45, gh#213).
    expect(declarationsFor(shellStyles, '.app-root[data-topbar-span="full"]')).not.toMatch(
      /grid-template-columns:/,
    );
  });

  it('keeps topbarSpan="full" spanning when docked mode rebuilds the narrow grid', () => {
    // Below the breakpoint the default grid collapses to one column, which already IS the full
    // arrangement — but docked mode explicitly restores the two-track grid, which would undo the
    // span exactly where the bar's space-level controls matter most.
    expect(
      declarationsFor(
        shellStyles,
        '.app-root[data-responsive-navigation="docked"][data-topbar-span="full"]',
      ),
    ).toMatch(/grid-template-areas:\s*"topbar topbar"\s*"sidebar main"\s*"sidebar footer";/);
  });

  it("makes the nav row's corner radius a knob so a full-bleed rail can square it", () => {
    // Every other geometry property of a nav row was already a knob; the radius was pinned to the
    // global rail radius. That is the right default for an inset pill, but a rail that zeroes
    // --sidebar-nav-scroll-padding and --sidebar-nav-gap has full-bleed rows flush with both
    // edges, and rounding a band leaves notched corners against the rail. Without the knob the
    // only fix is a consumer selector against `.sb-nav-item` — the coupling rule #45 forbids.
    expect(shellTokens).toContain("--sidebar-nav-item-radius: calc(var(--radius) - 1px);");
    expect(declarationsFor(shellStyles, ".sb-nav-item")).toMatch(
      /border-radius:\s*var\(--sidebar-nav-item-radius\);/,
    );
    // The literal it replaced must not survive on the row — that is what pinned it before.
    expect(declarationsFor(shellStyles, ".sb-nav-item")).not.toMatch(
      /border-radius:\s*calc\(var\(--radius\)/,
    );
  });

  it("sizes both docked rail widths from tokens, never literals (gh#213)", () => {
    // The single most-retuned shell constant: a service on a 255px grid sets the token once instead
    // of forking `.app-root`. Defaults are unchanged (16rem expanded / 4rem collapsed).
    expect(shellTokens).toContain("--app-shell-sidebar-width: 16rem;");
    expect(shellTokens).toContain("--app-shell-rail-width: 4rem;");
    expect(declarationsFor(shellStyles, ".app-root")).toMatch(
      /grid-template-columns:\s*var\(--app-shell-sidebar-width\) minmax\(0, 1fr\);/,
    );
    expect(declarationsFor(shellStyles, '.app-root[data-collapsed="true"]')).toMatch(
      /grid-template-columns:\s*var\(--app-shell-rail-width\) minmax\(0, 1fr\);/,
    );
    // No literal rail track may survive anywhere in the shell sheet.
    expect(shellStyles).not.toMatch(/grid-template-columns:\s*(?:16rem|4rem) minmax/);
  });

  it("restructures the shell at exactly ONE breakpoint and never deletes the footer (gh#213)", () => {
    // There used to be a second `@media (max-width: 768px)` block that ALSO restructured `.app-root`
    // — it dropped the "footer" grid area, hid `.app-footer`, and hard-coded `grid-template-rows:
    // 3rem`, defeating --app-shell-bar-height below 768px only. Between 768 and 900 the two rules
    // disagreed. One breakpoint now, and the footer/bar-height contract holds at every width.
    const restructuring = mediaBlocksMentioning(shellStyles, ".app-root");
    expect(restructuring).toHaveLength(1);
    expect(restructuring[0].condition).toBe("(width <= 56.25rem)");
    expect(restructuring[0].body).toContain('"footer"');
    // The bar height stays the token at every width…
    expect(restructuring[0].body).not.toMatch(/grid-template-rows:/);
    expect(shellStyles).not.toMatch(/grid-template-rows:\s*3rem/);
    // …and nothing anywhere hides the footer landmark.
    expect(declarationsFor(shellStyles, ".app-footer")).not.toMatch(/display:\s*none/);
    // The compact bar inset is a knob, not a raw space token.
    expect(shellTokens).toContain("--app-shell-bar-gap: var(--space-3);");
    // The bar's inset is NOT the shell restructure's business any more (gh#330) — see the
    // horizontal-page-inset-axis test below. Nothing in this block may touch it.
    expect(restructuring[0].body).not.toMatch(/padding-inline:/);
    // The TSX hamburger variant must state the SAME number as the CSS breakpoint.
    expect(appShell).toContain("max-[900px]:inline-flex");
  });

  it("gives the horizontal page-inset axis ONE owner, stepping on ONE breakpoint (gh#330)", () => {
    // Two independent inset tokens used to own one horizontal row: --app-shell-bar-inset
    // (--space-4) for the bar and --space-page-x (--space-6) for the page directly under it.
    // Measured in Chromium on /isolate/layout-app-shell BEFORE the fix, the topbar's content
    // started at x=80 and the page header's at x=88, and because the two sides stepped at
    // DIFFERENT breakpoints (shell 900px, page 720px) the error was not even constant: 8px at
    // 1512, 12px between 720 and 900, 4px below 720. The page gutter owns the axis; the bar reads
    // it. AFTER: 88/88, 24/24, 16/16, 16/16 at 1512 / 880 / 700 / 390.
    expect(shellTokens).toContain("--app-shell-bar-inset: var(--space-page-x);");
    expect(shellTokens).toContain("--app-shell-bar-inset-compact: var(--space-page-compact-x);");
    // The names survive as knobs — a theme that already overrides them keeps working.
    expect(declarationsFor(shellStyles, ".app-topbar")).toMatch(
      /padding-inline:\s*var\(--app-shell-bar-inset\);/,
    );
    // The compact step lives at the PAGE's breakpoint, stated identically on both sides so the two
    // can never drift apart again.
    const pageStep = "@media (max-width: 720px)";
    expect(shellStyles).toContain(pageStep);
    expect(layoutStyles).toContain(pageStep);
    const compact = mediaBlocksMentioning(shellStyles, ".app-topbar").filter((block) =>
      /--app-shell-bar-inset-compact/.test(block.body),
    );
    expect(compact).toHaveLength(1);
    expect(compact[0].condition).toBe("(max-width: 720px)");
    // The shell's 900px restructure no longer says anything about the inset, in either direction:
    // the docked-mode "undo" that used to cancel the old 900px step is gone with it.
    expect(shellStyles).not.toMatch(
      /data-responsive-navigation="docked"\]\s*>\s*\.app-topbar\s*\{[^}]*padding-inline/s,
    );
  });

  it("puts CenteredShell on that same axis — the shell gh#330 missed", () => {
    // gh#330 gave AppShell's horizontal row one owner and left CenteredShell hard-coding
    // --space-4 (16px) for the bar while its own main and footer used --space-6 (24px). Measured
    // in Chromium on /isolate/layout-centered-shell BEFORE: the bar's content sat at x=16 and the
    // column at x=24 — a constant 8px error at every width from 784px (the md tier, 46rem, plus
    // the two 24px gutters — below which the column stops being centred and pins to the gutter)
    // down to 320px. AFTER: 24/24 at 784 · 760 · 721, and 16/16 at 720 · 700 · 390 · 320.
    expect(shellTokens).toContain("--centered-shell-bar-padding-x: var(--space-page-x);");
    expect(shellTokens).toContain(
      "--centered-shell-bar-padding-x-compact: var(--space-page-compact-x);",
    );

    // All THREE sides step, and on the page's line — two of them stepping is what re-opens the
    // gap, since the bar is only ever aligned relative to the column beneath it.
    const compact = mediaBlocksMentioning(shellStyles, ".ui-centered-shell-bar").filter((block) =>
      /--centered-shell-bar-padding-x-compact/.test(block.body),
    );
    expect(compact).toHaveLength(1);
    expect(compact[0].condition).toBe("(max-width: 720px)");
    expect(compact[0].body).toMatch(
      /\.ui-centered-shell-main\s*\{[^}]*--centered-shell-main-padding-inline-compact/s,
    );
    expect(compact[0].body).toMatch(
      /\.ui-centered-shell-footer\s*\{[^}]*--centered-shell-footer-padding-inline-compact/s,
    );

    // Only the inline axis steps: the block shorthands stay whole, so a service that already sets
    // --centered-shell-main-padding keeps controlling all four sides above the step.
    expect(compact[0].body).not.toMatch(/padding:\s*var\(--centered-shell-main-padding\)/);
    expect(declarationsFor(shellStyles, ".ui-centered-shell-main")).toMatch(
      /padding:\s*var\(--centered-shell-main-padding\);/,
    );
  });

  it("offers an opt-in docked narrow contract without consumer media queries (gh#242)", () => {
    const restructuring = mediaBlocksMentioning(
      shellStyles,
      '.app-root[data-responsive-navigation="docked"]',
    );
    expect(restructuring).toHaveLength(1);
    expect(restructuring[0].condition).toBe("(width <= 56.25rem)");
    expect(restructuring[0].body).toContain('"sidebar topbar"');
    expect(restructuring[0].body).toContain('"sidebar main"');
    expect(restructuring[0].body).toContain('"sidebar footer"');
    expect(restructuring[0].body).toMatch(
      /grid-template-columns:\s*var\(--app-shell-sidebar-width\) minmax\(0, 1fr\);/,
    );
    expect(restructuring[0].body).toMatch(
      /data-responsive-navigation="docked"[^}]*> \.app-sidebar\s*\{[^}]*display:\s*flex;/s,
    );
    expect(restructuring[0].body).toMatch(
      /data-responsive-navigation="docked"[^}]*\.app-mobile-nav-trigger\s*\{[^}]*display:\s*none;/s,
    );
    expect(appShell).toContain('responsiveNavigation = "drawer"');
    expect(appShell).toContain("data-responsive-navigation={responsiveNavigation}");
  });

  it("exposes Topbar height / inset / gap as quiet-default knobs (gh#213)", () => {
    // Defaults are byte-identical to the pre-knob behaviour: `auto` height and no inline inset (the
    // AppShell `.app-topbar` grid row owns those), and the previous 8px cluster gap.
    expect(shellTokens).toContain("--topbar-height: auto;");
    expect(shellTokens).toContain("--topbar-inset: 0px;");
    expect(shellTokens).toContain("--topbar-gap: var(--space-2);");

    const root = declarationsFor(shellStyles, ".ui-topbar");
    expect(root).toMatch(/height:\s*var\(--topbar-height\);/);
    expect(root).toMatch(/padding-inline:\s*var\(--topbar-inset\);/);
    expect(root).toMatch(/gap:\s*var\(--topbar-gap\);/);
    // One knob re-rhythms the whole bar: the between-cluster gap and the in-cluster gap agree.
    for (const selector of [".ui-topbar-start", ".ui-topbar-center", ".ui-topbar-end"]) {
      expect(declarationsFor(shellStyles, selector)).toMatch(/gap:\s*var\(--topbar-gap\);/);
    }
    // …and the gh#226 shrink contract is untouched by the knobs (both-axes clip + clip-margin
    // since gh#291 — the margin, honoured only for two-axis clip, carries the focus ring).
    expect(root).toMatch(/flex:\s*1 1 0%;/);
    expect(root).toMatch(/overflow:\s*clip;/);
    expect(root).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
  });
});
