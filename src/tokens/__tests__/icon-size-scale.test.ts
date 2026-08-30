import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { allDeclarations, environment, resolveToken } from "./css-token-resolve";

/**
 * gh#326 / gh#327 / gh#328 — the icon axis.
 *
 * Icon was the one geometric axis with a vocabulary and no name: 28 component tokens declared
 * raw numbers, and between them they used only NINE values. `--icon-size-2xs … --icon-size-4xl`
 * in `foundation.css` is that list, written down. Migrating the 28 to it is a change of
 * EXPRESSION, not of geometry — and this file is the proof, because nothing else can be.
 *
 * WHY A SOURCE RESOLVER AND NOT `getComputedStyle`
 * jsdom does no layout and applies no author cascade, so a computed-style probe returns "" for
 * every one of these and would pass just as happily if the migration had halved every icon in
 * the library. The values below were captured by resolving the token graph from the CSS source
 * BEFORE the migration and are asserted against the graph AFTER it. A single moved icon fails.
 *
 * The three density columns matter as much as the values. `--control-icon-size` is
 * `calc(var(--icon-size-md) * var(--scaling))` and `--stat-card-icon-size` is a plain
 * `var(--icon-size-2xl)`; whether a given icon tracks density is a per-token decision that was
 * made long ago, and naming the scale must not quietly flip any of them. That is exactly the
 * trap in gh#328: `--card-service-launcher-icon-glyph-size` read `var(--space-5)`, which is the
 * wrong AXIS but is `--scaling`-multiplied, so pointing it at a bare `var(--icon-size-lg)` would
 * have frozen a glyph that used to breathe with density. It reads
 * `calc(var(--icon-size-lg) * var(--scaling))` instead — right axis, same behaviour, and the
 * compact/comfortable columns below are what says so.
 */

/** The nine steps, exactly as foundation.css must declare them. */
const SCALE: ReadonlyArray<readonly [string, string, number]> = [
  ["--icon-size-2xs", "0.625rem", 10],
  ["--icon-size-xs", "0.75rem", 12],
  ["--icon-size-sm", "0.875rem", 14],
  ["--icon-size-md", "1rem", 16],
  ["--icon-size-lg", "1.25rem", 20],
  ["--icon-size-xl", "1.5rem", 24],
  ["--icon-size-2xl", "2.25rem", 36],
  ["--icon-size-3xl", "2.5rem", 40],
  ["--icon-size-4xl", "3rem", 48],
];

