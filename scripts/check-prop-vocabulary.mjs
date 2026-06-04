#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const propsDir = join(root, "src/props/components");
const registrySrc = readFileSync(join(root, "src/props/registry.ts"), "utf8");
const vocabularyBlock =
  registrySrc.match(/export const VOCABULARY_REGISTRY = \{([\s\S]*?)\n\} as const;/)?.[1] ?? "";
const componentBlock =
  registrySrc.match(/export const COMPONENT_PROP_REGISTRY = \{([\s\S]*?)\n\} as const;/)?.[1] ?? "";
const vocabulary = new Set(
  [...vocabularyBlock.matchAll(/^\s{2}([A-Z][A-Za-z0-9]*Prop):/gm)].map((m) => m[1]),
);
const components = new Map();

for (const match of componentBlock.matchAll(/^\s{2}([A-Z][A-Za-z0-9]*Prop):\s*\{/gm)) {
  const name = match[1];
  const open = componentBlock.indexOf("{", match.index);
  let depth = 0;
  let end = open;
  for (; end < componentBlock.length; end++) {
    const ch = componentBlock[end];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) break;
  }
  const body = componentBlock.slice(open + 1, end);
  const file = body.match(/file:\s*"([^"]+)"/)?.[1] ?? "";
  const vocabularyText = body.match(/vocabulary:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  const refs = [...vocabularyText.matchAll(/"([A-Z][A-Za-z0-9]*Prop)"/g)].map((m) => m[1]);
  const hasLocalReason = /local:\s*true[\s\S]*?reason:\s*"[^"]+"/.test(vocabularyText);
  components.set(name, { file, vocabulary: refs, hasLocalReason });
}
const failures = [];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (entry.endsWith(".ts") && entry !== "index.ts") files.push(full);
  }
  return files;
}

function exportedPropTypes(src) {
  return [...src.matchAll(/export\s+type\s+([A-Z][A-Za-z0-9]*Prop)\b/g)].map((m) => m[1]);
}

function fieldsForType(src, name) {
  const start = src.indexOf(`export type ${name}`);
  if (start === -1) return [];
  const equals = src.indexOf("=", start);
  const semi = src.indexOf(";", start);
  const brace = src.indexOf("{", start);
  if (brace === -1 || (semi !== -1 && semi < brace)) return [];
  if (equals !== -1 && equals < brace) {
    const between = src.slice(equals + 1, brace).trim();
    if (between && !between.endsWith("&")) return [];
  }
  let depth = 0;
  let end = brace;
  for (; end < src.length; end++) {
    const ch = src[end];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) break;
  }
  const body = src.slice(brace + 1, end);
  return [...body.matchAll(/^\s*(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\??\s*:/gm)].map(
    (m) => m[1] ?? m[2],
  );
}

const fieldVocabulary = [
  [/^className$/, "ClassNameProp"],
  [/^children$/, "ChildrenProp"],
  [/^id$/, "IdProp"],
  [/^name$/, "NameProp"],
  [/^label$/, "LabelProp"],
  [/^title$/, "TitleProp"],
  [/^subtitle$|^subTitle$/, "SubtitleProp"],
  [/^description$/, "DescriptionProp"],
  [/^helper$/, "HelperProp"],
  [/^error$/, "ErrorProp"],
  [/^placeholder$|^searchPlaceholder$/, "PlaceholderProp"],
  [/^value$/, "ValueProp"],
  [/^defaultValue$/, "DefaultValueProp"],
  [/^onValueChange$/, "OnValueChangeProp"],
  [/^open$/, "OpenProp"],
  [/^defaultOpen$/, "DefaultOpenProp"],
  [/^onOpenChange$/, "OnOpenChangeProp"],
  [/^disabled$/, "DisabledProp"],
  [/^required$/, "RequiredProp"],
  [/^icon$/, "IconProp"],
  [/^variant$/, /VariantProp$/],
  [/^tone$/, "ToneProp"],
  [/^size$/, "SizeProp"],
  [/^density$/, "DensityProp"],
  [/^gap$/, "GapProp"],
  [/^onClick$/, "OnClickProp"],
  [/^onChange$/, "OnChangeProp"],
  [/^onConfirm$|^onRetry$|^onDismiss$/, "OnValueChangeProp"],
];

