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
