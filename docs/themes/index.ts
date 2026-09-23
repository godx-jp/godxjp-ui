/**
 * The theme REGISTRY for `/showcase/theme-lab` — the one file a new theme touches.
 *
 * gh#882 asks that adding a theme mean "one new CSS file and one new row, never a page edit".
 * That is what this module is: the page imports `THEMES` and `SEEDS` and knows nothing else about
 * either. A new theme is
 *
 *   1. `docs/themes/<id>.css`, containing NOTHING but `--custom-property` declarations under
 *      `[data-theme-style="<id>"]`, and
 *   2. one row below (plus the side-effect import that puts the file in the bundle).
 *
 * WHY THE IMPORT IS WRITTEN OUT rather than globbed. `import.meta.glob` would make the row the
 * only edit, but it is a Vite-only form typed by `vite/client`, and `tsconfig.json` pins
 * `"types": ["node"]` — `tsconfig.docs.json` inherits that, so a glob here is a TS2339 that
 * `typecheck:docs` catches and no amount of local success hides. Two lines in one non-page file is
 * the honest cost of staying inside the type system the rest of `docs/**` is checked by.
 *
 * ── The constraint that makes this a MEASUREMENT (gh#882, and it is the whole exercise) ────────
 * A theme file may declare custom properties and nothing else: no `backdrop-filter:`, no
 * `background:`, no selector into a `.ui-*` class, no `className` or inline `style` on the page.
 * Where a look cannot be expressed that way, the RESULT is the gap — written down in
 * `docs/showcase/theme-lab.tsx`'s "what the token API could not reach" table — never worked around.
 *
 * ── Seeds ─────────────────────────────────────────────────────────────────────────────────────
 * The second half of gh#882: nothing proved the glass theme was not tuned to violet. Every seed
 * below goes through `tenantTheme(hex)` (`@godxjp/ui/app`), which returns the contrast-safe
 * `--primary` / `--primary-foreground` pair plus the hover and pressed steps as real triplets, and
 * the theme files derive their own decoration FROM `--primary` with CSS relative colour so the
 * whole page follows the seed rather than the seed following the theme.
 */
import "./glassmorphism.css";
import "./flat.css";

export type ThemeRow = {
  /**
   * The `data-theme-style` value, or `null` for the library's own default — the control. `null`
   * is a row, not a special case: the page writes the attribute either way and an attribute that
   * matches no selector is exactly "no theme".
   */
  id: string | null;
  /** Message key for the switch label. */
  nameKey: string;
  /** Message key for the one-line note under the switch. */
  noteKey: string;
};

export type SeedRow = {
  /** Stable id — also the `?seed=` query value, so a measurement can address it directly. */
  id: string;
  /** The customer hex handed to `tenantTheme()`. */
  hex: string;
  /** Message key for the swatch label. */
  nameKey: string;
};

/**
 * Order is reading order in the switch. `base` leads because a control that is not first is a
 * control nobody looks at.
 */
export const THEMES: readonly ThemeRow[] = [
  { id: null, nameKey: "themeLab.theme.base.name", noteKey: "themeLab.theme.base.note" },
  { id: "glass", nameKey: "themeLab.theme.glass.name", noteKey: "themeLab.theme.glass.note" },
  { id: "flat", nameKey: "themeLab.theme.flat.name", noteKey: "themeLab.theme.flat.note" },
];

/**
 * Five seeds, chosen to break a theme rather than to flatter it: one cool default, one cool blue,
 * one warm, one at the very light end (`#FFD400`, L≈83% — a white label on it fails AA, so
 * `tenantTheme` picks black) and one at the very dark end (`#0A1F44`, L≈15% — the opposite).
 * A theme tuned to a mid-luminance violet fails at both ends, which is the point of including them.
 */
export const SEEDS: readonly SeedRow[] = [
  { id: "violet", hex: "#7C3AED", nameKey: "themeLab.seed.violet" },
  { id: "azure", hex: "#2563EB", nameKey: "themeLab.seed.azure" },
  { id: "coral", hex: "#E2564A", nameKey: "themeLab.seed.coral" },
  { id: "citron", hex: "#FFD400", nameKey: "themeLab.seed.citron" },
  { id: "navy", hex: "#0A1F44", nameKey: "themeLab.seed.navy" },
];

/** The `?theme=` value for a row — `"base"` stands in for the null id in the URL. */
export const themeQueryValue = (row: ThemeRow): string => row.id ?? "base";

/** Resolve `?theme=` back to a row, falling back to the first one. */
export function themeFromQuery(value: string | null): ThemeRow {
  return THEMES.find((row) => themeQueryValue(row) === value) ?? THEMES[0];
}

/** Resolve `?seed=` back to a row, falling back to the first one. */
export function seedFromQuery(value: string | null): SeedRow {
  return SEEDS.find((row) => row.id === value) ?? SEEDS[0];
}
