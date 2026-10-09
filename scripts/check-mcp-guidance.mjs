/**
 * check:mcp-guidance — the catalog's PROSE is held to the shipped surface (v32 #1223).
 *
 * The prop NAMES were already gated (`check:mcp-prop-sync`, ~99% in sync). The prose around them
 * was not, and R4 sampled it at 4 wrong entries in 12 — the steer an agent actually follows. This
 * gate checks what can be checked mechanically, one rule per defect class R4 measured:
 *
 *   related   — a `related` line names a component (its leading PascalCase word) that is neither a
 *               catalog entry, a documented sub-part, nor a utility: the agent is sent to a name
 *               that does not exist.
 *   useCases  — a use case shows a component (`<Name …>` or `` `Name` ``) that does not exist —
 *               the "LocalePicker / Combobox / MultiSelect" class.
 *   storyPath — an entry points at a page that is not there (`docs/<storyPath>`).
 *   tagline   — a tagline names an implementation library the package does not depend on at
 *               runtime — the "Radix-backed" taglines, written before the move to React Aria.
 *   inert     — a documented prop the implementation DISCARDS (`prop: _prop`) without the
 *               description saying so — the `Tooltip disableHoverableContent` class.
 *
 * What it cannot see is a false claim in free prose ("AppShell mounts AppProvider"); those were
 * fixed by hand and stay a review item.
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Implementation libraries a tagline may name → the npm package(s) that must back the claim. */
export const LIBRARIES = [
  { word: /\bRadix\b/i, packages: [/^@radix-ui\//] },
  { word: /\bReact Aria\b|\breact-aria\b/i, packages: [/^react-aria/] },
  { word: /\bcmdk\b/i, packages: [/^cmdk$/] },
  { word: /\bEmbla\b/i, packages: [/^embla-carousel/] },
  { word: /\bRecharts\b/i, packages: [/^recharts$/] },
  { word: /\bSonner\b/i, packages: [/^sonner$/] },
  { word: /\bvaul\b/i, packages: [/^vaul$/] },
  { word: /\breact-day-picker\b|\bDayPicker\b/i, packages: [/^react-day-picker$/] },
  { word: /\bTanStack\b/i, packages: [/^@tanstack\//] },
  { word: /\bTiptap\b/i, packages: [/^@tiptap\//] },
  { word: /\breact-resizable-panels\b/i, packages: [/^react-resizable-panels$/] },
  { word: /\bHeadless ?UI\b/i, packages: [/^@headlessui\//] },
];

/** Description words that make a discarded prop an HONEST entry rather than a false promise. */
const INERT_SAID =
  /no effect|ignored|inert|not applied|does nothing|no-op|kept for (?:api )?compat/i;

const LEADING_NAME = /^\s*`?<?([A-Z][A-Za-z0-9]*)/;
/**
 * A component SHOWN in prose: `<Name …>`, `` `Name` ``, or a bare multi-hump name (`LocalePicker`).
 * A name right after a `.` is a member (`DataTable.DensityToggle`, antd's `Tag.CheckableTag`), not
 * a claim that a top-level component exists.
 */
const SHOWN_NAME =
  /<([A-Z][A-Za-z0-9]*)[\s/>]|(?<![.\w])`<?([A-Z][A-Za-z0-9]*)(?:[\s.`/>])|(?<![.\w])([A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+)\b/g;
/** A line that says the name is NOT shipped is the steer `absorbed` exists for, not a defect. */
const SAYS_ABSENT =
  /\bno such\b|\bthere is no\b|\bno `?[A-Z]\w*`? (?:component|export)|does not exist|not a component|\bremoved\b|\bretired\b|were separate components/i;
/** Type names and config shapes are not components (`StepStatusProp`, antd's `RuleObject`). */
const NOT_A_COMPONENT = /(?:Props?|Object|Type|Config|Context|Options?|Result|Params|Api)$/;
/**
 * A word READS as a UI component when it ends in one of these — `LocalePicker`, `MultiSelect`,
 * `TreeList`, `StatusChip`. A bare PascalCase word that does not (`TanStack`, `ReactNode`, a Lucide
 * glyph, a brand) is prose, not a claim that a component exists. Absorbed names are always claims.
 */
const UI_SUFFIX =
  /(?:Picker|Select|Input|List|Bar|Menu|Button|Chip|Tag|Card|Cards|Panel|Dialog|Modal|Drawer|Sheet|Table|Grid|Tree|Toggle|Shell|Field|Fields|Tabs|Sidebar|Badge|Avatar|Tooltip|Popover|Banner|Callout|Skeleton|Spinner|Upload|Calendar|Slider|Switch|Checkbox|Radio|Rating|Stepper|Steps|Timeline|Carousel|Combobox|Autocomplete|Typography|Title|Paragraph|Switcher|Composer|Footer|Header)$/;

/**
 * @param {object} input
 * @param {Array<object>} input.components   catalog entries (COMPONENTS)
 * @param {Array<{name:string}>} input.utilities
 * @param {Set<string>} input.runtimeDeps   runtime dependency + peer names for the kit
 * @param {Record<string, Set<string>>} [input.packageDeps]  importPath → that package's deps
 * @param {Map<string, Set<string>>} [input.discarded]  component → props its implementation discards
 * @param {(rel: string) => boolean} input.docExists  does `docs/<rel>` exist
 * @param {Set<string>} [input.externalNames]  PascalCase names that are NOT components (Intl, File…)
 */
export function lintGuidance({
  components,
  utilities,
  runtimeDeps,
  packageDeps = {},
  discarded = new Map(),
  docExists,
  externalNames = new Set(),
}) {
  const known = new Set(externalNames);
  for (const c of components) {
    known.add(c.name);
    for (const p of c.subParts ?? []) known.add(p);
  }
  for (const u of utilities) known.add(u.name);
  const absorbed = new Set(components.flatMap((c) => c.absorbed ?? []));

  const findings = [];
  for (const c of components) {
    const unknown = (name) =>
      !known.has(name) &&
      !(name.endsWith("s") && known.has(name.slice(0, -1))) && // "a grid of ServiceLauncherCards"
      !NOT_A_COMPONENT.test(name) &&
      (absorbed.has(name) || UI_SUFFIX.test(name));
    /** The names a line SHOWS, minus another library's components (antd's `Menu`, `Tag`). */
    const shown = (line) =>
      [...line.matchAll(SHOWN_NAME)]
        .filter(
          (m) => !/\bantd(?:['’]s)?\s+`?$/i.test(line.slice(Math.max(0, m.index - 8), m.index)),
        )
        .map((m) => m[1] ?? m[2] ?? m[3]);
    for (const line of c.related ?? []) {
      // The LEADING name is what the line presents as a sibling to reach for, so it must exist —
      // an absorbed name there ("LocalePicker — …") sends the agent to something that is not
      // shipped. A name mentioned further in may be an absorbed one being steered AWAY from
      // ("Spin — no such component here"), which is the point of `absorbed`.
      if (SAYS_ABSENT.test(line)) continue;
      const lead = LEADING_NAME.exec(line)?.[1];
      const names = new Set();
      if (
        lead &&
        !known.has(lead) &&
        !NOT_A_COMPONENT.test(lead) &&
        (absorbed.has(lead) || UI_SUFFIX.test(lead))
      ) {
        names.add(lead);
      }
      for (const name of shown(line)) {
        if (name !== lead && !absorbed.has(name) && unknown(name)) names.add(name);
      }
      for (const name of names) {
        findings.push({
          rule: "related",
          entry: c.name,
          detail: `${name}${absorbed.has(name) ? " (absorbed — it does not exist)" : ""}`,
        });
      }
    }
    for (const line of c.useCases ?? []) {
      if (SAYS_ABSENT.test(line)) continue;
      const names = new Set(shown(line));
      for (const name of names) {
        if (unknown(name)) findings.push({ rule: "useCases", entry: c.name, detail: name });
      }
    }
    if (c.storyPath !== undefined && !docExists(c.storyPath)) {
      findings.push({ rule: "storyPath", entry: c.name, detail: `docs/${c.storyPath}` });
    }
    const deps =
      c.importPath && !c.importPath.startsWith("@godxjp/ui") && packageDeps[c.importPath]
        ? packageDeps[c.importPath]
        : runtimeDeps;
    for (const lib of LIBRARIES) {
      if (lib.word.test(c.tagline) && ![...deps].some((d) => lib.packages.some((p) => p.test(d)))) {
        findings.push({ rule: "tagline", entry: c.name, detail: String(lib.word) });
      }
    }
    const dropped = discarded.get(c.name);
    if (dropped) {
      for (const p of c.props) {
        if (dropped.has(p.name) && !INERT_SAID.test(p.description)) {
          findings.push({ rule: "inert", entry: c.name, detail: p.name });
        }
      }
    }
  }
  return findings;
}

/** `name: _name` destructuring — a prop the implementation receives and throws away. */
export function discardedProps(source) {
  return new Set([...source.matchAll(/\b([a-zA-Z][A-Za-z0-9]*):\s*_\1\b/g)].map((m) => m[1]));
}

/** `--catalog <dir>` lints another copy of mcp/src/data (e.g. a past release, to prove the gate red). */
async function loadCatalog() {
  const { build } = await import("esbuild");
  const at = process.argv.indexOf("--catalog");
  const dataDir = at > 0 ? process.argv[at + 1] : join(ROOT, "mcp/src/data");
  const out = join(tmpdir(), `godx-guidance-${process.pid}.mjs`);
  await build({
    stdin: {
      contents: `export { COMPONENTS } from ${JSON.stringify(join(dataDir, "components.ts"))}; export { UTILITIES } from ${JSON.stringify(join(dataDir, "utilities.ts"))};`,
      resolveDir: ROOT,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "error",
    outfile: out,
  });
  try {
    return await import(pathToFileURL(out).href);
  } finally {
    rmSync(out, { force: true });
  }
}

function depsOf(pkgPath) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]);
}

/** component name → props its implementation discards, read from the files that declare them. */
function discardedByComponent() {
  const manifest = JSON.parse(readFileSync(join(ROOT, "component-api-manifest.json"), "utf8"));
  const cache = new Map();
  const out = new Map();
  for (const [name, entry] of Object.entries(manifest.components)) {
    const files = new Set((entry.props ?? []).flatMap((p) => p.declaredIn ?? []));
    const dropped = new Set();
    for (const f of files) {
      if (!cache.has(f)) {
        const abs = join(ROOT, f);
        cache.set(f, existsSync(abs) ? discardedProps(readFileSync(abs, "utf8")) : new Set());
      }
      for (const p of cache.get(f)) dropped.add(p);
    }
    if (dropped.size) out.set(name, dropped);
  }
  return out;
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  const { COMPONENTS, UTILITIES } = await loadCatalog();
  const packageDeps = {};
  for (const dir of readdirSync(join(ROOT, "packages"))) {
    const p = join(ROOT, "packages", dir, "package.json");
    if (statSync(join(ROOT, "packages", dir)).isDirectory() && existsSync(p)) {
      packageDeps[JSON.parse(readFileSync(p, "utf8")).name] = depsOf(p);
    }
  }
  const findings = lintGuidance({
    components: COMPONENTS,
    utilities: UTILITIES,
    runtimeDeps: depsOf(join(ROOT, "package.json")),
    packageDeps,
    discarded: discardedByComponent(),
    docExists: (rel) => existsSync(join(ROOT, "docs", rel)),
    externalNames: new Set(["Intl", "File", "FormData", "Date", "URL", "Promise", "React"]),
  });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(findings, null, 2));
  }
  if (findings.length) {
    const byRule = {};
    for (const f of findings) (byRule[f.rule] ??= []).push(f);
    console.error(`✗ check:mcp-guidance — ${findings.length} finding(s):`);
    for (const [rule, list] of Object.entries(byRule)) {
      console.error(`  ${rule} (${list.length})`);
      for (const f of list.slice(0, 200)) console.error(`    ${f.entry}: ${f.detail}`);
    }
    process.exit(1);
  }
  console.log(
    `✓ check:mcp-guidance — ${COMPONENTS.length} entries: related, useCases, storyPath, tagline and inert props all resolve.`,
  );
}
