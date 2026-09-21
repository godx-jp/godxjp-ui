/**
 * What the Theme Editor page needs that is NOT React: the repo's own brand derivation, the two
 * stylesheet facts it takes as arguments, and the ONE style object that makes a previewed seed
 * actually reach the components under it.
 *
 * `deriveBrand` is `scripts/gen-brand.mjs`'s body (src/tokens/__tests__/brand-derivation.ts).
 * Importing it — rather than porting it — is why the page's export and `pnpm gen:brand` emit the
 * same bytes for the same hex. `wcag-contrast.ts`'s own opening line says why there is one copy of
 * the luminance formula; this is the same argument one level up.
 */
import type { CSSProperties } from "react";

import {
  asTriplet,
  deriveBrand,
  triplet,
  type BrandChannels,
  type BrandTheme,
  type Hsl,
} from "../../src/tokens/__tests__/brand-derivation";

export {
  AA_TEXT,
  NON_TEXT,
  asTriplet,
  contrast,
  deriveBrand,
  hslToRgb,
  parseHex,
  toHex,
  toHsl,
  round,
} from "../../src/tokens/__tests__/brand-derivation";
export type {
  Brand,
  BrandChannels,
  BrandTheme,
  ContrastRow,
  Hsl,
} from "../../src/tokens/__tests__/brand-derivation";

/* ── what the stylesheet says, asked of the browser rather than copied here ─────────────────── */

/**
 * `gen:brand` reads `--background` and the three `-channels` expressions out of `foundation.css`
 * and `derived.css` with `node:fs`. A page has no filesystem, and a literal copied into this file
 * would be a third place the canvas colour lives — stale the first time someone retunes the spine.
 * So the page asks the DOCUMENT, which is the same declarations after the same cascade.
 *
 * The CANVASES come from the CSSOM rather than `getComputedStyle`, because the page needs BOTH at
 * once and an element can only be in one theme at a time: read live, a page rendered under
 * `data-theme="dark"` would report the dark canvas as the light one and the whole dark-seed search
 * would target the wrong number, silently. The CSSOM carries both declarations side by side no
 * matter which theme is on screen.
 *
 * The CHANNELS are the opposite case: `--primary-hover-darken-channels` and its three siblings are
 * declared once at `:root` and never re-scoped (`.dark` only repoints `--primary-hover-channels`
 * AT one of them), so a computed read is correct under any theme and is one line instead of a walk.
 */
export type ThemeSpine = { lightCanvas: Hsl; darkCanvas: Hsl; channels: BrandChannels };

/** Every style rule in the document, walking into `@layer` / `@media` / `@supports` and nesting. */
function* styleRules(rules: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of Array.from(rules)) {
    if ("selectorText" in rule) yield rule as CSSStyleRule;
    const nested = (rule as CSSGroupingRule).cssRules;
    if (nested) yield* styleRules(nested);
  }
}

/** The LAST `--background` declared by a rule this selector test accepts — cascade order. */
function canvasFrom(accepts: (selector: string) => boolean): Hsl | null {
  let found: Hsl | null = null;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      /* A cross-origin sheet refuses `cssRules`. Ours are same-origin; skip anything else. */
      continue;
    }
    for (const rule of styleRules(rules)) {
      if (!accepts(rule.selectorText)) continue;
      const value = rule.style.getPropertyValue("--background").trim();
      if (!value) continue;
      try {
        found = triplet(value);
      } catch {
        /* Not a plain `H S% L%` triple — not a canvas this derivation can use. */
      }
    }
  }
  return found;
}

/**
 * The probe fallback, for the one case the CSSOM cannot answer: a sheet the document can paint from
 * but not read. It costs a layout, so it only runs when the walk came back empty.
 */
function canvasByProbe(dark: boolean): Hsl | null {
  const probe = document.createElement("div");
  if (dark) probe.className = "dark";
  document.body.append(probe);
  try {
    const value = getComputedStyle(probe).getPropertyValue("--background").trim();
    return value ? triplet(value) : null;
  } catch {
    return null;
  } finally {
    probe.remove();
  }
}

