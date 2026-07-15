#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const manifestPath = process.env.COMPONENT_API_MANIFEST ?? "component-api-manifest.json";
const evidencePath = process.env.COMPONENT_CASE_EVIDENCE ?? "component-case-evidence.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const errors = [];
const missing = [];
const covered = [];

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
  for (const [prop, propEvidence] of Object.entries(componentEvidence.props ?? {})) {
    for (const reference of propEvidence.evidence ?? []) {
      if (
        typeof reference !== "string" ||
        path.isAbsolute(reference) ||
        reference.startsWith("..") ||
        !fs.existsSync(reference) ||
        !fs.statSync(reference).isFile()
      ) {
        errors.push(
          `${component}.${prop}: evidence path does not resolve to a repository file: ${reference}`,
        );
      }
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
      } else {
        for (const reference of componentEvidence.inheritedProps.evidence) {
          if (
            typeof reference !== "string" ||
            path.isAbsolute(reference) ||
            reference.startsWith("..") ||
            !fs.existsSync(reference) ||
            !fs.statSync(reference).isFile()
          ) {
            errors.push(
              `${component}.inheritedProps: evidence path does not resolve to a repository file: ${reference}`,
            );
          }
        }
        covered.push(`${component}.${prop.name}`);
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
      errors.push(
        `${component}.${prop.name}: declared evidence omits literal branches ${JSON.stringify(absentValues)}`,
      );
    } else {
      covered.push(`${component}.${prop.name}`);
    }
  }
  if (componentEvidence?.complete) {
    const componentMissing = missing.filter((entry) => entry.startsWith(`${component}.`));
    if (componentMissing.length) {
      errors.push(
        `${component}: complete evidence contract regressed; missing ${componentMissing.join(", ")}`,
      );
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const report = {
  callableComponents: Object.keys(manifest.components).length,
  evidencedComponents: Object.keys(evidence.components ?? {}).length,
  fullyCoveredComponents: Object.entries(manifest.components).filter(
    ([component, contract]) =>
      contract.props.length > 0 &&
      contract.props.every((prop) => covered.includes(`${component}.${prop.name}`)),
  ).length,
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
  coveredProps: covered.length,
  untestedProps: missing.length,
  missing,
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--strict") && missing.length) process.exit(1);
