#!/usr/bin/env node
/**
 * Dev watch for consumers linking the package locally (file:/npm link):
 * tsup --watch rebuilds the TS entries, and the CSS trees (styles/tokens/theme)
 * are re-copied to dist/ on change — tsup only watches the TS module graph, so
 * without this a plain CSS edit never reaches dist.
 */
import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => spawn(cmd, args, { cwd: root, stdio: "inherit" });

run("npx", ["tsup", "--watch", "--onSuccess", "node scripts/copy-styles.mjs"]);

let timer;
for (const dir of ["styles", "tokens", "theme"]) {
  const full = join(root, "src", dir);
  if (!existsSync(full)) continue;
  watch(full, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => run("node", ["scripts/copy-styles.mjs"]), 150);
  });
}
