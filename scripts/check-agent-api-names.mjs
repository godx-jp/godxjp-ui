#!/usr/bin/env node
/**
 * check:agent-api-names — every name the consumer guidance presents as package API must exist in
 * the PACKED declarations, and every path it points at must exist and ship.
 *
 * WHY. `agent/rules.json` told consumers to call `initI18n()` and `addResourceBundle`, and the
 * README listed components the catalog had already absorbed. Nothing compared prose to the package
 * a consumer actually installs, so the guidance drifted for as long as both existed. The truth is
 * `dist/**\/*.d.ts` reached through the `package.json` export map: that is what npm publishes and
 * what a consumer's compiler sees. Source barrels are not the contract.
 *
 * WHAT IT CHECKS
 *   1. NAMES   — in `agent/rules.json` and in the README (prose, tables, code blocks): every
 *                identifier that reads as package API (a `<Component>`, a PascalCase name, a
 *                `useHook`, a `camelCase(call)`) must be an export of some public entry point. A
 *                README import statement must resolve against the subpath it imports from, and a
 *                README table row that names a subpath must resolve its examples against it.
 *   2. SUBPATHS — every `@godxjp/ui/<subpath>` mentioned must be a key of the export map.
 *   3. LINKS   — every repo path (`docs/X.md`, `src/...`, `scripts/...`) and every raw.github
 *                `agent/` URL in `agent/**` must exist; every `docs/*.md` it names must also be
 *                covered by the `package.json` `files` list, because a consumer reading
 *                `node_modules/@godxjp/ui/docs/X.md` gets a 404 for a file that is not packed.
 *
 * FAILS CLOSED. No `dist/`, zero exports, or zero extracted names is a failure, never a pass: a
 * gate that resolves nothing proves nothing.
 *
 * `--propose-files` prints the `docs` files the shipped scripts and `agent/` read, i.e. the named
 * list that can replace the blanket `docs` entry in `package.json` `files`.
 *
 * Run from the repo root after `pnpm build`.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

/**
 * Identifiers that look like package API in prose but are somebody else's. Each carries its reason;
 * a name here is a claim that it is not ours, so keep it short and honest.
 */
export const NOT_PACKAGE_API = {
  forwardRef: "React",
  ComponentPropsWithoutRef: "React",
  React: "React",
  Intl: "ECMAScript Intl",
  Math: "ECMAScript",
  Date: "ECMAScript",
  JSON: "ECMAScript",
  Array: "ECMAScript",
  Promise: "ECMAScript",
  Boolean: "ECMAScript",
  Number: "ECMAScript",
  String: "ECMAScript",
  Object: "ECMAScript",
  Error: "ECMAScript",
  Tailwind: "third-party product name",
  Radix: "third-party product name",
  Storybook: "third-party product name",
  TypeScript: "third-party product name",
  GitHub: "third-party product name",
  Playwright: "third-party product name",
  Vite: "third-party product name",
  Inertia: "third-party product name",
  Wayfinder: "third-party product name",
  Laravel: "third-party product name",
  React19: "third-party product name",
  SemVer: "specification name",
  WCAG: "specification name",
  CSS: "language name",
  HTML: "language name",
  CJK: "script name",
  JIS: "standard name",
  CLDR: "standard name",
  APG: "standard name",
  ARIA: "standard name",
  RTL: "standard name",
  ADR: "document type",
  CHANGELOG: "file name",
  README: "file name",
  AGENTS: "file name",
  "Keep a Changelog": "specification name",
};

const PACKAGE = "@godxjp/ui";

/* ---------- 1. what the package exports ---------- */

/**
 * `{ subpath -> Set<exportName> }` read from the export map's `types` targets with the TypeScript
 * checker, so `export *` chains and re-exports resolve exactly as they do for a consumer.
 */
