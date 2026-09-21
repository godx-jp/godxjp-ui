/**
 * ONE SEED → ONE BRAND, derived once and consumed twice.
 *
 * This is the body of `scripts/gen-brand.mjs`, lifted out of it so that the docs Theme Editor
 * (`docs/foundation/theme-editor.tsx`) can emit the SAME bytes from the SAME hex. Two
 * implementations of "what does this seed become" is how a paste-able export and a generated
 * stylesheet start disagreeing about a brand — the same failure mode the sibling
 * `wcag-contrast.ts` opens with for the luminance formula, one level up.
 *
 * IT KNOWS NO ENVIRONMENT. The generator reads `foundation.css` and `derived.css` off disk; the
 * editor reads the same declarations out of the live CSSOM. Neither fact belongs here, so both
 * canvases and all three channel expressions arrive as ARGUMENTS. Nothing in this file touches
 * `node:fs`, `document`, or a literal copied out of a stylesheet.
 *
 * What it deliberately does not emit is documented where it is emitted — see the CSS banner below
 * and `docs/CUSTOMER-THEMING.md`: `--primary-hover` / `--primary-active` / `--primary-border` /
 * `--control-outline` DERIVE from the `--primary` in scope, and `--brand` is an independent
 * identity role (gh#250). A generator that wrote them would be pinning them to one seed.
 */
import { contrast, hslToRgb, luminance, relative } from "./wcag-contrast";

export type Hsl = [number, number, number];
export type Rgb = [number, number, number];

/** WCAG 2.2 SC 1.4.3 — a label on its own fill. */
export const AA_TEXT = 4.5;
/** WCAG 2.2 SC 1.4.11 — a control's fill against the surface behind it. */
export const NON_TEXT = 3;

/* ── hex ⇄ HSL, exactly as `applyPrimaryColor` does it ──────────────────────────────────────── */
/* 0–255 throughout, the convention `wcag-contrast.ts` uses. (`applyPrimaryColor` works in 0–1;
 * mixing the two silently produces a luminance off by 255 and a hex of the wrong length, which is
 * how the first run of the generator printed a 13-digit colour.) */

