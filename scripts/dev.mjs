#!/usr/bin/env node
/**
 * Dev watch for consumers linking the package locally (file:/npm link).
 *
 * `pnpm build` is FIVE steps, and this watcher used to run two of them:
 *
 *     tsup && tsc -p tsconfig.build.json && copy-styles && fix-esm-extensions && add-use-client
 *     ^^^^                                  ^^^^^^^^^^^
 *
 * The three it skipped are not polish, and each one's own header says why:
 *
 *   • `tsc -p tsconfig.build.json` is the ONLY thing that emits `.d.ts` — `tsup.config.ts` sets
 *     `dts: false`. Without it a linked consumer type-checks against whatever declarations the last
 *     full build left behind, so a NEW export does not exist as far as its compiler is concerned,
 *     and a CHANGED signature is silently the old one. That failure reads as the consumer's bug.
 *   • `fix-esm-extensions` adds the `.js` a `bundle: false` build omits — "keeps bundlers happy AND
 *     unbreaks Node" (its own words). Skipping it ships a `dist/` Node cannot resolve.
 *   • `add-use-client` stamps the directive without which a client module evaluated in an RSC
 *     server graph throws `TypeError: createContext is not a function`.
 *
 * So the watcher produced a `dist/` that was wrong in three ways, while CLAUDE.md told consumers to
 * keep it running — which is how a consumer ends up distrusting it and paying for a full
 * `pnpm build` on every single library edit instead. Measured, that is the whole difference between
 * a ~0.3s incremental loop and a ~2s one, on every keystroke-to-check cycle in the consuming app.
 *
 * Measured cost of doing it properly: copy-styles 79ms · fix-esm-extensions 86ms · add-use-client
 * 91ms — 256ms for all three, which is affordable on every rebuild. `tsc` is 1088ms cold, so it
 * runs as its own INCREMENTAL watcher in parallel rather than serialising behind tsup.
 *
 * The three post-steps are chained with `&&` ON PURPOSE, and that is not the mistake gh#853 was
 * about: they are PREREQUISITES, not independent gates. `fix-esm-extensions` and `add-use-client`
 * rewrite tsup's output, so running them after it failed would be rewriting nothing.
 */
import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => spawn(cmd, args, { cwd: root, stdio: "inherit" });

/** Everything `pnpm build` does after `tsup`, minus the type emit (which has its own watcher). */
const POST_BUILD = [
  "node scripts/copy-styles.mjs",
  "node scripts/fix-esm-extensions.mjs",
  "node scripts/add-use-client.mjs",
].join(" && ");

run("npx", ["tsup", "--watch", "--onSuccess", POST_BUILD]);

/* `.d.ts` in parallel, incremental. `--preserveWatchOutput` keeps tsup's output on screen instead
 * of tsc clearing the terminal on every rebuild — two watchers sharing one terminal is only usable
 * if neither erases the other's errors. */
run("npx", ["tsc", "-p", "tsconfig.build.json", "--watch", "--preserveWatchOutput"]);

/* tsup watches the TS module graph only, so a plain CSS edit never reaches dist without this. The
 * JS post-steps are deliberately NOT re-run here: they rewrite JavaScript, and no CSS edit changes
 * any. */
let timer;
for (const dir of ["styles", "tokens", "theme"]) {
  const full = join(root, "src", dir);
  if (!existsSync(full)) continue;
  watch(full, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => run("node", ["scripts/copy-styles.mjs"]), 150);
  });
}
