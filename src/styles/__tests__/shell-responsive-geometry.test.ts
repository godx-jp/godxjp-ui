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
    if (splitSelectorList(match[1]).includes(normalizeSelector(selector))) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

/**
 * Split a selector LIST on its top-level commas only. A plain `.split(",")` shreds any selector
 * carrying a functional pseudo-class or an attribute value that contains one — `:is(button, a,
 * [role="button"])` became four fragments, none of which matched, so the lookup returned "" and the
 * assertion that followed read as a missing DECLARATION rather than a missing RULE.
 */
function splitSelectorList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of list) {
    if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(normalizeSelector(current));
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(normalizeSelector(current));
  return parts.filter((part) => part.length > 0);
}

/**
 * One selector, one spelling. A multi-line selector carries newlines and indentation, so an exact
 * string match against a single-line needle silently returns "" — and the assertion that follows
 * then reads as a missing DECLARATION rather than a missing RULE.
 */
function normalizeSelector(selector: string): string {
  return selector.trim().replace(/\s+/g, " ");
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

/**
 * The shell's grid lives in TWO complementary blocks at one breakpoint: the wide-only templates
 * (`width > 56.25rem`) and the narrow reset (`width <= 56.25rem`). Selecting by CONDITION rather
 * than by index is what keeps these assertions honest — reading `[0]` silently started measuring
 * the wide block the moment a second one existed.
 */
function shellBlock(condition: string) {
  const blocks = mediaBlocksMentioning(shellStyles, ".app-root").filter(
    (block) => block.condition === condition,
  );
  expect(blocks.length, `no @media ${condition} block owns .app-root`).toBeGreaterThan(0);
  // The wide side is written in two places — the shell's own variants and the `sidebar="none"`
  // ones that sit beside their narrow neighbours — so same-condition blocks are read as one.
  return blocks.map((block) => block.body).join("\n");
}

/** Top-level track count of a `grid-template-columns` value — `var()` / `minmax()` count as one. */
function trackCount(value: string): number {
  let flat = value;
  while (/\([^()]*\)/.test(flat)) flat = flat.replace(/\([^()]*\)/g, "");
  return flat.trim().split(/\s+/).filter(Boolean).length;
}

/** Columns named by the FIRST row of a `grid-template-areas` value. */
function areaColumns(value: string): number {
  const firstRow = value.match(/"([^"]*)"/);
  return firstRow ? firstRow[1].trim().split(/\s+/).filter(Boolean).length : 0;
}

/**
 * Every `.app-root` rule that lives OUTSIDE the wide-only block, as `[selector, declarations]`.
 * The bare `.app-root` is excluded: it is the base rule the narrow reset is there to override,
 * and both are (0,1,0) with the reset later in the sheet.
 */
function qualifiedAppRootRulesOutsideWideBlock(): [string, string][] {
  const stripped = shellStyles.replace(/\/\*[\s\S]*?\*\//g, "");
  let outside = stripped;
  for (const block of mediaBlocksMentioning(shellStyles, ".app-root")) {
    if (block.condition === "(width > 56.25rem)") outside = outside.replace(block.body, "");
  }
  const rules: [string, string][] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(outside)) !== null) {
    for (const selector of splitSelectorList(match[1])) {
      if (selector.startsWith(".app-root") && selector !== ".app-root") {
        rules.push([selector, match[2]]);
      }
    }
  }
  return rules;
}

