#!/usr/bin/env node
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("component-api-manifest.json", "utf8"));
const evidence = JSON.parse(fs.readFileSync("component-case-evidence.json", "utf8"));
const errors = [];
const missing = [];

if (manifest.schemaVersion !== 1 || evidence.schemaVersion !== 1) {
  errors.push("manifest and evidence schemaVersion must be 1");
}

for (const [component, componentEvidence] of Object.entries(evidence.components ?? {})) {
  if (!manifest.components[component]) {
    errors.push(`${component}: evidence references an unknown callable component export`);
    continue;
  }
  for (const prop of Object.keys(componentEvidence.props ?? {})) {
    if (!manifest.components[component].props.some((entry) => entry.name === prop)) {
      errors.push(`${component}.${prop}: evidence references a stale or nonexistent public prop`);
    }
  }
}

for (const [component, contract] of Object.entries(manifest.components)) {
  const componentEvidence = evidence.components?.[component];
  for (const prop of contract.props) {
    if (
      prop.origin === "inherited-behavioral" &&
      componentEvidence?.inheritedProps?.status === "pass-through"
    ) {
      if (
        !Array.isArray(componentEvidence.inheritedProps.evidence) ||
        !componentEvidence.inheritedProps.evidence.length
      ) {
        errors.push(`${component}.inheritedProps: pass-through evidence is required`);
      }
      continue;
    }
    const propEvidence = componentEvidence?.props?.[prop.name];
    if (!propEvidence) {
      missing.push(`${component}.${prop.name}`);
      continue;
    }
    if (!Array.isArray(propEvidence.evidence) || !propEvidence.evidence.length) {
      errors.push(
        `${component}.${prop.name}: at least one rendered/test evidence reference is required`,
      );
    }
    if (!Array.isArray(propEvidence.cases) || !propEvidence.cases.length) {
      errors.push(`${component}.${prop.name}: explicit cases are required`);
    }
    const absentValues = prop.values.filter(
      (value) => !propEvidence.cases.some((candidate) => Object.is(candidate, value)),
    );
    if (absentValues.length) {
      missing.push(`${component}.${prop.name} values=${JSON.stringify(absentValues)}`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const report = {
  callableComponents: Object.keys(manifest.components).length,
  coveredComponents: Object.keys(evidence.components ?? {}).length,
  publicProps: Object.values(manifest.components).reduce(
    (total, component) => total + component.props.length,
    0,
  ),
  ownedProps: Object.values(manifest.components).reduce(
    (total, component) => total + component.props.filter((prop) => prop.origin === "owned").length,
    0,
  ),
  inheritedBehavioralProps: Object.values(manifest.components).reduce(
    (total, component) =>
      total + component.props.filter((prop) => prop.origin === "inherited-behavioral").length,
    0,
  ),
  missing,
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--strict") && missing.length) process.exit(1);
