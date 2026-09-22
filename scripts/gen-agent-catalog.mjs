#!/usr/bin/env node
/**
 * THE STATIC CATALOG — this design system, readable by an agent that cannot run a process.
 *
 * WHY THIS EXISTS. `@godxjp/ui-mcp` already answers every question in here, and answers them
 * better: searchable, version-locked to the package on disk, list-then-drill so an agent spends
 * tokens on what it asked for. But it is an MCP server over stdio, so it is only available to an
 * agent that can spawn a process — Claude Code, Codex CLI, Cursor. ChatGPT on the web and
 * Claude.ai cannot, and today they have nothing: they guess prop names from memory and invent
 * components that were deleted two majors ago.
 *
 * So this writes the SAME data — `mcp/src/data/*`, plus the two theme token tiers read straight
 * from `src/tokens/*.css` because no module in `mcp/src/data` carries them (gh#862) — as files the
 * repo already serves publicly over raw.githubusercontent.com. No hosting, no deploy step, and two
 * URL shapes for free:
 *
 *   …/main/agent/…        corrections are live the moment they merge
 *   …/v28.4.0/agent/…     immutable, pinned to the release a consumer actually installed
 *
 * That second one is the part that matters. A cached doc that has drifted from the installed
 * package is worse than no doc, because nothing says it drifted — the same failure gh#789 hit
 * when a version-stale MCP catalog reported a prop as non-existent and a consumer believed it.
 *
 * READING THE DATA. Via esbuild rather than a regex over the TypeScript. The house style for
 * reading `mcp/src/data` is `readFileSync` + a pattern, which is fine for `^ {4}name: "X"` and
 * wrong for a nested object graph — a regex that half-parses a component entry produces a catalog
 * that looks complete and has lost fields, which is the exact class of silent-wrong this repo
 * keeps paying for. esbuild gives the real values or throws.
 */
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { build } from "esbuild";

import { parseThemeTokens } from "./theme-token-rules.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
/* argv[2] is the OUTPUT DIR — but it is also where `--check` lands, and taking the flag as a path
 * sends every comparison at ./--check/, where nothing exists, so `--check` reports the whole
 * catalog stale and is never wrong about anything else again. Flags are filtered, not positional. */
const OUT = (() => {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  return positional[0] ? join(process.cwd(), positional[0]) : join(ROOT, "agent");
})();

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const REPO = "godx-jp/godxjp-ui";
const rawBase = (ref) => `https://raw.githubusercontent.com/${REPO}/${ref}/agent`;

/* esbuild via its JS API, not `node_modules/.bin/esbuild`.
 *
 * The bin path shipped once and failed on every CI runner with `spawnSync … esbuild ENOENT`, while
 * passing locally — esbuild was an undeclared TRANSITIVE peer of vite, so the bin link existed on
 * one machine's hoist and nowhere else. It is a declared devDependency now, and this imports the
 * package rather than guessing a path into node_modules, so "resolvable" is the same question npm
 * already answers. */
/** Bundle one `mcp/src/data` module and hand back its exports. */
async function load(module) {
  const out = join(tmpdir(), `godx-agent-${module}-${process.pid}.mjs`);
  await build({
    entryPoints: [join(ROOT, "mcp/src/data", `${module}.ts`)],
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "error",
    outfile: out,
  });
  try {
    return await import(`file://${out}`);
  } finally {
    rmSync(out, { force: true });
  }
}

/** Stable key order, so re-running produces no diff and a reviewer sees only real changes. */
const stable = (value) =>
  JSON.stringify(
    value,
    (_k, v) =>
      v && typeof v === "object" && !Array.isArray(v)
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, v[k]]),
          )
        : v,
    2,
  ) + "\n";

const [components, tokens, vocabulary, rules, patterns, tells] = await Promise.all([
  load("components"),
  load("component-tokens.generated"),
  load("prop-vocabulary"),
  load("rules"),
  load("patterns"),
  load("anti-ai-tells"),
]);

