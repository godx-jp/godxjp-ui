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
    filter: (src) => src === from || statSync(src).isDirectory() || src.endsWith(".css"),
  });
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

console.log("copied CSS trees + i18n messages -> dist");

// dist CSS ships without comments (`/*!` license blocks are kept).
function stripCssComments(css) {
  return css
    .replace(/\/\*(?!!)[\s\S]*?\*\//g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
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
