#!/usr/bin/env node
/**
 * gen-style-layers — the machine-readable CSS layer graph behind `prune-css` (gh#971).
 *
 * README's rule stands: a HUMAN must never cherry-pick `*-layout.css` files, because layers
 * share rules and a missing one fails silently. This generator is the one thing allowed to
 * slice, and it can be allowed to because it does not guess:
 *
 *   1. OWNERS (hand-maintained, below) says which layer file carries each component's own
 *      rules — the knowledge that a Toggle's box lives in control.css while its variants live
 *      in toggle.css is a fact about how src/styles is organised, so it lives here, next to it.
 *   2. What a component RENDERS INTERNALLY (DataTable → DropdownMenu → dialog-layout.css) is
 *      not hand-maintained — it is read from the real import graph under src/, with named
 *      barrel imports resolved to their defining file so a `import { Flex } from "../layout"`
 *      pulls flex.tsx and not the whole group. Context rules (`.ui-topbar .ui-card`) need no
 *      edge at all: they only match when BOTH components are on the page, and each side's own
 *      import already brings its home file.
 *
 * The resolved graph is written to src/styles/layers.json (version: null — the build stamps
 * the real version into the dist copy, see copy-styles.mjs), which ships in dist/styles/ and
 * is the only input `scripts/prune-css.mjs` reads in a consumer repo.
 *
 * `--check` regenerates and diffs, so the committed manifest cannot drift from the sources —
 * a new component, a moved layer rule or a new internal dependency turns CI red here instead
 * of shipping a slice that silently misses a layer.
 */
import { globSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const OUT = join(ROOT, "src/styles/layers.json");

/**
 * OWNERS — layer file → the components whose OWN rules live in it.
 *
 * This is the hand-maintained half of the graph, and it is deliberately per FILE, not per
 * selector: the prune unit is the file (that is the package's structure), so all the manifest
 * needs is "using X requires loading F". A component may appear under several files when its
 * rules are split (Toggle, DropdownMenu, SkeletonTable). Compound sub-parts (CardHeader,
 * DialogContent, SheetTrigger…) are NOT listed — prune-css maps them to their root by longest
 * component-name prefix, and the root's row covers them.
 *
 * Adding a component? Put its name under the file(s) that style it. The checks below go red
 * when a catalog component ends up with no layers while some layer file mentions its tokens,
 * and when a file in index.css has no row here.
 */
const OWNERS = {
  "shell-layout.css": [
    "AppShell",
    "MobileShell",
    "AuthShell",
    "CenteredShell",
    "Sidebar",
    "Topbar",
    "TopbarItem",
    "NavList",
    "OrgSwitcher",
    "AppLauncher",
    "AccountChip",
    "AuthDivider",
    "AuthFooter",
    "AuthIdentity",
    "AuthAccountSummary",
    "AuthStack",
    "ServiceRolePanel",
    "ErrorSurface",
  ],
  "motion.css": ["Reveal", "Activity", "Marquee"],
  "layout.css": [
    "Flex",
    "PageContainer",
    "ResponsiveGrid",
    "SpaceCompact",
    "Separator",
    "AspectRatio",
    "Breadcrumb",
    "Toolbar",
    "FilterBar",
    "EmptyState",
    "MasterDetail",
    "SplitPane",
    "DraggablePanel",
    "ResizablePanel",
    "Masonry",
    "Affix",
    "Actions",
    "LegalDocumentShell",
  ],
  "control.css": [
    "Button",
    "Input",
    "NumberInput",
    "SearchInput",
    "PasswordInput",
    "TagInput",
    "Textarea",
    "Label",
    "Checkbox",
    "Radio",
    "Switch",
    "Slider",
    "Toggle",
    "ToggleGroup",
    "Segmented",
    "Rating",
    "ColorPicker",
    "Calendar",
    "Command",
    "CommandPalette",
    "Transfer",
    "Select",
    "Cascader",
    "TreeSelect",
    "TimePicker",
    "Link",
    "InputOTP",
  ],
  "toggle.css": ["Toggle", "ToggleGroup"],
  "logo-layout.css": ["Logo"],
  "card-layout.css": [
    "Card",
    "CardContent",
    "CardBar",
    "StatCard",
    "ServiceLauncherCard",
    "ServiceCatalogCta",
  ],
  "text-layout.css": ["Text", "Heading", "Typography", "Title", "Paragraph"],
  "table-layout.css": ["Table", "DataTable", "SkeletonTable"],
  "dialog-layout.css": [
    "Dialog",
    "AlertDialog",
    "AlertDialogRoot",
    "Sheet",
    "Popover",
    "HoverCard",
    "Tooltip",
    "TwoFactorSetup",
    "DropdownMenu",
  ],
  "alert-layout.css": [
    "Alert",
    "Banner",
    "Callout",
    "Toaster",
    "Skeleton",
    "SkeletonRows",
    "SkeletonDetail",
    "SkeletonStat",
    "SkeletonArticle",
    "SkeletonTable",
  ],
  "badge-layout.css": ["Badge"],
  "data-display-layout.css": [
    "Avatar",
    "Carousel",
    "ChatBubble",
    "ChatBubbleList",
    "CodeBlock",
    "CredentialReveal",
    "Descriptions",
    "FeatureList",
    "Legend",
    "ListRow",
    "PermissionMatrix",
    "Progress",
    "Prose",
    "QrCode",
    "RangeTimeline",
    "ScrollArea",
    "Swatch",
    "ThoughtChain",
    "Thumbnail",
    "Timeline",
    "TimelineGrid",
    "Tree",
    "Welcome",
    "Accordion",
  ],
  "data-entry-layout.css": [
    "Attachments",
    "BranchScopePicker",
    "ChatComposer",
    "ChatSuggestion",
    "PasswordStrength",
    "Upload",
    "RecordPicker",
  ],
  "form-layout.css": ["Form", "FormField", "FormFieldControl", "Field"],
  "navigation-layout.css": [
    "Tabs",
    "Steps",
    "Anchor",
    "Conversations",
    "MegaMenu",
    "Pagination",
    "AppSettingPicker",
    "AppSettingToggle",
    "DropdownMenu",
  ],
  "chart-layout.css": ["LineChart", "BarChart", "AreaChart", "PieChart", "CompactBarTrend"],
  "float-button-layout.css": ["FloatButton"],
  "icon-layout.css": ["Icon"],
};

/**
 * VENDOR — third-party stylesheets index.css imports in `layer(vendor)`, and the component
 * whose presence (direct or through the import closure) requires each. The entry files are
 * thin package-owned wrappers (src/styles/vendor-*.css) so the emitted consumer file never
 * imports `sonner/…` directly — under pnpm's strict layout a transitive dependency does not
 * resolve from the consumer's own css.
 */
const VENDOR = [
  { file: "vendor-sonner.css", trigger: "Toaster" },
  { file: "vendor-day-picker.css", trigger: "Calendar" },
];

// ── source graph ─────────────────────────────────────────────────────────────

const files = new Map();
for (const p of globSync("src/**/*.{ts,tsx}", { cwd: ROOT })) {
  const n = normalize(p);
  if (/__tests__|\/test\/|\.d\.ts$|\.test\./.test(n.replaceAll("\\", "/"))) continue;
  files.set(n.replaceAll("\\", "/"), readFileSync(join(ROOT, n), "utf8"));
}

function resolve(from, spec) {
  const base = normalize(join(dirname(from), spec)).replaceAll("\\", "/");
  for (const c of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`]) {
    if (files.has(c)) return c;
  }
  return null;
}

/** Barrel export maps: file → { exportedName: [definingFileOrBarrel, originalName] }. */
const exportMap = new Map();
const starExports = new Map();
for (const [p, src] of files) {
  const named = {};
  for (const m of src.matchAll(/export\s*(type\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
    const target = resolve(p, m[3]);
    if (!target) continue;
    for (let entry of m[2].split(",")) {
      entry = entry.trim().replace(/^type\s+/, "");
      if (!entry) continue;
      const [orig, alias = orig] = entry.split(/\s+as\s+/).map((s) => s.trim());
      named[alias] = [target, orig];
    }
  }
  exportMap.set(p, named);
  starExports.set(
    p,
    [...src.matchAll(/export\s*\*\s*from\s*["']([^"']+)["']/g)]
      .map((m) => resolve(p, m[1]))
      .filter(Boolean),
  );
}

/** The file that DEFINES `name`, chased through re-export chains. */
function findExport(file, name, seen = new Set()) {
  if (seen.has(file)) return null;
  seen.add(file);
  const named = exportMap.get(file) ?? {};
  if (named[name]) {
    const [target, orig] = named[name];
    return findExport(target, orig, seen) ?? target;
  }
  const src = files.get(file);
  const local = new RegExp(
    `\\bexport\\s+(?:const|function|class|type|interface|enum)\\s+${name}\\b|export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*;`,
  );
  if (local.test(src)) return file;
  for (const star of starExports.get(file) ?? []) {
    const hit = findExport(star, name, seen);
    if (hit) return hit;
  }
  return null;
}

/**
 * Import edges, with named imports FROM A BARREL resolved to the defining file. Without this
 * every `import { cn } from "../layout"` drags the whole group in and every component maps to
 * every layer — measured before this existed: Flex reached 17 files and react-day-picker.
 * `import type` carries no runtime render, so it adds no edge.
 */
const edges = new Map();
const externals = new Map();
for (const [p, src] of files) {
  const e = new Set();
  const x = new Set();
  for (const m of src.matchAll(/import\s+(type\s+)?([^;]*?)\s*from\s*["']([^"']+)["']/g)) {
    const [, typeOnly, clause, spec] = m;
    if (typeOnly) continue;
    if (!spec.startsWith(".")) {
      x.add(spec);
      continue;
    }
    const target = resolve(p, spec);
    if (!target) continue;
    const names = /\{([^}]*)\}/.exec(clause);
    const isBarrel = /\/index\.tsx?$/.test(target);
    if (names && isBarrel && !/\*\s*as/.test(clause)) {
      for (let entry of names[1].split(",")) {
        entry = entry.trim().replace(/^type\s+/, "");
        if (!entry) continue;
        const orig = entry.split(/\s+as\s+/)[0].trim();
        const defining = findExport(target, orig);
        if (defining) e.add(defining);
      }
    } else {
      e.add(target);
    }
  }
  for (const m of src.matchAll(/import\s*\(\s*["'](\.[^"']+)["']\s*\)/g)) {
    const target = resolve(p, m[1]);
    if (target) e.add(target); // a lazy chunk still loads and still renders
  }
  edges.set(p, e);
  externals.set(p, x);
}

function closureOf(file) {
  const seen = new Set([file]);
  const stack = [file];
  while (stack.length) {
    for (const next of edges.get(stack.pop()) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

// ── catalog components → defining files ──────────────────────────────────────

const catalog = JSON.parse(readFileSync(join(ROOT, "agent/components-index.json"), "utf8"))
  .map((c) => c.name)
  .filter((n) => /^[A-Z]/.test(n));

const entryBarrels = [
  "src/index.ts",
  ...globSync("src/components/*/index.ts", { cwd: ROOT }).map((p) => p.replaceAll("\\", "/")),
  "src/form/index.ts",
  "src/app/index.ts",
  "src/inertia/index.ts",
].filter((p) => files.has(p));

const componentFile = new Map();
for (const name of catalog) {
  for (const barrel of entryBarrels) {
    const hit = findExport(barrel, name);
    if (hit) {
      componentFile.set(name, hit);
      break;
    }
  }
}

// ── resolve layers per component ─────────────────────────────────────────────

const indexCss = readFileSync(join(ROOT, "src/styles/index.css"), "utf8");
const order = [...indexCss.matchAll(/@import\s+"\.\/([\w-]+\.css)"/g)]
  .map((m) => m[1])
  .filter((f) => f !== "base.css" && f !== "fonts.css");

const errors = [];
for (const f of Object.keys(OWNERS)) {
  if (!order.includes(f))
    errors.push(`OWNERS names ${f}, which src/styles/index.css does not import`);
}
for (const f of order) {
  if (!OWNERS[f]) errors.push(`src/styles/index.css imports ${f} but OWNERS has no row for it`);
}
const catalogSet = new Set(catalog);
for (const [f, names] of Object.entries(OWNERS)) {
  for (const n of names) {
    if (!catalogSet.has(n))
      errors.push(`OWNERS[${f}] names ${n}, which is not in the agent catalog`);
  }
}
for (const { trigger } of VENDOR) {
  if (!catalogSet.has(trigger))
    errors.push(`VENDOR trigger ${trigger} is not in the agent catalog`);
}

const ownedLayers = new Map(); // component → Set<layer file>
for (const [f, names] of Object.entries(OWNERS)) {
  for (const n of names) (ownedLayers.get(n) ?? ownedLayers.set(n, new Set()).get(n)).add(f);
}

const layerCss = new Map(order.map((f) => [f, readFileSync(join(ROOT, "src/styles", f), "utf8")]));

const components = {};
for (const name of catalog) {
  const file = componentFile.get(name);
  if (!file) {
    errors.push(`catalog component ${name} not found through any entry barrel`);
    continue;
  }
  const closure = closureOf(file);
  const layers = new Set();
  const vendor = new Set();
  for (const other of catalog) {
    const otherFile = componentFile.get(other);
    if (!otherFile || !closure.has(otherFile)) continue;
    for (const l of ownedLayers.get(other) ?? []) layers.add(l);
    for (const { file: vf, trigger } of VENDOR) if (trigger === other) vendor.add(vf);
  }

  if (layers.size === 0) {
    // A component with no layers must be genuinely unstyled: nothing it (or anything it
    // renders) emits may appear in any layer file. Otherwise OWNERS is missing a row and the
    // pruned page would silently lose rules — the exact failure prune-css exists to prevent.
    const tokens = new Set();
    // CSS generic font families, not component classes — `font-family: ui-monospace` appears
    // in both a token stack and text-layout.css and would flag AppProvider as styled.
    const FONT_GENERICS = new Set(["ui-monospace", "ui-sans-serif", "ui-serif", "ui-rounded"]);
    for (const f of closure) {
      const src = files.get(f);
      for (const t of src.matchAll(/\bui-[a-z0-9-]+/g)) {
        if (!FONT_GENERICS.has(t[0])) tokens.add(t[0]);
      }
      for (const t of src.matchAll(/data-slot["']?\s*[:=]\s*["']([a-z0-9-]+)/g))
        tokens.add(`data-slot="${t[1]}"`);
    }
    for (const [layerFile, css] of layerCss) {
      for (const token of tokens) {
        if (css.includes(token)) {
          errors.push(
            `${name} resolved to NO layers, but ${layerFile} styles "${token}" from its closure — add it to OWNERS`,
          );
          break;
        }
      }
    }
  }

  components[name] = {
    layers: order.filter((f) => layers.has(f)),
    ...(vendor.size ? { vendor: VENDOR.map((v) => v.file).filter((f) => vendor.has(f)) } : {}),
  };
}

if (errors.length) {
  console.error(`✗ gen-style-layers: ${errors.length} problem(s)\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}

const manifest = {
  // Stamped with the real package version in the dist copy by scripts/copy-styles.mjs; null
  // here so the committed file does not churn on every release.
  version: null,
  generatedBy: "scripts/gen-style-layers.mjs — do not edit by hand; run `pnpm gen:style-layers`",
  base: "base.css",
  fonts: "fonts.css",
  order,
  vendor: VENDOR.map((v) => v.file),
  components: Object.fromEntries(
    Object.keys(components)
      .sort()
      .map((k) => [k, components[k]]),
  ),
};
const json = JSON.stringify(manifest, null, 2) + "\n";

if (CHECK) {
  let current = null;
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* missing counts as stale */
  }
  if (current !== json) {
    console.error(
      "✗ src/styles/layers.json is stale — run `pnpm gen:style-layers` and commit the result.",
    );
    process.exit(1);
  }
  console.log(
    `✓ style layer manifest is current (${Object.keys(components).length} components, ${order.length} layers)`,
  );
} else {
  writeFileSync(OUT, json);
  console.log(
    `wrote src/styles/layers.json (${Object.keys(components).length} components, ${order.length} layers)`,
  );
}
