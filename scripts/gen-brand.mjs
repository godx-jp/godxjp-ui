#!/usr/bin/env node
/**
 * gen-brand — one hex in, a complete brand in every surface this design system paints.
 *
 * WHY THIS EXISTS. A consumer re-theming @godxjp/ui writes one file, and `src/theme/famgia.service.css`
 * is the shipped proof at 40 lines. But "one file" hides how many DECISIONS are in it, and two of
 * them cannot be made in CSS at all:
 *
 *   · EMAIL NEVER REBRANDS. `src/email/tokens.generated.ts` bakes literal hex at build time because
 *     Gmail strips <style> and Outlook ignores custom properties. A consumer's `--primary` reaches
 *     every screen and no inbox. `hslToHex` is exported for exactly this and documented for it, but
 *     a consumer still has to know that, and know which roles to map.
 *   · THE DARK SEED IS AUTHORED, NOT DERIVED. Nothing in CSS lifts a light seed onto the dark
 *     spine, so a brand file that sets `--primary` only in `:root` keeps the GoDX violet in dark
 *     mode — and nothing says so.
 *
 * So this emits both, from one `#rrggbb`, and MEASURES what it emits rather than asserting it.
 *
 * WHAT IT DELIBERATELY DOES NOT EMIT.
 *
 *   · `--primary-hover` / `--primary-active` / `--primary-border` / `--control-outline`.
 *     These DERIVE from the `--primary` in scope (src/tokens/derived.css, gh#678). Writing them is
 *     the drift `src/theme/famgia.service.css` still carries: literals pinned to a seed, which stop
 *     following the moment the seed moves. What this DOES emit, when the label polarity is not the
 *     theme's default, is the `-channels` pair — the one thing CSS cannot infer, because it is the
 *     label that decides which way a state steps, and only the author knows the label.
 *   · `--brand` / `--brand-foreground`. The IDENTITY role is independent of the action colour on
 *     purpose (gh#250), and `src/tokens/__tests__/brand-identity-role.test.ts:143` asserts on the
 *     DECLARATION that `--brand` never reads `--primary`. A generator that re-tinted the logo from
 *     the button colour would be overwriting a decision, not filling a gap.
 *
 * THE DERIVATION IS THE REPO'S OWN. Hex→HSL and the label choice are `applyPrimaryColor`'s
 * (src/app/theme-axes.ts) — the same luminance 0.179 threshold, so a runtime re-theme and a
 * generated stylesheet cannot disagree. The ramp steps come from `derived.css`'s `-channels`
 * formulas, evaluated by `src/tokens/__tests__/wcag-contrast.ts`'s `relative()` — the evaluator
 * `derived-seed-sweep.test.ts` already holds the CSS to. Nothing here restates a formula.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── the repo's own colour maths, bundled rather than restated ─────────────────────────────── */
/* esbuild via its JS API, not `node_modules/.bin/esbuild`.
 *
 * The bin path shipped once and failed on every CI runner with `spawnSync … esbuild ENOENT`, while
 * passing locally — esbuild was an undeclared TRANSITIVE peer of vite, so the bin link existed on
 * one machine's hoist and nowhere else. It is a declared devDependency now, and this imports the
 * package rather than guessing a path into node_modules, so "resolvable" is the same question npm
 * already answers. */
