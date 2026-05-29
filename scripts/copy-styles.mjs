#!/usr/bin/env node
/**
 * Copy standalone CSS trees into dist/ preserving relative layout so the
 * `@import "./..."` chains inside base.css / index.css keep resolving.
 * Mirrors src/<dir> -> dist/<dir>.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
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
    filter: (src) => src === from || src.endsWith(".css") || !src.includes("."),
  });
}

console.log("copied CSS trees -> dist/{styles,tokens,theme}");
