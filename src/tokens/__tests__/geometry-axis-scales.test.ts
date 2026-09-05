import { describe, expect, it } from "vitest";

import { allDeclarations, environment, resolveToken } from "./css-token-resolve";

/**
 * gh#324 — the two geometry axes that had a vocabulary and no name.
 *
 * gh#326 named the icon axis and proved the method: an axis WITH a scale stays disciplined, an
 * axis WITHOUT one is almost all raw numbers, and the cure is to write down the vocabulary that
 * already exists rather than invent one. This file does the same job for the two loudest rows of
 * the gh#324 census — and records the other half of the finding, which is that the loudest axis
 * was never one axis at all.
 *
 *   width   91% raw   → THREE concerns. Only the first is a vocabulary:
 *                       • stroke — the thickness of a painted line. 6 values, ~20 tokens. NAMED.
 *                       • container measure — a dialog, a sheet, a reading column, an auth card.
 *                         ~26 tokens over 15 values, most appearing exactly once. NOT a scale.
 *                       • field width — how wide a picker must be to hold its longest label.
 *                         Content-driven, per control. NOT a scale.
 *   height  69% raw   → TWO concerns:
 *                       • band — a control, a table row, a menu item, a nav row, the app-shell top
 *                         bar. 7 values, each declared by two to five tokens. NAMED.
 *                       • container measure — a chart plot, a transfer pane, a popover max-height.
 *                         NOT a scale.
 *   size    77% raw   → four unrelated things (icons under another name, media boxes, `em` marks,
 *                       `px` strokes). NOT a scale — see scripts/token-scale-bypass-rules.mjs.
 *   offset  53% raw   → half is `--space-*` already; the rest is ring geometry below the grid,
 *                       `em` marks, and artboard-pinned coordinates. NOT a scale.
 *
 * WHY A SOURCE RESOLVER AND NOT `getComputedStyle`
 * jsdom does no layout and applies no author cascade, so a computed-style probe returns "" for
 * every token here and would pass just as happily if the migration had halved every control in
 * the library. The FROZEN table below was captured by resolving the token graph from the CSS
 * source BEFORE the migration and is asserted against the graph AFTER it.
 *
 * FOUR COLUMNS, AND A FIFTH TEST FOR THE COARSE POINTER. Whether a token breathes with density is
 * a per-token decision made long ago (the gh#328 trap: `--space-*` is `--scaling`-multiplied and a
 * plain literal is not, so migrating one to the other silently flips it). `--control-height`
 * multiplies by `--scaling`; `--app-shell-bar-height` deliberately does not; `.ui-scale-fixed`
 * pins a subtree to the baseline. All four are checked on every token, and the coarse-pointer
 * ladder — where `--control-height-default` jumps to the 44px tap floor — gets its own describe,
 * because that is where the one intended geometry change of gh#324 lives.
 */

/** The stroke steps, exactly as foundation.css must declare them. */
const STROKE: ReadonlyArray<readonly [string, string, number]> = [
  ["--stroke-hairline", "1px", 1],
  ["--stroke-sm", "1.5px", 1.5],
  ["--stroke-md", "2px", 2],
  ["--stroke-lg", "3px", 3],
  ["--stroke-xl", "4px", 4],
  ["--stroke-2xl", "6px", 6],
];

/** The band-height steps, exactly as foundation.css must declare them. */
const BAND: ReadonlyArray<readonly [string, string, number]> = [
  ["--band-height-xs", "1.5rem", 24],
  ["--band-height-sm", "1.75rem", 28],
  ["--band-height-md", "2rem", 32],
  ["--band-height-lg", "2.25rem", 36],
  ["--band-height-xl", "2.75rem", 44],
  ["--band-height-2xl", "3rem", 48],
  ["--band-height-3xl", "3.5rem", 56],
];

/**
 * Pre-migration resolved values: [default, compact (.92), comfortable (1.08), inside
 * `.ui-scale-fixed` while the page is comfortable]. Captured from the CSS source before the
 * rewrite; a single moved value fails.
 */
