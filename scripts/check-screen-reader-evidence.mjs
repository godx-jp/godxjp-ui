#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const evidencePath = process.env.SCREEN_READER_EVIDENCE_CONFIG ?? "screen-reader-evidence.json";
const ledger = JSON.parse(
  execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], { encoding: "utf8" }),
);
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const errors = [];
const owners = new Set(ledger.entries.map((entry) => entry.owner));
const passingOwners = new Set(
  ledger.entries
    .filter((entry) => entry.dimensions.screenReader.status === "pass")
    .map((entry) => entry.owner),
);

const requiredRecordFields = [
  "id",
  "owner",
  "combinationId",
  "operatingSystem",
  "operatingSystemVersion",
  "assistiveTechnology",
  "assistiveTechnologyVersion",
  "browser",
  "browserVersion",
  "locale",
  "frameUrl",
  "journey",
  "transcript",
  "captureMethod",
  "evidenceUrl",
  "testedAt",
  "tester",
];
const realCaptureMethods = new Set([
  "audio-recording",
  "at-speech-log",
  "voiceover-last-phrase",
  "nvda-speech-viewer",
]);
const forbiddenEvidenceTerms = /\b(?:axe|aria|accessibility[- ]tree|dom snapshot)\b/i;
const baselineLocales = new Set(["ja-JP", "vi-VN"]);
const baselineCombinations = new Map([
  ["voiceover-safari-macos", "all-interactive"],
  ["nvda-firefox-windows", "all-interactive"],
  ["nvda-chrome-windows-complex", "complex-composites-and-live-regions"],
]);

if (evidence.schemaVersion !== 2) errors.push("schemaVersion must be 2");
if (!Array.isArray(evidence.policy?.requiredLocales) || !evidence.policy.requiredLocales.length) {
  errors.push("policy.requiredLocales must be a non-empty array");
}
if (!Array.isArray(evidence.policy?.combinations) || !evidence.policy.combinations.length) {
  errors.push("policy.combinations must be a non-empty array");
}
if (!Array.isArray(evidence.policy?.complexOwners)) {
  errors.push("policy.complexOwners must be an array");
}
if (!Array.isArray(evidence.records)) errors.push("records must be an array");
for (const locale of baselineLocales) {
  if (!evidence.policy?.requiredLocales?.includes(locale)) {
    errors.push(`policy.requiredLocales cannot omit baseline locale ${locale}`);
  }
}

const combinations = new Map();
for (const combination of evidence.policy?.combinations ?? []) {
  for (const field of ["id", "operatingSystem", "assistiveTechnology", "browser", "appliesTo"]) {
    if (typeof combination[field] !== "string" || !combination[field].trim()) {
      errors.push(`combination ${combination.id ?? "<missing>"}: missing ${field}`);
    }
  }
  if (!["all-interactive", "complex-composites-and-live-regions"].includes(combination.appliesTo)) {
    errors.push(`${combination.id ?? "<missing>"}: invalid appliesTo`);
  }
  if (combinations.has(combination.id)) errors.push(`${combination.id}: duplicate combination id`);
  combinations.set(combination.id, combination);
}
for (const [id, appliesTo] of baselineCombinations) {
  const combination = combinations.get(id);
  if (!combination) {
    errors.push(`policy.combinations cannot omit baseline combination ${id}`);
  } else if (combination.appliesTo !== appliesTo) {
    errors.push(`${id}: baseline appliesTo cannot be weakened`);
  }
}

for (const owner of evidence.policy?.complexOwners ?? []) {
  if (!owners.has(owner)) errors.push(`${owner}: policy.complexOwners references an unknown owner`);
}

const records = Array.isArray(evidence.records) ? evidence.records : [];
const recordIds = new Set();
for (const record of records) {
  const label = record.id || record.owner || "<missing>";
  for (const field of requiredRecordFields) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      errors.push(`${label}: evidence record is missing ${field}`);
    }
  }
  if (recordIds.has(record.id)) errors.push(`${label}: duplicate record id`);
  recordIds.add(record.id);
  if (!owners.has(record.owner)) errors.push(`${label}: evidence references an unknown owner`);
  const combination = combinations.get(record.combinationId);
  if (!combination) {
    errors.push(`${label}: unknown combinationId ${record.combinationId ?? "<missing>"}`);
  } else {
    for (const field of ["operatingSystem", "assistiveTechnology", "browser"]) {
      if (record[field] !== combination[field]) {
        errors.push(`${label}: ${field} must match combination ${record.combinationId}`);
      }
    }
  }
  if (!(evidence.policy?.requiredLocales ?? []).includes(record.locale)) {
    errors.push(`${label}: locale is not listed in policy.requiredLocales`);
  }
  try {
    const frameUrl = new URL(record.frameUrl);
    if (!["http:", "https:"].includes(frameUrl.protocol)) throw new Error();
  } catch {
    errors.push(`${label}: frameUrl must be an HTTP(S) URL`);
  }
  if (!realCaptureMethods.has(record.captureMethod)) {
    errors.push(`${label}: captureMethod must identify a real AT speech capture`);
  }
  if (forbiddenEvidenceTerms.test(`${record.captureMethod} ${record.evidenceUrl}`)) {
    errors.push(`${label}: Axe/DOM/ARIA/accessibility-tree output is not screen-reader evidence`);
  }
  if (!/^https:\/\//.test(record.evidenceUrl ?? "")) {
    const artifact = path.resolve(path.dirname(evidencePath), record.evidenceUrl ?? "");
    const root = path.resolve(path.dirname(evidencePath));
    if (
      !record.evidenceUrl ||
      !artifact.startsWith(`${root}${path.sep}`) ||
      !fs.existsSync(artifact)
    ) {
      errors.push(
        `${label}: evidenceUrl must be HTTPS or an existing repository-relative artifact`,
      );
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(record.testedAt ?? "")) {
    errors.push(`${label}: testedAt must be an ISO-8601 UTC timestamp`);
  }
  if (!["pass", "fail"].includes(record.verdict)) {
    errors.push(`${label}: evidence verdict must be pass or fail`);
  }
  if (record.verdict === "fail" && !/^https:\/\//.test(record.defectUrl ?? "")) {
    errors.push(`${label}: failing evidence requires an HTTPS defectUrl`);
  }
}

const complexOwners = new Set(evidence.policy?.complexOwners ?? []);
for (const owner of passingOwners) {
  const requiredCombinations = [...combinations.values()].filter(
    (combination) =>
      combination.appliesTo === "all-interactive" ||
      (combination.appliesTo === "complex-composites-and-live-regions" && complexOwners.has(owner)),
  );
  for (const combination of requiredCombinations) {
    for (const locale of evidence.policy?.requiredLocales ?? []) {
      const record = records.find(
        (candidate) =>
          candidate.owner === owner &&
          candidate.combinationId === combination.id &&
          candidate.locale === locale &&
          candidate.verdict === "pass",
      );
      if (!record) {
        errors.push(`${owner}: screenReader PASS lacks ${combination.id} evidence for ${locale}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `screen-reader evidence valid: ${passingOwners.size} passing owner(s), ${records.length} real-AT record(s)`,
);
