import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * gh#880 — the theme API could not express glassmorphism, and the failures were specific.
 *
 * Measured on `/showcase/glassmorphism` before this: **blur reachable on 1 of 19 surfaces**
 * (Topbar), and the visible defect the owner spotted by eye was a translucent Card whose own Tabs
 * strip stayed opaque `--muted`. This file holds the shape of the fix.
 *
 * WHY EVERY ASSERTION IS ABOUT THE SHAPE OF A DECLARATION, not about a rendered pixel.
 *
 * The whole design rests on one property of CSS that jsdom cannot paint and a screenshot cannot
 * prove: a custom property set to `initial` is guaranteed-invalid, so a declaration that reads it
 * is invalid-at-computed-value-time and the property falls back to its OWN initial value. For
 * `backdrop-filter` that means `none` — no blur AND no backdrop root. A literal `blur(0px)` is NOT
 * equivalent: it still promotes the element to a backdrop root and makes it the containing block
 * for every `position: fixed` descendant, which is a layout change that looks like nothing until
 * something inside goes fixed. `topbar-glass.test.ts` established this idiom for the one surface
 * that had a blur knob; these are the ten that did not.
 *
 * The rendered half of the proof is a browser probe recorded in the issue: 18 surfaces × 4 painted
 * properties, default drift 0, 23 properties newly theme-reachable.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

/**
 * Comments stripped, for every assertion of the form "this string is GONE".
 *
 * Each removal in this change is documented at the place it was removed from, which means the
 * docblock names the very utility the test is checking for the absence of. Without this the test
 * passes only while nobody explains themselves — the worst possible incentive.
 */
const code = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const cardLayout = read("../card-layout.css");
const controlLayout = read("../control.css");
const dialogLayout = read("../dialog-layout.css");
const navLayout = read("../navigation-layout.css");
const shellLayout = read("../shell-layout.css");
const tableLayout = read("../table-layout.css");
const alertLayout = read("../alert-layout.css");
const indexCss = read("../index.css");
const coreCss = read("../core.css");
const glassTheme = read("../../../docs/themes/glassmorphism.css");

const foundation = read("../../tokens/foundation.css");
const cardTokens = read("../../tokens/components/card.css");
const controlTokens = read("../../tokens/components/control.css");
const feedbackTokens = read("../../tokens/components/feedback.css");
const navTokens = read("../../tokens/components/navigation.css");
const segmentedTokens = read("../../tokens/components/segmented.css");
const shellTokens = read("../../tokens/components/shell.css");
const tableTokens = read("../../tokens/components/table.css");

const tabsTsx = read("../../components/navigation/tabs.tsx");
const sheetTsx = read("../../components/feedback/sheet.tsx");
const sonnerTsx = read("../../components/feedback/sonner.tsx");
const controlStyles = read("../../lib/control-styles.ts");
const controlAppearance = read("../../components/data-entry/control-appearance.ts");
const buttonTsx = read("../../components/general/button.tsx");

/** Every blur knob: the token it is declared in, and the stylesheet that reads it. */
const BLUR_KNOBS: Array<[knob: string, tokenFile: string, sheet: string]> = [
  ["--card-backdrop-blur-size", cardTokens, cardLayout],
  ["--dialog-overlay-backdrop-blur-size", feedbackTokens, dialogLayout],
  ["--sheet-overlay-backdrop-blur-size", feedbackTokens, dialogLayout],
  ["--popover-backdrop-blur-size", feedbackTokens, dialogLayout],
  ["--tooltip-backdrop-blur-size", feedbackTokens, dialogLayout],
  ["--toast-backdrop-blur-size", feedbackTokens, alertLayout],
  ["--dropdown-content-backdrop-blur-size", navTokens, navLayout],
  ["--select-content-backdrop-blur-size", controlTokens, controlLayout],
  ["--button-backdrop-blur-size", controlTokens, controlLayout],
  ["--sidebar-backdrop-blur-size", shellTokens, shellLayout],
  ["--table-surface-backdrop-blur-size", tableTokens, tableLayout],
];

