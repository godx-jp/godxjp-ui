#!/usr/bin/env node
/**
 * Why: the tsup build is `bundle: false`, mirroring src 1:1 with bundler-oriented ESM
 * (extensionless relative imports). Adding the extension keeps bundlers happy (an explicit `.js`
 * still resolves) AND unbreaks Node.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");

// Static `from "x"` / side-effect `import "x"` / dynamic `import("x")`. Group 2 is the specifier.
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.\.?\/[^"']*)\2/g;
const HAS_EXT = /\.(js|mjs|cjs|json|css|node)$/;

// A relative `.json` import (from "./x.json") not already carrying an import attribute — Node's
// native ESM needs `with { type: "json" }`. Group 1 is everything up to and including the specifier;
// the negative lookahead skips imports that already have a `with`/`assert` attribute.
const JSON_IMPORT = /(\bfrom\s*(["'])\.\.?\/[^"']*\.json\2)(?!\s*(?:with|assert)\b)/g;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

/** @param {string} p @returns {boolean} */
function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Resolve an extensionless relative specifier to its explicit form, or null.
 * @param {string} fileDir absolute dir of the importing file
 * @param {string} spec relative specifier (no extension)
 * @param {boolean} isDts whether the importing file is a declaration file
 * @returns {string | null}
 */
function resolveSpecifier(fileDir, spec, isDts) {
  const base = resolve(fileDir, spec);
  // `.d.ts` files resolve against declaration files but still emit a `.js` specifier (nodenext).
  const fileProbe = isDts ? ".d.ts" : ".js";
  if (isFile(base + fileProbe)) {
    return `${spec}.js`;
  }
  if (isFile(join(base, `index${fileProbe}`))) {
    return `${spec}/index.js`;
  }
  return null;
}

const files = walk(DIST);
let rewritten = 0;
let touchedFiles = 0;
/** @type {string[]} */
const unresolved = [];

for (const file of files) {
  const isDts = file.endsWith(".d.ts");
  const fileDir = dirname(file);
  const src = readFileSync(file, "utf8");
  let changedInFile = 0;

  let next = src.replace(SPECIFIER, (match, lead, quote, spec) => {
    if (HAS_EXT.test(spec)) {
      return match;
    }
    const resolved = resolveSpecifier(fileDir, spec, isDts);
    if (resolved === null) {
      unresolved.push(`${file}: ${spec}`);
      return match;
    }
    changedInFile += 1;
    return `${lead}${quote}${resolved}${quote}`;
  });

  next = next.replace(JSON_IMPORT, (match, importClause) => {
    changedInFile += 1;
    return `${importClause} with { type: "json" }`;
  });

  if (changedInFile > 0) {
    writeFileSync(file, next);
    rewritten += changedInFile;
    touchedFiles += 1;
  }
}

if (unresolved.length > 0) {
  console.error(
    `fix-esm-extensions: ${unresolved.length} relative specifier(s) resolved to neither <spec>.js nor <spec>/index.js:`,
  );
  for (const u of unresolved.slice(0, 20)) {
    console.error(`  ${u}`);
  }
  process.exit(1);
}

console.log(
  `fix-esm-extensions: rewrote ${rewritten} relative import(s) across ${touchedFiles} file(s).`,
);