const channel = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** The spine this document is actually painting, or `null` when it cannot be read at all. */
export function readThemeSpine(): ThemeSpine | null {
  const lightCanvas = canvasFrom((s) => s.trim() === ":root") ?? canvasByProbe(false);
  const darkCanvas = canvasFrom((s) => /\[data-theme=["']?dark/.test(s)) ?? canvasByProbe(true);
  const channels: BrandChannels = {
    hoverDarken: channel("--primary-hover-darken-channels"),
    activeDarken: channel("--primary-active-darken-channels"),
    hoverLighten: channel("--primary-hover-lighten-channels"),
  };
  if (!lightCanvas || !darkCanvas) return null;
  if (!channels.hoverDarken || !channels.activeDarken || !channels.hoverLighten) return null;
  return { lightCanvas, darkCanvas, channels };
}

/* ── the scope a preview pane declares ──────────────────────────────────────────────────────── */

/**
 * THE THREE TOKENS `gen:brand` EMITS ARE THE THREE A SCOPE MUST DECLARE, and that is not a
 * coincidence — it is the freeze rule (docs/TOKENS.md) read from the other end.
 *
 * `--primary` and `--primary-foreground` are ordinary roles: declare them on the pane and every
 * descendant paints from them, including `--primary-hover` and `--text-link`, which are `initial`
 * knobs whose defaults re-resolve at the element that paints (gh#678, gh#664). Writing THOSE here
 * is the drift `gen:brand` refuses to emit, so this does not write them either.
 *
 * `--ring` is the one that bites. `derived.css` declares `--ring: var(--primary)` — and a `var()`
 * substitutes where it is DECLARED, so at `:root` it computed against the package's own seed and
 * inherits that frozen answer into every subtree. The dark pane escapes by accident (it carries
 * `.dark`, and `derived.css` re-declares `--ring: var(--primary)` in that block too, which
 * re-substitutes on the pane); the LIGHT pane does not, and a focus ring in the old brand colour
 * on a re-themed button is exactly the defect. `derived.css` says so in as many words: "a
 * `--primary` scoped BELOW `<html>` does not reach `--ring` … a nested scope sets `--ring`
 * itself". So both panes set it, which is also what a consumer's `:root` gets from `gen:brand`.
 *
 * The `-channels` PAIR is written only when the seed's label runs against the theme's default,
 * because that is the one thing CSS cannot infer: the label decides which way a state steps, and
 * only the author knows the label. It is a role-mirror, so it is written as `var(--…-channels)`
 * and never as a resolved literal.
 */
export function previewScope(theme: BrandTheme): CSSProperties {
  const scope: Record<string, string> = {
    "--primary": asTriplet(theme.seed),
    "--primary-foreground": asTriplet(theme.label),
    "--ring": asTriplet(theme.seed),
  };
  if (theme.repointsChannels) {
    scope["--primary-hover-channels"] = `var(--primary-hover-${theme.polarity}-channels)`;
    scope["--primary-active-channels"] = `var(--primary-active-${theme.polarity}-channels)`;
  }
  return scope as CSSProperties;
}

/* ── the seeds a demo must not avoid ────────────────────────────────────────────────────────── */

/**
 * AN EDITOR THAT ONLY DEMOS A NICE BLUE PROVES NOTHING. Each of these is here because it produces
 * an answer the happy path hides; `hex` is the only input, everything else is measured.
 */
export type SeedPreset = {
  id: "godx" | "blue" | "very-light" | "very-dark" | "sunflower";
  hex: string;
};

export const SEED_PRESETS: SeedPreset[] = [
  /* The package's own `--primary`: the export must reproduce foundation.css's light block. */
  { id: "godx", hex: "#7A00FF" },
  /* An ordinary, well-behaved brand — every row clears, so a passing readout is visible too. */
  { id: "blue", hex: "#2563EB" },
  /* Near-white: the label flips to black and the fill cannot clear 3:1 on a near-white canvas. */
  { id: "very-light", hex: "#FFF9C4" },
  /* Near-black: the dark-seed search runs all the way to pure white to hold parity. */
  { id: "very-dark", hex: "#0B0B14" },
  /* A dark label in light and a light label in dark — the seed that repoints the `-channels`
   * pair in BOTH theme blocks, which nothing else here exercises. */
  { id: "sunflower", hex: "#F5D60A" },
];

/** One place that knows how a hex becomes a brand, so the page never calls `deriveBrand` twice. */
export function brandFor(
  spine: ThemeSpine,
  hex: string,
  name: string,
  foreground: string | null,
  darkLightness: number | null,
) {
  return deriveBrand({ hex, name, foreground, darkLightness, ...spine });
}

/**
 * THE COMMAND THAT REPRODUCES THIS EXPORT, or `null` when nothing does.
 *
 * The seed and the forced label are both `gen:brand` flags, so those exports are byte-identical to
 * what the CLI writes and the page can say which command to run. An AUTHORED dark lightness is
 * not: the generator searches for parity and has no flag to override it, so the page has to stop
 * claiming agreement rather than print a command that emits something else.
 */
export function genBrandCommand(
  hex: string,
  name: string,
  foreground: string | null,
  darkLightnessOverridden: boolean,
): string | null {
  if (darkLightnessOverridden) return null;
  const flags = foreground ? ` --foreground '${foreground}'` : "";
  return `pnpm gen:brand '${hex}' --name ${name}${flags}`;
}