/** Pre-migration resolved values: [default, compact (.92), comfortable (1.08)]. */
const FROZEN: Record<string, [string, string, string]> = {
  "--alert-dismiss-icon-size": ["1rem", "1rem", "1rem"],
  "--app-setting-picker-icon-size": ["1rem", "1rem", "1rem"],
  "--app-shell-mobile-nav-icon-size": ["1.25rem", "1.25rem", "1.25rem"],
  "--auth-account-summary-avatar-glyph-size": ["0.875rem", "0.805rem", "0.945rem"],
  "--auth-requester-glyph-size": ["0.625rem", "0.625rem", "0.625rem"],
  "--auth-requester-icon-size": ["1rem", "1rem", "1rem"],
  "--avatar-tinted-glyph-size": ["1rem", "0.92rem", "1.08rem"],
  "--button-xs-icon-size": ["0.75rem", "0.75rem", "0.75rem"],
  "--card-service-launcher-icon-glyph-size": ["1.25rem", "1.15rem", "1.35rem"],
  "--card-service-launcher-icon-size": ["2.25rem", "2.07rem", "2.43rem"],
  "--cascader-option-icon-size": ["1rem", "1rem", "1rem"],
  "--control-affix-icon-size": ["1rem", "1rem", "1rem"],
  "--control-icon-size": ["1rem", "0.92rem", "1.08rem"],
  "--control-icon-size-sm": ["0.875rem", "0.805rem", "0.945rem"],
  "--control-inline-affix-icon-size": ["1rem", "1rem", "1rem"],
  "--empty-state-icon-glyph-size": ["1.5rem", "1.5rem", "1.5rem"],
  "--empty-state-icon-size": ["3rem", "3rem", "3rem"],
  "--menu-icon-size": ["1rem", "1rem", "1rem"],
  "--month-picker-icon-size": ["1rem", "1rem", "1rem"],
  "--month-picker-separator-icon-size": ["0.875rem", "0.875rem", "0.875rem"],
  "--pagination-icon-size": ["1rem", "0.92rem", "1.08rem"],
  "--permission-matrix-cell-icon-size": ["1rem", "0.92rem", "1.08rem"],
  "--sidebar-nav-icon-size": ["1rem", "1rem", "1rem"],
  "--stat-card-icon-glyph-size": ["1.25rem", "1.25rem", "1.25rem"],
  "--stat-card-icon-size": ["2.25rem", "2.25rem", "2.25rem"],
  "--steps-marker-icon-size": ["1rem", "1rem", "1rem"],
  "--steps-wait-icon-size": ["0.75rem", "0.75rem", "0.75rem"],
  "--table-pagination-icon-size": ["1rem", "1rem", "1rem"],
  "--table-sort-icon-size": ["0.75rem", "0.75rem", "0.75rem"],
  "--table-toolbar-icon-size": ["1rem", "1rem", "1rem"],
  "--toast-icon-size": ["1rem", "1rem", "1rem"],
  "--transfer-action-icon-size": ["1rem", "1rem", "1rem"],
  "--upload-draft-icon-size": ["0.875rem", "0.875rem", "0.875rem"],
  "--upload-dropzone-icon-size": ["2.5rem", "2.5rem", "2.5rem"],
  "--upload-remove-icon-size": ["0.875rem", "0.875rem", "0.875rem"],
  "--upload-row-icon-size": ["1rem", "1rem", "1rem"],
  "--upload-tile-icon-size": ["1.5rem", "1.5rem", "1.5rem"],
};

const ICON_TOKEN = /-(?:icon|glyph)-size(?:-[a-z0-9]+)?$/;
const decls = allDeclarations();
const iconDecls = decls.filter((d) => ICON_TOKEN.test(d.token));

const root = environment({ selectors: [":root"] });
const compact = environment({ selectors: [":root"], scaling: "0.92" });
const comfortable = environment({ selectors: [":root"], scaling: "1.08" });

describe("icon size scale — tier 1 (gh#326)", () => {
  it("declares all nine steps at :root, on whole pixels at a 16px root", () => {
    for (const [token, value, px] of SCALE) {
      expect(root.get(token), `${token} must be declared at :root in foundation.css`).toBe(value);
      expect(Number.parseFloat(value) * 16, `${token} must land on a whole pixel`).toBe(px);
    }
  });

  it("is a fixed list, NOT a ratio scale — no single ratio generates it", () => {
    // The reason the scale is nine literals and not `calc(base * ratio^n)`: 14/16 = 0.875 but
    // 20/16 = 1.25. Type can sit between pixels because hinting carries it; a 1px-stroke glyph
    // cannot. If someone ever "tidies" this into a ratio, this assertion is what stops them.
    const px = SCALE.map(([, , p]) => p);
    const ratios = px.slice(1).map((v, i) => v / px[i]);
    expect(new Set(ratios.map((r) => r.toFixed(4))).size).toBeGreaterThan(1);
  });

  it("every component icon token reads a scale step — no raw lengths left", () => {
    const raw = iconDecls
      .filter((d) => d.file.startsWith("src/tokens/components/"))
      .filter((d) => !d.value.includes("var(--"))
      .map((d) => `${d.file}:${d.line} ${d.token}: ${d.value}`);
    expect(raw).toEqual([]);
  });

  it("no icon token invents a value off the nine steps", () => {
    const steps = new Set(SCALE.map(([, value]) => value));
    const off = Object.entries(FROZEN)
      .filter(([, [base]]) => !steps.has(base))
      .map(([token, [base]]) => `${token} = ${base}`);
    expect(off).toEqual([]);
  });
});