export function readPackedExports(
  root,
  pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")),
) {
  const entries = [];
  for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
    if (subpath.includes("*")) continue;
    const types = typeof target === "string" ? target : target?.types;
    if (typeof types !== "string" || !types.endsWith(".d.ts")) continue;
    const file = join(root, types);
    if (existsSync(file)) entries.push([subpath, file]);
  }
  const bySubpath = new Map();
  if (entries.length === 0) return bySubpath;
  const program = ts.createProgram(
    entries.map(([, file]) => file),
    {
      noEmit: true,
      skipLibCheck: true,
      types: [],
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  );
  const checker = program.getTypeChecker();
  for (const [subpath, file] of entries) {
    const source = program.getSourceFile(file);
    const symbol = source && checker.getSymbolAtLocation(source);
    const names = new Set(symbol ? checker.getExportsOfModule(symbol).map((s) => s.getName()) : []);
    bySubpath.set(subpath, names);
  }
  return bySubpath;
}

/* ---------- 2. what the guidance claims ---------- */

const FENCE = /^```(\w*)\n([\s\S]*?)^```/gm;
const SPAN = /`([^`\n]+)`/g;
const PASCAL = /^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/;
const HOOK = /^use[A-Z][A-Za-z0-9]*$/;

/** Names a single backtick span (or code line) presents as API. */
export function namesInSpan(span) {
  if (/^(--|\/|\.|src\/|docs\/|scripts\/|@|#|https?:|[a-z-]+:)/.test(span)) return [];
  if (!/\s/.test(span) && span.includes("/")) return []; // a path or a URL, not an identifier
  const out = new Set();
  for (const m of span.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) out.add(m[1]);
  for (const m of span.matchAll(/\b([A-Za-z_$][\w$]*)\(/g)) {
    if (/[A-Z]/.test(m[1])) out.add(m[1]);
  }
  const [first, ...rest] = span.trim().split(/\s+/);
  const head = first
    .replace(/<.*$/, "")
    .replace(/\.[A-Z]\w*$/, "")
    .replace(/[,;:]+$/, "");
  const restLooksLikeProps = rest.every(
    (w) => /^[a-z][\w-]*(=.*)?[,;]?$/.test(w) || /^[{}]/.test(w),
  );
  if ((PASCAL.test(head) || HOOK.test(head)) && restLooksLikeProps) out.add(head);
  return [...out];
}

/** All package-API names in markdown/JSON prose, spans only. */
export function namesInProse(text) {
  const names = [];
  for (const m of text.matchAll(SPAN)) for (const name of namesInSpan(m[1])) names.push(name);
  return names;
}

/** `[ { subpath, names } ]` for each `import { … } from "@godxjp/ui…"` in the fenced code. */
export function importsInFences(markdown) {
  const found = [];
  for (const fence of markdown.matchAll(FENCE)) {
    for (const m of fence[2].matchAll(
      /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["'](@godxjp\/ui[^"']*)["']/g,
    )) {
      const names = m[1]
        .split(",")
        .map(
          (s) =>
            s
              .trim()
              .replace(/^type\s+/, "")
              .split(/\s+as\s+/)[0],
        )
        .filter(Boolean);
      found.push({ subpath: "." + m[2].slice(PACKAGE.length), names });
    }
  }
  return found;
}

/** Every `@godxjp/ui/<subpath>` mentioned anywhere in the text, as an export-map key. */
export function subpathsMentioned(text) {
  const out = new Set();
  for (const m of text.matchAll(/@godxjp\/ui((?:\/[a-z0-9][a-z0-9-]*)+)(?![\w-])/g)) {
    // `@godxjp/ui/dist/...`, `/agent/...`, `/scripts/...` and `/docs/...` are FILE paths inside the package
    if (!/^\/(dist|agent|scripts|docs)(\/|$)/.test(m[1])) out.add("." + m[1]);
  }
  return [...out];
}

/** README table rows that name one subpath in backticks, with the API names in the same row. */
export function rowsWithSubpath(markdown) {
  const rows = [];
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("|")) continue;
    const subpaths = subpathsMentioned(line);
    if (subpaths.length !== 1) continue;
    const cells = line.split("|").slice(1, -1);
    const names = cells.filter((c) => !c.includes("@godxjp/ui")).flatMap((c) => namesInProse(c));
    if (names.length) rows.push({ subpath: subpaths[0], names });
  }
  return rows;
}

/** Names in the left column of the migration table: they are REMOVED, so they are not API. */
export function removedNames(markdown) {
  const section = markdown.split(/^## /m).find((s) => /^Migrating/.test(s)) ?? "";
  const removed = new Set();
  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) continue;
    const first = line.split("|")[1] ?? "";
    for (const name of namesInProse(first)) removed.add(name);
  }
  return removed;
}

/* ---------- 3. what the guidance points at ---------- */

const PATH_REF =
  /(?<![\w./-])((?:docs|scripts|src|mcp|examples|agent)\/[A-Za-z0-9_.@/-]*[A-Za-z0-9_]\.(?:mjs|md|tsx|ts|css|json|txt)(?![\w]))/g;
const RAW_AGENT_URL =
  /raw\.githubusercontent\.com\/godx-jp\/godxjp-ui\/[^/\s)"]+\/(agent\/[\w./<>-]*\.(?:json|md|txt))/g;

/**
 * Paths that are real but are NOT ours: the guidance quotes an upstream project's file when it
 * explains where a behaviour was copied from. Each is checked by hand; do not add a path here to
 * silence a dead link.
 */
export const UPSTREAM_PATHS = {
  "src/hooks/useIndicator.ts": "@rc-component/tabs",
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** `{ file, path }` for every repo path or raw `agent/` URL named in `agent/**`. */
export function pathRefsInAgent(root) {
  const refs = [];
  const agentDir = join(root, "agent");
  if (!existsSync(agentDir)) return refs;
  for (const file of walk(agentDir)) {
    if (!/\.(json|md|txt)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(PATH_REF)) {
      if (m[1] in UPSTREAM_PATHS) continue;
      refs.push({ file: relative(root, file), path: m[1] });
    }
    for (const m of text.matchAll(RAW_AGENT_URL)) {
      refs.push({
        file: relative(root, file),
        path: m[1].replace(/<[^>]*>/g, "Select").replace(/[.,)]+$/, ""),
      });
    }
  }
  return refs;
}