/* PATTERNS ARE THE LAYER A COMPONENT INDEX CANNOT BE.
 *
 * An index answers "does a component called X exist". It cannot answer "build a settings page",
 * because a tagline describes an API SHAPE and a task is stated as an INTENT — measured on this
 * repo's own index, "confirm a destructive delete" does not reach `AlertDialog` (the word "delete"
 * appears nowhere in it) and "async searchable country picker" does not reach `Select`, which is
 * precisely the query that makes an agent hand-roll the combobox we deleted.
 *
 * `mcp/src/data/patterns.ts` already maps intent to complete, copy-paste-ready code, and
 * `anti-ai-tells.ts` already names the generated-looking output to avoid. Both have been MCP-only:
 * an agent that can spawn a process gets them, an agent on a web URL does not, and the web agent is
 * the one guessing. This publishes the data that exists rather than inventing a new layer. */
/* THE TOKEN CATALOG IS THREE TIERS, AND IT USED TO PUBLISH ONE (gh#862).
 *
 * `tokens.json` carried 1685 entries and every one of them was a COMPONENT knob, because
 * `mcp/src/data/component-tokens.generated.ts` is — by its name and its purpose — the component
 * tier alone. The foundation and semantic tiers appeared in NO file under `agent/`: `--primary`,
 * `--background`, `--radius`, `--ring` were absent from a catalog whose stated audience is an
 * assistant handed a brand kit, whose first question is which token carries the brand colour. The
 * answer that catalog supported was "this system has none", which sends a reader to the bespoke
 * CSS that docs/CUSTOMER-THEMING.md exists to prevent. Measured by an external assistant doing
 * exactly that task.
 *
 * DERIVED, NOT HAND-LISTED. The tiers are read from the stylesheets that declare them, the same way
 * the component tier is read from `src/tokens/components/*.css`. A hand-kept list of theme roles is
 * how `check:frame-token-scope`'s colour seeds went blind to 18 of 36 roles (gh#854): the list was
 * right when it was written and nothing re-derived it.
 *
 * WHY `tier` IS ON EVERY ENTRY, INCLUDING THE 1685. The point of publishing all three is that a
 * reader can tell a re-scopable theme role from a component knob — `--primary` is one a consumer is
 * INVITED to set, `--card-space-inset` is one they usually should not. A tag present on two tiers
 * and absent on the third makes that distinction an inference, and an agent that infers it wrong
 * silently rethemes nothing. Gzipped (which is how the tarball and every HTTP fetch carry it) 1685
 * repeats of the same short string cost almost nothing.
 */
const THEME_TIERS = [
  ["foundation", ["src/tokens/foundation.css"]],
  /* derived.css is the SEMANTIC half of colour, not a primitive one: it declares the roles that
   * follow the seeds — `--primary-hover`, `--ring`, `--text-link` — which is exactly what
   * CUSTOMER-THEMING calls a "level 2 · role" override. base.css imports it between foundation and
   * semantic/ for the same reason. */
  ["semantic", ["src/tokens/derived.css", ...globSync("src/tokens/semantic/*.css").sort()]],
];
const themeTokens = THEME_TIERS.flatMap(([tier, files]) =>
  files.flatMap((file) =>
    parseThemeTokens(readFileSync(join(ROOT, file), "utf8")).map((t) => ({ ...t, tier })),
  ),
);

const data = {
  "components.json": components.COMPONENTS,
  /* Theme tiers FIRST. A reader who fetches this file and stops at the top should land on
   * `--background` / `--primary` / `--radius`, not on the alphabetically-first component knob. */
  "tokens.json": [
    ...themeTokens,
    ...tokens.COMPONENT_TOKENS.map((t) => ({ ...t, tier: "component" })),
  ],
  "vocabulary.json": vocabulary.PROP_VOCABULARY,
  "rules.json": rules.CARDINAL_RULES,
  "patterns.json": patterns.PATTERNS,
  "anti-ai-tells.json": tells.ANTI_AI_TELLS,
};

/* A catalog that is EMPTY must fail, never publish. An agent cannot tell "this system has no
 * components" from "the export name changed and nobody noticed", and it will believe the file. */
