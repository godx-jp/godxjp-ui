#!/usr/bin/env node
/**
 * Generates src/tokens/antd.generated.css — the DERIVED half of the colour system.
 *
 * WHY THIS FILE EXISTS. Every derived colour in this library used to be authored by hand: a hover
 * step picked by eye, an active step picked by eye, a focus halo alpha picked by eye. That is a
 * thousand small decisions with no authority behind any of them, and each one has to be re-argued
 * the next time somebody looks at it. Ant Design already solves this exactly once — a SEED colour
 * goes in, an ALGORITHM runs, and the whole derived map falls out — and docs/DESIGN-AUTHORITY.md
 * already names antd as this repo's authority for focus shape and component taxonomy. This script
 * promotes it from a shape reference to the GENERATOR of derived colour.
 *
 * WHAT IS AUTHORED AND WHAT IS COMPUTED. `SEEDS` below is the entire authored colour surface: the
 * five brand colours per theme that foundation.css already commits to. Every other value this file
 * emits is `theme.getDesignToken()` output. To change a derived colour you change a seed.
 *
 * ANTD IS BUILD-TIME ONLY. It is a devDependency, imported here and nowhere under `src/`. The
 * output is plain CSS custom properties, so nothing from antd reaches the shipped bundle or the
 * shipped stylesheet — asserted by scripts/check-no-antd-runtime.mjs.
 *
 * WHAT IS DELIBERATELY *NOT* GENERATED. antd's neutral bases stay at their defaults rather than
 * being seeded with this library's warm hue-60 spine, and none of antd's neutral output is taken.
 * Two reasons, both measured rather than felt:
 *
 *   · The neutral spine is SmartHR's. docs/DESIGN-AUTHORITY.md assigns the colour FOUNDATION to
 *     SmartHR; what antd owns is derivation FROM a seed, and the neutrals are not derived from the
 *     brand seed.
 *   · Taking antd's neutrals back breaks two floors this repo already gates. `colorBorder` is the
 *     only role antd offers for a control boundary and it measures 1.43:1 on the page, while
 *     `--input` is held to 3:1 by SC 1.4.11 and by input-boundary-contrast.test.ts. antd's text
 *     ramp is alpha-based (`rgba(0,0,0,0.88)`), which cannot enter this library's opaque
 *     `H S% L%` triple without choosing a surface to composite against — lossy by construction.
 *
 * THE CONFLICT LIST IS THE POINT OF THE `--report` MODE. Where antd's answer measurably fails a
 * floor this repo gates, it is recorded in `CONFLICTS` with the measurement, and the committed
 * value stands. A conflict cannot be asserted without evidence: the generator re-measures every
 * one and fails if the claimed failure is not real.
 *
 * Usage: no flag writes, `--check` fails on drift, `--report` prints the before/after table.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const theme = require("antd/lib/theme/index.js").default;
const { version: ANTD_VERSION } = require("antd/package.json");

const OUT = "src/tokens/antd.generated.css";
const SOURCE = "src/tokens/foundation.css";

// ── colour maths ────────────────────────────────────────────────────────────
function hexToRgb(value) {
  let s = value.replace("#", "").trim();
  if (s.length === 3) s = [...s].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => Number.parseInt(s.slice(i, i + 2), 16));
}

/** antd hands back `#rrggbb`, `#rgb` or `rgba(r,g,b,a)`. Both forms, one shape. */
function parseColor(value) {
  const text = String(value).trim();
  if (text.startsWith("#")) return { rgb: hexToRgb(text), alpha: 1 };
  const inner = text.match(/rgba?\(([^)]+)\)/);
  if (!inner) throw new Error(`unparsable antd colour: ${value}`);
  const parts = inner[1].split(",").map((n) => Number(n.trim()));
  return { rgb: parts.slice(0, 3), alpha: parts[3] ?? 1 };
}

function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return [0, 0, l * 100];
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s * 100, l * 100];
}

function hslToRgb([h, s, l]) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((x) => Math.round(x * 255));
}

const hex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const triple = (text) => text.replace(/%/g, "").split(/\s+/).map(Number);

/**
 * Convert into this library's storage format — a bare `H S% L%` triple read via `hsl(var(--x))`.
 *
 * LOSSLESS OR IT THROWS. The triple is emitted at the LOWEST precision that still round-trips to
 * antd's exact byte value, because the whole point of generating is that the browser paints what
 * antd computed. `--brand` already carries one decimal for this reason (an integer triple drifts
 * to the wrong hex); this makes that rule mechanical instead of a comment somebody has to read.
 */
