#!/usr/bin/env node
/**
 * prune-css — emit a consumer stylesheet with only the component CSS layers the app uses
 * (gh#971). Runs in the CONSUMER repo:
 *
 *     node node_modules/@godxjp/ui/scripts/prune-css.mjs resources/js [more dirs/globs …]
 *     npx @godxjp/ui prune-css resources/js --out resources/css/godx-ui.css
 *
 * It scans the given sources for imports from `@godxjp/ui` (any subpath), maps the imported
 * components to CSS layer files through the dependency graph the package ships in
 * dist/styles/layers.json, takes the closure, and writes a css file that @imports the
 * foundation ALWAYS (base — Tailwind entry, tokens, theme, density, focus ring) plus only the
 * needed `*-layout.css` layers, in exactly the order styles/index.css loads them — layer order
 * is load-bearing there (icon-layout.css is last on purpose, and the vendor sheets sit in
 * `layer(vendor)` before base).
 *
 * This is the sanctioned alternative to the forbidden act: README still says "do not
 * cherry-pick *-layout.css files", and that rule is WHY this tool exists — the layer
 * dependency graph is owned and shipped by the package, so the slice is computed, never
 * hand-guessed. A missing layer fails silently (naked menus, unsized rows); a computed one
 * cannot go missing without the manifest's own CI guard going red first.
 *
 * Fonts mirror `@godxjp/ui/styles/core`: NO bundled `@font-face` by default (that is where
 * 77% of the all-in entry's weight lives — gh#971). Pass `--fonts` for the bundled faces,
 * the same thing `@godxjp/ui/styles` adds over `core`.
 *
 * Re-run it whenever the set of components the app uses changes, and after every
 * @godxjp/ui upgrade. The emitted file refuses to be hand-edited by carrying its own
 * provenance header, and this script refuses to run against a manifest whose version does
 * not match the installed package — a half-upgraded node_modules must fail loudly, not
 * emit a slice computed from another release's graph.
 */
import { existsSync, globSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log(`prune-css — emit a stylesheet with only the @godxjp/ui CSS layers your app uses

usage: node node_modules/@godxjp/ui/scripts/prune-css.mjs <src dir/glob …> [--out <file>] [--fonts]

  <src dir/glob …>  where your app's source lives (directories are walked; globs expand)
  --out <file>      where to write the css (default: godx-ui.css in the current directory)
  --fonts           include the bundled M PLUS 2 / Noto Sans JP @font-face declarations
                    (default mirrors @godxjp/ui/styles/core: none — bring your own fonts)

Then import the emitted file INSTEAD of "@godxjp/ui/styles" and re-run this command whenever
the set of components you use changes, and after every @godxjp/ui upgrade.`);
  process.exit(0);
}

const outFlag = args.indexOf("--out");
const OUT = outFlag !== -1 ? args[outFlag + 1] : "godx-ui.css";
if (outFlag !== -1 && (!OUT || OUT.startsWith("--"))) {
  console.error("prune-css: --out needs a file path");
  process.exit(2);
}
const FONTS = args.includes("--fonts");
const positionals = args.filter(
  (a, i) => !a.startsWith("--") && (outFlag === -1 || i !== outFlag + 1),
);

// ── the package's own graph, version-locked ──────────────────────────────────

const pkg = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8"));
const manifestPath = join(PKG_ROOT, "dist/styles/layers.json");
if (!existsSync(manifestPath)) {
  console.error(
    `prune-css: ${manifestPath} not found — the installed @godxjp/ui build does not ship the ` +
      "layer manifest (upgrade the package; inside the repo itself, run `pnpm build` first).",
  );
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.version !== pkg.version) {
  console.error(
    `prune-css: refusing to emit — the layer manifest says ${manifest.version ?? "null"} but the ` +
      `installed @godxjp/ui is ${pkg.version}. A slice computed from another release's dependency ` +
      "graph can silently miss a layer, which is the exact failure this tool exists to prevent. " +
      "Reinstall @godxjp/ui (or rebuild dist/ if this is a linked checkout) and re-run.",
  );
  process.exit(2);
}

// ── scan consumer sources ────────────────────────────────────────────────────

const SCANNABLE = /\.(tsx|jsx|ts|mjs|js|cjs|mts)$/;

function walk(dir, into) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, into);
    else if (SCANNABLE.test(name)) into.push(p);
  }
}

const sources = [];
for (const arg of positionals) {
  const asPath = resolve(process.cwd(), arg);
  if (existsSync(asPath) && statSync(asPath).isDirectory()) walk(asPath, sources);
  else if (existsSync(asPath) && SCANNABLE.test(asPath)) sources.push(asPath);
  else {
    for (const hit of globSync(arg, { cwd: process.cwd() })) {
      const p = resolve(process.cwd(), hit);
      if (statSync(p).isDirectory()) walk(p, sources);
      else if (SCANNABLE.test(p)) sources.push(p);
    }
  }
}
if (sources.length === 0) {
  console.error(
    `prune-css: nothing to scan — no source files matched ${positionals.join(" ")}. ` +
      "An empty scan must never emit an empty stylesheet, so this is an error, not a result.",
  );
  process.exit(2);
}

