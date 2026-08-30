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
/**
 * Icon tokens deliberately NOT on the nine steps, each carrying a `scale-exempt:` reason beside
 * its declaration. Off-SCALE and off-GRID are different findings: a 14.4px stroked chevron lands
 * on half pixels and was snapped, while an 18px letter medallion is a whole pixel that simply
 * falls between two steps, and snapping it would be a visible 2px change bought for nothing.
 */
const DECLARED_OFF_SCALE = new Set(["--topbar-chip-icon-size"]);

const FROZEN: Record<string, [string, string, string]> = {
  "--alert-dismiss-icon-size": ["1rem", "1rem", "1rem"],
  "--calendar-chevron-size": ["1rem", "1rem", "1rem"],
  "--otp-separator-icon-size": ["1rem", "1rem", "1rem"],
  "--accordion-chevron-size": ["1rem", "1rem", "1rem"],
  "--carousel-arrow-icon-size": ["1rem", "1rem", "1rem"],
  "--sidebar-product-caret-icon-size": ["0.875rem", "0.875rem", "0.875rem"],
  "--topbar-icon-size": ["1rem", "1rem", "1rem"],
  "--topbar-caret-icon-size": ["0.75rem", "0.75rem", "0.75rem"],
  // Declared off-scale, on-grid: an 18px letter medallion, not a glyph.
  "--topbar-chip-icon-size": ["1.125rem", "1.125rem", "1.125rem"],
  // gh#333 — minted for a rule that baked `1.25rem`. Same step, so this row is a no-move row.
  "--alert-icon-size": ["1.25rem", "1.25rem", "1.25rem"],
  "--badge-icon-size": ["0.75rem", "0.75rem", "0.75rem"],
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
  // gh#333 — the ONE row in this table whose value MOVED. `.ui-navigation-menu-trigger-icon`
  // baked `0.9rem` = 14.4px: off the scale and off the pixel grid, so the chevron's stroke landed
  // on half pixels. Snapped to the nearest step, --icon-size-sm / 14px, a −0.4px change.
  "--navigation-menu-trigger-icon-size": ["0.875rem", "0.875rem", "0.875rem"],
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

// Must stay in step with the selector pattern in the ratchet below. They drifted apart once —
// the selector side learned `caret|chevron|arrow` while this stayed on `icon|glyph`, so
// `--accordion-chevron-size` was frozen in the table and invisible to the scanner reading it back.
// A token is an icon token by what it SIZES, not by whether someone happened to type "icon".
const ICON_TOKEN =
  /-(?:icon|glyph|caret|chevron|arrow)(?:-[a-z0-9]+)*-size(?:-[a-z0-9]+)?$|-(?:icon|glyph)-size(?:-[a-z0-9]+)?$/;
const decls = allDeclarations();

/**
 * Names the wider pattern matches that are NOT an icon's box, with the reason each is not.
 * Widening a pattern without widening the exclusions is how a guard starts reporting things it
 * was never asked about, and the first person to hit that noise is the one who silences it.
 */
const NOT_AN_ICON_BOX = new Set([
  "--topbar-chip-icon-font-size", // a TYPE size for the medallion's letter, not the box
  "--otp-caret-block-size", // a text cursor's height — it tracks a line box, not an icon
  "--otp-caret-inline-size", // a text cursor's 1px bar — that is a stroke, not an icon
]);

const iconDecls = decls.filter((d) => ICON_TOKEN.test(d.token) && !NOT_AN_ICON_BOX.has(d.token));

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
    // `scale-exempt:` is honoured here for the same reason `check-token-scale-bypass.mjs` honours
    // it: two authorities disagreeing about what is allowed is worse than either rule alone. A
    // value genuinely off the scale must be DECLARED, not forbidden — the topbar chip is an 18px
    // letter medallion, the OTP caret is a text cursor whose height tracks a line box. Both carry
    // their reason on the line above, and both are printed on a passing guard run.
    const source = new Map<string, string>();
    const raw = iconDecls
      .filter((d) => d.file.startsWith("src/tokens/components/"))
      .filter((d) => !d.value.includes("var(--"))
      .filter((d) => {
        const css = source.get(d.file) ?? readFileSync(join(process.cwd(), d.file), "utf8");
        source.set(d.file, css);
        const lines = css.split("\n");
        const here = lines[d.line - 1] ?? "";
        const above = lines[d.line - 2] ?? "";
        return !/scale-exempt:\s*\S/.test(here) && !/scale-exempt:\s*\S/.test(above);
      })
      .map((d) => `${d.file}:${d.line} ${d.token}: ${d.value}`);
    expect(raw).toEqual([]);
  });

  it("no icon token invents a value off the nine steps", () => {
    const steps = new Set(SCALE.map(([, value]) => value));
    const off = Object.entries(FROZEN)
      .filter(([token]) => !DECLARED_OFF_SCALE.has(token))
      .filter(([, [base]]) => !steps.has(base))
      .map(([token, [base]]) => `${token} = ${base}`);
    expect(off).toEqual([]);
  });

  it("every declared off-scale value carries its reason in the tier file", () => {
    // The exception is only legitimate because it is written down where the token is. If the
    // marker is ever deleted the value becomes an undeclared literal again, and this fails rather
    // than the exemption silently widening to cover it.
    for (const token of DECLARED_OFF_SCALE) {
      const file = iconDecls.find((d) => d.token === token)?.file;
      expect(file, `${token} is not declared in any tier file`).toBeDefined();
      const lines = readFileSync(join(process.cwd(), file!), "utf8").split("\n");
      const at = lines.findIndex((l) => l.includes(`${token}:`));
      expect(
        /scale-exempt:\s*\S/.test(lines[at - 1] ?? "") ||
          /scale-exempt:\s*\S/.test(lines[at] ?? ""),
        `${token} is off the scale with no scale-exempt reason beside it`,
      ).toBe(true);
    }
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
   * Seven predated gh#326. gh#333 closed four of them: the Alert tone glyph and the Badge glyph
   * got tokens of their own (--alert-icon-size, --badge-icon-size), the ContextMenu/Menubar
   * sub-trigger chevrons were pointed at --menu-icon-size — the knob DropdownMenu's chevron
   * already read, so all three menu surfaces now retune together — and the NavigationMenu trigger
   * chevron SNAPPED from `0.9rem` (14.4px, off the scale and off the pixel grid) to
   * --navigation-menu-trigger-icon-size = --icon-size-sm, 14px.
   *
   * The three left are blocked on token files gh#333 did not own:
   *   • `.ui-otp-separator-icon` needs --otp-separator-icon-size in components/control.css
   *   • `.tb-icon-btn svg` needs --topbar-icon-size in components/shell.css
   *   • `.tb-chip-icon` needs --topbar-chip-icon-size in components/shell.css, and it is NOT a
   *     snap case: 1.125rem is a whole 18px, and the box is a letter medallion (`display: grid`,
   *     `place-items: center`, a border-radius and `color: white`), not a stroked glyph — so it
   *     wants `scale-exempt`, not the nearest step.
   *
   * The list may only SHRINK. A new literal-sized icon rule fails this test.
   */
  // One entry, and it is not a missing token — it is DEAD CSS. Nothing renders `.ui-combobox-*`:
  // the ten rules in data-entry-layout.css style a component that no longer exists (the ARIA
  // `role="combobox"` on TreeSelect/TimePicker is unrelated, and applies no class). Giving a knob
  // to a rule nothing renders would document a capability the library does not have, so it stays
  // listed here until the dead block is removed. See the follow-up issue.
  const KNOWN_UNREACHABLE = ["src/styles/data-entry-layout.css .ui-combobox-caret 0.9rem"];

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
        // `caret|chevron|arrow` are here because the narrower `icon|glyph` pattern let an eighth
        // rule through for months: `.tb-chip-caret svg` sized a 12px glyph with a literal and the
        // ratchet never saw it, because the selector does not contain the word "icon". A guard
        // that recognises a thing by what it happens to be CALLED will keep missing the ones
        // named something else.
        // `caret|chevron|arrow` are here because the narrower `icon|glyph` pattern let five rules
        // through for months — `.tb-chip-caret svg`, `.ui-otp-caret`, `.ui-accordion-chevron`,
        // `.ui-carousel-arrow`, `.ui-combobox-caret` — every one of them sizing a glyph with a
        // literal, none of them containing the word "icon". A guard that recognises a thing by
        // what it happens to be CALLED will keep missing the ones named something else.
        //
        // The boundaries are load-bearing: a bare /arrow/ matches inside `--n-arrow-`, so
        // `.ui-page-container--narrow .ui-page-body { max-width: 42rem }` was reported as an
        // oversized icon. A guard that cries wolf is one someone eventually silences.
        if (!/(?:^|[^a-z])(?:icon|glyph|caret|chevron|arrow)(?:[^a-z]|$)/i.test(selector)) continue;
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
    // Nobody had counted. The sweep found two, both Banner, neither on the icon axis:
    // feedback.css declared them and banner.css (imported later) overrode, so the feedback
    // copies never applied and `--banner-border-width` read a DIFFERENT value in each — `0`
    // there against the `1px` that alert-layout.css actually paints. gh#333 deleted both dead
    // copies, leaving banner.css the single owner of the strip geometry. Verified by SELECTOR,
    // not just by import order: both sat at a bare `:root`, so they really did compete. Frozen
    // at zero so the next one cannot appear unnoticed.
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
    expect(shadowed).toEqual([]);
  });
});
