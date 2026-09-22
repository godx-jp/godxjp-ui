#!/usr/bin/env node
/**
 * RUN EVERY GENERATOR, DERIVED FROM package.json — NEVER FROM A LIST SOMEONE MAINTAINS.
 *
 * The repeated failure this exists to end: adding a public surface means re-running the generators
 * that record it, and the generators are only discoverable one at a time, by the gate that catches
 * the one you forgot. Measured on two batches in one day — 28.2.0 went red across SEVEN stacked
 * gates and the gh#796-799 batch across SIX, both from one root cause each, because a stale
 * artifact hides the gate that reads it and `verify:ci:static` aborts at the first failure. Each
 * fix revealed the next, one CI round at a time.
 *
 * There are SEVEN of them. Anyone who thinks they know the list is wrong: the author of this file
 * believed there were three.
 *
 * The list is therefore COMPUTED: every `check:*` script that invokes `node scripts/<x>.mjs
 * --check` is, by construction, the checker half of a generator, and dropping `--check` is the
 * generating half. An eighth generator added tomorrow appears here for free, and — the point —
 * cannot be forgotten by someone who does not know it exists.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {};

/** `node scripts/<name>.mjs … --check` → the same call without `--check`. */
const GEN_CALL = /node\s+(scripts\/[\w.-]+\.mjs)((?:\s+(?!&&)[^\s&]+)*)/g;

const generators = new Map();
for (const [name, command] of Object.entries(scripts)) {
  if (!name.startsWith("check:") || !command.includes("--check")) continue;
  for (const [, file, rest] of command.matchAll(GEN_CALL)) {
    if (!rest.includes("--check")) continue; // the CHECKER half of a compound command, not the generator
    const args = rest.split(/\s+/).filter((a) => a && a !== "--check");
    generators.set(file, { args, from: name });
  }
}

if (generators.size === 0) {
  console.error(
    "✗ regen: found no generators — the derivation broke, which is worse than a stale artifact.",
  );
  process.exit(1);
}

/**
 * RUN TO A FIXED POINT, BECAUSE ONE GENERATOR EATS ANOTHER'S OUTPUT (gh#847).
 *
 * `gen-agent-catalog` reads `mcp/src/data/component-tokens.generated.ts`, which
 * `gen-component-tokens` is the thing that writes. Iteration order here is the order of KEYS IN
 * package.json, and the catalog's key happens to come first — so a change under
 * `src/tokens/components/` left the catalog built from the PREVIOUS run's generated file,
 * `check:agent-catalog` failed, and the only cure was running `pnpm regen` a second time.
 *
 * Silent until the exact change regen exists to absorb, which is how it survived.
 *
 * REORDERING THE KEYS WOULD NOT BE A FIX. It trades one accident of key order for another, and the
 * next generator that reads a sibling's output re-opens it — silently again, since nothing here
 * declares a dependency. A maintained dependency list is also out: this file's whole design is that
 * the generator set is DERIVED, because "anyone who thinks they know the list is wrong".
 *
 * So: run the whole set, and if anything on disk moved, run it again. Generators are deterministic
 * functions of their inputs, so a pass that changes nothing means every input is settled — which
 * is exactly the property `--check` asserts afterwards, reached without knowing who feeds whom.
 * A dependency CYCLE cannot converge and would spin, so the pass count is capped and a cap hit is
 * a hard failure with the still-moving files named: that is a real defect in the generator graph,
 * not something to paper over with one more pass.
 */
const MAX_PASSES = 4;

/** Content signature of the working tree, so "did anything move?" needs no per-generator knowledge. */
const treeSignature = () =>
  createHash("sha1")
    .update(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }))
    .update(
      execFileSync("git", ["diff", "HEAD"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }),
    )
    .digest("hex");

const runAll = () => {
  for (const [file, { args, from }] of generators) {
    process.stdout.write(`  ${file}${args.length ? ` ${args.join(" ")}` : ""}  (${from}) … `);
    try {
      execFileSync("node", [file, ...args], { stdio: "pipe" });
      console.log("ok");
    } catch (error) {
      console.log("FAILED");
      console.error(String(error.stdout ?? "") + String(error.stderr ?? ""));
      process.exit(1);
    }
  }
};

let signature = treeSignature();
let passes = 0;
for (;;) {
  passes += 1;
  console.log(
    `regen — pass ${passes}: ${generators.size} generator(s), derived from package.json:\n`,
  );
  runAll();
  const next = treeSignature();
  if (next === signature) break;
  signature = next;
  if (passes >= MAX_PASSES) {
    console.error(
      `\n✗ regen: still changing files after ${MAX_PASSES} passes. Generators are deterministic, so\n` +
        "  this means a CYCLE in the generator graph — two artifacts each derived from the other —\n" +
        "  and no number of passes will settle it. Files still moving:\n" +
        execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" })
          .split("\n")
          .filter(Boolean)
          .map((line) => `    ${line}`)
          .join("\n"),
    );
    process.exit(1);
  }
  console.log(`\n  …a generator changed a file another generator reads. Running again.\n`);
}

console.log(
  `\n✓ regen — ${generators.size} artifact(s) settled after ${passes} pass(es). Now run the gates.`,
);