function coversField(field, entries) {
  if (entries.length > 0) return true;
  for (const entry of entries) {
    if (typeof entry === "object" && entry?.local === true && entry.reason) return true;
  }
  for (const [pattern, expected] of fieldVocabulary) {
    if (!pattern.test(field)) continue;
    if (expected instanceof RegExp) return entries.some((entry) => expected.test(String(entry)));
    return entries.includes(expected);
  }
  if (/^on[A-Z]/.test(field)) return entries.some((entry) => String(entry).startsWith("On"));
  return true;
}

for (const file of walk(propsDir)) {
  const rel = file.slice(join(root, "src/props/").length);
  const src = readFileSync(file, "utf8");
  for (const name of exportedPropTypes(src)) {
    const entry = components.get(name);
    if (!entry) {
      failures.push(`${rel}: exported ${name} has no COMPONENT_PROP_REGISTRY entry`);
      continue;
    }
    if (entry.file !== rel)
      failures.push(`${name}: registry file is ${entry.file}, expected ${rel}`);
    const refs = entry.vocabulary ?? [];
    for (const ref of refs) {
      if (typeof ref === "string" && !vocabulary.has(ref)) {
        failures.push(`${name}: unknown vocabulary reference ${ref}`);
      }
    }
    for (const field of fieldsForType(src, name)) {
      if (!coversField(field, refs)) {
        failures.push(`${name}.${field}: no vocabulary mapping or local reason`);
      }
    }
  }
}

// Component-declared prop types (XProp / XProps directly declared in src/components/**) must
// also be governed: registered in COMPONENT_PROP_REGISTRY (or carried by a VOCABULARY_REGISTRY
// entry), or explicitly allowlisted for native/Radix structural passthroughs where per-field
// vocabulary does not apply.
const COMPONENT_TYPE_ALLOWLIST = new Set([
  "InputProps", // React.InputHTMLAttributes passthrough
  "TextareaProps", // React.TextareaHTMLAttributes passthrough
  "SkeletonProps", // React.HTMLAttributes passthrough
  "TabsProps", // Radix Tabs.Root props passthrough
  "SelectProp", // data-driven union (SelectDataProp | Radix Select.Root props)
]);

function walkComponents(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "__tests__") continue;
      files.push(...walkComponents(full));
    } else if (
      /\.(ts|tsx)$/.test(entry) &&
      !/\.(test|stories)\./.test(entry) &&
      entry !== "index.ts" &&
      entry !== "index.tsx"
    ) {
      files.push(full);
    }
  }
  return files;
}

for (const file of walkComponents(join(root, "src/components"))) {
  const rel = file.slice(join(root, "src/").length);
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/^export\s+type\s+([A-Z][A-Za-z0-9]*Props?)\s*=/gm)) {
    const name = m[1];
    const base = name.endsWith("Props") ? `${name.slice(0, -1)}` : name; // XProps -> XProp
    if (
      components.has(name) ||
      components.has(base) ||
      vocabulary.has(base) ||
      vocabulary.has(name) ||
      COMPONENT_TYPE_ALLOWLIST.has(name)
    ) {
      continue;
    }
    failures.push(
      `${rel}: exported ${name} is not governed — register ${base} in COMPONENT_PROP_REGISTRY or list it in the guard's COMPONENT_TYPE_ALLOWLIST`,
    );
  }
}

for (const [name, entry] of components) {
  for (const ref of entry.vocabulary ?? []) {
    if (typeof ref === "string" && !vocabulary.has(ref)) {
      failures.push(`${name}: unknown vocabulary reference ${ref}`);
    }
  }
}

const canonicalAliases = ["PageTitleProp", "StackGapProp", "InlineGapProp", "StatusToneProp"];
for (const alias of canonicalAliases) {
  if (vocabulary.has(alias))
    failures.push(`${alias}: forbidden canonical alias in VOCABULARY_REGISTRY`);
}

if (failures.length) {
  console.error("✗ prop vocabulary guard failed");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("✓ prop vocabulary guard passed");
