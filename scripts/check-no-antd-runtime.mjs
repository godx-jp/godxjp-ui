#!/usr/bin/env node
/**
 * antd is a GENERATOR, not a dependency.
 *
 * scripts/gen-antd-tokens.mjs runs Ant Design's own algorithm at build time and writes plain CSS
 * custom properties. Nothing from antd may reach a consumer: not a module in `dist/`, not a class
 * in the shipped stylesheet, not an entry in `dependencies` or `peerDependencies`. The whole
 * argument for adopting antd as the colour authority is that it costs the bundle nothing, so that
 * claim gets a gate rather than a sentence in a doc.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const failures = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
  if (pkg[field]?.antd) failures.push(`package.json: antd must not appear in ${field}`);
}
if (!pkg.devDependencies?.antd) {
  failures.push("package.json: antd must be present in devDependencies — the generator needs it");
}

/** A source import of antd, in any of the forms a bundler would follow. */
const IMPORT = /(?:from\s+|require\(\s*|import\(\s*)["'](antd|@ant-design\/[\w-]+)["']/;

for (const file of walk(join(ROOT, "src"))) {
  if (!/\.(tsx?|jsx?|css)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  if (IMPORT.test(text) || /@import\s+["']antd/.test(text)) {
    failures.push(`${relative(ROOT, file)}: imports antd — it is a BUILD-TIME tool only`);
  }
}

const dist = join(ROOT, "dist");
if (existsSync(dist)) {
  for (const file of walk(dist)) {
    if (!/\.(m?js|cjs|css|d\.ts)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    if (IMPORT.test(text) || /\bant-(?:design|d)-/.test(text)) {
      failures.push(`dist/${relative(dist, file)}: carries antd code`);
    }
  }
} else {
  console.warn("  note: dist/ absent — run `pnpm build` for the shipped-bundle half of this gate.");
}

if (failures.length) {
  console.error("✗ check:no-antd-runtime");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("✓ check:no-antd-runtime — antd is a devDependency and reaches no shipped artefact.");
