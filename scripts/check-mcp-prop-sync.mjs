#!/usr/bin/env node
/**
 * Prop-level MCP catalog sync guard. `check:mcp-sync` only verifies that every catalogued
 * COMPONENT exists in the library — it does NOT check props.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const componentsSrc = readFileSync(join(root, "mcp/src/data/components.ts"), "utf8");

const propFiles = ["general", "layout", "data-display", "data-entry", "feedback", "navigation"].map(
  (g) => readFileSync(join(root, `src/props/components/${g}.prop.ts`), "utf8"),
);
const allPropsSrc = propFiles.join("\n");

/** MCP component name → the `*Prop` type(s) whose literal fields it must document. */
const TYPE_OVERRIDES = {
  Select: ["SelectDataProp"], // public Select is a union; the data-driven shape is what's documented
};
/** Fields never required in the catalog (framework plumbing / native pass-through). */
const IGNORED_FIELDS = new Set([
  "className",
  "children",
  "style",
  "key",
  "ref",
  "data-testid",
  "asChild",
  // a11y pass-through plumbing (forwarded to the native control, not a catalog concept)
  "aria-labelledby",
  "aria-describedby",
  // callback PARAM that the field-splitter can leak from a nested signature
  "targetSelectedKeys",
]);

/** Extract the field names declared in the FIRST object literal(s) of `export type Name = …`. */
function literalFields(rawSrc, typeName) {
  /*
   * STRIP COMMENTS FIRST — this gate was blind to every prop that had documentation.
   *
   * The member split ran on text that still held its JSDoc, and the name regex anchors at `^\s*`,
   * so a member reading `\n  /** … *\/\n  gapRaw?: number` never matched: the comment sat where
   * the name had to be. The gate therefore only ever checked props that NOBODY had documented —
   * measured across `src/props/components/**`, 460 of 1019 declared props were invisible to it.
   *
   * That is the mechanism behind a failure already paid for: `Flex`'s `pad` / `padRaw` / `gapRaw`
   * shipped in code and never reached the MCP catalog, and an agent that queried the catalog
   * correctly concluded "Flex only has gap". The catalog drifted and the gate watching for drift
   * could not see the drifting half.
   *
   * Stripping before the brace scan, not after: a `{` inside a JSDoc example also skewed the
   * depth counter that finds the end of the type body.
   */
  const src = rawSrc.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  const start = src.indexOf(`export type ${typeName}`);
  if (start === -1) return null;
  const equals = src.indexOf("=", start);
  // Collect every `{ … }` block on the RHS up to the terminating `;` (handles `A & { … }`).
  const fields = new Set();
  let i = equals;
  const stop = src.indexOf("\nexport ", equals + 1);
  const limit = stop === -1 ? src.length : stop;
  while (i < limit) {
    const brace = src.indexOf("{", i);
    if (brace === -1 || brace > limit) break;
    let depth = 0;
    let end = brace;
    for (; end < src.length; end++) {
      if (src[end] === "{") depth++;
      if (src[end] === "}") depth--;
      if (depth === 0) break;
    }
    const body = src.slice(brace + 1, end);
    // Split into TOP-LEVEL members (a `;`/`,` at nesting depth 0), so keys inside a nested
    // function-param list `(file: …)`, a return-type literal `{ mediaId: … }`, or a nested
    // object prop are NOT mistaken for top-level props.
    let depthN = 0;
    let member = "";
    const members = [];
    for (const ch of body) {
      if ("{([<".includes(ch)) depthN++;
      else if ("})]>".includes(ch)) depthN--;
      if ((ch === ";" || ch === ",") && depthN === 0) {
        members.push(member);
        member = "";
      } else {
        member += ch;
      }
    }
    members.push(member);
    for (const m of members) {
      const key = m.match(/^\s*(?:"([^"]+)"|([A-Za-z_$][A-Za-z0-9_$]*))\??\s*:/);
      if (key) fields.add(key[1] ?? key[2]);
    }
    i = end + 1;
  }
  return fields;
}

/** Pull `{ name: "Foo", props: [ { name: "x" }, … ] }` blocks out of the catalog. */
function catalogProps(name) {
  const marker = `name: "${name}",`;
  const at = componentsSrc.indexOf(marker);
  if (at === -1) return null;
  const propsAt = componentsSrc.indexOf("props: [", at);
  if (propsAt === -1) return new Set();
  let depth = 0;
  let end = componentsSrc.indexOf("[", propsAt);
  for (; end < componentsSrc.length; end++) {
    if (componentsSrc[end] === "[") depth++;
    if (componentsSrc[end] === "]") depth--;
    if (depth === 0) break;
  }
  const body = componentsSrc.slice(propsAt, end);
  return new Set([...body.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]));
}

const failures = [];
// Every catalog component whose `<Name>Prop` (or an override) resolves to an object literal.
const names = [...componentsSrc.matchAll(/^\s{4}name:\s*"([A-Z][A-Za-z0-9]*)",/gm)].map(
  (m) => m[1],
);

for (const name of names) {
  const typeNames = TYPE_OVERRIDES[name] ?? [`${name}Prop`];
  const declared = new Set();
  let resolved = false;
  for (const t of typeNames) {
    const fields = literalFields(allPropsSrc, t);
    if (fields) {
      resolved = true;
      for (const f of fields) declared.add(f);
    }
  }
  if (!resolved) continue; // no matching prop type (composite/shell) — out of scope
  const documented = catalogProps(name);
  if (documented === null) continue;
  const missing = [...declared].filter((f) => !IGNORED_FIELDS.has(f) && !documented.has(f));
  if (missing.length > 0) {
    failures.push(
      `  ${name}: catalog is missing prop(s) ${missing.map((m) => `\`${m}\``).join(", ")}`,
    );
  }
}

if (failures.length > 0) {
  console.error(
    "✗ MCP catalog is missing documented props (update mcp/src/data/components.ts):\n" +
      failures.join("\n"),
  );
  process.exit(1);
}
console.log("✓ MCP prop sync guard passed — catalog documents every declared component prop.");
