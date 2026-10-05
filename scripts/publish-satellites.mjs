#!/usr/bin/env node
/**
 * PUBLISH THE PACKAGES BESIDE THE KIT (gh#1108 / gh#1109 / gh#1156): @godxjp/markdown, then
 * @godxjp/editor and @godxjp/block-editor.
 *
 * They are versioned with @godxjp/ui (check-release-lockstep.mjs) and published AFTER it, by the
 * same tag, from the same commit. Kept out of scripts/release-core.mjs on purpose: that script's
 * recovery logic is built around the two-package (ui + mcp) train, and these two depend on the
 * kit, not the other way round — so they go out once the kit is on the registry, never before.
 *
 * Idempotent and fail-closed, so a rerun of the workflow is always safe:
 *   • the tag names the version every manifest carries (root + both packages);
 *   • @godxjp/ui@<version> must already be on the registry (the kit went out first);
 *   • a package whose <version> is already published is skipped, not re-published;
 *   • the target must outrank the package's current `latest` (never move it backwards);
 *   • after publishing, `latest` must report <version> (npm propagation has taken 348s — polled).
 *
 *   node scripts/publish-satellites.mjs --tag v31.18.0 [--dry-run]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SATELLITES = ["packages/markdown", "packages/editor", "packages/block-editor"];
const args = process.argv.slice(2);
const tag = args[args.indexOf("--tag") + 1];
const dryRun = args.includes("--dry-run");

const fail = (message) => {
  console.error(`✗ publish-satellites: ${message}`);
  process.exit(1);
};
const manifest = (dir) => JSON.parse(readFileSync(join(ROOT, dir, "package.json"), "utf8"));
const npm = (argv, cwd = ROOT) =>
  execFileSync("npm", argv, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
/** `npm view` answers E404 for a version (or package) that does not exist yet. */
const published = (spec) => {
  try {
    return npm(["view", spec, "version"]) !== "";
  } catch {
    return false;
  }
};
const latestOf = (name) => {
  try {
    return npm(["view", name, "dist-tags.latest"]) || null;
  } catch {
    return null;
  }
};
const outranks = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!tag || !/^v\d+\.\d+\.\d+$/.test(tag)) fail(`--tag vX.Y.Z is required (got ${tag ?? "nothing"}).`);
const version = tag.slice(1);
const ui = manifest(".");
if (ui.version !== version) fail(`tag ${tag} but @godxjp/ui is ${ui.version}.`);
for (const dir of SATELLITES) {
  const { name, version: v } = manifest(dir);
  if (v !== version) fail(`tag ${tag} but ${name} (${dir}) is ${v}.`);
}
if (!dryRun && !published(`@godxjp/ui@${version}`)) {
  fail(`@godxjp/ui@${version} is not on the registry: the kit publishes first, then these.`);
}

console.log(`· building ${SATELLITES.join(", ")}`);
execFileSync("pnpm", ["build:packages"], { cwd: ROOT, stdio: "inherit" });

for (const dir of SATELLITES) {
  const { name } = manifest(dir);
  const spec = `${name}@${version}`;
  if (!dryRun && published(spec)) {
    console.log(`· ${spec} already published — skipped`);
    continue;
  }
  const latest = latestOf(name);
  if (latest && !outranks(version, latest)) {
    fail(`${spec} does not outrank the published latest ${latest}; refusing to move it backwards.`);
  }
  const publishArgs = ["publish", "--access", "public", "--tag", "latest"];
  if (dryRun) publishArgs.push("--dry-run");
  console.log(`· npm ${publishArgs.join(" ")}  (${dir})`);
  execFileSync("npm", publishArgs, { cwd: join(ROOT, dir), stdio: "inherit" });
}

if (dryRun) {
  console.log("✓ publish-satellites dry run complete.");
  process.exit(0);
}

// The release is done when `latest` moved, not when the tarball exists.
for (const dir of SATELLITES) {
  const { name } = manifest(dir);
  const deadline = Date.now() + 8 * 60_000;
  while (latestOf(name) !== version) {
    if (Date.now() > deadline) fail(`${name} latest is ${latestOf(name)}, not ${version}, after 8 minutes.`);
    await sleep(15_000);
  }
  console.log(`✓ ${name}@${version} is latest`);
}
