#!/usr/bin/env node
/**
 * An AI consumer copies MCP "patterns" verbatim. `Stack` from `@godxjp/ui/layout` after
 * Stack→Flex), or names an undefined library CSS class (`settings-layout`), the consumer gets code
 * that does not compile or that silently renders unstyled.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";

const ROOT = process.cwd();

// ── 1) Resolve the REAL export set of every public @godxjp/ui subpath ────────────────────────
// package.json `exports` maps a subpath → a dist `.d.ts`; the same tree lives under src/. We map
// dist → src and then read the exported names straight from the barrel (source of truth, no build).
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

function distTypesToSrc(distTypes) {
  // "./dist/components/layout/index.d.ts" → "src/components/layout/index.ts"
  const rel = distTypes
    .replace(/^\.\//, "")
    .replace(/^dist\//, "src/")
    .replace(/\.d\.ts$/, ".ts");
  return join(ROOT, rel);
}

/** subpath specifier (e.g. "@godxjp/ui/layout") → absolute src barrel file. */
const SUBPATH_TO_BARREL = new Map();
for (const [key, val] of Object.entries(pkg.exports ?? {})) {
  const types = typeof val === "object" && val ? val.types : undefined;
  if (!types || !types.endsWith(".d.ts")) continue; // CSS / wildcard entries have no named exports
  const spec = key === "." ? "@godxjp/ui" : `@godxjp/ui/${key.replace(/^\.\//, "")}`;
  SUBPATH_TO_BARREL.set(spec, distTypesToSrc(types));
}

/** Recursively collect the PascalCase/camelCase names a barrel file exports. */
function collectExports(file, seen = new Set()) {
  const names = new Set();
  if (seen.has(file) || !existsSync(file)) return names;
  seen.add(file);
  const src = readFileSync(file, "utf8");

  // export function/const/class/enum Name
  for (const m of src.matchAll(
    /export\s+(?:async\s+)?(?:function|const|class|enum)\s+([A-Za-z_$][\w$]*)/g,
  ))
    names.add(m[1]);

  // export { a, b as c, type d } [from "./rel"]  — and  export type { … } [from "./rel"]
  for (const m of src.matchAll(
    /export\s+(?:type\s+)?\{([^}]+)\}(?:\s+from\s+["']([^"']+)["'])?/g,
  )) {
    for (const part of m[1].split(",")) {
      const name = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  }

  // export * from "./rel"  →  recurse into the re-exported barrel
  for (const m of src.matchAll(/export\s+\*\s+from\s+["'](\.[^"']+)["']/g)) {
    for (const n of collectExports(resolveRel(file, m[1]), seen)) names.add(n);
  }
  return names;
}

function resolveRel(fromFile, rel) {
  const base = resolve(dirname(fromFile), rel);
  for (const cand of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")])
    if (existsSync(cand)) return cand;
  return `${base}.ts`;
}

const EXPORTS_BY_SUBPATH = new Map();
for (const [spec, barrel] of SUBPATH_TO_BARREL)
  EXPORTS_BY_SUBPATH.set(spec, collectExports(barrel));

// ── 2) Load the canonical patterns (transpile patterns.ts, no build needed) ──────────────────
function loadPatterns() {
  const file = join(ROOT, "mcp/src/data/patterns.ts");
  const source = readFileSync(file, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "module", "require", js)(module.exports, module, () => ({}));
  return module.exports.PATTERNS ?? [];
}

// ── 3) Denylist matchers (precise API forms only — never prose) ──────────────────────────────
const REMOVED_API = [
  {
    label: "import of removed layout primitive Stack/Inline",
    re: /import\s+(?:type\s+)?\{[^}]*\b(?:Stack|Inline)\b[^}]*\}\s+from\s+["']@godxjp\/ui[^"']*["']/g,
  },
  {
    label: 'removed JSX <Stack>/<Inline> (use <Flex direction="col">)',
    re: /<\/?(?:Stack|Inline)(?=[\s/>])/g,
  },
  {
    label: "removed prop type StackProp/InlineProp/StackGapProp/InlineGapProp",
    re: /\b(?:Stack|Inline)(?:Gap)?Prop\b/g,
  },
];
const UNDEFINED_CLASS = {
  label: "undefined library CSS class settings-* (no such class ships)",
  re: /\bsettings-(?:layout|local-nav|content|[a-z-]+)\b/g,
};