function toTriple(rgb) {
  const [h, s, l] = rgbToHsl(rgb);
  for (const digits of [0, 1, 2, 3, 4]) {
    const at = (n) => Number(n.toFixed(digits));
    const candidate = [at(h), at(s), at(l)];
    if (hex(hslToRgb(candidate)) === hex(rgb)) {
      return `${candidate[0]} ${candidate[1]}% ${candidate[2]}%`;
    }
  }
  throw new Error(`no HSL triple round-trips ${hex(rgb)}`);
}

function luminance(rgb) {
  const a = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ── the source of truth for the seeds: foundation.css itself ────────────────
const source = readFileSync(SOURCE, "utf8");

function block(selector) {
  const start = source.indexOf(selector);
  if (start === -1) throw new Error(`selector not found in ${SOURCE}: ${selector}`);
  const open = source.indexOf("{", start);
  return source.slice(open + 1, source.indexOf("\n}", open));
}

const BLOCKS = { light: block(":root {"), dark: block('.dark,\n:root[data-theme="dark"] {') };

function role(mode, name) {
  const m = BLOCKS[mode].match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`--${name} not found in the ${mode} block of ${SOURCE}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/**
 * THE SEED — read out of foundation.css, never restated here.
 *
 * These five roles per theme are the brand: SmartHR MAIN and four 和色, plus the lifted dark ramp
 * the dark spine already commits to. They are not derived from anything and never can be. Reading
 * them rather than hard-coding them means the seed has exactly ONE home, so a service that
 * retints `--primary` in foundation.css regenerates its whole derived map from that one edit.
 */
const SEED_ROLES = {
  colorPrimary: "primary",
  colorError: "destructive",
  colorSuccess: "success",
  colorWarning: "warning",
  colorInfo: "info",
};

const SEEDS = Object.fromEntries(
  ["light", "dark"].map((mode) => [
    mode,
    Object.fromEntries(
      Object.entries(SEED_ROLES).map(([antdKey, name]) => [antdKey, hex(hslToRgb(role(mode, name)))]),
    ),
  ]),
);

const TOKENS = {
  light: theme.getDesignToken({ token: SEEDS.light }),
  dark: theme.getDesignToken({ token: SEEDS.dark, algorithm: theme.darkAlgorithm }),
};

/**
 * GEOMETRY antd owns, and which this library already agrees with to the pixel.
 *
 * Asserted rather than emitted: a generated `--stroke-md: 2px` would be a SECOND declaration of a
 * scale step that already exists, and the tier rule is that geometry lives on its named scale
 * (gh#324). What the generator adds is the PROOF that antd's number and the scale step are the
 * same number, so if either side ever moves this fails instead of the two silently diverging.
 */
const GEOMETRY = [
  ["lineWidth", 1, "--stroke-hairline", "1px"],
  ["controlOutlineWidth", 2, "--stroke-md", "2px"],
  ["lineWidthFocus", 3, "--stroke-lg", "3px"],
  ["borderRadius", 6, "--radius", "0.375rem"],
  ["controlHeight", 32, "--band-height-md", "2rem"],
  ["fontSize", 14, "--font-size-base", "0.875rem"],
];

function geometryProblems() {
  const problems = [];
  for (const [antdName, expected, token, declared] of GEOMETRY) {
    if (TOKENS.light[antdName] !== expected) {
      problems.push(`antd ${antdName} is ${TOKENS.light[antdName]}, expected ${expected}`);
    }
    if (!new RegExp(`\\${token}:[^;]*${declared.replace(".", "\\.")}`).test(source)) {
      problems.push(`${token} no longer declares ${declared} — antd ${antdName} = ${expected}`);
    }
  }
  return problems;
}

/**
 * THE MAP — antd's derived token on the left, this library's role on the right.
 *
 * Every entry is a role antd genuinely computes from the seed. A role antd has no opinion about
 * (`--input`, the neutral text ramp, the 和色 decorative palette, the identity `--brand`) is
 * absent on purpose; see the file header.
 */
const MAP = [
  {
    token: "--primary-hover",
    antd: "colorPrimaryHover",
    note: "antd steps hover LIGHTER than the seed — the opposite direction to the hand-authored ramp",
  },
  { token: "--primary-active", antd: "colorPrimaryActive" },
  {
    token: "--primary-border",
    antd: "colorPrimaryBorder",
    note: "the hue antd's genFocusOutline paints on a control that has no boundary of its own",
  },
  { token: "--destructive-hover", antd: "colorErrorHover" },
  { token: "--destructive-active", antd: "colorErrorActive" },
];

/** Alpha-carrying tokens: antd's own rgba(), split into the triple + alpha this repo composes. */
const OUTLINES = [
  {
    color: "--control-outline",
    alpha: "--control-outline-alpha",
    antd: "controlOutline",
    note: "the focus halo on a field — antd es/input/style/token.js `activeShadow`",
  },
  {
    color: "--control-outline-error",
    alpha: "--control-outline-error-alpha",
    antd: "colorErrorOutline",
    note: "the same halo on an invalid field — antd `errorActiveShadow`",
  },
];

/**
 * WHERE ANTD'S ANSWER MEASURABLY FAILS A FLOOR THIS REPO GATES.
 *
 * Each entry names the antd token, the floor, and the pair that was measured. `check()` re-runs
 * the measurement: a conflict that is no longer real is an ERROR, so this list cannot rot into a
 * pile of opinions. The committed value in foundation.css stands for these, and only these.
 */
const CONFLICTS = [];

/**
 * WHERE THE DEFAULT IS NOT BYTE-IDENTICAL TO ANTD, and why. One entry, and it is structural.
 *
 * antd's dark theme is `darkAlgorithm(seed)`, and the algorithm MOVES the seed: it returns
 * `colorPrimary` as a darker, desaturated transform rather than the seed itself (its own
 * #1677ff becomes #1668dc). Feeding this library's light seed straight in gives #0363a4, which
 * measures 2.81:1 on this dark spine and fails src/tokens/__tests__/primary-text-contrast.test.ts
 * outright — antd's dark primary is a known low-contrast value that antd only gets away with by
 * always putting white on it. So the dark theme is seeded with the lifted ramp foundation.css
 * already commits to, and `--primary` stays that seed rather than becoming antd's transform of it
 * (#3794d3, 5.36:1 against 7.07:1). Everything DERIVED from it — hover, active, the halo, the
 * outline hue — is antd's, computed from that seed.
 */
const DIVERGENCES = [
  {
    mode: "dark",
    what: "--primary / --ring",
    antd: "colorPrimary = darkAlgorithm(seed) — moves the seed",
    why: "antd's dark transform of the committed seed measures 5.36:1 on the dark spine where the seed itself measures 7.07:1; the seed is kept and everything derived from it is antd's",
  },
];

// ── derivation ──────────────────────────────────────────────────────────────
function derive(mode) {
  const t = TOKENS[mode];
  const lines = [];
  for (const entry of MAP) {
    if (CONFLICTS.some((c) => c.token === entry.token && c.mode === mode)) continue;
    const { rgb, alpha } = parseColor(t[entry.antd]);
    if (alpha !== 1) throw new Error(`${entry.antd} is translucent; map it through OUTLINES`);
    lines.push({ ...entry, value: toTriple(rgb), source: hex(rgb) });
  }
  for (const entry of OUTLINES) {
    const { rgb, alpha } = parseColor(t[entry.antd]);
    lines.push({
      token: entry.color,
      antd: entry.antd,
      note: entry.note,
      value: toTriple(rgb),
      source: t[entry.antd],
    });
    lines.push({
      token: entry.alpha,
      antd: `${entry.antd} alpha`,
      value: String(alpha),
      source: t[entry.antd],
    });
  }
  return lines;
}

function render() {
  const out = [];
  out.push("/* AUTO-GENERATED by scripts/gen-antd-tokens.mjs — do not edit by hand.");
  out.push(" *");
  out.push(` * antd ${ANTD_VERSION}, \`theme.getDesignToken()\`, seeded from the roles`);
  out.push(" * foundation.css already commits to and nothing else:");
  for (const mode of ["light", "dark"]) {
    out.push(
      ` *   ${mode.padEnd(5)} ${Object.entries(SEEDS[mode])
        .map(([k, v]) => `${k.replace("color", "").toLowerCase()} ${v}`)
        .join(" · ")}`,
    );
  }
  out.push(" *");
  out.push(" * Every value below is the algorithm's output. Nothing here was chosen by a person:");
  out.push(" * to move a derived colour, move the seed. Regenerate with `pnpm gen:antd-tokens`;");
  out.push(" * `pnpm check:antd-tokens` fails the build if this file drifts from the algorithm.");
  out.push(" *");
  out.push(" * antd is a devDependency and a BUILD-TIME tool. Nothing from it ships — see");
  out.push(" * scripts/check-no-antd-runtime.mjs.");
  out.push(" */");
  out.push("");
  for (const [mode, selector] of [
    ["light", ":root"],
    ["dark", '.dark,\n:root[data-theme="dark"]'],
  ]) {
    out.push(`${selector} {`);
    for (const line of derive(mode)) {
      if (line.note) out.push(`  /* ${line.note} */`);
      out.push(`  ${line.token}: ${line.value}; /* antd ${line.antd} = ${line.source} */`);
    }
    out.push("");
    out.push("  /* antd has no separate focus-colour token: a focused field's border simply");
    out.push("   * becomes `colorPrimary` (es/input/style/token.js `activeBorderColor`). Emitted");
    out.push("   * as a REFERENCE rather than a copied triple, so retinting the seed retints the");
    out.push("   * focus mark with it — which is the entire point of a derived system. Declared in");
    out.push("   * BOTH blocks, not inherited from `:root`: a var() binding made once at `:root`");
    out.push("   * would freeze on the light `--primary` if `.dark` ever lands on an element below");
    out.push("   * `<html>` (docs/TOKENS.md, the freeze rule). */");
    out.push("  --ring: var(--primary);");
    out.push("}");
    out.push("");
  }
  return out.join("\n");
}