describe("icon size migration moved nothing (gh#326)", () => {
  it.each(Object.entries(FROZEN))(
    "%s resolves unchanged at default / compact / comfortable density",
    (token, [atDefault, atCompact, atComfortable]) => {
      expect(resolveToken(token, root)).toBe(atDefault);
      expect(resolveToken(token, compact)).toBe(atCompact);
      expect(resolveToken(token, comfortable)).toBe(atComfortable);
    },
  );

  it("covers every icon token in the tier — the frozen table cannot go stale", () => {
    const live = [...new Set(iconDecls.map((d) => d.token))]
      .filter((t) => !t.startsWith("--icon-size-"))
      .sort();
    expect(live).toEqual(Object.keys(FROZEN).sort());
  });

  it(".ui-scale-fixed still pins the icon axis to baseline", () => {
    // Chrome that must not resize with density (the AppShell topbar, the search palette)
    // re-declares the --scaling-derived tokens. Those re-declarations now read the scale too,
    // so this checks the pin survived the rewrite rather than becoming a no-op.
    const fixed = environment({ selectors: [":root", ".ui-scale-fixed"], scaling: "1.08" });
    expect(resolveToken("--control-icon-size", fixed)).toBe("1rem");
    expect(resolveToken("--control-icon-size-sm", fixed)).toBe("0.875rem");
  });
});