// ── run ──────────────────────────────────────────────────────────────────────────────────────
const importViolations = [];
const denylistViolations = [];

for (const p of loadPatterns()) {
  const code = String(p.code ?? "");
  // 3a) validate every @godxjp/ui import
  for (const m of code.matchAll(
    /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["'](@godxjp\/ui[^"']*)["']/g,
  )) {
    const spec = m[2];
    const exp = EXPORTS_BY_SUBPATH.get(spec);
    if (!exp) {
      importViolations.push(
        `pattern "${p.name}": unknown subpath "${spec}" (not in package.json exports)`,
      );
      continue;
    }
    for (const raw of m[1].split(",")) {
      const name = raw
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        ?.trim();
      if (name && !exp.has(name))
        importViolations.push(`pattern "${p.name}": "${name}" is not exported by "${spec}"`);
    }
  }
  // 3b) denylist inside pattern code + tagline
  const hay = `${p.tagline ?? ""}\n${code}`;
  for (const { label, re } of REMOVED_API)
    for (const m of hay.matchAll(re))
      denylistViolations.push(`pattern "${p.name}": ${label} — "${m[0]}"`);
  for (const m of hay.matchAll(UNDEFINED_CLASS.re))
    denylistViolations.push(`pattern "${p.name}": ${UNDEFINED_CLASS.label} — "${m[0]}"`);
}

// 3c) denylist across MCP catalog data + docs (prose is safe; only API forms match)
function walkFiles(dir, test, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkFiles(full, test, out);
    else if (test(full)) out.push(full);
  }
  return out;
}
const SCAN_FILES = [
  ...walkFiles(join(ROOT, "mcp/src/data"), (f) => f.endsWith(".ts")),
  ...walkFiles(join(ROOT, "docs"), (f) => f.endsWith(".md")),
];
for (const file of SCAN_FILES) {
  const rel = file.slice(ROOT.length + 1);
  if (rel === "mcp/src/data/patterns.ts") continue; // already scanned per-pattern above
  const text = readFileSync(file, "utf8");
  for (const { label, re } of REMOVED_API)
    for (const m of text.matchAll(re)) denylistViolations.push(`${rel}: ${label} — "${m[0]}"`);
  for (const m of text.matchAll(UNDEFINED_CLASS.re))
    denylistViolations.push(`${rel}: ${UNDEFINED_CLASS.label} — "${m[0]}"`);
}

const failed = importViolations.length + denylistViolations.length > 0;
if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({ importViolations, denylistViolations }, null, 2) + "\n");
} else if (!failed) {
  const patterns = loadPatterns().length;
  console.log(
    `✓ MCP pattern imports resolve — ${patterns} canonical patterns validated against ${EXPORTS_BY_SUBPATH.size} ` +
      `real @godxjp/ui subpaths; no removed Stack/Inline API or undefined settings-* class in catalog/docs.`,
  );
} else {
  if (importViolations.length) {
    console.error(
      `✗ ${importViolations.length} MCP pattern import(s) do not resolve against the released package:`,
    );
    for (const v of importViolations) console.error(`  • ${v}`);
  }
  if (denylistViolations.length) {
    console.error(
      `\n✗ ${denylistViolations.length} reference(s) to a removed component or undefined library CSS class:`,
    );
    for (const v of denylistViolations) console.error(`  • ${v}`);
  }
  console.error(
    '\nPatterns/docs must name only real exports & classes. Stack/Inline → Flex (direction="col"); ' +
      "settings-* classes do not exist — compose real primitives/tokens.",
  );
}
process.exit(failed ? 1 : 0);
