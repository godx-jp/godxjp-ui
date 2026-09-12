#!/usr/bin/env node
/**
 * check:mcp-catalog-completeness — every component this package EXPORTS is a component the MCP
 * catalog can be asked about, by name.
 *
 * ## Why the two gates that already exist did not catch gh#526
 *
 * `Tree`, the whole Chat family and `StatusBadge` shipped uncatalogued while BOTH catalog gates
 * were green on every merge. Neither was broken; neither was measuring this.
 *
 *  - `check:mcp-orphans` walks `src/components/**` and derives ONE name per file, by PascalCasing
 *    the FILENAME. `StatusBadge` lives in `badge.tsx`, so the only name that file is ever checked
 *    for is `Badge` — which is catalogued. Every SECONDARY export in the package is invisible to
 *    it, and secondary exports are most of the public surface (133 of 276 at the time of writing).
 *  - `check:mcp-catalog-coverage` asks whether the name appears ANYWHERE in `mcp/src/data/*.ts`,
 *    as a plain `String.includes` SUBSTRING. `Tree` is a substring of `TreeSelect`; `Area` is a
 *    substring of `ScrollArea`. A name can therefore "pass" because a DIFFERENT component is
 *    spelled with it inside, or because one sentence of prose anywhere in the catalog happens to
 *    mention it. Passing that check is close to free, so it cannot mean the catalog documents you.
 *
 * Both gates were green on an uncatalogued component the day the issue was filed. This one asks
 * the question the consumer rule actually depends on:
 *
 *    **can `get_component` answer for this name?**
 *
 * ## The rule
 *
 * Enumerate every PascalCase value export with a call signature, from every public subpath in
 * `package.json#exports`. Each one must be EITHER an entry's `name`, OR named in exactly one
 * entry's `subParts`. There is no allowlist and no substring credit: a name folded into a parent
 * is a decision someone recorded in the data, which `get_component` then honours by answering with
 * the parent — so the fold is visible to the agent instead of looking like an absence.
 *
 * Checked in both directions. A `subParts` name that is no longer exported is an error too, or the
 * lists rot into claims about components that left.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const CATALOG = "mcp/src/data/components.ts";

/** `./dist/components/layout/index.d.ts` → the `src/` file it is built from. */
function sourceOf(distTypes) {
  const rel = distTypes.replace(/^\.\/dist\//, "").replace(/\.d\.ts$/, "");
  for (const candidate of [`src/${rel}.ts`, `src/${rel}.tsx`, `src/${rel}/index.ts`]) {
    if (existsSync(join(ROOT, candidate))) return candidate;
  }
  return null;
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const barrels = [];
const unresolved = [];
for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
  if (typeof target !== "object" || !target.types) continue;
  const source = sourceOf(target.types);
  if (source) barrels.push({ subpath, source });
  else unresolved.push({ subpath, types: target.types });
}

/**
 * Public component exports, keyed by name.
 *
 * A component is a PascalCase export that resolves to a VALUE (not a type-only re-export) whose
 * type is callable. That admits `forwardRef` results and zero-prop components alike — the latter
 * being exactly what `component-api-manifest.json` drops, since its generator requires a first
 * parameter (`SkeletonDetail` is real, public, and absent from the manifest for that reason).
 */
function publicComponents() {
  const configFile = ts.readConfigFile(join(ROOT, "tsconfig.json"), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ROOT);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();

  const found = new Map();
  for (const { subpath, source } of barrels) {
    const sourceFile = program.getSourceFile(join(ROOT, source));
    if (!sourceFile) continue;
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) continue;
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      const name = symbol.name;
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue;
      const resolved =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (!(resolved.flags & ts.SymbolFlags.Value)) continue;
      if (
        checker.getTypeOfSymbolAtLocation(resolved, sourceFile).getCallSignatures().length === 0
      ) {
        continue;
      }
      const declaration = (resolved.declarations ?? [])[0];
      const file = declaration ? relative(ROOT, declaration.getSourceFile().fileName) : "?";
      if (!found.has(name)) found.set(name, { name, file, subpaths: [] });
      found.get(name).subpaths.push(subpath);
    }
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Entry names and their `subParts`, read from the catalog SOURCE rather than imported.
 *
 * The catalog is TypeScript the MCP compiles separately; a Node gate that had to build it first
 * would be a gate people skip. The entry anchor is the 4-space `name:` field, the same anchor
 * `check:mcp-orphans` and `check:catalog-contradictions` use, so sample data nested inside props
 * or examples is never mistaken for an entry.
 */
function catalogEntries() {
  const src = readFileSync(join(ROOT, CATALOG), "utf8");
  const starts = [...src.matchAll(/^ {4}name: "([A-Za-z][A-Za-z0-9]*)",$/gm)].map((m) => ({
    name: m[1],
    at: m.index,
  }));
  return starts.map((entry, i) => {
    const body = src.slice(entry.at, i + 1 < starts.length ? starts[i + 1].at : src.length);
    const declared = body.match(/^ {4}subParts: \[([^\]]*)\]/m);
    const subParts = declared
      ? [...declared[1].matchAll(/"([A-Za-z][A-Za-z0-9]*)"/g)].map((m) => m[1])
      : [];
    return { name: entry.name, subParts };
  });
}

