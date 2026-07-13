import fs from "node:fs";
const map = JSON.parse(
  fs.readFileSync(new URL("../display-feedback-query-prop-cases.json", import.meta.url), "utf8"),
);
if (Object.keys(map).length < 25) throw new Error("display prop-case map is incomplete");
for (const [owner, cases] of Object.entries(map)) {
  if (!Object.keys(cases).length) throw new Error(`${owner}: empty prop-case map`);
  for (const [props, evidence] of Object.entries(cases)) {
    if (!props.trim() || !String(evidence).trim())
      throw new Error(`${owner}: incomplete prop evidence`);
  }
}
console.log(`display prop-case mappings valid: ${Object.keys(map).length}`);