const FROZEN: Record<string, [string, string, string, string]> = {
  "--focus-ring-width": ["2px", "2px", "2px", "2px"],
  "--card-accent-rail-width": ["6px", "6px", "6px", "6px"],
  "--card-accent-perimeter-width": ["1px", "1px", "1px", "1px"],
  "--card-accent-perimeter-ring-width": ["1px", "1px", "1px", "1px"],
  "--card-featured-ring-width": ["1px", "1px", "1px", "1px"],
  "--control-border-width": ["1px", "1px", "1px", "1px"],
  "--toggle-focus-ring-width": ["3px", "3px", "3px", "3px"],
  "--avatar-presence-ring-width": ["2px", "2px", "2px", "2px"],
  "--avatar-presence-stroke-width": ["1.5px", "1.5px", "1.5px", "1.5px"],
  "--avatar-presence-bar-block-size": ["1.5px", "1.5px", "1.5px", "1.5px"],
  "--chart-trend-bar-min-height": ["2px", "2px", "2px", "2px"],
  "--legal-document-toc-marker-width": ["2px", "2px", "2px", "2px"],
  "--separator-rule-size": ["1px", "1px", "1px", "1px"],
  "--table-row-border-width": ["1px", "1px", "1px", "1px"],
  "--table-flush-divider-width": ["1px", "1px", "1px", "1px"],
  "--toggle-count-forced-outline-width": ["1px", "1px", "1px", "1px"],
  "--upload-dropzone-border-width": ["2px", "2px", "2px", "2px"],
  "--upload-avatar-border-width": ["2px", "2px", "2px", "2px"],
  "--control-height-compact": ["1.75rem", "1.75rem", "1.75rem", "1.75rem"],
  "--control-height-default": ["2rem", "2rem", "2rem", "2rem"],
  "--control-height-comfortable": ["2.75rem", "2.75rem", "2.75rem", "2.75rem"],
  "--control-height": ["2rem", "1.84rem", "2.16rem", "2rem"],
  "--control-height-sm": ["1.75rem", "1.61rem", "1.89rem", "1.75rem"],
  "--control-height-lg": ["2.25rem", "2.07rem", "2.43rem", "2.25rem"],
  "--control-height-xs": ["1.5rem", "1.38rem", "1.62rem", "1.5rem"],
  "--button-xs-height": ["1.5rem", "1.38rem", "1.62rem", "1.5rem"],
  "--input-file-button-height": ["1.75rem", "1.75rem", "1.75rem", "1.75rem"],
  "--table-row-height-compact": ["1.75rem", "1.75rem", "1.75rem", "1.75rem"],
  "--table-row-height-default": ["2rem", "2rem", "2rem", "2rem"],
  "--table-row-height-comfortable": ["2.75rem", "2.75rem", "2.75rem", "2.75rem"],
  "--table-row-height": ["2rem", "1.84rem", "2.16rem", "2rem"],
  "--table-action-collection-row-height-compact": ["1.75rem", "1.75rem", "1.75rem", "1.75rem"],
  "--sidebar-nav-item-height": ["2rem", "2rem", "2rem", "2rem"],
  "--org-switcher-trigger-height": ["2.75rem", "2.75rem", "2.75rem", "2.75rem"],
  "--auth-shell-canonical-control-height": ["2.25rem", "2.25rem", "2.25rem", "2.25rem"],
  "--auth-shell-control-height": ["2.75rem", "2.75rem", "2.75rem", "2.75rem"],
  "--auth-account-summary-min-height": ["2.75rem", "2.75rem", "2.75rem", "2.75rem"],
  "--app-shell-bar-height": ["3rem", "3rem", "3rem", "3rem"],
  "--centered-shell-bar-height": ["3rem", "3rem", "3rem", "3rem"],
  "--admin-collection-control-height": ["2rem", "2rem", "2rem", "2rem"],
  "--admin-collection-table-row-height": ["2rem", "2rem", "2rem", "2rem"],
  "--app-setting-picker-compact-control-height": ["1.75rem", "1.61rem", "1.89rem", "1.75rem"],
  "--card-service-launcher-icon-size": ["2.25rem", "2.07rem", "2.43rem", "2.25rem"],
  "--card-service-launcher-cta-min-height": ["9rem", "8.28rem", "9.72rem", "9rem"],
  "--table-skeleton-line-height": ["1rem", "1rem", "1rem", "1rem"],
  "--activity-bar-height": ["0.25em", "0.25em", "0.25em", "0.25em"],
  "--table-skeleton-line-block-size": ["1rem", "1rem", "1rem", "1rem"],
};

/**
 * `email.css` is excluded for the reason the guard records: HTML email cannot read a custom
 * property (Gmail and Outlook strip <style> and demand literal inline values), so every constant
 * in that file must stay a literal. It is the one documented exception on every axis.
 */
