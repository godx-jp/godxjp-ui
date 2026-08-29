#!/usr/bin/env node
/**
 * VoiceOver evidence capture (issue #171).
 *
 * Records ONE screen-reader evidence record by walking the journey phases its owner's cohort
 * requires, capturing what VoiceOver actually said at each step, and appending the result to
 * `screen-reader-evidence.json` in the schema `check:screen-reader-evidence` enforces.
 *
 * THE ONE RULE: `announced` is never typed. Every transcript line is read back out of VoiceOver
 * itself (`tell application "VoiceOver" to get content of last phrase`), and a step whose capture
 * comes back empty is refused rather than filled in. That is the whole point of the gate — it
 * rejects axe/ARIA/accessibility-tree output as evidence precisely because a DOM claim about what
 * SHOULD be announced is not proof of what WAS announced. Do not add a manual-entry flag.
 *
 * You drive the screen reader; this script only listens, timestamps, and files the result.
 *
 * Usage:
 *   node scripts/capture-voiceover-evidence.mjs --owner data-entry/select --locale ja-JP
 *   node scripts/capture-voiceover-evidence.mjs --owner layout/topbar --locale vi-VN --dry-run
 *
 * Prerequisites (checked before anything is captured):
 *   - macOS with VoiceOver RUNNING (Command-F5)
 *   - System Settings → Privacy & Security → Accessibility: your terminal may control VoiceOver,
 *     and VoiceOver Utility → General → "Allow VoiceOver to be controlled with AppleScript"
 *   - the preview server serving the frame (pnpm preview, or pass --base)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const REPO_ROOT = process.cwd();
const EVIDENCE_PATH = path.join(REPO_ROOT, "screen-reader-evidence.json");
const ARTIFACT_DIR = path.join(REPO_ROOT, "audit-evidence/screen-reader");
const COMBINATION_ID = "voiceover-safari-macos";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const owner = flag("owner");
const locale = flag("locale");
const base = (flag("base") ?? "http://localhost:6008").replace(/\/$/, "");
const dryRun = args.includes("--dry-run");

const die = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

if (!owner || !locale)
  die("usage: --owner <owner> --locale <ja-JP|vi-VN> [--base URL] [--dry-run]");

const run = (file, cliArgs) =>
  execFileSync(file, cliArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

// ── Readiness ────────────────────────────────────────────────────────────────
if (process.platform !== "darwin") die("VoiceOver capture requires a macOS session.");
let osVersion, safariVersion, voiceOverVersion;
try {
  osVersion = `${run("/usr/bin/sw_vers", ["-productVersion"])} (${run("/usr/bin/sw_vers", ["-buildVersion"])})`;
  safariVersion = run("/usr/bin/mdls", [
    "-raw",
    "-name",
    "kMDItemVersion",
    "/Applications/Safari.app",
  ]);
  voiceOverVersion = run("/usr/bin/defaults", [
    "read",
    "/System/Library/CoreServices/VoiceOver.app/Contents/Info",
    "CFBundleShortVersionString",
  ]);
} catch (error) {
  die(`could not read OS/Safari/VoiceOver versions: ${error.message}`);
}
try {
  run("/usr/bin/pgrep", ["-f", "/VoiceOver.app/Contents/MacOS/VoiceOver"]);
} catch {
  die("VoiceOver is not running. Start it with Command-F5, then rerun.");
}

const captureLastPhrase = () =>
  run("/usr/bin/osascript", [
    "-e",
    'tell application "VoiceOver" to get content of last phrase',
  ]).trim();

try {
  captureLastPhrase();
} catch (error) {
  die(
    "VoiceOver refused AppleScript control. Enable VoiceOver Utility → General → " +
      `"Allow VoiceOver to be controlled with AppleScript", and grant your terminal Accessibility ` +
      `permission. (${error.message.split("\n")[0]})`,
  );
}

// ── Resolve the owner's cohort, required phases and frame ────────────────────
const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, "utf8"));
if (!evidence.policy?.requiredLocales?.includes(locale)) {
  die(
    `locale ${locale} is not in policy.requiredLocales (${evidence.policy?.requiredLocales?.join(", ")})`,
  );
}
const combination = evidence.policy.combinations.find((entry) => entry.id === COMBINATION_ID);
if (!combination) die(`policy.combinations has no ${COMBINATION_ID}`);

const cohort = evidence.policy.cohorts.find((entry) => entry.owners?.includes(owner));
if (!cohort) {
  die(
    `${owner} is not mapped to a policy cohort, so there is no required journey to capture. ` +
      "Map it in screen-reader-evidence.json first (or record it as reviewed not-applicable).",
  );
}

const ledger = JSON.parse(
  execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }),
);
const frameId = ledger.entries.find((entry) => entry.owner === owner)?.frameId;
if (!frameId) die(`no frame is registered for ${owner}`);
const frameUrl = `${base}/frame/${encodeURIComponent(frameId)}`;

// ── Walk the journey ─────────────────────────────────────────────────────────
const rl = readline.createInterface({ input, output });
const ask = async (question, fallback = "") => {
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
};

console.log(`\n  owner       ${owner}`);
console.log(`  cohort      ${cohort.id} — ${cohort.requiredPhases.length} required phase(s)`);
console.log(`  frame       ${frameUrl}`);
console.log(`  locale      ${locale}`);
console.log(`  capture     VoiceOver ${voiceOverVersion} · Safari ${safariVersion} · ${osVersion}`);
console.log(
  `\nOpen the frame in Safari with VoiceOver on, set the app locale to ${locale}, then walk each\n` +
    `phase below. After performing a step, press Enter here and VoiceOver's last phrase is read\n` +
    `back. Nothing is typed on your behalf.\n`,
);

const steps = [];
for (const phase of cohort.requiredPhases) {
  let captured = "";
  let command = "";
  for (;;) {
    console.log(`\n── ${phase} ──`);
    command = await ask("  command you performed (e.g. VO-Right, Tab, VO-Space): ");
    if (!command) {
      console.log("  ! a command is required — what did you press?");
      continue;
    }
    await ask("  perform it now, wait for VoiceOver to finish speaking, then press Enter…");
    try {
      captured = captureLastPhrase();
    } catch (error) {
      console.log(`  ! capture failed: ${error.message.split("\n")[0]}`);
      continue;
    }
    if (!captured) {
      console.log("  ! VoiceOver returned an empty phrase — nothing was announced, or the capture");
      console.log("    raced the speech. Repeat the step; this script will not write a blank.");
      continue;
    }
    console.log(`  ⟵ ${captured}`);
    const verdict = await ask("  [k]eep · [r]edo? (k) ", "k");
    if (verdict.toLowerCase().startsWith("k")) break;
  }
  steps.push({ phase, command, announced: captured });
}

console.log("\n── record ──");
const tester = await ask("  tester (your name, as it should be attested): ");
if (!tester) die("a record must name the person who listened to it");
const verdict = (await ask("  verdict [pass|fail] (pass): ", "pass")).toLowerCase();
if (!["pass", "fail"].includes(verdict)) die("verdict must be pass or fail");
let defectUrl;
if (verdict === "fail") {
  defectUrl = await ask("  defect URL (https://…): ");
  if (!/^https:\/\//.test(defectUrl)) die("a failing record needs an HTTPS defectUrl");
}

const testedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
const id = `${owner.replace(/\W+/g, "-")}-${COMBINATION_ID}-${locale}-${testedAt.slice(0, 10)}`;

// The speech log IS the artifact — evidenceUrl points at a real file, not a claim.
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
const artifactPath = path.join(ARTIFACT_DIR, `${id}.log`);
fs.writeFileSync(
  artifactPath,
  [
    `# ${owner} · ${cohort.id} · ${locale}`,
    `# VoiceOver ${voiceOverVersion} · Safari ${safariVersion} · macOS ${osVersion}`,
    `# frame ${frameUrl}`,
    `# captured ${testedAt} by ${tester}`,
    "",
    ...steps.map((step) => `[${step.phase}] ${step.command}\n  ${step.announced}`),
    "",
  ].join("\n"),
);

const record = {
  id,
  owner,
  combinationId: COMBINATION_ID,
  operatingSystem: combination.operatingSystem,
  operatingSystemVersion: osVersion,
  assistiveTechnology: combination.assistiveTechnology,
  assistiveTechnologyVersion: voiceOverVersion,
  browser: combination.browser,
  browserVersion: safariVersion,
  locale,
  frameUrl,
  entryCommand: steps[0].command,
  journey: cohort.requiredPhases.join(" → "),
  transcript: steps.map((step) => step.announced).join(" / "),
  captureMethod: "voiceover-last-phrase",
  evidenceUrl: path.relative(REPO_ROOT, artifactPath),
  testedAt,
  tester,
  verdict,
  ...(defectUrl ? { defectUrl } : {}),
  steps,
};

rl.close();

if (dryRun) {
  console.log(`\n(dry run — nothing written)\n${JSON.stringify(record, null, 2)}`);
  process.exit(0);
}

evidence.records.push(record);
fs.writeFileSync(EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`\n✓ record ${id} appended`);
console.log(`  transcript → ${path.relative(REPO_ROOT, artifactPath)}`);
console.log("  verify with: pnpm check:screen-reader-evidence");