/** `docs/…` files that the shipped scripts read or point a consumer at. */
export function docsReadByScripts(root, files) {
  const out = new Set();
  for (const entry of files) {
    if (!entry.startsWith("scripts/") || !entry.endsWith(".mjs")) continue;
    const full = join(root, entry);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, "utf8");
    for (const m of text.matchAll(/(?<![\w./-])(docs\/[A-Za-z0-9_.-]+\.md)/g)) out.add(m[1]);
    for (const m of text.matchAll(/["']docs["']\s*,\s*["']([A-Za-z0-9_.-]+\.md)["']/g))
      out.add(`docs/${m[1]}`);
  }
  return out;
}

/** Is `path` shipped by a `files` list (exact entry, or inside a listed directory)? */
export function isShipped(path, files) {
  return files.some((f) => f === path || path.startsWith(f.endsWith("/") ? f : `${f}/`));
}

/* ---------- the gate ---------- */

export function run(root, { proposeFiles = false } = {}) {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const problems = [];
  const fail = (message) => problems.push(message);

  const exportsBySubpath = readPackedExports(root, pkg);
  const allExports = new Set([...exportsBySubpath.values()].flatMap((s) => [...s]));
  if (exportsBySubpath.size === 0 || allExports.size === 0) {
    fail(
      "no declarations resolved from the export map (is dist/ built? run `pnpm build`). " +
        "A gate that resolves 0 names proves nothing, so it fails.",
    );
    return { problems, names: 0, unknown: [] };
  }
  const known = (name) => allExports.has(name) || name in NOT_PACKAGE_API;

  const sources = [];
  const rulesPath = join(root, "agent/rules.json");
  if (existsSync(rulesPath)) {
    const rules = JSON.parse(readFileSync(rulesPath, "utf8"));
    for (const r of rules) {
      sources.push({ where: `agent/rules.json rule #${r.number}`, text: `${r.title}\n${r.body}` });
    }
  } else fail("agent/rules.json is missing");
  const readmePath = join(root, "README.md");
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
  if (!readme) fail("README.md is missing or empty");
  const removed = removedNames(readme);
  sources.push({ where: "README.md", text: readme });

  let checked = 0;
  const unknown = new Map();
  const note = (name, where) => {
    if (!unknown.has(name)) unknown.set(name, new Set());
    unknown.get(name).add(where);
  };
  for (const { where, text } of sources) {
    for (const name of new Set(namesInProse(text))) {
      if (where === "README.md" && removed.has(name)) continue;
      checked += 1;
      if (!known(name)) note(name, where);
    }
  }
  for (const { subpath, names } of importsInFences(readme)) {
    const entry = exportsBySubpath.get(subpath);
    if (!entry) {
      note(`${PACKAGE}${subpath.slice(1)}`, "README.md import (subpath not in export map)");
      continue;
    }
    for (const name of names) {
      checked += 1;
      if (!entry.has(name)) note(name, `README.md import from ${PACKAGE}${subpath.slice(1)}`);
    }
  }
  for (const { subpath, names } of rowsWithSubpath(readme)) {
    const entry = exportsBySubpath.get(subpath);
    if (!entry) continue;
    for (const name of names) {
      if (removed.has(name) || name in NOT_PACKAGE_API) continue;
      checked += 1;
      if (!entry.has(name)) note(name, `README.md table row for ${PACKAGE}${subpath.slice(1)}`);
    }
  }
  for (const { where, text } of sources) {
    for (const subpath of subpathsMentioned(text)) {
      checked += 1;
      if (!(subpath in (pkg.exports ?? {})))
        note(`${PACKAGE}${subpath.slice(1)}`, `${where} (not in export map)`);
    }
  }
  if (checked === 0)
    fail("extracted 0 names from agent/rules.json and README.md; the extractor is broken");
  for (const [name, wheres] of unknown) {
    fail(`unknown package name \`${name}\` in ${[...wheres].join("; ")}`);
  }
  const stillExported = [...removed].filter((n) => allExports.has(n));

  /* links */
  const files = pkg.files ?? [];
  const refs = pathRefsInAgent(root);
  const seen = new Set();
  for (const { file, path } of refs) {
    const key = `${file} -> ${path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!existsSync(join(root, path))) {
      fail(`dead link in ${file}: ${path} does not exist`);
    } else if (/^docs\/.+\.md$/.test(path) && !isShipped(path, files)) {
      fail(`${file} points at ${path}, which package.json "files" does not ship`);
    }
  }
  const sourcePointers = new Set(
    refs
      .filter((r) => /^(src|mcp)\//.test(r.path) || /^docs\/.+\/.+\.tsx$/.test(r.path))
      .map((r) => r.path),
  );

  const needed = new Set([
    ...[...docsReadByScripts(root, files)],
    ...refs.map((r) => r.path).filter((p) => /^docs\/.+\.md$/.test(p)),
    "docs/CONSUMER-RULES.md",
    "docs/CUSTOMER-THEMING.md",
  ]);
  if (proposeFiles)
    return { proposed: [...needed].sort(), problems, names: checked, unknown: [...unknown.keys()] };

  return {
    problems,
    names: checked,
    unknown: [...unknown.keys()],
    stillExported,
    sourcePointers: sourcePointers.size,
    linkRefs: seen.size,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = process.cwd();
  const result = run(root, { proposeFiles: process.argv.includes("--propose-files") });
  if (result.proposed) {
    console.log(result.proposed.join("\n"));
    process.exit(0);
  }
  if (result.problems.length) {
    console.error(`x check:agent-api-names - ${result.problems.length} problem(s):`);
    for (const p of result.problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(
    `ok check:agent-api-names - ${result.names} name(s) resolved against the packed declarations, ` +
      `0 unknown; ${result.linkRefs} link(s) alive and shipped` +
      (result.sourcePointers
        ? ` (${result.sourcePointers} source pointer(s) into src/ or docs/**/*.tsx are not shipped)`
        : "") +
      (result.stillExported.length
        ? `\n  note: the README migration table lists as removed, but the package still exports: ${result.stillExported.join(", ")}`
        : ""),
  );
}
