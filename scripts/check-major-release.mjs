#!/usr/bin/env node
/**
 * The compatibility gate for a NEW MAJOR (gh#1218). Run by `npm-publish.yml` before anything is
 * published. Twelve majors shipped in 28 days (v19 → v31); a policy written in a doc did not stop
 * that, so the publish job enforces it.
 *
 *   node scripts/check-major-release.mjs --tag v32.0.0 [--published 31.31.8]
 *     [--published-at 2026-09-27T00:00:00Z] [--allow-off-cycle] [--root .]
 *
 * When `--tag` raises the major over the latest published version it requires:
 *  1. `docs/migrations/v<major>.md`, written in English, with a "Breaking changes" and a
 *     "How to upgrade" section and at least 250 words. The author must write a real note, not
 *     create an empty file to get past the gate.
 *  2. At least 90 days since the previous major was published (one scheduled major per quarter),
 *     unless the owner approves it: `--allow-off-cycle`, or an "Off-cycle approved: …" line in the
 *     note itself (a tag push carries no workflow input). Either way it is logged.
 * A patch or minor passes untouched. Without `--published` it asks the registry.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const tag = flag("tag");
const root = path.resolve(flag("root") ?? ".");
let allowOffCycle = argv.includes("--allow-off-cycle");
const MIN_WORDS = 250;
const MIN_DAYS = 90;

if (!tag || !/^v\d+\.\d+\.\d+/.test(tag)) {
  console.error(`✗ check-major-release: --tag vX.Y.Z is required (got ${tag ?? "nothing"})`);
  process.exit(2);
}
const major = (v) => Number(String(v).replace(/^v/, "").split(".")[0]);

let published = flag("published");
let publishedAt = flag("published-at");
if (!published) {
  const meta = JSON.parse(
    execFileSync("npm", ["view", "@godxjp/ui", "version", "time", "--json"], { encoding: "utf8" }),
  );
  published = meta.version;
  // The date the CURRENT major first appeared: its x.0.0, or the earliest version of that major.
  const firstOfMajor = Object.keys(meta.time)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && major(v) === major(published))
    .sort((a, b) => Date.parse(meta.time[a]) - Date.parse(meta.time[b]))[0];
  publishedAt = meta.time[firstOfMajor];
}

const next = major(tag);
const current = major(published);
if (next <= current) {
  console.log(
    `✓ check-major-release — ${tag} is not a new major (published ${published}); nothing to check.`,
  );
  process.exit(0);
}

const problems = [];
const notePath = path.join(root, "docs", "migrations", `v${next}.md`);
if (!existsSync(notePath)) {
  problems.push(
    `docs/migrations/v${next}.md is missing. A major must ship an English migration note.`,
  );
} else {
  const note = readFileSync(notePath, "utf8");
  // A tag push has no workflow inputs, so the owner's off-cycle approval can also live IN the note,
  // where git records who wrote it: a line "Off-cycle approved: <who> <date> <why>".
  if (/^off-cycle approved:\s*\S+/im.test(note)) allowOffCycle = true;
  const prose = note.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
  const words = prose.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
  if (words < MIN_WORDS)
    problems.push(
      `docs/migrations/v${next}.md has ${words} words of prose; at least ${MIN_WORDS} are required.`,
    );
  if (!/^#{1,3} .*breaking changes/im.test(note))
    problems.push(`docs/migrations/v${next}.md has no "Breaking changes" heading.`);
  if (!/^#{1,3} .*how to upgrade/im.test(note))
    problems.push(`docs/migrations/v${next}.md has no "How to upgrade" heading.`);
  // English-canonical: Vietnamese diacritics or Japanese script in the prose means the note is not.
  const letters = prose.match(/\p{L}/gu)?.length ?? 1;
  const foreign = prose.match(/[ăâđêôơưạ-ỹ぀-ヿ一-鿿]/giu)?.length ?? 0;
  if (foreign / letters > 0.02)
    problems.push(
      `docs/migrations/v${next}.md is not English (${Math.round((foreign / letters) * 100)}% non-English script).`,
    );
}

if (publishedAt) {
  const days = (Date.now() - Date.parse(publishedAt)) / 86_400_000;
  if (days < MIN_DAYS && !allowOffCycle) {
    problems.push(
      `v${current} first shipped ${Math.floor(days)} days ago; a new major needs ${MIN_DAYS} (one per quarter). ` +
        'The owner approves an off-cycle major by adding a line "Off-cycle approved: <who> <date> <why>" to the migration note.',
    );
  } else if (days < MIN_DAYS) {
    console.log(
      `! check-major-release — off-cycle major allowed by the owner (${Math.floor(days)} days after v${current}).`,
    );
  }
}

if (problems.length) {
  console.error(
    `✗ check-major-release — ${tag} is a new major (published ${published}) and cannot ship:`,
  );
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  `✓ check-major-release — ${tag}: migration note present, English, complete; cadence respected.`,
);
