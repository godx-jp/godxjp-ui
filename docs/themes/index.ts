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
  /**
   * The LIGHTEST surface brand INK lands on in this theme, as hex — handed to `tenantTheme` as
   * `options.surface`. `null` means the library's own light default (`--accent` #ebe9e5).
   *
   * `tenantTheme` walks the three brand inks AWAY from a surface until they clear 4.5:1, and it
   * has to be told which surface, because it emits them as literals in `style` — which outrank a
   * theme's own `--text-link` however carefully the theme declared it. Omitting this on a DARK
   * theme is not a missing nicety, it is the ink walked the WRONG WAY: measured on glass/citron,
   * `tenantTheme(#FFD400)` alone emitted `--text-link: 49.88 100% 24.4%` — rgb(124,103,0), walked
   * dark for the light default — over a #3b382b panel, so `Button variant="link"` and a `Text`
   * link both read **2.09:1** while the theme's own `--foreground` next to them was near-white.
   * The library says so at `src/app/tenant-theme.ts`: "a region inside a DARK theme must pass the
   * dark surface or its ink is walked the wrong way."
   *
   * WHY ONE HEX COVERS FIVE SEEDS. Every glass surface is a translucent white over
   * `--background`, which derives its hue from the seed, so the composited panel moves per seed.
   * Composited and measured across all five: card #312b3b..#3b382b, popover #434851..#514f43,
   * accent #482d76..#766a2d, muted #232a39..#393523. The value below is the LIGHTEST of the
   * twenty — glass/citron's `--accent` — because ink walked away from a dark surface goes
   * lighter, and lighter ink on a DARKER surface only gains contrast. Clearing the worst case
   * clears all of them.
   *
   * A PAIR, not one hex (gh#896): the surface above was measured while glass was reachable in ONE
   * polarity only — the whole theme rendered permanently dark (the bug gh#896 reports), so every
   * hex the paragraph above lists, `#766A2D` included, is a DARK-branch measurement with no light
   * counterpart. Now that polarity is addressable, both members below are `null` until a real
   * compositing measurement exists for EACH branch — the old single hex is not carried over into
   * either slot, because guessing which polarity it belongs to is exactly the mistake this pair
   * exists to prevent. `null` means the library's own default for that polarity (light `--accent`
   * #ebe9e5; dark reads the built-in dark spine).
   */
  inkSurface: { light: string | null; dark: string | null };
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
 * The polarity axis (gh#896): the library ships light AND dark, and until this row existed the lab
 * had no way to address the dark half of a theme × seed cell — a theme's dark branch could regress
 * silently because nothing ever asked for it. `id` is the exact string `applyThemeAxes`
 * (`src/app/theme-axes.ts`) resolves `data-theme` to, so it can be handed straight to
 * `AppProvider`'s own `setTheme` — never written to `document.documentElement` by this page itself.
 */
export type ModeRow = {
  /** Also the `?mode=` query value. */
  id: "light" | "dark";
  /** Message key for the switch label. */
  nameKey: string;
};

/**
 * Order is reading order in the switch. `base` leads because a control that is not first is a
 * control nobody looks at.
 */
export const THEMES: readonly ThemeRow[] = [
  {
    id: null,
    nameKey: "themeLab.theme.base.name",
    noteKey: "themeLab.theme.base.note",
    /* The package default IS this surface in both polarities, so there is nothing to override —
     * and measuring it anyway is what proves the method used for the other two rows. Compositing
     * every surface of this theme across five seeds returns #EBE9E5 light and #3C3A34 dark, which
     * are exactly `INK_SURFACE_LIGHT` in `src/app/tenant-theme.ts` and the hex its docblock names
     * for a dark theme. A probe that reproduces the library's own two answers is one whose answers
     * for glass and flat can be trusted. */
    inkSurface: { light: null, dark: null },
  },
  {
    id: "glass",
    nameKey: "themeLab.theme.glass.name",
    noteKey: "themeLab.theme.glass.note",
    /* Measured per branch, and the two are not the same KIND of number (see the type above).
     * `#766A2D` was right and stays on the dark side, where the hardest ground is the LIGHTEST
     * surface; the light side is #B59FDB, the DARKEST surface, because the ink walks the other
     * way there. Carrying one hex into both slots would have been wrong in exactly one of them. */
    inkSurface: { light: "#B59FDB", dark: "#766A2D" },
  },
  {
    id: "flat",
    nameKey: "themeLab.theme.flat.name",
    noteKey: "themeLab.theme.flat.note",
    /* Measured per branch now that flat has one. The light side is close enough to the package
     * default that omitting it would very nearly work (#E4E1EA against #EBE9E5, both far above the
     * pivot) — stated anyway, because "near enough to the default" is a fact about today's flat,
     * not a contract it holds anyone to. */
    inkSurface: { light: "#E4E1EA", dark: "#403D30" },
  },
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

/** `light` leads for the same reason `base` leads `THEMES`: the first option is the control. */
export const MODES: readonly ModeRow[] = [
  { id: "light", nameKey: "themeLab.mode.light" },
  { id: "dark", nameKey: "themeLab.mode.dark" },
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

/** Resolve `?mode=` back to a row, falling back to the first one (light). */
export function modeFromQuery(value: string | null): ModeRow {
  return MODES.find((row) => row.id === value) ?? MODES[0];
}