describe("gh#880 · a backdrop-blur knob on every floating surface", () => {
  it.each(BLUR_KNOBS)("%s ships OFF as `initial`", (knob, tokenFile) => {
    expect(tokenFile).toMatch(new RegExp(`${knob}:\\s*initial;`));
  });

  it.each(BLUR_KNOBS)("%s is read through blur() with NO literal fallback", (knob, _t, sheet) => {
    expect(sheet).toMatch(new RegExp(`blur\\(var\\(${knob}\\)\\)`));
    // A fallback inside blur() would make the declaration VALID with the knob unset, promoting the
    // element to a backdrop root on every page that never asked for glass.
    expect(code(sheet)).not.toMatch(new RegExp(`blur\\(var\\(${knob},`));
  });

  it.each(BLUR_KNOBS)("%s is paired with the shared saturate companion", (knob, _t, sheet) => {
    const decl = sheet.match(
      new RegExp(`backdrop-filter:\\s*blur\\(var\\(${knob}\\)\\)[^;]*;`),
    )?.[0];
    expect(decl, `no backdrop-filter declaration reads ${knob}`).toBeTruthy();
    // 160% at the CALL SITE, not in the token: a theme that sets only a blur size still gets the
    // saturate, so asking for glass can never accidentally ask for fog.
    expect(decl).toMatch(/saturate\(var\(--surface-backdrop-saturate,\s*160%\)\)/);
  });

  it("the saturate companion is ONE shared knob, and it too ships as `initial`", () => {
    expect(foundation).toMatch(/--surface-backdrop-saturate:\s*initial;/);
    // Blur alone desaturates — that is why the first attempt was grey mush. The number lives at the
    // call sites (asserted above), so this knob only ever overrides, never enables.
    const perSurface = [...code(foundation).matchAll(/--[a-z-]*-backdrop-saturate:/g)];
    expect(perSurface).toHaveLength(1);
  });

  it("THE MODAL BLUR IS ON THE SCRIM, never on the box", () => {
    // `backdrop-filter` on the panel would blur the (flat) scrim and pin the panel to itself as the
    // containing block for its fixed descendants — the trap shell-layout.css documents for the app
    // launcher, and the rule docs/GLASSMORPHISM-STANDARD.md §4 states.
    const panel =
      code(dialogLayout).match(/\[data-slot="dialog-content"\] \{[\s\S]*?\n {2}\}/)?.[0] ?? "";
    expect(panel).not.toMatch(/backdrop-filter/);
    const sheetPanel =
      code(dialogLayout).match(/\n {2}\.ui-sheet-panel \{[\s\S]*?\n {2}\}/)?.[0] ?? "";
    expect(sheetPanel).not.toMatch(/backdrop-filter/);
    expect(dialogLayout).toMatch(/blur\(var\(--dialog-overlay-backdrop-blur-size\)\)/);
    expect(dialogLayout).toMatch(/blur\(var\(--sheet-overlay-backdrop-blur-size\)\)/);
  });
});