for (const [file, rows] of Object.entries(data)) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error(
      `✗ gen-agent-catalog — ${file} resolved to ${Array.isArray(rows) ? "0 entries" : typeof rows}. ` +
        `An export in mcp/src/data was renamed or removed. Refusing to write an empty catalog: ` +
        `an agent cannot tell an empty answer from a wrong one.`,
    );
    process.exit(1);
  }
}

/* THE GATE: EVERY TOKEN docs/CUSTOMER-THEMING.md TELLS A CONSUMER TO SET MUST BE IN THE CATALOG.
 *
 * This is the falsifiable form of "the catalog serves its audience", and it is the check that was
 * missing when gh#862 shipped: the theming guide and the agent catalog are written from different
 * sources — one by hand, one generated — and NOTHING compared them. The guide named `--primary` 24
 * times while the catalog contained no such token, for as long as both existed, and every gate in
 * this repo passed the whole time.
 *
 * WHAT COUNTS AS "NAMED BY THE DOC": a token the doc writes as a DECLARATION — `--primary: …`. That
 * is precisely the set the doc instructs a reader to put in their own `theme.css`, and it is the
 * set whose absence from the catalog is a defect. It deliberately excludes the three other shapes
 * the doc uses a `--name` in, none of which are a promise about this library:
 *
 *   · placeholders the doc INVENTS for the reader's own font — `var(--my-face)`, `var(--brand-sans)`,
 *     `var(--font-kr)` — which appear only on the right-hand side;
 *   · CLI flags — `pnpm gen:brand '#2563EB' --name acme --out src/theme`;
 *   · brace shorthand in the reference tables — `--gradient-{hero,glow,brand}`, which names three
 *     tokens with a string that is none of them.
 *
 * A wider rule was measured first and it is a trap: matching every `--word` in the prose demands
 * `--my-face` and `--out` exist, and the only way to keep it green is a hand-kept exemption list —
 * the same shape of hand-kept list this catalog was just fixed for trusting.
 */