async function loadContrastHelpers() {
  const out = join(tmpdir(), `godx-brand-wcag-${process.pid}.mjs`);
  await build({
    entryPoints: [join(ROOT, "src/tokens/__tests__/wcag-contrast.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    packages: "external",
    logLevel: "error",
    outfile: out,
  });
  try {
    return await import(`file://${out}`);
  } finally {
    rmSync(out, { force: true });
  }
}

const { contrast, hslToRgb, luminance, relative, triplet, channelsOf } =
  await loadContrastHelpers();

/* ── arguments ─────────────────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const at = argv.indexOf(`--${name}`);
  return at === -1 ? fallback : argv[at + 1];
};
const hex = argv.find((a) => a.startsWith("#")) ?? null;
const name = flag("name", "brand");
const outArg = flag("out", ".");
const outDir = isAbsolute(outArg) ? outArg : join(process.cwd(), outArg);
const forcedForeground = flag("foreground");

if (!hex || !/^#[\da-f]{6}$/i.test(hex)) {
  console.error(
    "usage: pnpm gen:brand '#RRGGBB' [--name <slug>] [--out <dir>] [--foreground '#RRGGBB']\n\n" +
      "  #RRGGBB       the brand's action colour — what a primary button is filled with.\n" +
      "  --name        file stem for the emitted theme (default: brand).\n" +
      "  --out         directory to write into (default: the working directory).\n" +
      "  --foreground  force the label colour instead of letting luminance choose it.",
  );
  process.exit(1);
}

/* ── hex → HSL and the label, exactly as applyPrimaryColor does it ─────────────────────────── */
/* 0–255 throughout, the convention src/tokens/__tests__/wcag-contrast.ts uses. (applyPrimaryColor
 * works in 0–1; mixing the two silently produces a luminance off by 255 and a hex of the wrong
 * length, which is how the first run of this generator printed a 13-digit colour.) */
const parse = (value) => [1, 3, 5].map((o) => parseInt(value.slice(o, o + 2), 16));
const toHsl = ([r255, g255, b255]) => {
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
};
const toHex = ([h, s, l]) =>
  `#${hslToRgb([h, s, l])
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
const round = ([h, s, l]) => [Number(h.toFixed(1)), Number(s.toFixed(1)), Number(l.toFixed(1))];
const asTriplet = ([h, s, l]) => `${h} ${s}% ${l}%`;

const seedRgb = parse(hex);
const lightSeed = round(toHsl(seedRgb));

/* The label is chosen by the SEED's luminance, not by the theme — `applyPrimaryColor`'s 0.179
 * threshold, which is the sRGB midpoint where black and white swap places. */
const labelFor = (rgb) =>
  (forcedForeground && parse(forcedForeground)) ||
  (luminance(rgb) > 0.179 ? [0, 0, 0] : [255, 255, 255]);

/* ── the dark seed, MEASURED rather than guessed ───────────────────────────────────────────── */
const foundation = readFileSync(join(ROOT, "src/tokens/foundation.css"), "utf8");
const blockOf = (selector) => {
  const at = foundation.indexOf(selector);
  if (at === -1) throw new Error(`gen-brand: selector not found in foundation.css: ${selector}`);
  const open = foundation.indexOf("{", at);
  return foundation.slice(open + 1, foundation.indexOf("\n}", open));
};
const roleOf = (body, role) => {
  const m = new RegExp(`^\\s*--${role}:\\s*([\\d.]+\\s+[\\d.]+%\\s+[\\d.]+%)\\s*;`, "m").exec(body);
  if (!m) throw new Error(`gen-brand: --${role} is not a plain triplet in foundation.css`);
  return triplet(m[1]);
};
const darkCanvas = roleOf(blockOf('.dark,\n:root[data-theme="dark"] {'), "background");
const lightCanvas = roleOf(blockOf(":root {"), "background");

const AA_TEXT = 4.5;
const NON_TEXT = 3; /* WCAG 1.4.11 — a control's fill against the surface behind it */

/**
 * Nothing in CSS lifts a light seed onto the dark spine, so the dark `--primary` is authored in
 * every theme file in this repo. Authoring it by eye is what produces a brand that is AA in light
 * and unreadable in dark, so it is SEARCHED here — hold the hue and saturation that make it the
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
function darkSeedFor([h, s]) {
  const target = contrast(hslToRgb(lightSeed), hslToRgb(lightCanvas));
  let best = null;
  for (let step = 0; step <= 1000; step += 1) {
    const l = Number((step / 10).toFixed(1));
    const fill = [h, s, l];
    const rgb = hslToRgb(fill);
    if (contrast(rgb, labelFor(rgb)) < AA_TEXT) continue;
    const onCanvas = contrast(rgb, hslToRgb(darkCanvas));
    if (onCanvas < NON_TEXT) continue;
    const distance = Math.abs(onCanvas - target);
    if (!best || distance < best.distance) best = { fill, distance };
  }
  return best?.fill ?? null;
}

const darkSeed = darkSeedFor(lightSeed);
if (!darkSeed) {
  console.error(
    `✗ gen:brand — no lightness at hue ${lightSeed[0]}° / saturation ${lightSeed[1]}% clears both ` +
      `${AA_TEXT}:1 on its own label and ${NON_TEXT}:1 on the dark canvas. This hue cannot carry a ` +
      `readable dark fill at that saturation: desaturate the seed, or pass --foreground to fix the ` +
      `label yourself and re-run.`,
  );
  process.exit(1);
}

/* ── the brand text roles, from derived.css's own channel formulas ─────────────────────────── */
const derived = readFileSync(join(ROOT, "src/tokens/derived.css"), "utf8");
const derivedLight = derived.slice(derived.indexOf(":root {"), derived.indexOf("\n.dark,"));
const step = (pair) => channelsOf(`primary-${pair}`, derivedLight);

const lightLabel = labelFor(seedRgb);
const darkLabel = labelFor(hslToRgb(darkSeed));
const polarity = (label) => (luminance(label) > 0.5 ? "darken" : "lighten");

/* `--text-link` / `--text-brand` are one ramp step off the action colour and `--text-primary` is
 * the pressed step — derived.css says so in as many words ("identity v2.3 gives #6400D4 one step
 * below the action bg and #5200B0 as action.primary.pressed, which this repo already carries as
 * --text-brand and --text-primary"). They are AUTHORED roles rather than derived ones, which is
 * how `--text-link` spent a release on the pre-v2.3 blue after the seed moved (gh#664). Generating
 * them from the same formulas is what keeps a consumer off that path. */
/* THE TWO THEMES DO NOT USE THE SAME STEPS, and the repo's own authored values are why. In light,
 * the link ink is one step DOWN the ramp from the action colour and the pressed ink is two
 * (#6400D4 / #5200B0 — derived.css names both). In dark, the seed is already at the bright end, so
 * the link ink IS the seed and the pressed ink is the single hover step above it (#DCBCFF /
 * #E8DAFF). Applying the light mapping to dark would push a link PAST the seed, away from the only
 * anchor a reader has. These two rows reproduce foundation.css's dark block exactly on our own
 * seed, which is the check that they are the repo's rule and not a new one. */
const textRoles = (seed, theme) =>
  theme === "light"
    ? {
        "--text-link": round(relative(seed, step("hover-darken"))),
        "--text-brand": round(relative(seed, step("hover-darken"))),
        "--text-primary": round(relative(seed, step("active-darken"))),
      }
    : {
        "--text-link": round(seed),
        "--text-brand": round(seed),
        "--text-primary": round(relative(seed, step("hover-lighten"))),
      };

const lightText = textRoles(lightSeed, "light");
const darkText = textRoles(darkSeed, "dark");

/* The label polarity the THEME assumes: light darkens its states, dark lightens them. A seed whose
 * label runs the other way needs the pair repointed, and that is the one thing CSS cannot infer. */
const needsPolarity = (label, themeDefault) => polarity(label) !== themeDefault;

const themeBlock = (selector, seed, label, themeDefault, note) => {
  const lines = [
    `  /* ${note} */`,
    `  --primary: ${asTriplet(seed)}; /* ${toHex(seed)} */`,
    `  --primary-foreground: ${asTriplet(round(toHsl(label)))};`,
    `  --ring: ${asTriplet(seed)};`,
  ];
  if (needsPolarity(label, themeDefault)) {
    const p = polarity(label);
    lines.push(
      "",
      `  /* This seed's label is ${p === "darken" ? "DARK" : "LIGHT"}, which is not this theme's default, so the`,
      `   * interaction states must step the other way — towards contrast, never towards the label. */`,
      `  --primary-hover-channels: var(--primary-hover-${p}-channels);`,
      `  --primary-active-channels: var(--primary-active-${p}-channels);`,
    );
  }
  /* THE BRAND TEXT ROLES ARE NOT WRITTEN. They derive from the `--primary` in scope exactly as the
   * interaction states do (gh#664), so a literal here would pin them to this seed and stop them
   * following the next change — the same regression this generator already refuses for
   * --primary-hover. They ARE measured and reported below, because a brand author has to see the
   * link ink clear AA even though they never type it. */
  return `${selector} {\n${lines.join("\n")}\n}`;
};

/* ── output ────────────────────────────────────────────────────────────────────────────────── */
const css = `/* ${name} — generated by \`pnpm gen:brand ${hex}\`. Re-run it rather than editing by hand.
 *
 * Every value here derives from ONE seed, ${hex}, using @godxjp/ui's own formulas. What is NOT
 * here is deliberate: --primary-hover, --primary-active, --primary-border and --control-outline
 * derive from the --primary in scope at the element that paints them, so writing them would pin
 * them to this seed and stop them following a later change. --brand is absent too: the identity
 * role is independent of the action colour on purpose (gh#250).
 *
 * To re-theme further, set any role below @godxjp/ui documents — an explicit value always wins
 * over a derived default. See docs/CUSTOMER-THEMING.md.
 */
@import "@godxjp/ui/styles";

${themeBlock(":root", lightSeed, lightLabel, "darken", "Light (default)")}

${themeBlock('.dark,\n:root[data-theme="dark"]', darkSeed, darkLabel, "lighten", `Dark — the seed lifted ${(darkSeed[2] - lightSeed[2]).toFixed(1)}% in lightness, hue and saturation held`)}
`;

/* EMAIL IS THE SURFACE CSS CANNOT REACH. Gmail strips <style> and Outlook ignores custom
 * properties, so `src/email/tokens.generated.ts` bakes literal hex at BUILD time — from this
 * repo's seeds, which means a consumer's brand reaches every screen and no inbox. `hslToHex` is
 * exported and documented for exactly this case; what a consumer lacks is knowing WHICH roles to
 * map. This is that map, resolved. */
const emailRoles = {
  primary: asTriplet(lightSeed),
  primaryForeground: asTriplet(round(toHsl(lightLabel))),
  focusRing: asTriplet(lightSeed),
};
const emailTs = `// ${name} email palette — generated by \`pnpm gen:brand ${hex}\`. Re-run, do not edit.
//
// HTML email cannot read a custom property, so @godxjp/ui bakes its own palette to literal hex at
// build time (src/email/tokens.generated.ts). That baked palette carries GODX's seed, not yours —
// which is why a re-themed product still sends GoDX-violet mail. Spread this over EMAIL_COLORS to
// correct the brand-coloured slots; every other slot is neutral and needs no override.
//
//   import { EMAIL_COLORS } from "@godxjp/ui/email";
//   const palette = { ...EMAIL_COLORS, ...${name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_EMAIL_COLORS };
//
import { hslToHex } from "@godxjp/ui/email";

export const ${name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_EMAIL_COLORS = {
${Object.entries(emailRoles)
  .map(([slot, value]) => `  ${slot}: hslToHex("${value}"),`)
  .join("\n")}
} as const;
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${name}.service.css`), css);
writeFileSync(join(outDir, `${name}.email.ts`), emailTs);

/* ── the measurement, printed rather than claimed ──────────────────────────────────────────── */
const ratio = (a, b) => contrast(hslToRgb(a), hslToRgb(b)).toFixed(2);
const report = [
  ["primary label on fill (light)", ratio(lightSeed, round(toHsl(lightLabel))), AA_TEXT],
  ["primary label on fill (dark)", ratio(darkSeed, round(toHsl(darkLabel))), AA_TEXT],
  ["primary fill on canvas (light)", ratio(lightSeed, lightCanvas), NON_TEXT],
  ["primary fill on canvas (dark)", ratio(darkSeed, darkCanvas), NON_TEXT],
  ["link ink on canvas (light)", ratio(lightText["--text-link"], lightCanvas), AA_TEXT],
  ["link ink on canvas (dark)", ratio(darkText["--text-link"], darkCanvas), AA_TEXT],
];
console.log(`✓ gen:brand — ${name} from ${hex}\n`);
console.log(`  ${outDir}/${name}.service.css`);
console.log(`  ${outDir}/${name}.email.ts\n`);
console.log(
  `  light seed ${toHex(lightSeed)}  ·  dark seed ${toHex(darkSeed)} (lifted ${(darkSeed[2] - lightSeed[2]).toFixed(1)}%)\n`,
);
let failed = 0;
for (const [label, measured, threshold] of report) {
  const ok = Number(measured) >= threshold;
  if (!ok) failed += 1;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(32)} ${measured}:1  (needs ${threshold}:1)`);
}
if (failed) {
  console.error(
    `\n✗ ${failed} measurement(s) below threshold. The files were written so you can see the values, ` +
      `but this seed does not meet WCAG AA as-is — adjust the hex or pass --foreground.`,
  );
  process.exit(1);
}