const decls = allDeclarations().filter((d) => d.file !== "src/tokens/components/email.css");
const root = environment({ selectors: [":root"] });
const compact = environment({ selectors: [":root"], scaling: "0.92" });
const comfortable = environment({ selectors: [":root"], scaling: "1.08" });
const scaleFixed = environment({ selectors: [":root", ".ui-scale-fixed"], scaling: "1.08" });

/** `:root` plus the `@media (pointer: coarse)` overrides — the 44px tap-floor ladder (rule #24). */
function coarseEnvironment(): Map<string, string> {
  const env = environment({ selectors: [":root"] });
  for (const decl of decls) {
    if (decl.selector !== ":root") continue;
    if (!decl.atRules.some((rule) => rule.includes("pointer: coarse"))) continue;
    env.set(decl.token, decl.value);
  }
  return env;
}
const coarse = coarseEnvironment();

describe("stroke scale — tier 1 (gh#324)", () => {
  it("declares all six steps at :root", () => {
    for (const [token, value] of STROKE) {
      expect(root.get(token), `${token} must be declared at :root in foundation.css`).toBe(value);
    }
  });

  it("is px, never rem — a device line must not grow with the root font-size", () => {
    // The whole point of the axis. A 1px divider that became 1.14px because the app set a 18px
    // root would stop reading as one crisp rule; `--slider-track-height: 0.375rem` is a different
    // decision and deliberately did NOT move onto this scale.
    for (const [token, value, px] of STROKE) {
      expect(value.endsWith("px"), `${token} must be a px length`).toBe(true);
      expect(Number.parseFloat(value)).toBe(px);
    }
  });

  it("is not --scaling-multiplied — density tightens rhythm, it does not blur lines", () => {
    for (const [token, value] of STROKE) {
      expect(resolveToken(token, compact)).toBe(value);
      expect(resolveToken(token, comfortable)).toBe(value);
    }
  });

  it("the one global thickness knob reads the scale", () => {
    // `--focus-ring-width` was the system's only NAMED line thickness before gh#324; it is now a
    // member of the axis rather than a parallel authority, so a theme retunes both at once.
    expect(root.get("--focus-ring-width")).toBe("var(--stroke-md)");
  });
});

describe("band-height scale — tier 1 (gh#324)", () => {
  it("declares all seven steps at :root, on whole pixels at a 16px root", () => {
    for (const [token, value, px] of BAND) {
      expect(root.get(token), `${token} must be declared at :root in foundation.css`).toBe(value);
      expect(Number.parseFloat(value) * 16, `${token} must land on a whole pixel`).toBe(px);
    }
  });

  it("carries the WCAG 2.2 / rule #24 tap floor as a named step", () => {
    // 44px is not an aesthetic choice, and the coarse-pointer ladder lands on it. Naming it is
    // what stops someone "tidying" the ladder onto a nearby number.
    expect(root.get("--band-height-xl")).toBe("2.75rem");
    expect(Number.parseFloat("2.75") * 16).toBe(44);
  });

  it("is not --scaling-multiplied — the tokens that want density opt in themselves", () => {
    // gh#328's rule. `--control-height` multiplies by --scaling; `--app-shell-bar-height` does
    // not. Baking --scaling into the scale would flip every band in the system at once.
    for (const [token, value] of BAND) {
      expect(resolveToken(token, compact)).toBe(value);
      expect(resolveToken(token, comfortable)).toBe(value);
    }
  });

  it("anchors the control ladder instead of being replaced by it", () => {
    // The control tier is a RUNTIME ladder (density × the coarse-pointer floor); the band scale is
    // the static vocabulary it is anchored on. A band token pointed at `--control-height-*` would
    // silently enrol in both, which is a geometry change — `--table-row-height-default` is
    // `var(--band-height-md)` for exactly that reason, and the coarse column below is the proof.
    expect(root.get("--control-height-default")).toBe("var(--band-height-md)");
    expect(root.get("--table-row-height-default")).toBe("var(--band-height-md)");
    expect(resolveToken("--control-height-default", coarse)).toBe("2.75rem");
    expect(resolveToken("--table-row-height-default", coarse)).toBe("2rem");
  });
});

