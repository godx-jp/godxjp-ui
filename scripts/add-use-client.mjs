#!/usr/bin/env node
/**
 * Why: a client module evaluated in the RSC server graph throws `TypeError: createContext is not a
 * function` (e.g. `i18n/use-translation` runs `createContext` at module top-level; `Button` calls
 * the `useTranslation` hook).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "src");
const DIST = join(root, "dist");

/** Client-only runtime deps: importing one means the module renders interactive client UI. */
const CLIENT_DEPS =
  /\bfrom\s*["'](?:@radix-ui\/|sonner|cmdk|embla-carousel|react-day-picker|recharts|input-otp|vaul|react-resizable-panels|@tanstack\/react-query|next-themes)/;
/** `createContext(` — a context module must be a client boundary. */
const CREATE_CONTEXT = /\bcreateContext\s*\(/;
/** A React hook CALL — `useX(` / `useX<T>(`; calling a hook makes the module a client component. */
const HOOK_CALL = /\buse[A-Z][A-Za-z0-9_]*\s*(?:<[^>=();]*>)?\s*\(/;

/** Direct client usage (no graph needed). */
export function isClientSource(code) {
  return CREATE_CONTEXT.test(code) || HOOK_CALL.test(code) || CLIENT_DEPS.test(code);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (["__tests__", "__fixtures__", "test", "messages"].includes(name)) continue;
      out.push(...walk(full));
    } else if (/\.tsx?$/.test(name) && !/\.(test|stories)\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/** Resolve a relative `import ... from "./x"` specifier to an absolute src file we track. */
function resolveSpecifier(fromFile, spec, known) {
  const base = resolve(dirname(fromFile), spec);
  for (const cand of [
    `${base}.tsx`,
    `${base}.ts`,
    join(base, "index.tsx"),
    join(base, "index.ts"),
  ]) {
    if (known.has(cand)) return cand;
  }
  return null;
}

/** Value-import / re-export specifiers (NOT `import type`, NOT `export type`) to other modules. */
function valueImportSpecifiers(code) {
  const specs = [];
  const re = /(?:^|\n)\s*(import|export)\s+(type\s+)?[^;'"]*?from\s*["'](\.[^"']+)["']/g;
  let m;
  while ((m = re.exec(code))) {
    if (m[2]) continue; // `import type` / `export type` is erased — no runtime edge
    specs.push(m[3]);
  }
  // bare `import "./x"` side-effect imports
  const sideRe = /(?:^|\n)\s*import\s*["'](\.[^"']+)["']/g;
  while ((m = sideRe.exec(code))) specs.push(m[1]);
  return specs;
}

/** The set of src files (absolute paths) that must ship `"use client"`. */
export function clientSources() {
  const files = walk(SRC);
  const known = new Set(files);
  const code = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

  const client = new Set(files.filter((f) => isClientSource(code.get(f))));

  // Fixpoint: a .tsx that value-imports a client module is itself a client boundary.
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of files) {
      if (client.has(f) || !f.endsWith(".tsx")) continue;
      for (const spec of valueImportSpecifiers(code.get(f))) {
        const target = resolveSpecifier(f, spec, known);
        if (target && client.has(target)) {
          client.add(f);
          changed = true;
          break;
        }
      }
    }
  }
  return client;
}

/** Map a src file to its emitted dist module (1:1, bundle:false). */
function distFor(srcFile) {
  return join(DIST, relative(SRC, srcFile)).replace(/\.tsx?$/, ".js");
}

export function clientDistModules() {
  return [...clientSources()].map(distFor);
}

function main() {
  let stamped = 0;
  let missing = 0;
  for (const dist of clientDistModules()) {
    let src;
    try {
      src = readFileSync(dist, "utf8");
    } catch {
      missing++; // a client src with no dist twin (e.g. a type-only .ts that emits nothing)
      continue;
    }
    if (/^\s*["']use client["'];?/.test(src)) continue;
    writeFileSync(dist, `"use client";\n${src}`);
    stamped++;
  }
  console.log(
    `add-use-client: stamped "use client" on ${stamped} client module(s)` +
      (missing ? ` (${missing} client src had no dist output)` : ""),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
