import fs from "node:fs";

const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const file = new URL("../display-runtime-evidence.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];

for (const frame of data.frames ?? []) {
  if (!frame.id || !["pass", "fail", "untested"].includes(frame.verdict)) {
    errors.push(`${frame.id ?? "<missing>"}: invalid identity or verdict`);
    continue;
  }
  if (frame.verdict === "untested" && !frame.reason)
    errors.push(`${frame.id}: untested needs reason`);
  if (frame.verdict !== "untested") {
    if (JSON.stringify(frame.widths) !== JSON.stringify(widths)) {
      errors.push(`${frame.id}: PASS/FAIL requires all eight widths`);
    }
    for (const gate of ["overflow", "a11y", "rtl", "keyboard"]) {
      if (!["pass", "fail", "not-applicable"].includes(frame[gate])) {
        errors.push(`${frame.id}.${gate}: missing executed verdict`);
      }
    }
    if (!frame.evidence?.length) errors.push(`${frame.id}: executed verdict needs evidence`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`display runtime evidence valid: ${data.frames.length} frames`);