export function parseHex(value: string): Rgb | null {
  if (!/^#[\da-f]{6}$/i.test(value)) return null;
  return [1, 3, 5].map((o) => parseInt(value.slice(o, o + 2), 16)) as Rgb;
}

export function toHsl([r255, g255, b255]: Rgb): Hsl {
  const [r, g, b] = [r255 / 255, g255 / 255, b255 / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  const h =
    delta === 0
      ? 0
      : 60 *
        (max === r
          ? ((g - b) / delta + 6) % 6
          : max === g
            ? (b - r) / delta + 2
            : (r - g) / delta + 4);
  return [h, s * 100, l * 100];
}

export function toHex([h, s, l]: Hsl): string {
  return `#${hslToRgb([h, s, l])
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export const round = ([h, s, l]: Hsl): Hsl => [
  Number(h.toFixed(1)),
  Number(s.toFixed(1)),
  Number(l.toFixed(1)),
];

export const asTriplet = ([h, s, l]: Hsl): string => `${h} ${s}% ${l}%`;

/* ── the inputs a stylesheet owns ───────────────────────────────────────────────────────────── */

/**
 * The three `-channels` expressions this derivation needs, read from `derived.css`'s LIGHT block.
 *
 * The two themes do not use the same steps, and the repo's own authored values are why — see
 * `textRoles` below. All three are read from the light block because that is where all three are
 * declared as literals; `.dark` only repoints `--primary-hover-channels` at one of them.
 */
export type BrandChannels = {
  /** `--primary-hover-darken-channels` */
  hoverDarken: string;
  /** `--primary-active-darken-channels` */
  activeDarken: string;
  /** `--primary-hover-lighten-channels` */
  hoverLighten: string;
};

export type BrandInput = {
  /** The brand's action colour — what a primary button is filled with. `#rrggbb`. */
  hex: string;
  /** File stem / exported constant stem for the emitted theme. */
  name: string;
  /** Force the label colour instead of letting luminance choose it. `#rrggbb`. */
  foreground?: string | null;
  /** `--background` as declared at `:root`. */
  lightCanvas: Hsl;
  /** `--background` as declared at `.dark, :root[data-theme="dark"]`. */
  darkCanvas: Hsl;
  channels: BrandChannels;
  /**
   * AUTHOR THE DARK SEED'S LIGHTNESS INSTEAD OF SEARCHING FOR IT.
   *
   * Contrast parity with the light theme is the DEFAULT, not a law — the emitted file says in as
   * many words that an explicit override wins, and this package's own dark seed is an override:
   * #D8BCFF came from the published brand kit, hue-snapped, and reads 10.72:1 where light reads
   * 6.32:1. `gen:brand` has no flag for it because a generator cannot know a kit it was not given;
   * a person looking at both themes at once can, so the docs Theme Editor offers it.
   *
   * Hue and saturation are still held — they are what make it the brand. The WCAG floors that
   * CONSTRAIN the search do not constrain this: an authored value is allowed to fail, and the
   * report is how it says so.
   */
  darkLightness?: number | null;
};

/* ── the derivation ─────────────────────────────────────────────────────────────────────────── */

export type BrandTheme = {
  /** `--primary`. */
  seed: Hsl;
  /** `--primary-foreground`, as HSL. */
  label: Hsl;
  /** The label as the derivation chose it, 0–255, before the HSL round-trip. */
  labelRgb: Rgb;
  /** `darken` when the label is light-on-dark's opposite — the direction states must NOT step. */
  polarity: "darken" | "lighten";
  /** True when that polarity is not this theme's default, so the `-channels` pair must be written. */
  repointsChannels: boolean;
  /**
   * `--text-link` / `--text-brand` / `--text-primary`, MEASURED but never written: they derive
   * from the `--primary` in scope (gh#664), so a literal would pin them to this seed.
   */
  text: { link: Hsl; brand: Hsl; primary: Hsl };
};

export type ContrastRow = {
  /** Stable id — the caller owns the wording. */
  id:
    | "label-on-fill-light"
    | "label-on-fill-dark"
    | "fill-on-canvas-light"
    | "fill-on-canvas-dark"
    | "link-on-canvas-light"
    | "link-on-canvas-dark";
  /** The measured ratio, fixed to 2dp — the string BOTH consumers compare and print. */
  measured: string;
  threshold: number;
  ok: boolean;
};

export type Brand = {
  hex: string;
  name: string;
  light: BrandTheme;
  /**
   * `null` when no lightness at this hue/saturation clears both WCAG floors on the dark spine.
   * There is then no theme to emit, and `css` / `email` / `report` are `null` with it.
   */
  dark: BrandTheme | null;
  /**
   * The lightness contrast parity asks for, whether or not `darkLightness` overrode it — so a
   * caller can show how far an authored value has departed from the derived one, and offer it back.
   * `null` when no lightness at this hue clears both floors.
   */
  darkSearched: Hsl | null;
  /** How far the dark seed's lightness moved, fixed to 1dp. `null` with `dark`. */
  darkLift: string | null;
  css: string | null;
  email: string | null;
  report: ContrastRow[] | null;
};

/**
 * The label is chosen by the SEED's luminance, not by the theme — `applyPrimaryColor`'s 0.179
 * threshold, which is the sRGB midpoint where black and white swap places.
 */
function labelFor(rgb: Rgb, forced: Rgb | null): Rgb {
  return forced ?? (luminance(rgb) > 0.179 ? [0, 0, 0] : [255, 255, 255]);
}

const polarityOf = (label: Rgb): "darken" | "lighten" =>
  luminance(label) > 0.5 ? "darken" : "lighten";

/**
 * THE DARK SEED IS SEARCHED, NOT GUESSED.
 *
 * Nothing in CSS lifts a light seed onto the dark spine, so the dark `--primary` is authored in
 * every theme file in this repo. Authoring it by eye is what produces a brand that is AA in light
 * and unreadable in dark, so it is searched here — hold the hue and saturation that make it the
 * brand, and move only lightness.
 *
 * THE TARGET IS CONTRAST PARITY WITH THE LIGHT THEME: whatever the seed reads against the light
 * canvas, the dark seed should read against the dark one. That is a choice, and the repo's own two
 * seeds show why it has to be stated rather than discovered. `famgia` lands at 5.12:1 light and
 * 5.49:1 dark — parity, near enough. GoDX violet is 6.32:1 light and 10.72:1 dark, because its
 * dark value was TAKEN from the published brand kit (#D8BCFF, hue-snapped) rather than computed,
 * and a generator cannot know a kit it was not given. So parity is the default and the generated
 * file says plainly that an explicit override wins.
 *
 * Both WCAG floors are hard constraints on the search, not preferences: the label must clear AA on
 * the fill, and the fill must clear 3:1 on the canvas it sits on (1.4.11).
 */
function darkSeedFor(lightSeed: Hsl, input: BrandInput, forced: Rgb | null): Hsl | null {
  const [h, s] = lightSeed;
  const target = contrast(hslToRgb(lightSeed), hslToRgb(input.lightCanvas));
  let best: { fill: Hsl; distance: number } | null = null;
  for (let step = 0; step <= 1000; step += 1) {
    const l = Number((step / 10).toFixed(1));
    const fill: Hsl = [h, s, l];
    const rgb = hslToRgb(fill);
    if (contrast(rgb, labelFor(rgb, forced)) < AA_TEXT) continue;
    const onCanvas = contrast(rgb, hslToRgb(input.darkCanvas));
    if (onCanvas < NON_TEXT) continue;
    const distance = Math.abs(onCanvas - target);
    if (!best || distance < best.distance) best = { fill, distance };
  }
  return best?.fill ?? null;
}

/**
 * `--text-link` / `--text-brand` are one ramp step off the action colour and `--text-primary` is
 * the pressed step — `derived.css` says so in as many words ("identity v2.3 gives #6400D4 one step
 * below the action bg and #5200B0 as action.primary.pressed, which this repo already carries as
 * --text-brand and --text-primary"). They are AUTHORED roles rather than derived ones, which is
 * how `--text-link` spent a release on the pre-v2.3 blue after the seed moved (gh#664).
 *
 * THE TWO THEMES DO NOT USE THE SAME STEPS, and the repo's own authored values are why. In light,
 * the link ink is one step DOWN the ramp from the action colour and the pressed ink is two
 * (#6400D4 / #5200B0 — derived.css names both). In dark, the seed is already at the bright end, so
 * the link ink IS the seed and the pressed ink is the single hover step above it (#DCBCFF /
 * #E8DAFF). Applying the light mapping to dark would push a link PAST the seed, away from the only
 * anchor a reader has. These two rows reproduce foundation.css's dark block exactly on our own
 * seed, which is the check that they are the repo's rule and not a new one.
 */
function textRoles(
  seed: Hsl,
  theme: "light" | "dark",
  channels: BrandChannels,
): BrandTheme["text"] {
  return theme === "light"
    ? {
        link: round(relative(seed, channels.hoverDarken)),
        brand: round(relative(seed, channels.hoverDarken)),
        primary: round(relative(seed, channels.activeDarken)),
      }
    : {
        link: round(seed),
        brand: round(seed),
        primary: round(relative(seed, channels.hoverLighten)),
      };
}

function themeOf(
  seed: Hsl,
  labelRgb: Rgb,
  themeDefault: "darken" | "lighten",
  theme: "light" | "dark",
  channels: BrandChannels,
): BrandTheme {
  const polarity = polarityOf(labelRgb);
  return {
    seed,
    label: round(toHsl(labelRgb)),
    labelRgb,
    polarity,
    /* The label polarity the THEME assumes: light darkens its states, dark lightens them. A seed
     * whose label runs the other way needs the pair repointed, and that is the one thing CSS
     * cannot infer, because it is the label that decides which way a state steps. */
    repointsChannels: polarity !== themeDefault,
    text: textRoles(seed, theme, channels),
  };
}

function themeBlock(selector: string, theme: BrandTheme, note: string): string {
  const lines = [
    `  /* ${note} */`,
    `  --primary: ${asTriplet(theme.seed)}; /* ${toHex(theme.seed)} */`,
    `  --primary-foreground: ${asTriplet(theme.label)};`,
    `  --ring: ${asTriplet(theme.seed)};`,
  ];
  if (theme.repointsChannels) {
    lines.push(
      "",
      `  /* This seed's label is ${theme.polarity === "darken" ? "DARK" : "LIGHT"}, which is not this theme's default, so the`,
      `   * interaction states must step the other way — towards contrast, never towards the label. */`,
      `  --primary-hover-channels: var(--primary-hover-${theme.polarity}-channels);`,
      `  --primary-active-channels: var(--primary-active-${theme.polarity}-channels);`,
    );
  }
  /* THE BRAND TEXT ROLES ARE NOT WRITTEN. They derive from the `--primary` in scope exactly as the
   * interaction states do (gh#664), so a literal here would pin them to this seed and stop them
   * following the next change — the same regression this generator already refuses for
   * --primary-hover. They ARE measured and reported, because a brand author has to see the link
   * ink clear AA even though they never type it. */
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** The email constant's identifier stem — `acme-two` → `ACME_TWO`. */
export const emailConstantName = (name: string): string =>
  `${name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_EMAIL_COLORS`;

function cssFor(input: BrandInput, light: BrandTheme, dark: BrandTheme, lift: string): string {
  return `/* ${input.name} — generated by \`pnpm gen:brand ${input.hex}\`. Re-run it rather than editing by hand.
 *
 * Every value here derives from ONE seed, ${input.hex}, using @godxjp/ui's own formulas. What is NOT
 * here is deliberate: --primary-hover, --primary-active, --primary-border and --control-outline
 * derive from the --primary in scope at the element that paints them, so writing them would pin
 * them to this seed and stop them following a later change. --brand is absent too: the identity
 * role is independent of the action colour on purpose (gh#250).
 *
 * To re-theme further, set any role below @godxjp/ui documents — an explicit value always wins
 * over a derived default. See docs/CUSTOMER-THEMING.md.
 */
@import "@godxjp/ui/styles";

${themeBlock(":root", light, "Light (default)")}

${themeBlock('.dark,\n:root[data-theme="dark"]', dark, `Dark — the seed lifted ${lift}% in lightness, hue and saturation held`)}
`;
}

/**
 * EMAIL IS THE SURFACE CSS CANNOT REACH. Gmail strips `<style>` and Outlook ignores custom
 * properties, so `src/email/tokens.generated.ts` bakes literal hex at BUILD time — from this
 * repo's seeds, which means a consumer's brand reaches every screen and no inbox. `hslToHex` is
 * exported and documented for exactly this case; what a consumer lacks is knowing WHICH roles to
 * map. This is that map, resolved.
 */
function emailFor(input: BrandInput, light: BrandTheme): string {
  const roles = {
    primary: asTriplet(light.seed),
    primaryForeground: asTriplet(light.label),
    focusRing: asTriplet(light.seed),
  };
  const constant = emailConstantName(input.name);
  return `// ${input.name} email palette — generated by \`pnpm gen:brand ${input.hex}\`. Re-run, do not edit.
//
// HTML email cannot read a custom property, so @godxjp/ui bakes its own palette to literal hex at
// build time (src/email/tokens.generated.ts). That baked palette carries GODX's seed, not yours —
// which is why a re-themed product still sends GoDX-violet mail. Spread this over EMAIL_COLORS to
// correct the brand-coloured slots; every other slot is neutral and needs no override.
//
//   import { EMAIL_COLORS } from "@godxjp/ui/email";
//   const palette = { ...EMAIL_COLORS, ...${constant} };
//
import { hslToHex } from "@godxjp/ui/email";

export const ${constant} = {
${Object.entries(roles)
  .map(([slot, value]) => `  ${slot}: hslToHex("${value}"),`)
  .join("\n")}
} as const;
`;
}

function reportFor(input: BrandInput, light: BrandTheme, dark: BrandTheme): ContrastRow[] {
  const ratio = (a: Hsl, b: Hsl) => contrast(hslToRgb(a), hslToRgb(b)).toFixed(2);
  const rows: Array<[ContrastRow["id"], string, number]> = [
    ["label-on-fill-light", ratio(light.seed, light.label), AA_TEXT],
    ["label-on-fill-dark", ratio(dark.seed, dark.label), AA_TEXT],
    ["fill-on-canvas-light", ratio(light.seed, input.lightCanvas), NON_TEXT],
    ["fill-on-canvas-dark", ratio(dark.seed, input.darkCanvas), NON_TEXT],
    ["link-on-canvas-light", ratio(light.text.link, input.lightCanvas), AA_TEXT],
    ["link-on-canvas-dark", ratio(dark.text.link, input.darkCanvas), AA_TEXT],
  ];
  return rows.map(([id, measured, threshold]) => ({
    id,
    measured,
    threshold,
    ok: Number(measured) >= threshold,
  }));
}

/** One `#rrggbb` in, a complete brand out. Throws only on a hex this function cannot parse. */
export function deriveBrand(input: BrandInput): Brand {
  const seedRgb = parseHex(input.hex);
  if (!seedRgb) throw new Error(`deriveBrand: not a #rrggbb colour: ${input.hex}`);

  const forced = input.foreground ? parseHex(input.foreground) : null;
  const lightSeed = round(toHsl(seedRgb));
  const light = themeOf(lightSeed, labelFor(seedRgb, forced), "darken", "light", input.channels);

  const darkSearched = darkSeedFor(lightSeed, input, forced);
  const darkSeed: Hsl | null =
    input.darkLightness == null
      ? darkSearched
      : [lightSeed[0], lightSeed[1], Number(input.darkLightness.toFixed(1))];
  if (!darkSeed) {
    return {
      hex: input.hex,
      name: input.name,
      light,
      dark: null,
      darkSearched,
      darkLift: null,
      css: null,
      email: null,
      report: null,
    };
  }

  const dark = themeOf(
    darkSeed,
    labelFor(hslToRgb(darkSeed), forced),
    "lighten",
    "dark",
    input.channels,
  );
  const darkLift = (darkSeed[2] - lightSeed[2]).toFixed(1);

  return {
    hex: input.hex,
    name: input.name,
    light,
    dark,
    darkSearched,
    darkLift,
    css: cssFor(input, light, dark, darkLift),
    email: emailFor(input, light),
    report: reportFor(input, light, dark),
  };
}

/**
 * Re-exported so a consumer that must READ a stylesheet — `gen-brand.mjs` off disk, the docs Theme
 * Editor out of the live CSSOM — gets the very parsers this module's inputs are defined in terms
 * of, instead of writing a second one beside it.
 */
export { channelsOf, contrast, hslToRgb, relative, triplet } from "./wcag-contrast";
