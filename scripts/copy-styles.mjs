#!/usr/bin/env node
/**
 * Copy standalone CSS trees into dist/ preserving relative layout so the
 * `@import "./..."` chains inside base.css / index.css keep resolving.
 * Mirrors src/<dir> -> dist/<dir>.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_DIRS = ["styles", "tokens", "theme"];

for (const dir of CSS_DIRS) {
  const from = join(root, "src", dir);
  const to = join(root, "dist", dir);
  if (!existsSync(from)) {
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, {
    recursive: true,
    // `.woff2` ships too: src/styles/fonts holds the merged JIS level 1 faces that
    // styles/core-with-jis-level1 points `url()` at (gh#535). Nothing else binary lives here.
    filter: (src) =>
      src === from || statSync(src).isDirectory() || src.endsWith(".css") || src.endsWith(".woff2"),
  });
}

// The style layer manifest ships next to the css it describes, stamped with the version it
// was built with. prune-css (gh#971) REFUSES on a version mismatch against the installed
// package.json — a half-upgraded node_modules or a stale dist/ must fail loudly rather than
// slice with another release's dependency graph. Source keeps `version: null` so the
// committed file does not churn on release bumps; only the built copy carries the number.
const layersFrom = join(root, "src", "styles", "layers.json");
if (existsSync(layersFrom)) {
  const manifest = JSON.parse(readFileSync(layersFrom, "utf8"));
  manifest.version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  writeFileSync(
    join(root, "dist", "styles", "layers.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
}

// Preserved-module output keeps `import ja from "./messages/ja.json"` as-is,
// so the JSON files must ship next to the emitted i18n modules.
const messagesFrom = join(root, "src", "i18n", "messages");
const messagesTo = join(root, "dist", "i18n", "messages");
if (existsSync(messagesFrom)) {
  mkdirSync(messagesTo, { recursive: true });
  cpSync(messagesFrom, messagesTo, {
    recursive: true,
    filter: (src) => src === messagesFrom || src.endsWith(".json"),
  });
}

// The measurement contract ships as DATA, not as prose, because the gate that needs it is a
// consumer's browser test and a gate cannot read `docs/`. gh#503/#506/#507 each survived four
// releases on that gap (scripts/gen-measurement-contract.mjs has the numbers).
const contractsFrom = join(root, "src", "contracts");
const contractsTo = join(root, "dist", "contracts");
if (existsSync(contractsFrom)) {
  mkdirSync(contractsTo, { recursive: true });
  cpSync(contractsFrom, contractsTo, {
    recursive: true,
    filter: (src) => src === contractsFrom || src.endsWith(".json"),
  });
}

console.log("copied CSS trees + i18n messages + contracts -> dist");

// dist CSS ships without comments (`/*!` license blocks are kept).
function stripCssComments(css) {
  // Quoted strings (an `@source "../**/*.tsx"` glob, a url()) can contain `/*`; they are not
  // comments. Walk the text once: copy strings verbatim, drop `/* … */` (keep `/*!`).
  let out = "";
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== c) j += css[j] === "\\" ? 2 : 1;
      out += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === "/" && css[i + 1] === "*" && css[i + 2] !== "!") {
      const end = css.indexOf("*/", i + 2);
      i = end < 0 ? css.length : end + 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
}
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".css")) writeFileSync(p, stripCssComments(readFileSync(p, "utf8")));
  }
}
for (const dir of CSS_DIRS) {
  const to = join(root, "dist", dir);
  if (existsSync(to)) walk(to);
}