describe("the migration moved nothing (gh#324)", () => {
  it.each(Object.entries(FROZEN))(
    "%s resolves unchanged at default / compact / comfortable / scale-fixed",
    (token, [atDefault, atCompact, atComfortable, atFixed]) => {
      expect(resolveToken(token, root)).toBe(atDefault);
      expect(resolveToken(token, compact)).toBe(atCompact);
      expect(resolveToken(token, comfortable)).toBe(atComfortable);
      expect(resolveToken(token, scaleFixed)).toBe(atFixed);
    },
  );

  it("every component token on the two new axes reads a step or an exemption", () => {
    // The census, asserted. Anything left raw here is either in the guard's baseline (a file a
    // different owner had open when gh#324 landed) or carries a `scale-exempt:` marker.
    // One entry. The other four were "baselined" only because their files belonged to a different
    // agent while gh#324 landed — an ownership boundary, never a reason a token should stay raw.
    // They now read the scale at their existing values (--menu-item-height -> --band-height-md 2rem,
    // --steps-marker-border-width and --branch-scope-picker-subset-border-width -> --stroke-md 2px,
    // --steps-dot-process-ring-width -> --stroke-xl 4px; --stroke-lg is 3px and would have moved it).
    const KNOWN_RAW = [
      "--activity-bar-height", // scale-exempt: an em thickness that tracks its label
    ];
    const AXIS =
      /-(?:border|ring|stroke|outline|rule|divider)-width(?:-[a-z0-9]+)?$|-(?:band|bar|row|item|trigger|control|button)-height(?:-[a-z0-9]+)?$/;
    const raw = decls
      .filter((d) => d.file.startsWith("src/tokens/components/"))
      .filter((d) => AXIS.test(d.token))
      .filter((d) =>
        /(?<![\w.])(?!0(?:\.0+)?(?:rem|px)|1px)\d+(?:\.\d+)?(?:rem|px|em)/.test(d.value),
      )
      .filter((d) => !d.value.includes("var(--stroke") && !d.value.includes("var(--band-height"))
      .filter((d) => !d.value.includes("var(--control-height"))
      .map((d) => d.token);
    expect([...new Set(raw)].sort()).toEqual([...KNOWN_RAW].sort());
  });
});

describe("the one deliberate geometry change (gh#324)", () => {
  it("the ServiceLauncherCard medallion no longer inflates on touch devices", () => {
    // It read `var(--control-height-lg)` — a CONTROL tier sizing an ICON box. Invisible at the
    // desk, wrong on a phone: `@media (pointer: coarse)` lifts the control ladder to the 44px tap
    // floor, so the medallion silently grew 36px → 48px while the glyph inside it stayed 20px.
    // It is now the `--icon-size-2xl` step times --scaling: same value on every density column
    // (the FROZEN table above), and 36px on a coarse pointer where it used to be 48px.
    expect(root.get("--card-service-launcher-icon-size")).toBe(
      "calc(var(--icon-size-2xl) * var(--scaling))",
    );
    expect(resolveToken("--control-height-lg", coarse)).toBe("3rem");
    expect(resolveToken("--card-service-launcher-icon-size", coarse)).toBe("2.25rem");
    // The glyph inside it was already right (gh#328) and is untouched.
    expect(resolveToken("--card-service-launcher-icon-glyph-size", coarse)).toBe("1.25rem");
  });

  it("the dashed catalog CTA still tracks the control tier, because it is four of them", () => {
    // Not everything that reads `--control-height-lg` is a mistake. The companion tile is sized to
    // sit level with a populated tile in the same grid row, so it SHOULD grow with the ladder.
    expect(resolveToken("--card-service-launcher-cta-min-height", coarse)).toBe("12rem");
  });
});

describe("line-height is an axis of RATIOS (gh#324)", () => {
  it("--table-skeleton-line-height keeps working as a published alias", () => {
    // It was a LENGTH on an axis whose scale is unitless ratios — a mis-named height, and the only
    // raw value on that axis, which is what kept the axis ungated. Renamed rather than deleted: a
    // consumer theme may already override it, and styles/table-layout.css still reads the old
    // name, so both spellings resolve to the same 1rem.
    expect(resolveToken("--table-skeleton-line-block-size", root)).toBe("1rem");
    expect(resolveToken("--table-skeleton-line-height", root)).toBe("1rem");
    expect(root.get("--table-skeleton-line-height")).toBe("var(--table-skeleton-line-block-size)");
  });

  it("no component token on the line-height axis declares a length", () => {
    const lengths = decls
      .filter((d) => d.file.startsWith("src/tokens/components/"))
      .filter((d) => /-line-height(?:-[a-z0-9]+)?$/.test(d.token))
      .filter((d) => /\d(?:rem|px|em|ch|ex)\b/.test(d.value))
      .map((d) => `${d.file}:${d.line} ${d.token}: ${d.value}`);
    expect(lengths).toEqual([]);
  });
});