const themingDoc = readFileSync(join(ROOT, "docs/CUSTOMER-THEMING.md"), "utf8");
const promised = [
  ...new Set([...themingDoc.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map((m) => m[1])),
].sort();
const catalogued = new Set(data["tokens.json"].map((t) => t.name));
const unlisted = promised.filter((name) => !catalogued.has(name));
if (unlisted.length) {
  const byTier = Object.fromEntries(
    ["foundation", "semantic", "component"].map((tier) => [
      tier,
      data["tokens.json"].filter((t) => t.tier === tier).length,
    ]),
  );
  console.error(
    `✗ gen-agent-catalog — docs/CUSTOMER-THEMING.md tells a consumer to set ${unlisted.length} ` +
      `token(s) that agent/tokens.json does not contain: ${unlisted.join(", ")}.\n` +
      `    The catalog currently carries ${Object.entries(byTier)
        .map(([tier, n]) => `${n} ${tier}`)
        .join(" · ")}. A theming guide that names a token the catalog omits is how gh#862 ` +
      `happened: an agent reading only the catalog concludes the token does not exist and writes ` +
      `bespoke CSS instead.\n` +
      `    Fix it at whichever end is wrong — declare the token in its tier file under a top-level ` +
      `\`:root\` (scripts/theme-token-rules.mjs reads those), or stop naming it in the guide.`,
  );
  process.exit(1);
}

/* WHICH SUBPATH DOES THIS COMPONENT COME FROM.
 *
 * The catalog's `group` is a docs heading, and an agent that infers `@godxjp/ui/<group>` from it is
 * right about 6 groups out of 7 — `providers` has no subpath at all (AppProvider lives in
 * `@godxjp/ui/app`). "Right most of the time, with no signal when it is wrong" is the shape of
 * failure this whole catalog exists to remove, so the path is MEASURED: esbuild bundles each
 * public entry point declared in package.json `exports` and reports what it actually exports.
 * Only 13 of 165 entries carry a hand-written `importPath`; the rest are resolved here. */
async function resolveImportPaths(names) {
  const found = new Map();
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (subpath.includes("*")) continue;
    const js = typeof target === "string" ? target : target?.import;
    if (!js?.endsWith(".js")) continue;
    const base = js.replace(/^\.\/dist\//, "src/").replace(/\.js$/, "");
    const entry = [`${base}.ts`, `${base}.tsx`].map((f) => join(ROOT, f)).find(existsSync);
    if (!entry) continue;
    let result;
    try {
      result = await build({
        entryPoints: [entry],
        bundle: true,
        format: "esm",
        platform: "node",
        packages: "external",
        logLevel: "silent",
        metafile: true,
        write: false,
      });
    } catch {
      continue; /* an entry point that does not bundle standalone exports nothing we can claim */
    }
    const outputs = result.metafile.outputs;
    for (const out of Object.values(outputs))
      for (const name of out.exports ?? []) {
        if (!found.has(name)) found.set(name, new Set());
        found.get(name).add(`${pkg.name}${subpath.slice(1)}`);
      }
  }

  /* Several subpaths can export the same name (`Select` is in data-entry, ui and ui/select). Pick
   * the one a docs page would write: the group subpath if it exists, else the shortest that is not
   * the root barrel or the `/ui` shadcn passthrough, else the root. */
  const pick = (name, group) => {
    const paths = [...(found.get(name) ?? [])];
    if (!paths.length) return null;
    const byGroup = paths.find((p) => p === `${pkg.name}/${group}`);
    if (byGroup) return byGroup;
    const specific = paths.filter((p) => p !== pkg.name && !p.startsWith(`${pkg.name}/ui`));
    return (specific.length ? specific : paths).sort((a, b) => a.length - b.length)[0];
  };

  const unresolved = [];
  for (const entry of names) {
    entry.importPath ??= pick(entry.name, entry.group);
    if (!entry.importPath) unresolved.push(entry.name);
  }
  if (unresolved.length) {
    console.error(
      `✗ gen-agent-catalog — ${unresolved.length} catalogued component(s) are exported from no ` +
        `public subpath, so nothing can import them: ${unresolved.join(", ")}. Either export them ` +
        `from their group barrel or remove the entry from mcp/src/data/components.ts — publishing ` +
        `a documented component a consumer cannot import is worse than not documenting it.`,
    );
    process.exit(1);
  }
}

await resolveImportPaths(data["components.json"]);

/* AN EMPTY CATALOG FAILS ABOVE; A HALVED ONE USED TO PASS. `JSON.stringify` drops a key whose
 * value is `undefined` and silently omits a function, so a refactor that breaks one export in
 * mcp/src/data can take 165 components down to 40 and still produce a well-formed file that every
 * gate accepts. The previous catalog is the baseline: growth is normal, shrinkage is a claim that
 * public API was removed, and that has to be stated rather than discovered by a consumer. */
const previous = (() => {
  try {
    return JSON.parse(readFileSync(join(OUT, "index.json"), "utf8")).counts ?? {};
  } catch {
    return {};
  }
})();
const shrunk = Object.entries(data)
  .map(([file, rows]) => [file.replace(".json", ""), rows.length])
  .filter(([key, count]) => typeof previous[key] === "number" && count < previous[key])
  .map(([key, count]) => `${key} ${previous[key]} → ${count}`);
if (shrunk.length && !process.argv.includes("--allow-shrink")) {
  console.error(
    `✗ gen-agent-catalog — the catalog SHRANK: ${shrunk.join(", ")}. Either an export in ` +
      `mcp/src/data broke, or public API really was removed. If it was removed on purpose, ` +
      `re-run with --allow-shrink.`,
  );
  process.exit(1);
}

const files = {
  ...Object.fromEntries(Object.entries(data).map(([f, rows]) => [f, stable(rows)])),
};

/* THE SMALL ONE IS THE POINT. `components.json` is 1.1 MB and `tokens.json` 0.6 MB — a web agent
 * fetching either spends its context on entries it did not ask about, or truncates and then
 * confidently answers from the half it got. 38 KB of name + group + tagline is what a first fetch
 * should be: enough to decide WHICH component, with the full entry one fetch away. */
/* ONE FILE PER COMPONENT — the part that makes the static lane competitive with MCP.
 *
 * What a remote MCP server actually buys over a static index is SELECTIVE RETRIEVAL: "find date
 * inputs", then "give me only that component's props". An index plus a 1.1 MB blob gives
 * orientation and then forces an agent to swallow 165 entries to read one. Granular files give the
 * same selectivity over plain HTTP — roughly a 4 KB fetch instead of a 1.1 MB one — with no
 * server, no deploy, no version skew between a deployed Worker and the package on disk.
 *
 * It does NOT buy search. `components-index.json` is the search surface: 42 KB, every name, group
 * and tagline, which an agent can read whole and then fetch exactly one of these. */
for (const entry of data["components.json"]) {
  files[`components/${entry.name}.json`] = stable(entry);
}
for (const entry of data["patterns.json"]) {
  files[`patterns/${entry.name}.json`] = stable(entry);
}

/* `absorbed` rides in the INDEX, not just the full entry, because it is search bait: the index is
 * the only file an agent reads whole, and "Combobox" is what it will look for. A name that resolves
 * to nothing anywhere is the one that gets hand-rolled. */
files["components-index.json"] = stable(
  data["components.json"].map(({ name, group, tagline, absorbed }) => ({
    name,
    group,
    tagline,
    ...(absorbed ? { absorbed } : {}),
  })),
);

/* The pattern index carries `tags` and `aliases` as well as the tagline, because this is the file
 * an agent searches BY INTENT — the thing the component index cannot do. */
files["patterns-index.json"] = stable(
  data["patterns.json"].map(({ name, tagline, tags, aliases }) => ({
    name,
    tagline,
    tags,
    ...(aliases ? { aliases } : {}),
  })),
);

/* MEASURED, never estimated. Every size quoted to an agent is read off the bytes just produced:
 * a stale "~4 KB" next to a 30 KB file teaches the agent to trust a number that is wrong, and the
 * first hand-typed figure in this catalog was already off (38 KB written for a 42 KB file). */
const kb = (bytes) =>
  bytes >= 1_000_000 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
const perComponentBytes = data["components.json"]
  .map((entry) => Buffer.byteLength(files[`components/${entry.name}.json`]))
  .sort((a, b) => a - b);
const size = {
  index: kb(Buffer.byteLength(files["components-index.json"])),
  components: kb(Buffer.byteLength(files["components.json"])),
  perComponent: `${kb(perComponentBytes[0])}–${kb(perComponentBytes.at(-1))}, median ${kb(perComponentBytes[perComponentBytes.length >> 1])}`,
};

files["index.json"] = stable({
  name: pkg.name,
  version: pkg.version,
  generated: "scripts/gen-agent-catalog.mjs",
  source:
    "mcp/src/data — the same data @godxjp/ui-mcp serves — plus the foundation and semantic token " +
    "tiers, read from src/tokens/*.css",
  read: {
    live: `${rawBase("main")}/index.json`,
    pinned: `${rawBase(`v${pkg.version}`)}/index.json`,
  },
  note: "Pin to the tag that matches the @godxjp/ui version you installed. A catalog newer than your package describes props you do not have; older, and it hides props you do.",
  counts: Object.fromEntries(
    Object.entries(data).map(([f, rows]) => [f.replace(".json", ""), rows.length]),
  ),
  /* The token count alone hid gh#862: 1685 looks like a complete design system and was one tier of
   * three. Split here so the omission of a tier is visible in the smallest file in the catalog. */
  tokenTiers: {
    foundation: "the seeds a consumer is invited to set — --primary, --background, --radius",
    semantic: "named roles that follow the seeds — --ring, --text-link, --overlay-background",
    component: "per-part knobs, --{component}-{part}-{property}; usually leave these alone",
    counts: Object.fromEntries(
      ["foundation", "semantic", "component"].map((tier) => [
        tier,
        data["tokens.json"].filter((t) => t.tier === tier).length,
      ]),
    ),
  },
  start: `${rawBase("main")}/START-HERE.md`,
  files: [
    {
      file: "components-index.json",
      url: `${rawBase("main")}/components-index.json`,
      note: `${size.index} — name + group + tagline for all ${data["components.json"].length}. FETCH THIS FIRST, then fetch only the components you chose.`,
    },
    {
      file: "components/<Name>.json",
      url: `${rawBase("main")}/components/<Name>.json`,
      note: `One file per component (${size.perComponent}), each carrying its importPath. This is the selective route: read the index, then fetch only what you need instead of the ${size.components} blob.`,
    },
    ...Object.keys(data).map((f) => ({ file: f, url: `${rawBase("main")}/${f}` })),
  ],
});

/* THE PROSE IS GENERATED TOO.
 *
 * START-HERE.md and llms.txt quote the version and the counts, and a hand-typed number in a file
 * nothing checks is a promise that decays silently — `release.mjs` bumps the version and the doc
 * keeps naming the old one, with no gate to notice. The prose lives in scripts/agent-catalog/*.tmpl
 * and every fact in it is substituted from the data just generated. An unsubstituted placeholder
 * is a hard failure: a literal `{{version}}` shipped to an agent is worse than a stale number. */
const substitutions = {
  version: pkg.version,
  raw: rawBase("main"),
  components: String(data["components.json"].length),
  tokens: String(data["tokens.json"].length),
  ...Object.fromEntries(
    ["foundation", "semantic", "component"].map((tier) => [
      `tokens${tier[0].toUpperCase()}${tier.slice(1)}`,
      String(data["tokens.json"].filter((t) => t.tier === tier).length),
    ]),
  ),
  rules: String(data["rules.json"].length),
  patterns: String(data["patterns.json"].length),
  tells: String(data["anti-ai-tells.json"].length),
  vocabulary: String(data["vocabulary.json"].length),
  indexSize: size.index,
  componentsSize: size.components,
  perComponentSize: size.perComponent,
  /* HONESTY ABOUT THE PINNED LANE. `agent/` did not exist before this change, so every
   * `…/v<older>/agent/…` URL is a 404 — and the version header above tells an agent on an older
   * package to go read exactly that URL and NOT to fall back to `main`. Sending a reader to a 404
   * and forbidding the working alternative is the one instruction here that cannot be recovered
   * from, so it is stated instead of assumed. */
  pinnedCaveat:
    "Pinned catalogs only exist for releases whose tag actually contains `agent/`. If " +
    "`…/v<version>/agent/index.json` returns 404, that release predates this catalog: read " +
    "`…/main/…` instead and compare `index.json` → `version` against the package you have, so you " +
    "at least know which way it drifted.",
};

for (const name of ["START-HERE.md", "llms.txt"]) {
  const body = readFileSync(join(ROOT, "scripts/agent-catalog", `${name}.tmpl`), "utf8").replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => {
      if (!(key in substitutions)) {
        console.error(
          `✗ gen-agent-catalog — ${name}.tmpl uses ${match}, which this generator does not define.`,
        );
        process.exit(1);
      }
      return substitutions[key];
    },
  );
  files[name] = body;
}

mkdirSync(OUT, { recursive: true });
let stale = 0;
for (const [file, body] of Object.entries(files)) {
  const path = join(OUT, file);
  mkdirSync(dirname(path), { recursive: true });
  let current = null;
  try {
    current = readFileSync(path, "utf8");
  } catch {
    /* new file */
  }
  if (current === body) continue;
  stale += 1;
  if (!CHECK) writeFileSync(path, body);
}

if (CHECK && stale > 0) {
  console.error(`✗ check:agent-catalog — ${stale} file(s) stale. Run \`pnpm gen:agent-catalog\`.`);
  process.exit(1);
}
const counts = Object.entries(data)
  .map(([f, r]) => `${r.length} ${f.replace(".json", "")}`)
  .join(" · ");
console.log(
  CHECK
    ? `✓ check:agent-catalog — the published catalog matches mcp/src/data + src/tokens, and ` +
      `contains every token docs/CUSTOMER-THEMING.md tells a consumer to set (${counts}).`
    : `✓ gen:agent-catalog — ${Object.keys(files).length} file(s) in agent/ (${counts}).`,
);