const componentNames = Object.keys(manifest.components);
// Longest name first, so `CardBar…` resolves before `Card` when matching sub-part imports.
const byLength = [...componentNames].sort((a, b) => b.length - a.length);

const used = new Set();
let sawNamespace = false;
const IMPORT =
  /(?:import|export)\s+(type\s+)?([^;'"]*?)\s*from\s*["'](@godxjp\/ui(?:\/[^"']*)?)["']/g;
for (const file of new Set(sources)) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(IMPORT)) {
    const [, typeOnly, clause, spec] = m;
    if (typeOnly) continue; // a type renders nothing
    if (spec.startsWith("@godxjp/ui/styles")) continue; // css imports carry no components
    if (/\*\s*as\s/.test(clause)) {
      // `import * as UI` — anything may be rendered through it. Correct beats minimal:
      // include everything rather than guess at property accesses.
      sawNamespace = true;
      continue;
    }
    const braces = /\{([^}]*)\}/.exec(clause);
    if (!braces) continue; // a bare side-effect or default import names no component
    for (let entry of braces[1].split(",")) {
      entry = entry.trim();
      if (!entry || entry.startsWith("type ")) continue;
      const name = entry.split(/\s+as\s+/)[0].trim();
      if (!/^[A-Z]/.test(name)) continue; // hooks and utils style nothing
      // Sub-parts (SheetContent, DropdownMenuTrigger, CardHeader…) are not manifest rows;
      // their root component is, and the root's layers cover the whole compound family.
      const root = byLength.find((c) => name === c || name.startsWith(c));
      if (root) used.add(root);
    }
  }
  // A dynamic `import("@godxjp/ui…")` names no bindings this regex can see.
  if (/import\s*\(\s*["']@godxjp\/ui(?!\/styles)/.test(src)) sawNamespace = true;
}

if (sawNamespace) {
  console.error(
    "prune-css: found a namespace or dynamic import of @godxjp/ui — cannot tell which " +
      "components it renders, so ALL component layers are included (still no bundled fonts " +
      "unless --fonts). Use named imports to get a real slice.",
  );
  for (const c of componentNames) used.add(c);
}
if (used.size === 0) {
  console.error(
    `prune-css: scanned ${sources.length} files and found no @godxjp/ui component imports — ` +
      "check the paths you passed. Refusing to emit a component-less stylesheet.",
  );
  process.exit(2);
}

// ── closure → ordered emit ───────────────────────────────────────────────────

const layers = new Set();
const vendors = new Set();
for (const name of used) {
  const entry = manifest.components[name];
  for (const l of entry.layers) layers.add(l);
  for (const v of entry.vendor ?? []) vendors.add(v);
}

const keptLayers = manifest.order.filter((f) => layers.has(f));
const keptVendors = manifest.vendor.filter((f) => vendors.has(f));
const asImport = (f) => `@import "@godxjp/ui/styles/${f.replace(/\.css$/, "")}";`;

const lines = [
  "/*",
  ` * GENERATED by @godxjp/ui prune-css — DO NOT EDIT.`,
  ` *`,
  ` * @godxjp/ui version: ${pkg.version}`,
  ` * components detected: ${[...used].sort().join(", ")}`,
  ` * layers: ${keptLayers.length} of ${manifest.order.length} (+base${FONTS ? "+fonts" : ", no bundled fonts — like styles/core"})`,
  ` *`,
  ` * Re-run when the components your app uses change, and after every @godxjp/ui upgrade:`,
  ` *   node node_modules/@godxjp/ui/scripts/prune-css.mjs <src …> --out <this file>${FONTS ? " --fonts" : ""}`,
  ` *`,
  ` * Hand-editing this file is the cherry-picking the README forbids: layers share rules and`,
  ` * a missing one fails silently. Change your imports, then re-run the tool.`,
  " */",
  // Layer order must be declared before the first @import — same statement, same reasoning,
  // as styles/index.css (vendor between base and components; see the comment there).
  "@layer theme, base, vendor, components, utilities;",
  ...keptVendors.map(asImport),
  asImport(manifest.base),
  ...(FONTS ? [asImport(manifest.fonts)] : []),
  ...keptLayers.map(asImport),
  "",
];

writeFileSync(resolve(process.cwd(), OUT), lines.join("\n"));

const dropped = manifest.order.filter((f) => !layers.has(f));
console.error(
  `prune-css: ${relative(process.cwd(), resolve(process.cwd(), OUT)) || OUT} — ` +
    `${used.size} components across ${sources.length} files → ${keptLayers.length}/${manifest.order.length} layers` +
    (keptVendors.length ? `, vendor: ${keptVendors.join(", ")}` : "") +
    (dropped.length ? `\n  dropped: ${dropped.join(", ")}` : "\n  (every layer is in use)"),
);