const entries = catalogEntries();
const entryNames = new Set(entries.map((e) => e.name));

/** name → the entries that claim it as a sub-part (more than one is an error). */
const claimed = new Map();
for (const entry of entries) {
  for (const part of entry.subParts) {
    if (!claimed.has(part)) claimed.set(part, []);
    claimed.get(part).push(entry.name);
  }
}

const exported = publicComponents();
const exportedNames = new Set(exported.map((c) => c.name));

const uncatalogued = exported.filter((c) => !entryNames.has(c.name) && !claimed.has(c.name));
const contested = [...claimed].filter(([, owners]) => owners.length > 1);
const stale = [...claimed].filter(([part]) => !exportedNames.has(part) && !entryNames.has(part));
const shadowed = [...claimed].filter(([part]) => entryNames.has(part));

const failed =
  uncatalogued.length > 0 ||
  contested.length > 0 ||
  stale.length > 0 ||
  shadowed.length > 0 ||
  unresolved.length > 0;

if (process.argv.includes("--json")) {
  console.log(
    JSON.stringify(
      {
        exported: exported.length,
        entries: entries.length,
        subParts: claimed.size,
        uncatalogued,
        contested,
        stale,
        shadowed,
        unresolved,
      },
      null,
      2,
    ),
  );
} else if (failed) {
  if (unresolved.length > 0) {
    console.error(
      `✗ check:mcp-catalog-completeness — ${unresolved.length} public subpath(s) point at a build target with no source, so nothing can traverse them:`,
    );
    for (const u of unresolved) console.error(`    "${u.subpath}" → ${u.types}`);
    console.error("  Delete the dead subpath from package.json#exports, or restore its source.\n");
  }
  if (uncatalogued.length > 0) {
    console.error(
      `✗ check:mcp-catalog-completeness — ${uncatalogued.length} exported component(s) the MCP cannot be asked about (gh#526):`,
    );
    for (const c of uncatalogued) {
      console.error(`    ${c.name}  (${c.file})  exported from ${c.subpaths.join(", ")}`);
    }
    console.error(
      `\n  An agent told to search the catalog first finds nothing and hand-rolls it. Either give it\n` +
        `  an entry in ${CATALOG} (props + a real example), or — if it is a compound sub-part, an\n` +
        `  alias or a compatibility shim — add it to the \`subParts\` of the ONE entry that documents\n` +
        `  it, and make sure that entry's prose actually says what it is for.\n`,
    );
  }
  if (contested.length > 0) {
    console.error(`✗ ${contested.length} name(s) claimed as a sub-part by more than one entry:`);
    for (const [part, owners] of contested) console.error(`    ${part} ← ${owners.join(", ")}`);
    console.error("  Exactly one entry owns the documentation for a name.\n");
  }
  if (stale.length > 0) {
    console.error(`✗ ${stale.length} subParts name(s) are no longer exported:`);
    for (const [part, owners] of stale) console.error(`    ${part} (claimed by ${owners[0]})`);
    console.error("  Remove them; a sub-part list is a claim about the shipped surface.\n");
  }
  if (shadowed.length > 0) {
    console.error(`✗ ${shadowed.length} name(s) are BOTH an entry and someone's sub-part:`);
    for (const [part, owners] of shadowed) console.error(`    ${part} (claimed by ${owners[0]})`);
    console.error("  A component with its own entry is not folded into a parent.\n");
  }
} else {
  console.log(
    `✓ check:mcp-catalog-completeness — ${exported.length} exported components across ${barrels.length} public subpaths: ` +
      `${entries.length} catalog entries, ${claimed.size} documented as sub-parts, 0 invisible.`,
  );
}

process.exit(failed ? 1 : 0);