describe("the rail's top row follows topbarSpan", () => {
  // Only a COLUMN rail has a top row to align: on a block edge the rail is a strip and there is
  // no shell top row of its own to share a centre line with.
  const COLUMN_RAIL =
    '.app-root:not([data-topbar-span="full"]):is( [data-nav-rail-position="start"], [data-nav-rail-position="end"] )';
  const BAND_SELECTOR = `${COLUMN_RAIL} > .app-nav-rail > :first-child`;

  /**
   * Under `topbarSpan="content"` the bar starts BESIDE the navigation, so the rail runs to y=0 and
   * its first row is the shell's top row — the counterpart of `.sb-brand` and of the bar. All
   * three are then sized by ONE token. Left alone, the row was only as tall as whatever control
   * the consumer put in it: a 44px OrgSwitcher trigger centred its avatar at 22 against the logo's
   * and the bar's 24.
   */
  it('sizes all three top rows from --app-shell-bar-height under topbarSpan="content"', () => {
    expect(declarationsFor(shellStyles, ".sb-brand")).toMatch(
      /min-height:\s*var\(--app-shell-bar-height\);/,
    );
    // The bar has no height of its own — its grid ROW carries the token.
    expect(declarationsFor(shellStyles, ".app-root")).toMatch(
      /grid-template-rows:\s*var\(--app-shell-bar-height\)/,
    );
    expect(declarationsFor(shellStyles, BAND_SELECTOR)).toMatch(
      /min-block-size:\s*var\(--app-shell-bar-height\);/,
    );
  });

  it("leaves that row free to grow, so the band is a floor and not a fixed height", () => {
    const rule = declarationsFor(shellStyles, BAND_SELECTOR);
    expect(rule).not.toMatch(/(^|[^-])\bheight:/);
    expect(rule).not.toMatch(/max-block-size:/);
  });

  it("centres it in the band without coercing the consumer node's display", () => {
    // The band alone is not enough: the control kept sitting at the TOP of it (measured centre 22
    // against the logo's and the bar's 24). `align-items` centres a flex/grid row and is inert on
    // anything else — declaring `display: flex` here would silently relay a multi-child node.
    const rule = declarationsFor(shellStyles, BAND_SELECTOR);
    expect(rule).toMatch(/align-items:\s*center;/);
    expect(rule).not.toMatch(/display:/);
  });

  /**
   * Under `full` the bar owns the top row and all three columns start beneath it, so the band has
   * nothing left to align to — measured, it put the rail's first item 10px above the line the
   * sidebar's nav starts on. There the rail is an ordinary column with its own inset.
   */
  it('gives the rail its own inset, and drops the band, under topbarSpan="full"', () => {
    expect(shellTokens).toContain("--app-shell-nav-rail-inset: var(--space-3);");
    expect(declarationsFor(shellStyles, ".app-nav-rail")).toMatch(
      /padding-block:\s*var\(--app-shell-nav-rail-inset\);/,
    );
    // The band and the top inset are BOTH scoped away from `full` — an unscoped rule would apply
    // to every arrangement, which is the bug this pair replaced.
    expect(declarationsFor(shellStyles, ".app-nav-rail > :first-child")).toBe("");
    expect(declarationsFor(shellStyles, `${COLUMN_RAIL} > .app-nav-rail`)).toMatch(
      /padding-block-start:\s*0;/,
    );
  });
});

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
    // vanishes on the clipped axis (measured). The 8px margin carries the 3px ring on
    // every side; Safari (no clip-margin) falls back to `visible` via @supports.
    expect(slots).toMatch(/overflow:\s*clip;/);
    expect(slots).not.toMatch(/overflow:\s*hidden;/);
    expect(shellStyles).toMatch(/@supports not \(overflow-clip-margin: 1px\)/);
    // …and the clip margin keeps an edge control's focus ring paintable (WCAG 2.4.11 / 2.4.13).
    // The dedicated 4px headroom token, consumed as a BARE var(): rings paint up to 3px while
    // --focus-ring-width is 2px, and Chromium rejects any calc() inside overflow-clip-margin at
    // parse time — a calc() here silently degrades the margin to 0.
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

    // Truncation is a TEXT contract. The selector excludes interactive boxes: a control put last
    // (a search trigger, the GitHub placement) kept losing its own min-width to this rule, because
    // (0,1,1) here beats the control's own (0,1,0) — measured at 186px against a 16rem floor.
    const startTitleSelector =
      '.ui-topbar-start > :last-child:not(:is(button, a, [role="button"], .ui-button))';
    const startTitle = declarationsFor(shellStyles, startTitleSelector);
    expect(declarationsFor(shellStyles, ".ui-topbar-start > :last-child")).toBe("");
    expect(startTitle).toMatch(/min-width:\s*0;/);
    expect(startTitle).toMatch(/flex:\s*0 1 auto;/);
    // `clip` + the ring margin, never `hidden`: this selector hits whatever the slot's last child
    // is, and `hidden` shaves the focus ring off an interactive one (gh#376). `overflow-clip-margin`
    // is ignored on `hidden`, so the choice of keyword IS the fix.
    expect(startTitle).toMatch(/overflow:\s*clip;/);
    expect(startTitle).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
    expect(startTitle).toMatch(/text-overflow:\s*ellipsis;/);
    expect(startTitle).toMatch(/white-space:\s*nowrap;/);
  });

  it("owns canonical mobile drawer width, backdrop, safe areas and reduced motion", () => {
    expect(shellTokens).toContain("--app-shell-mobile-nav-width: 22.5rem;");
    // The scrim knob is `initial` at :root with the shared --overlay-background default resolved at
    // the CALL SITE, so a scoped [data-tenant]/.dark override reaches the portaled drawer
    // (docs/TOKENS.md · "Role-mirror knobs MUST be `initial`").
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
    // from --app-shell-sidebar-width and silently break the collapsed rail (rule #45).
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
    expect(shellTokens).toContain("--app-shell-sidebar-collapsed-width: 4rem;");
    expect(declarationsFor(shellStyles, ".app-root")).toMatch(
      /grid-template-columns:\s*var\(--app-shell-sidebar-width\) minmax\(0, 1fr\);/,
    );
    expect(declarationsFor(shellStyles, '.app-root[data-collapsed="true"]')).toMatch(
      /grid-template-columns:\s*var\(--app-shell-sidebar-collapsed-width\) minmax\(0, 1fr\);/,
    );
    // No literal rail track may survive anywhere in the shell sheet.
    expect(shellStyles).not.toMatch(/grid-template-columns:\s*(?:16rem|4rem) minmax/);
  });

  it("adds a THIRD navigation track when `navRail` is filled, from its own token", () => {
    /*
     * The rail is a separate track, not a re-use of the collapsed-sidebar width — a service that
     * retunes one must not silently move the other.
     *
     * So this asserts they are two DECLARATIONS WITH DIFFERENT VALUES, not one pinned number. The
     * earlier version pinned `4rem`, which was the collapsed sidebar's value too: it would have
     * stayed green through the exact regression it exists to catch (someone aliasing the rail to
     * the collapsed width), and instead went red the day the default legitimately moved to 3.5rem.
     * An assertion that survives the bug and fails on the fix is worse than none.
     */
    const railWidth = /--app-shell-nav-rail-width:\s*([^;]+);/.exec(shellTokens)?.[1]?.trim();
    const collapsedWidth = /--app-shell-sidebar-collapsed-width:\s*([^;]+);/
      .exec(shellTokens)?.[1]
      ?.trim();
    expect(railWidth).toBeDefined();
    expect(collapsedWidth).toBeDefined();
    expect(railWidth).not.toBe(collapsedWidth);
    expect(declarationsFor(shellStyles, '.app-root[data-nav-rail][data-nav-rail-position="start"]')).toMatch(
      /grid-template-columns:\s*var\(--app-shell-nav-rail-width\)\s*var\(--app-shell-sidebar-width\)\s*minmax\(0, 1fr\);/,
    );
    expect(declarationsFor(shellStyles, '.app-root[data-nav-rail][data-nav-rail-position="start"]')).toMatch(
      /grid-template-areas:\s*"navrail sidebar topbar"\s*"navrail sidebar main"\s*"navrail sidebar footer";/,
    );
  });

  it("folds only the SIDEBAR track on collapse and leaves the rail at full width", () => {
    // Slack's behaviour, and the one that keeps the rail's destinations reachable while collapsed.
    // If this ever read `--app-shell-sidebar-collapsed-width` twice, both columns would shrink and
    // the workspace switcher would become a second strip of anonymous icons.
    expect(declarationsFor(
      shellStyles,
      '.app-root[data-nav-rail][data-nav-rail-position="start"][data-collapsed="true"]',
    )).toMatch(
      /grid-template-columns:\s*var\(--app-shell-nav-rail-width\)\s*var\(--app-shell-sidebar-collapsed-width\)\s*minmax\(0, 1fr\);/,
    );
  });

  it("composes the rail with topbarSpan='full' — two independent axes, not a preset", () => {
    // The whole argument for a slot rather than a fourth enum value: the bar spans every column
    // while BOTH navigation columns start beneath it.
    expect(
      declarationsFor(
        shellStyles,
        '.app-root[data-nav-rail][data-nav-rail-position="start"][data-topbar-span="full"]',
      ),
    ).toMatch(
      /grid-template-areas:\s*"topbar\s+topbar\s+topbar"\s*"navrail sidebar main"\s*"navrail sidebar footer";/,
    );
  });

  it("HIDES the rail below 900px instead of letting the grid auto-place it (measured bug)", () => {
    // Measured on the real page before this rule existed: the narrow template drops the `navrail`
    // area name, so an `.app-nav-rail` that is merely unplaced does NOT disappear — the grid put it
    // in an implicit column and it rendered as a 33x168px sliver at x=1213, y=637, over the page
    // content. Being absent from the template is not the same as being hidden.
    const narrow = shellBlock("(width <= 56.25rem)");
    expect(declarationsFor(narrow, ".app-nav-rail")).toMatch(/display:\s*none;/);
    // And the single-column template must actually REACH a railed shell. It used to be spelled as
    // a list of the rail states somebody had thought of — five selectors for a matrix of thirty,
    // and the list lost to its own members on specificity: `[data-nav-rail]` is (0,2,0) while the
    // wide `[data-nav-rail][data-nav-rail-position="start"]` is (0,3,0) (gh#474; measured, 44 of
    // 60 state × direction pairs still multi-column below 900px). The reset is now ONE bare
    // `.app-root`, and what makes that enough is the invariant below rather than a longer list.
    expect(declarationsFor(narrow, ".app-root")).toMatch(
      /grid-template-columns:\s*minmax\(0, 1fr\);/,
    );
    // THE INVARIANT: outside the wide-only block, nothing qualified by an attribute may build a
    // multi-column shell — except docked mode, the one contract that KEEPS its columns narrow.
    for (const [selector, declarations] of qualifiedAppRootRulesOutsideWideBlock()) {
      const columns = declarations.match(/grid-template-columns:([^;]+);/)?.[1] ?? "";
      const areas = declarations.match(/grid-template-areas:([^;]+);/)?.[1] ?? "";
      const multiColumn = trackCount(columns) > 1 || areaColumns(areas) > 1;
      expect(
        !multiColumn || selector.includes('[data-responsive-navigation="docked"]'),
        `${selector} builds a multi-column shell outside the wide-only block`,
      ).toBe(true);
    }
  });

  it("keeps BOTH tracks under responsiveNavigation='docked' at narrow widths", () => {
    const narrow = shellBlock("(width <= 56.25rem)");
    expect(
      declarationsFor(
        narrow,
        '.app-root[data-responsive-navigation="docked"][data-nav-rail][data-nav-rail-position="start"]',
      ),
    ).toMatch(/grid-template-areas:\s*"navrail sidebar topbar"/);
    // The rail is re-shown explicitly; the blanket `display: none` above would otherwise win.
    expect(
      declarationsFor(narrow, '.app-root[data-responsive-navigation="docked"] > .app-nav-rail'),
    ).toMatch(/display:\s*flex;/);
  });

  it("restructures the shell at exactly ONE breakpoint and never deletes the footer (gh#213)", () => {
    // Between 768 and 900 the two rules disagreed. One breakpoint now, and the footer/bar-height
    // contract holds at every width.
    // ONE breakpoint, still — but TWO complementary blocks at it: the wide-only templates and the
    // narrow reset. That split is the gh#474 fix; what must never come back is a SECOND number.
    const restructuring = mediaBlocksMentioning(shellStyles, ".app-root");
    expect([...new Set(restructuring.map((block) => block.condition))].sort()).toEqual([
      "(width <= 56.25rem)",
      "(width > 56.25rem)",
    ]);
    // The reset itself stays in ONE place: two narrow blocks could disagree with each other.
    expect(
      restructuring.filter((block) => block.condition === "(width <= 56.25rem)"),
    ).toHaveLength(1);
    expect(shellBlock("(width <= 56.25rem)")).toContain('"footer"');
    // THE BAR HEIGHT STAYS THE TOKEN AT EVERY WIDTH. This used to be spelled "no
    // `grid-template-rows` in this block at all", which was the blunt form of the real rule and
    // became wrong once a rail on a BLOCK edge added a fourth row: that row has to go when the
    // rail is hidden, or a phone keeps a band of dead space sized by a rail nobody can see. What
    // must never come back is the thing that actually broke — the deleted 768px block restating
    // the rows with a `3rem` LITERAL, which defeated the token below 768px only.
    for (const rows of shellBlock("(width <= 56.25rem)").matchAll(/grid-template-rows:([^;]+);/g)) {
      expect(rows[1], "narrow-width row template must be token-driven").not.toMatch(
        /\d+(\.\d+)?(px|rem|em)/,
      );
      expect(rows[1]).toMatch(/var\(--app-shell-bar-height\)/);
    }
    expect(shellStyles).not.toMatch(/grid-template-rows:\s*3rem/);
    // …and nothing anywhere hides the footer landmark.
    expect(declarationsFor(shellStyles, ".app-footer")).not.toMatch(/display:\s*none/);
    // The compact bar inset is a knob, not a raw space token.
    expect(shellTokens).toContain("--app-shell-bar-gap: var(--space-3);");
    // The bar's inset is NOT the shell restructure's business any more — see the
    // horizontal-page-inset-axis test below. Nothing in this block may touch it.
    expect(shellBlock("(width <= 56.25rem)")).not.toMatch(/padding-inline:/);
    // TSX KHÔNG được nhắc lại con số breakpoint. Yêu cầu cũ ở đây là "TSX phải nêu CÙNG con số
    // với CSS", và chính nó đóng khung một lỗi: Tailwind biên dịch `max-[900px]` thành
    // `width < 900px` trong khi luật CSS dùng `width <= 56.25rem`, tức bao gồm cả 900. Utility
    // nằm sau components nên đúng ở 900px thanh bên đã ẩn còn nút chưa hiện. Hai nguồn không thể
    // bất đồng nếu chỉ có một nguồn, nên việc ẩn hiện thuộc về CSS và TSX chỉ mang tên class.
    expect(appShell).not.toMatch(/max-\[\d+px\]:/);
    expect(appShell).toContain('className="app-mobile-nav-trigger"');
    // …và luật đó PHẢI bọc trong `.app-root`. Nút là một `.ui-button`, mà control.css khai
    // `.ui-button { display: inline-flex }` và được import SAU file này trong cùng
    // `@layer components`. Một selector trần hoà (0,1,0) rồi thua vì thứ tự import, nên
    // `display: none` không ẩn được gì — đó chính là lý do trước đây phải mượn utility
    // `hidden`, và cũng là gốc của khe chết 900px (#367). Bỏ scope là quay lại lỗi cũ.
    expect(declarationsFor(shellStyles, ".app-mobile-nav-trigger")).toBe("");
    expect(declarationsFor(shellStyles, ".app-root .app-mobile-nav-trigger")).toMatch(
      /display:\s*none/,
    );
    expect(shellBlock("(width <= 56.25rem)")).toContain(".app-root .app-mobile-nav-trigger");
  });

  it("gives the horizontal page-inset axis ONE owner, stepping on ONE breakpoint (gh#330)", () => {
    // The page gutter owns the axis; the bar reads it. AFTER: 88/88, 24/24, 16/16, 16/16 at 1512
    // / 880 / 700 / 390.
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
    expect(shellStyles).not.toMatch(
      /data-responsive-navigation="docked"\]\s*>\s*\.app-topbar\s*\{[^}]*padding-inline/s,
    );
  });

  it("puts CenteredShell on that same axis", () => {
    // CenteredShell takes its bar padding from the same page-gutter owner as AppShell:
    // 24/24 at 784 · 760 · 721, and 16/16 at 720 · 700 · 390 · 320.
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
    expect(shellBlock("(width <= 56.25rem)")).toContain('"sidebar topbar"');
    expect(shellBlock("(width <= 56.25rem)")).toContain('"sidebar main"');
    expect(shellBlock("(width <= 56.25rem)")).toContain('"sidebar footer"');
    expect(shellBlock("(width <= 56.25rem)")).toMatch(
      /grid-template-columns:\s*var\(--app-shell-sidebar-width\) minmax\(0, 1fr\);/,
    );
    // `[^{]*` rather than `\s*` after the selector: docked now re-shows BOTH navigation columns,
    // so `> .app-sidebar` heads a grouped selector and is followed by `, … > .app-nav-rail` before
    // the brace. The assertion is unchanged — docked still restores the sidebar.
    expect(shellBlock("(width <= 56.25rem)")).toMatch(
      /data-responsive-navigation="docked"[^}]*> \.app-sidebar[^{]*\{[^}]*display:\s*flex;/s,
    );
    expect(shellBlock("(width <= 56.25rem)")).toMatch(
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
    // …and the shrink contract is untouched by the knobs (both-axes clip + clip-margin
    // — the margin, honoured only for two-axis clip, carries the focus ring).
    expect(root).toMatch(/flex:\s*1 1 0%;/);
    expect(root).toMatch(/overflow:\s*clip;/);
    expect(root).toMatch(/overflow-clip-margin:\s*var\(--focus-ring-clip-margin\);/);
  });

  it("OrgSwitcher's sheet re-tunes the chrome inset at a specificity that can actually win", () => {
    /*
     * `[data-slot="sheet-content"]` declares --sheet-pad-x in dialog-layout.css at (0,1,0), and
     * THIS file is imported before it — so a bare `.ui-org-switcher-sheet` ties and loses on order,
     * silently. Measured before the pairing: the heading sat 24px from the edge while the rows sat
     * at 12px, two starts visibly out of line on a 359px panel.
     *
     * Pinning the SELECTOR, not the computed value: jsdom does no cascade, so the only thing that
     * decides this is whether both hooks are in the selector.
     */
    const decls = declarationsFor(shellStyles, '[data-slot="sheet-content"].ui-org-switcher-sheet');
    expect(decls).toMatch(/--sheet-pad-x:\s*var\(--org-switcher-sheet-inset\);/);
    // The bare class must NOT be where the inset lives, or the pairing above is decoration.
    expect(declarationsFor(shellStyles, ".ui-org-switcher-sheet")).not.toMatch(/--sheet-pad-x:/);
    expect(shellTokens).toMatch(/--org-switcher-sheet-inset:\s*var\(--space-3\);/);
  });

  it("OrgSwitcher aligns ruled rows and the search field through one shared column", () => {
    /*
     * `.ui-command-item` rounds and fills because its home is a command PALETTE — a search-anything
     * surface where a floating highlight tracks a cursor through results (Raycast, cmdk, Spotlight).
     * This list is "choose one of N": a closed set, where what a reader needs is to see where one
     * row ends and the next begins.
     *
     * Scoped to this panel and deliberately NOT pushed into `.ui-command-item`, which eight
     * components use as a palette and would be wrong to re-shape.
     */
    const row = declarationsFor(shellStyles, ".ui-org-switcher-command .ui-command-item");
    expect(row).toMatch(/border-radius:\s*0;/);
    /*
     * THE ROW REACHES BOTH EDGES; ONLY ITS CONTENT IS INSET.
     *
     * This used to assert `margin-inline: 0` — "the command owns the outer column once; rows do not
     * cancel it" — which kept the row's fill and its rule inside the column and left a strip of
     * panel showing on either side. A row that stops short of the border reads as a card in a frame,
     * and the panel is already the frame; every command surface worth copying lets the row meet both
     * edges.
     *
     * The guarantee that mattered is unchanged, and it is the one asserted here: the row's mark and
     * the search field's magnifier sit on ONE start line. The row cancels exactly what stands
     * between it and the panel edge — `--org-switcher-list-inset`, which is the surface's own body
     * inset plus the list's remainder however the surface splits them — and pays it back as padding
     * along with the field's own glyph padding. Sum from the panel edge: `inset + input padding`,
     * which is where the magnifier is. Measured in a browser at 1440px: mark 537, magnifier 538,
     * one pixel of dialog border between them.
     */
    expect(row).toMatch(/margin-inline:\s*calc\(-1 \* var\(--org-switcher-list-inset\)\);/);
    expect(row).toMatch(
      /padding-inline:\s*calc\(\s*var\(--org-switcher-list-inset\) \+ var\(--command-input-padding-x\)\s*\);/,
    );
    expect(declarationsFor(shellStyles, ".ui-org-switcher-command")).toMatch(
      /padding-inline:\s*calc\(var\(--org-switcher-list-inset\) - var\(--org-switcher-list-offset\)\);/,
    );
    expect(shellTokens).toMatch(/--org-switcher-list-offset:\s*0px;/);
    expect(
      declarationsFor(shellStyles, '[data-slot="sheet-content"].ui-org-switcher-sheet'),
    ).toMatch(/--org-switcher-list-offset:\s*var\(--org-switcher-sheet-inset\);/);

    // The group's padding goes on BOTH axes: inline it was a second inset, block it was a 4px band
    // above the first row and below the last (measured: list 82-179 against rows 86-175).
    expect(declarationsFor(shellStyles, ".ui-org-switcher-command .ui-command-group")).toMatch(
      /padding:\s*0;/,
    );

    // `+` and not a border on every row, so nothing hangs above the first item.
    expect(
      declarationsFor(shellStyles, ".ui-org-switcher-command .ui-command-item + .ui-command-item"),
    ).toMatch(/border-block-start:\s*1px solid hsl\(var\(--border\)\);/);

    // The palette itself keeps its pill — this must stay a local re-shape.
    const controlStyles = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
    expect(declarationsFor(controlStyles, ".ui-command-item")).toMatch(/border-radius:\s*calc\(/);
  });

  it("the picker's search is drawn AS A FIELD, on the heading's start line", () => {
    // The outer inset belongs to the command wrapper. The input keeps its field chrome
    // and fills that column, so applying the inset again here would double it.
    const decls = declarationsFor(
      shellStyles,
      ".ui-org-switcher-command .ui-command-input-wrapper",
    );
    expect(decls).toMatch(/border:\s*1px solid hsl\(var\(--input\)\);/);
    expect(decls).toMatch(/border-radius:\s*var\(--control-radius\);/);
    expect(decls).toMatch(/margin-inline:\s*0;/);
    expect(declarationsFor(shellStyles, ".ui-org-switcher-command")).toMatch(
      /padding-inline:\s*calc\(var\(--org-switcher-list-inset\) - var\(--org-switcher-list-offset\)\);/,
    );
    // The offset half must NOT be pre-substituted in a root token — that is the whole bug.
    expect(shellTokens).not.toMatch(/--org-switcher-search-space-outset:/);

    // The palette keeps its bottom rule; this is a local re-shape, not a change to Command.
    const controlStyles = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
    expect(declarationsFor(controlStyles, ".ui-command-input-wrapper")).toMatch(
      /border-bottom:\s*1px solid hsl\(var\(--border\)\);/,
    );
  });

  it("a command row spaces its leading mark from its label", () => {
    /*
     * `.ui-command-item` is a flex row and shipped with NO gap, so every command / palette / picker
     * row with an icon rendered its glyph flush against the text — measured at 0px between an
     * organization mark and its name, in eight components that use CommandItem.
     */
    const controlStyles = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
    expect(declarationsFor(controlStyles, ".ui-command-item")).toMatch(
      /gap:\s*var\(--command-item-gap\);/,
    );
    const controlTokens = readFileSync(
      resolve(process.cwd(), "src/tokens/components/control.css"),
      "utf8",
    );
    // --control-gap, not a literal: a command row is a control row, and it should move with them.
    expect(controlTokens).toMatch(/--command-item-gap:\s*var\(--control-gap\);/);
  });

  it("OrgSwitcher sizes its glyphs and its mark from scales, not from literals", () => {
    // Both shipped as literals that happened to equal the token — same number, out of a theme's
    // reach, and out of reach of the icon-size ratchet, whose pattern looks for `icon|glyph` and
    // never saw `chevron`, `check` or `spinner`.
    const glyphs = declarationsFor(shellStyles, ".ui-org-switcher-chevron");
    expect(glyphs).toMatch(/width:\s*var\(--icon-size-md\);/);
    expect(glyphs).not.toMatch(/width:\s*1rem/);
    expect(shellTokens).toMatch(/--org-switcher-avatar-size:\s*var\(--control-height-sm\);/);
  });
});