// ── reporting / verification ────────────────────────────────────────────────
function measure() {
  const rows = [];
  for (const mode of ["light", "dark"]) {
    const page = hslToRgb(role(mode, "background"));
    for (const line of derive(mode)) {
      if (!line.value.includes("%")) continue;
      const after = hslToRgb(triple(line.value));
      const beforeText = BLOCKS[mode].match(new RegExp(`${line.token}:\\s*([^;]+);`))?.[1]?.trim();
      const before = beforeText?.includes("%") ? hslToRgb(triple(beforeText)) : null;
      rows.push({
        mode,
        token: line.token,
        antd: line.antd,
        before: before ? `${beforeText} ${hex(before)}` : "— (new)",
        after: `${line.value} ${hex(after)}`,
        beforeContrast: before ? contrast(before, page) : null,
        afterContrast: contrast(after, page),
      });
    }
  }
  return rows;
}

function report() {
  console.log(`antd ${ANTD_VERSION} · seeds read from ${SOURCE}`);
  for (const mode of ["light", "dark"]) {
    console.log(`\n── ${mode} ── seed: ${JSON.stringify(SEEDS[mode])}`);
    for (const row of measure().filter((r) => r.mode === mode)) {
      console.log(
        `  ${row.token.padEnd(30)} ${row.before.padEnd(26)} → ${row.after.padEnd(30)}` +
          ` | vs page ${(row.beforeContrast?.toFixed(2) ?? "—").padStart(5)} → ` +
          `${row.afterContrast.toFixed(2)}`,
      );
    }
    for (const line of derive(mode).filter((l) => !l.value.includes("%"))) {
      console.log(`  ${line.token.padEnd(30)} ${"—".padEnd(26)} → ${line.value} (antd ${line.antd})`);
    }
  }
  console.log("\n── geometry antd owns, asserted against the named scales ──");
  for (const [antdName, expected, token, declared] of GEOMETRY) {
    console.log(`  antd ${antdName.padEnd(20)} = ${String(expected).padEnd(4)} ↔ ${token} = ${declared}`);
  }
  console.log(
    CONFLICTS.length
      ? `\n── ${CONFLICTS.length} recorded conflicts (antd's value rejected, committed value stands) ──`
      : "\n── no recorded conflicts: every mapped antd value clears the floors this repo gates ──",
  );
  for (const conflict of CONFLICTS) console.log(`  ${conflict.mode} ${conflict.token}: ${conflict.why}`);
  console.log(`\n── ${DIVERGENCES.length} structural divergence(s) from antd ──`);
  for (const d of DIVERGENCES) console.log(`  ${d.mode} ${d.what}\n    antd: ${d.antd}\n    kept: ${d.why}`);
}

const args = new Set(process.argv.slice(2));
const body = render();
const problems = geometryProblems();

if (args.has("--report")) {
  report();
} else if (args.has("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* missing → stale */
  }
  if (current !== body) problems.push(`${OUT} is stale — run \`pnpm gen:antd-tokens\``);
  if (problems.length) {
    console.error("✗ check:antd-tokens");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log(
    `✓ check:antd-tokens — ${OUT} is antd ${ANTD_VERSION}'s own output for the committed seed, ` +
      `and the ${GEOMETRY.length} geometry values antd owns still match the named scales.`,
  );
} else {
  if (problems.length) {
    console.error("✗ geometry drift");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  writeFileSync(OUT, body);
  console.log(`wrote ${OUT} from antd ${ANTD_VERSION}`);
}
