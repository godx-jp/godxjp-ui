#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ledger = JSON.parse(
  execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], { encoding: "utf8" }),
);
const evidence = JSON.parse(
  fs.readFileSync(
    process.env.SCREEN_READER_EVIDENCE_CONFIG ?? "screen-reader-evidence.json",
    "utf8",
  ),
);
const records = new Map((evidence.records ?? []).map((record) => [record.owner, record]));
const required = [
  "owner",
  "operatingSystem",
  "assistiveTechnology",
  "assistiveTechnologyVersion",
  "browser",
  "browserVersion",
  "locale",
  "frameUrl",
  "journey",
  "transcript",
  "evidenceUrl",
  "testedAt",
];
const errors = [];
const passingOwners = new Set(
  ledger.entries
    .filter((entry) => entry.dimensions.screenReader.status === "pass")
    .map((entry) => entry.owner),
);

for (const owner of passingOwners) {
  const record = records.get(owner);
  if (!record) {
    errors.push(`${owner}: screenReader PASS has no real-AT evidence record`);
    continue;
  }
  for (const field of required) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      errors.push(`${owner}: evidence record is missing ${field}`);
    }
  }
  if (!["pass", "fail"].includes(record.verdict)) {
    errors.push(`${owner}: evidence verdict must be pass or fail`);
  }
  if (record.verdict !== "pass") {
    errors.push(`${owner}: ledger cannot claim PASS from a non-passing evidence record`);
  }
}

for (const record of evidence.records ?? []) {
  if (!record.owner || !ledger.entries.some((entry) => entry.owner === record.owner)) {
    errors.push(`${record.owner ?? "<missing>"}: evidence references an unknown owner`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `screen-reader evidence valid: ${passingOwners.size} passing owner(s), ${(evidence.records ?? []).length} record(s)`,
);
