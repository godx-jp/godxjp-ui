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
const exportNames = new Set(ledger.entries.map((entry) => entry.export));
const passingOwners = new Set(
  ledger.entries
    .filter((entry) => entry.dimensions.screenReader.status === "pass")
    .map((entry) => entry.owner),
);
const notApplicableEntries = ledger.entries.filter(
  (entry) => entry.dimensions.screenReader.status === "not-applicable",
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
  "entryCommand",
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
const isoUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const baselineLocales = new Set(["ja-JP", "vi-VN"]);
const baselineCombinations = new Map([
  ["voiceover-safari-macos", "all-interactive"],
  ["nvda-firefox-windows", "all-interactive"],
  ["nvda-chrome-windows-complex", "complex-composites-and-live-regions"],
]);
// Journey phases mirror issue #171 "Evidence required per owner": focus entry, internal
// navigation, activation, escape/close, focus return, the form error/help/required/invalid
// announcements and the live/async loading/success/error/recovery announcements.
const journeyPhases = new Set([
  "landmark-navigation",
  "focus-entry",
  "internal-navigation",
  "activation",
  "value-change",
  "escape-close",
  "focus-return",
  "required-announcement",
  "help-announcement",
  "invalid-announcement",
  "error-announcement",
  "loading-announcement",
  "success-announcement",
  "recovery-announcement",
]);
// The seven owner cohorts named in issue #171. A cohort's baseline phases may be extended by
// policy but never weakened — that is how "error/help/required/invalid for form owners" and
// "loading/success/error/recovery for live/async owners" stay mandatory.
const baselineCohorts = new Map([
  ["landmarks-page-structure", ["landmark-navigation", "focus-entry", "internal-navigation"]],
  [
    "native-form-controls",
    [
      "focus-entry",
      "value-change",
      "required-announcement",
      "help-announcement",
      "invalid-announcement",
      "error-announcement",
    ],
  ],
  [
    "selection-composites",
    [
      "focus-entry",
      "internal-navigation",
      "activation",
      "value-change",
      "escape-close",
      "focus-return",
    ],
  ],
  ["overlays", ["focus-entry", "internal-navigation", "escape-close", "focus-return"]],
  ["navigation-composites", ["focus-entry", "internal-navigation", "activation"]],
  ["data-structures", ["focus-entry", "internal-navigation", "activation"]],
  [
    "live-async-feedback",
    ["loading-announcement", "success-announcement", "error-announcement", "recovery-announcement"],
  ],
]);

if (evidence.schemaVersion !== 3) errors.push("schemaVersion must be 3");
if (!Array.isArray(evidence.policy?.requiredLocales) || !evidence.policy.requiredLocales.length) {
  errors.push("policy.requiredLocales must be a non-empty array");
}
if (!Array.isArray(evidence.policy?.combinations) || !evidence.policy.combinations.length) {
  errors.push("policy.combinations must be a non-empty array");
}
if (!Array.isArray(evidence.policy?.cohorts) || !evidence.policy.cohorts.length) {
  errors.push("policy.cohorts must be a non-empty array");
}
if (!Array.isArray(evidence.policy?.complexOwners)) {
  errors.push("policy.complexOwners must be an array");
}
if (!Array.isArray(evidence.policy?.notApplicable)) {
  errors.push("policy.notApplicable must be an array");
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

// ---------------------------------------------------------------------------
// Owner cohort registry (#171 "Owner cohorts"). Evidence is recorded per owner
// JOURNEY, so every promotable owner must belong to exactly one cohort.
// ---------------------------------------------------------------------------
const cohorts = new Map();
const cohortByOwner = new Map();
for (const cohort of evidence.policy?.cohorts ?? []) {
  const label = cohort.id ?? "<missing>";
  for (const field of ["id", "title"]) {
    if (typeof cohort[field] !== "string" || !cohort[field].trim()) {
      errors.push(`cohort ${label}: missing ${field}`);
    }
  }
  if (cohorts.has(cohort.id)) errors.push(`cohort ${label}: duplicate cohort id`);
  if (!Array.isArray(cohort.requiredPhases) || !cohort.requiredPhases.length) {
    errors.push(`cohort ${label}: requiredPhases must be a non-empty array`);
  }
  for (const phase of cohort.requiredPhases ?? []) {
    if (!journeyPhases.has(phase)) errors.push(`cohort ${label}: unknown journey phase ${phase}`);
  }
  if (!Array.isArray(cohort.owners) || !cohort.owners.length) {
    errors.push(`cohort ${label}: owners must be a non-empty array`);
  }
  for (const owner of cohort.owners ?? []) {
    if (!owners.has(owner)) errors.push(`cohort ${label}: unknown owner ${owner}`);
    if (cohortByOwner.has(owner)) {
      errors.push(`${owner}: owner is mapped to both ${cohortByOwner.get(owner)} and ${label}`);
      continue;
    }
    cohortByOwner.set(owner, cohort.id);
  }
  cohorts.set(cohort.id, cohort);
}
for (const [id, requiredPhases] of baselineCohorts) {
  const cohort = cohorts.get(id);
  if (!cohort) {
    errors.push(`policy.cohorts cannot omit baseline cohort ${id}`);
    continue;
  }
  for (const phase of requiredPhases) {
    if (!cohort.requiredPhases?.includes(phase)) {
      errors.push(`cohort ${id}: baseline requiredPhases cannot drop ${phase}`);
    }
  }
}

for (const owner of evidence.policy?.complexOwners ?? []) {
  if (!owners.has(owner)) errors.push(`${owner}: policy.complexOwners references an unknown owner`);
  else if (!cohortByOwner.has(owner)) {
    errors.push(`${owner}: policy.complexOwners entry is not mapped to a cohort`);
  }
}

// ---------------------------------------------------------------------------
// Reviewed not-applicable registry. A static/decorative owner may leave
// `untested` only through an explicit, reasoned and attributed review.
// ---------------------------------------------------------------------------
const notApplicableOwners = new Set();
const notApplicableExports = new Set();
for (const review of evidence.policy?.notApplicable ?? []) {
  const label = review.target ?? "<missing>";
  for (const field of ["target", "scope", "reason", "reviewedBy", "reviewedIn", "reviewedAt"]) {
    if (typeof review[field] !== "string" || !review[field].trim()) {
      errors.push(`not-applicable ${label}: missing ${field}`);
    }
  }
  if (!["owner", "export"].includes(review.scope)) {
    errors.push(`not-applicable ${label}: scope must be owner or export`);
  }
  if ((review.reason ?? "").trim().length < 40) {
    errors.push(`not-applicable ${label}: reason must explain why no AT journey exists`);
  }
  if (!/^https:\/\//.test(review.reviewedIn ?? "")) {
    errors.push(`not-applicable ${label}: reviewedIn must be an HTTPS review link`);
  }
  if (!isoUtc.test(review.reviewedAt ?? "")) {
    errors.push(`not-applicable ${label}: reviewedAt must be an ISO-8601 UTC timestamp`);
  }
  if (review.scope === "owner") {
    if (!owners.has(review.target)) errors.push(`not-applicable ${label}: unknown owner`);
    if (cohortByOwner.has(review.target)) {
      errors.push(
        `not-applicable ${label}: an interactive cohort owner (${cohortByOwner.get(review.target)}) cannot be waived`,
      );
    }
    if (notApplicableOwners.has(review.target)) errors.push(`not-applicable ${label}: duplicate`);
    notApplicableOwners.add(review.target);
  }
  if (review.scope === "export") {
    if (!exportNames.has(review.target)) errors.push(`not-applicable ${label}: unknown export`);
    if (notApplicableExports.has(review.target)) errors.push(`not-applicable ${label}: duplicate`);
    notApplicableExports.add(review.target);
  }
}
for (const entry of notApplicableEntries) {
  if (notApplicableExports.has(entry.export) || notApplicableOwners.has(entry.owner)) continue;
  errors.push(
    `${entry.export}: screenReader not-applicable requires a reviewed policy.notApplicable entry`,
  );
}
const waivedTargets = new Set(notApplicableEntries.map((entry) => entry.export));
const waivedOwners = new Set(notApplicableEntries.map((entry) => entry.owner));
for (const target of notApplicableExports) {
  if (!waivedTargets.has(target)) {
    errors.push(`not-applicable ${target}: no ledger export is marked not-applicable`);
  }
}
for (const target of notApplicableOwners) {
  if (!waivedOwners.has(target)) {
    errors.push(`not-applicable ${target}: no ledger export of this owner is not-applicable`);
  }
}

// ---------------------------------------------------------------------------
// Evidence records.
// ---------------------------------------------------------------------------
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
  else if (!cohortByOwner.has(record.owner)) {
    errors.push(`${label}: owner ${record.owner} is not mapped to a policy cohort`);
  }
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
  if (!isoUtc.test(record.testedAt ?? "")) {
    errors.push(`${label}: testedAt must be an ISO-8601 UTC timestamp`);
  }
  if (!["pass", "fail"].includes(record.verdict)) {
    errors.push(`${label}: evidence verdict must be pass or fail`);
  }
  if (record.verdict === "fail" && !/^https:\/\//.test(record.defectUrl ?? "")) {
    errors.push(`${label}: failing evidence requires an HTTPS defectUrl`);
  }

  const observedPhases = new Set();
  if (!Array.isArray(record.steps) || !record.steps.length) {
    errors.push(`${label}: steps must be a non-empty transcript of the announced journey`);
  } else {
    record.steps.forEach((step, index) => {
      const stepLabel = `${label} step ${index + 1}`;
      for (const field of ["phase", "command", "announced"]) {
        if (typeof step?.[field] !== "string" || !step[field].trim()) {
          errors.push(`${stepLabel}: missing ${field}`);
        }
      }
      if (step?.phase && !journeyPhases.has(step.phase)) {
        errors.push(`${stepLabel}: unknown journey phase ${step.phase}`);
      } else if (step?.phase) {
        observedPhases.add(step.phase);
      }
    });
  }
  const cohortId = cohortByOwner.get(record.owner);
  if (record.verdict === "pass" && cohortId) {
    for (const phase of cohorts.get(cohortId)?.requiredPhases ?? []) {
      if (!observedPhases.has(phase)) {
        errors.push(`${label}: passing ${cohortId} evidence has no ${phase} announcement`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Ledger promotion gate: an export leaves `untested` only through a linked,
// passing owner evidence record for every applicable combination × locale.
// ---------------------------------------------------------------------------
const complexOwners = new Set(evidence.policy?.complexOwners ?? []);
for (const owner of passingOwners) {
  if (!cohortByOwner.has(owner)) {
    errors.push(`${owner}: screenReader PASS requires the owner to be mapped to a cohort`);
  }
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

const unmapped = [...owners].filter(
  (owner) => !cohortByOwner.has(owner) && !notApplicableOwners.has(owner),
);
console.log(
  `screen-reader evidence valid: ${cohorts.size} cohort(s) mapping ${cohortByOwner.size}/${owners.size} owner(s), ` +
    `${unmapped.length} unmapped owner(s), ${notApplicableEntries.length} reviewed not-applicable export(s), ` +
    `${passingOwners.size} passing owner(s), ${records.length} real-AT record(s)`,
);