describe("gh#880 · nested control surfaces that had no knob of their own", () => {
  it("Tabs has a track and a selected-slab knob, both `initial`", () => {
    expect(navTokens).toMatch(/--tabs-list-background:\s*initial;/);
    expect(navTokens).toMatch(/--tabs-trigger-active-background:\s*initial;/);
  });

  it("the Tabs fills are painted from CSS, not from Tailwind utilities on the component", () => {
    // `@layer utilities` outranks `@layer components`, so while these were classNames no rule this
    // package could write was able to reach the strip. That is why the knobs could not exist.
    expect(code(tabsTsx)).not.toMatch(/data-\[variant=default\]:bg-muted/);
    expect(code(tabsTsx)).not.toMatch(/"[^"]*\bdata-\[state=active\]:bg-background\b/);
    expect(navLayout).toMatch(
      /\[data-slot="tabs-list"\]\[data-variant="default"\] \{\s*background-color: var\(\s*--tabs-list-background,\s*hsl\(var\(--muted\) \/ var\(--tabs-list-background-alpha, 100%\)\)\s*\);/,
    );
    expect(navLayout).toMatch(
      /\[data-slot="tabs-trigger"\]\[data-state="active"\] \{\s*background-color: var\(\s*--tabs-trigger-active-background,\s*hsl\(var\(--background\) \/ var\(--tabs-trigger-active-background-alpha, 100%\)\)\s*\);/,
    );
  });

  it("the card and line strips keep their own fills as utilities, so neither moves", () => {
    expect(tabsTsx).toMatch(/data-\[variant=default\]:bg-transparent/);
    expect(tabsTsx).toMatch(/data-\[variant=line\]:bg-transparent/);
    expect(tabsTsx).toMatch(/tabs-panel-background/);
  });

  it("the form family reaches --control-surface-* — all of it, not the select half", () => {
    // Input, Textarea and the plain trigger baked `border-input bg-background`, which outranks the
    // component layer: the documented pair reached the select family and nothing else.
    expect(controlAppearance).toMatch(/outlined:\s*"ui-control-outlined-surface"/);
    expect(code(controlAppearance)).not.toMatch(/outlined:\s*"[^"]*bg-background/);
    expect(code(controlStyles)).not.toMatch(/border-input bg-background/);
    expect(controlStyles).toMatch(/ui-control-outlined-surface/);
    expect(controlLayout).toMatch(
      /\.ui-control-outlined-surface \{\s*border-color: var\(--control-surface-border-color, hsl\(var\(--input\) \/ var\(--input-alpha, 100%\)\)\);\s*background-color: var\(\s*--control-surface-background,\s*hsl\(var\(--background\) \/ var\(--control-surface-background-alpha, 100%\)\)\s*\);/,
    );
  });

  it("Button's four painted variants read a knob, and ghost/link have none to read", () => {
    for (const [knob, role] of [
      ["--button-default-background", "--primary"],
      ["--button-destructive-background", "--destructive"],
      ["--button-outline-background", "--background"],
      ["--button-secondary-background", "--secondary"],
    ]) {
      expect(controlTokens).toMatch(new RegExp(`${knob}:\\s*initial;`));
      /* The role default may now carry the knob's OPACITY companion (gh#901) and Prettier wraps
       * the longer value, so this tolerates both spellings and any line breaking. What it still
       * pins is the contract: the knob resolves its role default AT THE CALL SITE. */
      expect(controlLayout).toMatch(
        new RegExp(
          `background:\\s*var\\(\\s*${knob},\\s*hsl\\(var\\(${role}\\)(?:\\s*/\\s*var\\(${knob}-alpha,[^)]*\\))?\\)\\s*\\);`,
        ),
      );
    }
    expect(controlTokens).toMatch(/--button-outline-border-color:\s*initial;/);
    // `dashed` is `outline` with a dashed edge, so it SHARES the outline fill rather than growing a
    // fifth knob — and its fill had no rule at all before, only a `bg-background` utility.
    expect(controlLayout).toMatch(
      /\.ui-button--dashed \{[\s\S]*?background:\s*var\(\s*--button-outline-background,\s*hsl\(var\(--background\) \/ var\(--button-outline-background-alpha, 100%\)\)\s*\);/,
    );
    expect(controlTokens).not.toMatch(/--button-dashed-background/);
  });

  it("no Button variant still paints its resting surface from a Tailwind utility", () => {
    // `@layer utilities` outranks `@layer components`: while these stood, the four knobs above
    // could not reach four of the five variants. gh#662 removed the first pair for the same reason.
    const src = code(buttonTsx);
    const variants = src.slice(src.indexOf("variant: {"), src.indexOf("size: {"));
    // The lookbehind excludes a VARIANT prefix (`hover:bg-secondary/80`): only the RESTING fill
    // is at issue here, and the hover fills are deliberately still utilities.
    for (const role of ["background", "secondary", "destructive", "primary"]) {
      expect(variants, role).not.toMatch(new RegExp(`(?<![:/])\\bbg-${role}\\b`));
    }
    // The HOVER fills are deliberately untouched — a separate decision from the resting surface.
    expect(variants).toMatch(/hover:bg-accent/);
    expect(variants).toMatch(/hover:bg-secondary\/80/);
  });

  it("the overlay surfaces that had no fill knob now have one, each `initial`", () => {
    expect(controlTokens).toMatch(/--select-content-background:\s*initial;/);
    expect(navTokens).toMatch(/--dropdown-content-background:\s*initial;/);
    expect(feedbackTokens).toMatch(/--toast-background:\s*initial;/);
    expect(shellTokens).toMatch(/--sidebar-surface-background:\s*initial;/);
    // The other two shell rows, for the same reason — leaving them out is the asymmetry this
    // change exists to remove.
    expect(shellTokens).toMatch(/--app-shell-bar-background:\s*initial;/);
    expect(shellTokens).toMatch(/--app-shell-nav-rail-background:\s*initial;/);
    // THE BAR ROW DOES GET A BLUR KNOB, AND THIS LINE USED TO ASSERT IT DOES NOT (gh#895).
    // The reason recorded here was "`.app-topbar` is a sibling of `.app-main`, so nothing a theme
    // paints in the main region is behind it to blur" — true about the main region and wrong about
    // what a bar blurs, which is the PAGE backdrop: the body gradient sits behind the whole shell.
    // The cost of the omission was not a missing nicety. It left `--topbar-backdrop-blur-size` as
    // the only bar blur a theme could reach, and that knob is on `.ui-topbar`, which the row insets
    // by `--app-shell-bar-inset` on each side — so the glass theme filled the inset element and the
    // row showed through both gutters as two mismatched strips (measured: a 52/255 colour step at
    // x=24, the gutter boundary, in all five seeds; 0 after). Held by
    // `src/styles/__tests__/bar-row-blur-895.test.ts`.
    expect(shellTokens).toMatch(/--app-shell-bar-backdrop-blur-size:\s*initial;/);
    expect(shellLayout).toMatch(
      /background: var\(--app-shell-bar-background, hsl\(var\(--card\) \/ var\(--card-alpha, 100%\)\)\);/,
    );
    expect(shellLayout).toMatch(
      /background: var\(--app-shell-nav-rail-background, hsl\(var\(--muted\)\)\);/,
    );
    expect(tableTokens).toMatch(/--table-surface-background:\s*initial;/);
    expect(controlLayout).toMatch(
      /background: var\(--select-content-background, hsl\(var\(--popover\) \/ var\(--popover-alpha, 100%\)\)\);/,
    );
    expect(navLayout).toMatch(
      /background:\s*var\(\s*--dropdown-content-background,\s*hsl\(var\(--popover\) \/ var\(--popover-alpha, 100%\)\)\s*\);/,
    );
    expect(shellLayout).toMatch(
      /background:\s*var\(\s*--sidebar-surface-background,\s*hsl\(var\(--card\) \/ var\(--sidebar-surface-background-alpha, var\(--card-alpha, 100%\)\)\)\s*\);/,
    );
    // The DataTable frame painted NO fill, so its knob is read with no fallback: unset, the
    // declaration is invalid and `background-color` keeps its own initial `transparent`.
    expect(tableLayout).toMatch(
      /background-color:\s*var\(\s*--table-surface-background,\s*hsl\(var\(--card\) \/ var\(--table-surface-background-alpha\)\)\s*\);/,
    );
    // Sonner owns the toast body, so the package's knob is threaded through its private var.
    expect(sonnerTsx).toMatch(
      /"--normal-bg":\s*"var\(--toast-background, hsl\(var\(--popover\) \/ var\(--popover-alpha, 100%\)\)\)"/,
    );
  });
});

describe("gh#880 · Dialog and Sheet fills were dead ends", () => {
  it("the Dialog panel paints from a knob instead of a hard-coded role", () => {
    expect(feedbackTokens).toMatch(/--dialog-surface-background:\s*initial;/);
    expect(dialogLayout).toMatch(
      /background-color: var\(--dialog-surface-background, hsl\(var\(--background\)\)\);/,
    );
    expect(code(dialogLayout)).not.toMatch(/\n\s*background-color: hsl\(var\(--background\)\);/);
  });

  it("the Sheet panel's fill left the className, where no package rule could reach it", () => {
    expect(feedbackTokens).toMatch(/--sheet-surface-background:\s*initial;/);
    expect(code(sheetTsx)).not.toMatch(/ui-sheet-panel[^"]*\bbg-background\b/);
    expect(dialogLayout).toMatch(
      /background-color: var\(--sheet-surface-background, hsl\(var\(--background\)\)\);/,
    );
  });

  it("both panels still state their own INK rather than inheriting it (gh#877)", () => {
    // A translucent fill over inherited text is how an invisible label ships: under a themed region
    // the panel followed the theme and the ink did not — measured 1.03:1.
    expect(dialogLayout).toMatch(/color: hsl\(var\(--foreground\)\);/);
    expect(sheetTsx).toMatch(/text-foreground/);
  });
});

describe("gh#880 · Card's gradient dead end", () => {
  it("the tint is a REAL two-stop ramp with its own angle", () => {
    // It used to be `linear-gradient(var(--card-tint), var(--card-tint))` — one variable named
    // twice, so a two-colour value expanded to `linear-gradient(A, B, A, B)`: a hard split.
    expect(cardTokens).toMatch(/--card-tint-end:\s*initial;/);
    expect(cardTokens).toMatch(/--card-tint-angle:\s*initial;/);
    const rule = cardLayout.match(/background:\s*\n?\s*linear-gradient\([\s\S]*?\);/)?.[0] ?? "";
    expect(rule).toMatch(/var\(--card-tint-angle,\s*to bottom\)/);
    expect(rule).toMatch(/var\(--card-tint\),/);
    expect(rule).toMatch(/var\(--card-tint-end,\s*var\(--card-tint\)\)/);
    expect(code(cardLayout)).not.toMatch(
      /linear-gradient\(var\(--card-tint\), var\(--card-tint\)\)/,
    );
  });
});

describe("gh#880 · the frozen --*-shadow mirrors", () => {
  // A `:root` binding to the elevation ramp substitutes on `<html>`, so a scope that restates the
  // ramp can never move it (docs/TOKEN-RESOLUTION.md §3). Each is now `initial` with the ramp read
  // at the call site.
  const MIRRORS: Array<[knob: string, tokenFile: string, sheet: string, tier: string]> = [
    ["--card-shadow", cardTokens, cardLayout, "--shadow-sm"],
    ["--sheet-shadow", feedbackTokens, dialogLayout, "--shadow-lg"],
    ["--popover-shadow", feedbackTokens, dialogLayout, "--shadow-md"],
    ["--tooltip-shadow", feedbackTokens, dialogLayout, "--shadow-md"],
    ["--segmented-item-selected-shadow", segmentedTokens, controlLayout, "--shadow-md"],
  ];

  it.each(MIRRORS)(
    "%s is `initial` with the ramp at the call site",
    (knob, tokenFile, sheet, tier) => {
      expect(tokenFile).toMatch(new RegExp(`${knob}:\\s*initial;`));
      expect(code(tokenFile)).not.toMatch(new RegExp(`${knob}:\\s*var\\(${tier}\\);`));
      expect(sheet).toMatch(new RegExp(`var\\(${knob}, var\\(${tier}\\)\\)`));
    },
  );

  it("every call site that composes --card-shadow carries the fallback, not just the first", () => {
    // `accentPlacement="perimeter"` re-lists the resting elevation behind its attention ring; a
    // fallback on one reader and not the other is how half a component follows a theme.
    const reads = [...code(cardLayout).matchAll(/var\(--card-shadow[^)]*\)/g)].map((m) => m[0]);
    expect(reads.length).toBeGreaterThanOrEqual(2);
    for (const r of reads) expect(r).toBe("var(--card-shadow, var(--shadow-sm)");
  });
});

describe("gh#880 · the library ships no translucency fallback of its own any more", () => {
  it("the file, its import, and the shared opaque knob are gone", () => {
    expect(() => read("../translucency-fallbacks.css")).toThrow();
    expect(indexCss).not.toMatch(/translucency-fallbacks/);
    expect(coreCss).not.toMatch(/translucency-fallbacks/);
    expect(foundation).not.toMatch(/--surface-solid-background/);
  });
});

describe("gh#880-theme · the theme that made these surfaces translucent owns their fallbacks", () => {
  it("both branches exist, and they are the two the standard names", () => {
    expect(glassTheme).toMatch(/@supports not \(backdrop-filter: blur\(1px\)\)/);
    // An OS accessibility setting, not a nicety.
    expect(glassTheme).toMatch(/@media \(prefers-reduced-transparency: reduce\)/);
  });

  it("both branches declare custom properties only — no selector into a .ui-* class, no raw property", () => {
    for (const query of [
      "@supports not (backdrop-filter: blur(1px))",
      "@media (prefers-reduced-transparency: reduce)",
    ]) {
      const at = code(glassTheme).indexOf(query);
      expect(at, query).toBeGreaterThan(0);
      const block = code(glassTheme).slice(at, code(glassTheme).indexOf("\n}\n", at) + 2);
      expect(block).toMatch(/\[data-theme-style="glass"\]/);
      expect(block).not.toMatch(/\.ui-/);
      const decls = [...block.matchAll(/^\s{4}([a-zA-Z-]+):/gm)].map((m) => m[1]);
      expect(decls.length).toBeGreaterThan(0);
      for (const prop of decls) expect(prop.startsWith("--")).toBe(true);
    }
  });

  it("the reduced-transparency branch drops the blur through the TOKEN, never `none` or `blur(0px)`", () => {
    const media = code(glassTheme).slice(code(glassTheme).indexOf("prefers-reduced-transparency"));
    // The ROW's knob since gh#895 — this theme's bar glass moved off the inset `.ui-topbar`.
    expect(media).toMatch(/--app-shell-bar-backdrop-blur-size:\s*initial;/);
    expect(media).not.toMatch(/backdrop-filter/);
    expect(media).not.toMatch(/blur\(0/);
  });

  it("every surface the theme makes translucent above is repainted opaque in both branches", () => {
    for (const query of [
      "@supports not (backdrop-filter: blur(1px))",
      "@media (prefers-reduced-transparency: reduce)",
    ]) {
      const at = code(glassTheme).indexOf(query);
      const block = code(glassTheme).slice(at, code(glassTheme).indexOf("\n}\n", at) + 2);
      expect(block, query).toMatch(/--card-background:\s*0 0% 100%;/);
      expect(block, query).toMatch(/--card:\s*0 0% 100%;/);
      expect(block, query).toMatch(/--popover:\s*0 0% 100%;/);
      expect(block, query).toMatch(/--popover-surface-background:\s*hsl\(0 0% 100%\);/);
      expect(block, query).toMatch(/--tooltip-background:\s*hsl\(230 45% 12%\);/);
      // The bar goes opaque through the ROW's fill knob (gh#895), not through the inset
      // component's alpha. Pinned rather than left to the `--card: 0 0% 100%` above it, because
      // that line turns cards white for the page and the bar is dark chrome, not a surface.
      expect(block, query).toMatch(/--app-shell-bar-background:\s*hsl\(var\(--background\)\);/);
    }
  });
});
