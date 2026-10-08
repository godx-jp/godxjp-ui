#!/usr/bin/env node
/**
 * `npx godxjp-ui codemod v32 [paths…] [--godx] [--dry-run]` — the mechanical half of upgrading to
 * v32 (docs/migrations/v32.md). What it cannot decide, it reports instead of guessing.
 *
 *   --godx      the app is a GoDX product: keep today's look with the GoDX preset (violet, the GoDX
 *               mark, vi default locale, the Japanese fonts)
 *   --dry-run   list every change without writing
 *
 * Transforms (each one idempotent: running twice changes nothing the second time):
 *  1. fonts are opt-in (gh#1221): after an import of "@godxjp/ui/styles", add the fonts import.
 *  2. with --godx (gh#1220): add the preset stylesheet after it, and `preset={godxPreset}` (+ its
 *     import) to every `<AppProvider` that has no `preset`.
 *  3. component renames/moves (gh#1223): import specifiers rewritten from RENAMES below.
 * Reported, not changed: an `<AppProvider` with no `defaultLocale` and no preset now starts in `en`
 * (or `<html lang>`), not `vi` (gh#1219).
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * gh#1223 import renames: `{ from: [module, name], to: [module, name] }`. A JSX usage of the old
 * name is renamed with it. Moves that change props (Banner → Alert variant) carry `note`, which is
 * reported for the human to finish.
 */
export const RENAMES = [];

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "vendor",
  ".git",
  "public",
  "coverage",
]);
const CODE = /\.(tsx?|jsx?|mjs|cjs)$/;
const STYLE_IMPORT_CSS = /^([ \t]*)@import\s+(["'])@godxjp\/ui\/styles\2\s*;[ \t]*$/m;
const STYLE_IMPORT_JS = /^([ \t]*)import\s+(["'])@godxjp\/ui\/styles\2\s*;?[ \t]*$/m;
const FONTS = "@godxjp/ui/styles/fonts.css";
const GODX_CSS = "@godxjp/ui/themes/godx.css";

export function transformSource(file, source, { godx = false } = {}) {
  let out = source;
  const notes = [];
  const isCss = file.endsWith(".css");
  const styleImport = isCss ? STYLE_IMPORT_CSS : STYLE_IMPORT_JS;
  const m = out.match(styleImport);
  if (m) {
    const [line, indent, q] = m;
    const add = [];
    if (!out.includes(FONTS) && !out.includes("@godxjp/ui/styles/fonts")) add.push(FONTS);
    if (godx && !out.includes(GODX_CSS)) add.push(GODX_CSS);
    if (add.length) {
      const extra = add
        .map((spec) =>
          isCss ? `${indent}@import ${q}${spec}${q};` : `${indent}import ${q}${spec}${q};`,
        )
        .join("\n");
      out = out.replace(line, `${line}\n${extra}`);
    }
  }
  if (!isCss && /<AppProvider\b/.test(out)) {
    const tags = out.match(/<AppProvider\b[^>]*>/g) ?? [];
    for (const tag of tags) {
      if (/\bpreset=/.test(tag)) continue;
      if (godx) {
        out = out.replace(tag, tag.replace(/^<AppProvider\b/, "<AppProvider preset={godxPreset}"));
      } else if (!/\bdefaultLocale=/.test(tag)) {
        notes.push(
          "<AppProvider> has no defaultLocale and no preset: v32 starts in <html lang> or en (was vi). " +
            'Add defaultLocale="vi" if that is what you meant, or rerun with --godx.',
        );
      }
    }
    if (
      godx &&
      out.includes("preset={godxPreset}") &&
      !/\bgodxPreset\b[^\n]*from\s+["']@godxjp\/ui\/themes\/godx["']/.test(out)
    ) {
      out = addImport(out, 'import { godxPreset } from "@godxjp/ui/themes/godx";');
    }
  }
  if (!isCss) {
    for (const r of RENAMES) {
      const [fromMod, fromName] = r.from;
      const [toMod, toName] = r.to;
      const importRe = new RegExp(
        `import\\s*\\{([^}]*)\\b${fromName}\\b([^}]*)\\}\\s*from\\s*(["'])${fromMod.replace(/[/.]/g, "\\$&")}\\3`,
      );
      if (!importRe.test(out)) continue;
      out = out.replace(importRe, (all, before, after, q) => {
        const rest = `${before}${after}`
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const kept = rest.length ? `import { ${rest.join(", ")} } from ${q}${fromMod}${q};\n` : "";
        return `${kept}import { ${toName} } from ${q}${toMod}${q}`;
      });
      if (fromName !== toName)
        out = out.replace(new RegExp(`(</?)${fromName}\\b`, "g"), `$1${toName}`);
      if (r.note) notes.push(`${fromName} → ${toName}: ${r.note}`);
    }
  }
  return { out, changed: out !== source, notes };
}

function addImport(source, line) {
  const imports = [...source.matchAll(/^import[^;]*;[ \t]*$/gm)];
  if (!imports.length) return `${line}\n${source}`;
  const last = imports[imports.length - 1];
  const at = last.index + last[0].length;
  return `${source.slice(0, at)}\n${line}${source.slice(at)}`;
}

function* walk(target) {
  const st = statSync(target);
  if (st.isFile()) {
    yield target;
    return;
  }
  for (const entry of readdirSync(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(target, entry);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else if (CODE.test(entry) || entry.endsWith(".css")) yield full;
  }
}

export function run(argv) {
  const [version, ...rest] = argv;
  if (version !== "v32") {
    console.error("usage: godxjp-ui codemod v32 [paths…] [--godx] [--dry-run]");
    return 2;
  }
  const godx = rest.includes("--godx");
  const dryRun = rest.includes("--dry-run");
  const targets = rest.filter((a) => !a.startsWith("--"));
  const roots = targets.length ? targets : ["."];
  let changed = 0;
  const report = [];
  for (const root of roots) {
    if (!existsSync(root)) {
      console.error(`✗ ${root} does not exist`);
      return 2;
    }
    for (const file of walk(root)) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("@godxjp/")) continue;
      const { out, changed: did, notes } = transformSource(file, source, { godx });
      if (did) {
        changed += 1;
        report.push(`${dryRun ? "would change" : "changed"} ${file}`);
        if (!dryRun) writeFileSync(file, out);
      }
      for (const n of notes) report.push(`note ${file}: ${n}`);
    }
  }
  for (const line of report) console.log(line);
  console.log(
    `${dryRun ? "dry run: " : ""}${changed} file(s) ${dryRun ? "would change" : "changed"}.`,
  );
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(run(process.argv.slice(2)));
