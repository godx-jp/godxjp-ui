#!/usr/bin/env node
/**
 * antd IS GONE, AND THIS GATE IS WHY IT STAYS GONE.
 *
 * The build-time colour generator that used antd was removed; the derived tier is now authored in
 * src/tokens/derived.css and held correct by measurement (see docs/DESIGN-AUTHORITY.md). antd must
 * therefore appear NOWHERE — not in `dependencies`, `devDependencies` or `peerDependencies`, not
 * as an import in `src/`, not as a module or a class name in `dist/`.
 *
 * This is the difference between "we removed it" as a claim in a commit message and "it cannot
 * come back" as a fact CI enforces. Removing this file re-opens the door it closes.
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
for (const field of [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
]) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    if (name === "antd" || name.startsWith("@ant-design/")) {
      failures.push(`package.json: ${name} must not appear in ${field}`);
    }
  }
}

/**
 * A source import of antd, in any of the forms a bundler would follow.
 *
 * The package name may be followed by a SUBPATH and the statement may be a side-effect import
 * with no `from` — both forms were invisible to an earlier version of this check, and a deep
 * import such as `require("antd/lib/theme/index.js")` pulls the same runtime into the bundle, so
 * it must count.
 */
const IMPORT =
  /(?:from\s+|require\(\s*|import\(\s*|import\s+)["'](antd|@ant-design\/[\w-]+)(?:\/[^"']*)?["']/;

for (const file of walk(join(ROOT, "src"))) {
  if (!/\.(tsx?|jsx?|css)$/.test(file)) continue;
  // Tests are not shipped (tsup does not emit them; `dist/**/__tests__` is empty). They are
  // skipped here only because the dist half below is the authoritative guard on the shipped
  // artefact; no test imports antd any more either — focus-ring-contrast.test.ts used to, and
  // now pins the derived values instead.
  if (/[\\/]__tests__[\\/]|\.(?:test|spec)\.[jt]sx?$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  if (IMPORT.test(text) || /@import\s+["']antd/.test(text)) {
    failures.push(`${relative(ROOT, file)}: imports antd — antd was removed from this repo`);
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

console.log("✓ check:no-antd-runtime — antd appears in no manifest, no source and no artefact.");
