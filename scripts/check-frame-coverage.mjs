import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const config = JSON.parse(
  fs.readFileSync(
    process.env.FRAME_COVERAGE_CONFIG ?? path.join(root, "frame-coverage.json"),
    "utf8",
  ),
);
const allowed = new Set(["pass", "untested", "not-applicable"]);
const dimensions = [
  "isolated",
  "props",
  "composition",
  "journey",
  "responsive",
  "rtl",
  "a11y",
  "touch",
  "screenReader",
  "async",
];
const errors = [];
if (config.schemaVersion !== 1) errors.push("schemaVersion must be 1");
for (const d of dimensions) {
  const e = config.dimensions?.[d];
  if (!e || !allowed.has(e.status)) errors.push(`${d}: invalid status`);
  if (e?.status !== "pass" && !e?.reason?.trim()) errors.push(`${d}: reason required`);
}
const excluded = new Set(config.excludeExports ?? []);
const rows = [];
const builtinAliases = {
  "charts/line-chart": "data-display/charts",
  "charts/bar-chart": "data-display/charts",
  "charts/area-chart": "data-display/charts",
  "charts/pie-chart": "data-display/charts",
  "data-entry/checkbox-group": "data-entry/checkbox",
  "data-entry/field": "data-entry/checkbox",
  "feedback/sonner": "feedback/toast",
  "layout/breadcrumb": "navigation/breadcrumb",
  "navigation/filter-bar": "navigation/toolbar",
  "query/query-refetch-button": "query/button-refetch",
};
const base = path.join(root, "src/components");
for (const dir of fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  const index = path.join(base, dir.name, "index.ts");
  if (!fs.existsSync(index)) continue;
  const source = fs.readFileSync(index, "utf8");
  const re = /export\s*\{([\s\S]*?)\}\s*from\s*["']\.\/([^"']+)["'];/g;
  for (const m of source.matchAll(re)) {
    const owner = m[2];
    const names = m[1]
      .split(",")
      .map((x) => x.trim().replace(/\s+as\s+.*/, ""))
      .filter((x) => /^[A-Z][A-Za-z0-9]*$/.test(x) && !excluded.has(x));
    if (!names.length) continue;
    const key = `${dir.name}/${owner}`;
    const stem = config.sourceAliases?.[key] ?? builtinAliases[key] ?? key;
    const file = path.join(root, "docs", `${stem}.tsx`);
    if (!fs.existsSync(file)) {
      errors.push(`${key}: missing docs frame ${path.relative(root, file)}`);
      continue;
    }
    for (const name of names) {
      const states = {};
      for (const d of dimensions) {
        const groupOverride = config.ownerGroups?.find(
          (group) => group.owners?.includes(key) && group.dimensions?.[d],
        )?.dimensions?.[d];
        const exportOverride = [...(config.exportGroups ?? []), ...(config.ownerGroups ?? [])].find(
          (group) => group.exports?.includes(name) && group.dimensions?.[d],
        )?.dimensions?.[d];
        const v =
          exportOverride ??
          config.overrides?.[name]?.[d] ??
          config.ownerOverrides?.[key]?.[d] ??
          groupOverride ??
          config.dimensions[d];
        if (!allowed.has(v.status)) errors.push(`${name}.${d}: invalid status`);
        if (v.status !== "pass" && !v.reason?.trim()) errors.push(`${name}.${d}: reason required`);
        states[d] = v;
      }
      rows.push({
        export: name,
        owner: key,
        frameId: stem.replaceAll("/", "-"),
        frameFile: path.relative(root, file),
        dimensions: states,
      });
    }
  }
}
const seen = new Set();
for (const row of rows) {
  if (seen.has(row.export)) errors.push(`duplicate export: ${row.export}`);
  seen.add(row.export);
}
if (!rows.length) errors.push("no public visual exports discovered");
if (errors.length) {
  console.error(
    `Frame coverage failed (${errors.length}):\n${errors.map((x) => `- ${x}`).join("\n")}`,
  );
  process.exit(1);
}
const totals = Object.fromEntries(
  dimensions.map((d) => [d, { pass: 0, untested: 0, "not-applicable": 0 }]),
);
for (const row of rows) for (const d of dimensions) totals[d][row.dimensions[d].status]++;
console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      exports: rows.length,
      frames: new Set(rows.map((r) => r.frameId)).size,
      totals,
      entries: rows,
    },
    null,
    2,
  ),
);
