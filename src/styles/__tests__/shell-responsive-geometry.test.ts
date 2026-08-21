import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const shellStyles = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const shellTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
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
      /\.ui-topbar\s*\{[^}]*width:\s*auto;[^}]*max-width:\s*100%;[^}]*min-width:\s*0;[^}]*flex:\s*1 1 0%;[^}]*overflow-x:\s*clip;/s,
    );
    expect(shellStyles).toMatch(/\.ui-topbar-center\s*\{[^}]*flex:\s*1 1 0%;/s);
  });

  it("clips intrinsic-width Topbar slot content inside its own slot (gh#226)", () => {
    // A hosted console packs an intrinsically wide brand/tenant string into `start` and a
    // fixed-width search trigger into `center`. Verified in a headless browser at 390 / 1024 /
    // 1440 (document scrollWidth === clientWidth at all three, `end` never leaves the bar);
    // jsdom does no layout, so the contract is pinned here declaration-by-declaration.
    const slots = declarationsFor(shellStyles, ".ui-topbar-start");

    // Every slot clips its OWN horizontal overflow, so a long string can never spill over a
    // sibling cluster or leak a document scroll. `clip` (not `hidden`): a hidden box is still a
    // scroll container, so focusing a clipped control would scroll the slot and shove its leading
    // content away. The vertical axis stays `visible` (gh#291): the slot box hugs
    // --control-height, so any vertical clip cuts an edge control's focus ring flat — the
    // clip-margin alone cannot save it (2px margin vs a 3px toggle ring, and Safari does not
    // implement overflow-clip-margin).
    expect(slots).toMatch(/overflow-x:\s*clip;/);
    expect(slots).toMatch(/overflow-y:\s*visible;/);
    expect(slots).not.toMatch(/overflow:\s*hidden;/);
    // …and the clip margin keeps an edge control's focus ring paintable (WCAG 2.4.11 / 2.4.13).
    // The dedicated 4px headroom token, consumed as a BARE var(): rings paint up to 3px while
    // --focus-ring-width is 2px, and Chromium rejects any calc() inside overflow-clip-margin at
    // parse time — a calc() here silently degrades the margin to 0 (gh#291 follow-up).
    expect(slots).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
    expect(slots).not.toMatch(/overflow-clip-margin:\s*calc\(/);
    expect(slots).toMatch(/min-width:\s*0;/);
    // The grouped rule covers all three clusters.
    for (const selector of [".ui-topbar-center", ".ui-topbar-end"]) {
      expect(declarationsFor(shellStyles, selector)).toContain("overflow-x: clip;");
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
    expect(shellTokens).toContain("--app-shell-bar-inset: var(--space-4);");
    expect(shellTokens).toContain("--app-shell-bar-inset-compact: var(--space-3);");
    expect(shellTokens).toContain("--app-shell-bar-gap: var(--space-3);");
    expect(restructuring[0].body).toMatch(
      /\.app-topbar\s*\{[^}]*padding-inline:\s*var\(--app-shell-bar-inset-compact\);/s,
    );
    // The TSX hamburger variant must state the SAME number as the CSS breakpoint.
    expect(appShell).toContain("max-[900px]:inline-flex");
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
    // …and the gh#226 shrink contract is untouched by the knobs (horizontal-only clip since
    // gh#291 — the vertical axis stays visible so slot controls' focus rings paint).
    expect(root).toMatch(/flex:\s*1 1 0%;/);
    expect(root).toMatch(/overflow-x:\s*clip;/);
    expect(root).toMatch(/overflow-y:\s*visible;/);
  });
});
