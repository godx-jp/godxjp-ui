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
  console.error("✗ regen: found no generators — the derivation broke, which is worse than a stale artifact.");
  process.exit(1);
}

console.log(`regen — ${generators.size} generator(s), derived from package.json:\n`);
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
console.log(`\n✓ regen — ${generators.size} artifact(s) rewritten. Now run the gates.`);
