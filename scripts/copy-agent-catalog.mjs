#!/usr/bin/env node
/**
 * Publish the static agent catalog to the docs site.
 *
 * WHY THIS EXISTS. `agent/` was built for the one audience that cannot run the MCP server — an
 * assistant in a browser tab, with no process and no tools, which can only read a URL. Measured
 * after 28.9.0 shipped:
 *
 *   https://godx-jp.github.io/godxjp-ui/agent/START-HERE.md   404   (never published)
 *   the npm tarball                                            —    (`agent` not in `files`)
 *   https://raw.githubusercontent.com/.../main/agent/…        200
 *
 * So the catalog written for people who cannot run anything was reachable only by someone who
 * already knew a raw GitHub URL. That is the same failure `.ui-brand-glow` had — it shipped with
 * tokens and a test and went unused for months because nothing in the catalogue pointed at it —
 * and it is the failure this whole file set exists to prevent.
 *
 * `agent/` is generated (`pnpm gen:agent-catalog`) and checked (`check:agent-catalog`), so this
 * only copies. It runs after `vite build`, alongside `gen-registry.mjs`, because both publish a
 * consumer-facing artefact into `preview/dist` that the app itself never imports.
 */
import { cpSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "agent");
const OUT = join(ROOT, "preview/dist/agent");

if (!existsSync(SRC)) {
  console.error("✗ agent/ is missing — run `pnpm gen:agent-catalog` first.");
  process.exit(1);
}

cpSync(SRC, OUT, { recursive: true });

/* Assert the copy landed, rather than trusting the call. An empty publish reads exactly like a
 * successful one to anyone downstream, which is how `check:contrast` once swept two showcases
 * that were not there. */
const count = (dir) =>
  readdirSync(dir).reduce(
    (n, e) => n + (statSync(join(dir, e)).isDirectory() ? count(join(dir, e)) : 1),
    0,
  );
const files = count(OUT);
if (files === 0) {
  console.error("✗ agent catalog copy produced no files.");
  process.exit(1);
}

const version = JSON.parse(readFileSync(join(SRC, "index.json"), "utf8")).version;
console.log(
  `✓ agent catalog published — ${files} file(s) at /agent/ (catalog describes ${version}).`,
);
