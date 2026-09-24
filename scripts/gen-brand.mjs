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
 * WHAT THIS FILE IS, AND WHAT IT IS NOT. The derivation itself — the label threshold, the dark-seed
 * search, the ramp steps, and the exact bytes of both emitted files — lives in
 * `src/tokens/__tests__/brand-derivation.ts`, because it has a SECOND consumer: the docs Theme
 * Editor (`docs/foundation/theme-editor.tsx`) hands a brand author the same export from the same
 * hex, in a browser. Two implementations of "what does this seed become" is how a paste-able
 * export and a generated stylesheet start disagreeing about a brand. What is left here is the part
 * that is genuinely this script's: a CLI, the stylesheet READS the derivation needs as arguments,
 * two `writeFileSync` calls, and the console report.
 *
 * WHAT IT DELIBERATELY DOES NOT EMIT is documented at the emitter — `--primary-hover` and its
 * family derive from the `--primary` in scope (gh#678), and `--brand` is an independent identity
 * role (gh#250). Nothing here restates a formula.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── the repo's own derivation, bundled rather than restated ───────────────────────────────── */
/* esbuild via its JS API, not `node_modules/.bin/esbuild`.
 *
 * The bin path shipped once and failed on every CI runner with `spawnSync … esbuild ENOENT`, while
 * passing locally — esbuild was an undeclared TRANSITIVE peer of vite, so the bin link existed on
 * one machine's hoist and nowhere else. It is a declared devDependency now, and this imports the
 * package rather than guessing a path into node_modules, so "resolvable" is the same question npm
 * already answers. */
async function loadDerivation() {
  const out = join(tmpdir(), `godx-brand-derivation-${process.pid}.mjs`);
  await build({
    entryPoints: [join(ROOT, "src/tokens/__tests__/brand-derivation.ts")],
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

const { AA_TEXT, NON_TEXT, channelsOf, deriveBrand, toHex, triplet } = await loadDerivation();

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

/* ── what the STYLESHEETS say, read here because only this side has a filesystem ───────────── */
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

const derived = readFileSync(join(ROOT, "src/tokens/derived.css"), "utf8");
const derivedLight = derived.slice(derived.indexOf(":root {"), derived.indexOf("\n.dark,"));
const step = (pair) => channelsOf(`primary-${pair}`, derivedLight);

const brand = deriveBrand({
  hex,
  name,
  foreground: forcedForeground,
  lightCanvas: roleOf(blockOf(":root {"), "background"),
  darkCanvas: roleOf(blockOf('.dark,\n:root[data-theme="dark"] {'), "background"),
  channels: {
    hoverDarken: step("hover-darken"),
    activeDarken: step("active-darken"),
    hoverLighten: step("hover-lighten"),
  },
});

if (!brand.dark) {
  const [h, s] = brand.light.seed;
  console.error(
    `✗ gen:brand — no lightness at hue ${h}° / saturation ${s}% clears both ` +
      `${AA_TEXT}:1 on its own label and ${NON_TEXT}:1 on the dark canvas. This hue cannot carry a ` +
      `readable dark fill at that saturation: desaturate the seed, or pass --foreground to fix the ` +
      `label yourself and re-run.`,
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${name}.service.css`), brand.css);
writeFileSync(join(outDir, `${name}.email.ts`), brand.email);

/* ── the measurement, printed rather than claimed ──────────────────────────────────────────── */
const LABELS = {
  "label-on-fill-light": "primary label on fill (light)",
  "label-on-fill-dark": "primary label on fill (dark)",
  "fill-on-canvas-light": "primary fill on canvas (light)",
  "fill-on-canvas-dark": "primary fill on canvas (dark)",
  "link-on-canvas-light": "link ink on canvas (light)",
  "link-on-canvas-dark": "link ink on canvas (dark)",
};
console.log(`✓ gen:brand — ${name} from ${hex}\n`);
console.log(`  ${outDir}/${name}.service.css`);
console.log(`  ${outDir}/${name}.email.ts\n`);
console.log(
  `  light seed ${toHex(brand.light.seed)}  ·  dark seed ${toHex(brand.dark.seed)} (lifted ${brand.darkLift}%)`,
);
/* THE LABEL THIS GENERATOR CHOSE, PRINTED — because every "label on fill" row below is measured
 * against it, and a reader who ships a different one is reading a number about someone else's page
 * (gh#908). The label is DERIVED from the fill's luminance unless `--foreground` forces it, so a
 * brand whose guidelines mandate white can be handed a report full of ticks that were all measured
 * on black: #E8340D reports 4.92:1 here and measures 4.26:1 with a white label, and nothing in the
 * old output said which one it meant. */
console.log(
  `  label     ${toHex(brand.light.label)} (light)  ·  ${toHex(brand.dark.label)} (dark)` +
    `${forcedForeground ? "  — forced by --foreground" : "  — derived from the fill's luminance; pass --foreground to fix it yourself"}\n`,
);
let failed = 0;
for (const row of brand.report) {
  if (!row.ok) failed += 1;
  console.log(
    `  ${row.ok ? "✓" : "✗"} ${LABELS[row.id].padEnd(32)} ${row.measured}:1  (needs ${row.threshold}:1)`,
  );
}
if (failed) {
  console.error(
    `\n✗ ${failed} measurement(s) below threshold. The files were written so you can see the values, ` +
      `but this seed does not meet WCAG AA as-is — adjust the hex or pass --foreground.`,
  );
  process.exit(1);
}