describe("icon size — tier 2, the per-instance escape hatch (gh#326)", () => {
  /**
   * WHERE THE BOUNDARY SITS
   *   tier 1 — the value appears in more than one place. It earns a name on the scale, and a
   *            service retunes it once.
   *   tier 2 — the value appears in exactly ONE place. The 6px status dot is the case: it will
   *            never be on any icon scale, and it is a real need. Set that component's own
   *            `--*-icon-size` / `--*-glyph-size` token at the call site
   *            (`style={{ "--menu-icon-size": "6px" }}`, or a `[data-…]`-scoped rule in the app
   *            theme). An inline custom property wins by inheritance proximity — no
   *            `!important`, no `:root` override, no fork.
   *
   * That route only stays open while the rules that size icons read their token through `var()`.
   * The moment one bakes a literal — `width: 1rem` next to the token, a Tailwind `size-4`, or a
   * fallback like `var(--menu-icon-size, 1rem)` that a `:root` declaration makes unreachable —
   * the call site loses. These two tests are the lock on that.
   */
  const styleFiles = globSync("src/styles/**/*.css").sort();

  /**
   * Rules whose SELECTOR names an icon and that set a box size with a literal. A consumer
   * cannot reach any of these at any price: there is no token to set at the call site, so the
   * only routes left are `!important` or forking the stylesheet — precisely the two things
   * tier 2 exists to make unnecessary.
   *
   * These seven predate gh#326 and are frozen, not fixed. Minting a token for each means new
   * declarations across five component tier files and a re-baseline of
   * `scripts/no-hardcoded-css-values.baseline.json` (that ratchet fails when a count drops
   * without a re-baseline), which is a different owner's change. Two of them are worse than
   * merely unreachable and should be fixed first — `0.9rem` is 14.4px and `1.125rem` is 18px,
   * neither on the scale, both landing a stroked glyph on a half pixel.
   *
   * The list may only SHRINK. A new literal-sized icon rule fails this test.
   */
  const KNOWN_UNREACHABLE = [
    'src/styles/alert-layout.css [data-slot="alert-icon"] 1.25rem',
    'src/styles/badge-layout.css [data-slot="badge-icon"] 0.75rem',
    "src/styles/control.css .ui-otp-separator-icon 1rem",
    "src/styles/navigation-layout.css .ui-menubar-sub-trigger-icon 1rem",
    "src/styles/navigation-layout.css .ui-navigation-menu-trigger-icon 0.9rem",
    "src/styles/shell-layout.css .tb-chip-icon 1.125rem",
    "src/styles/shell-layout.css .tb-icon-btn svg 1rem",
  ];

  it("no NEW icon rule bakes in a literal size (ratchet, may only shrink)", () => {
    const found = new Set<string>();
    for (const file of styleFiles) {
      const css = readFileSync(join(process.cwd(), file), "utf8").replace(
        /\/\*[\s\S]*?\*\//g,
        (c) => c.replace(/[^\n]/g, " "),
      );
      // `selector… { … }` — token blocks and these layout rules never nest braces.
      for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const selector = rule[1].trim().split("\n").pop()!.trim();
        if (!/icon|glyph/i.test(selector)) continue;
        for (const decl of rule[2].matchAll(
          /(?:inline-size|block-size|width|height)\s*:\s*([^;]+);/g,
        )) {
          const value = decl[1].trim();
          if (value.includes("var(--")) continue;
          if (!/\d(?:rem|px|em)\b/.test(value)) continue;
          found.add(`${file} ${selector.split(",")[0].trim()} ${value}`);
        }
      }
    }
    expect([...found].sort()).toEqual([...KNOWN_UNREACHABLE].sort());
  });

  it("no component TSX hard-codes an svg size class", () => {
    const tsx = globSync("src/components/**/*.tsx").filter((f) => !f.includes("__tests__"));
    const offenders: string[] = [];
    for (const file of tsx) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      for (const match of source.matchAll(/\[&_svg\]:(?:size|w|h)-([^\s"'`]+)/g)) {
        if (!match[1].startsWith("[var(--")) offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("icon axis hygiene (gh#327 / gh#328)", () => {
  it("no icon or glyph size reads the SPACING scale (gh#328 category error)", () => {
    // `--space-*` is `calc(<n> * var(--scaling))`. A glyph sized from it moves whenever density
    // is retuned, along an axis nobody chose. If an icon token WANTS density it says so itself:
    // `calc(var(--icon-size-lg) * var(--scaling))`.
    const crossAxis = iconDecls
      .filter((d) => /var\(--space-/.test(d.value))
      .map((d) => `${d.file}:${d.line} ${d.token}: ${d.value}`);
    expect(crossAxis).toEqual([]);
  });

  it("--control-icon-size is NOT shadowed — its foundation.css copy is .ui-scale-fixed", () => {
    // gh#327 reported foundation.css:376 as dead code beaten by components/control.css. It is
    // not: the foundation declarations live inside `.ui-scale-fixed`, a different element
    // entirely, and deleting them would silently un-pin the topbar from the density axis.
    // Recorded as a test so the deletion is never attempted a second time.
    for (const token of ["--control-icon-size", "--control-icon-size-sm"]) {
      const selectors = decls
        .filter((d) => d.token === token)
        .map((d) => `${d.file} ${d.selector}`);
      expect(selectors).toContain(`src/tokens/foundation.css .ui-scale-fixed`);
      expect(selectors).toContain(`src/tokens/components/control.css :root`);
      expect(selectors).not.toContain(`src/tokens/foundation.css :root`);
    }
  });

  it("counts the tokens that ARE shadowed across tier files (gh#327 sweep)", () => {
    // Nobody had counted. Two, both Banner, neither on the icon axis — feedback.css declares
    // them and banner.css (imported later) overrides, so the feedback copies never apply and
    // `--banner-border-width` reads a DIFFERENT value in each. Left for the owner of those
    // files; frozen here so a third one cannot appear unnoticed.
    const byKey = new Map<string, typeof decls>();
    for (const decl of decls) {
      if (decl.atRules.length > 0) continue;
      const key = `${decl.selector}|${decl.token}`;
      byKey.set(key, [...(byKey.get(key) ?? []), decl]);
    }
    const shadowed = [...byKey.values()]
      .filter((group) => new Set(group.map((d) => d.file)).size > 1)
      .map((group) => group[0].token)
      .sort();
    expect(shadowed).toEqual(["--banner-border-width", "--banner-radius"]);
  });
});
