#!/usr/bin/env node

/**
 * Guard: preview examples + docs must compose ONLY real @godxjp/ui components,
 * never locally-invented wrapper components — otherwise a consumer who copies
 * the example gets code that imports a module that does not exist for them.
 *
 * Scope: examples preview files (.preview.tsx) and docs files (.tsx).
 * Allowed imports: react, lucide-react, @godxjp/ui, examples/fixtures, and
 * RELATIVE DATA modules only (a .ts file — e.g. ./_data). A relative import
 * that resolves to a .tsx (a local COMPONENT module — e.g. ./_kit) is FORBIDDEN.
 */

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const rootDir = process.cwd();
const examplesDir = path.join(rootDir, "examples");
const docsDir = path.join(rootDir, "docs");
const fixtureRoot = path.join(examplesDir, "fixtures");

/** Does a relative specifier resolve to a TSX (component) module? */
function resolvesToComponent(resolved) {
  return existsSync(`${resolved}.tsx`) || existsSync(path.join(resolved, "index.tsx"));
}

/** Does a relative specifier resolve to a TS (data/fixture) module? */
function resolvesToData(resolved) {
  return existsSync(`${resolved}.ts`) || existsSync(path.join(resolved, "index.ts"));
}

function classifySpecifier(specifier, filePath) {
  // The internal src alias would pull in library internals (not the public API).
  if (specifier.startsWith("@/")) {
    return { ok: false, reason: "imports internal src (@/) — use the public @godxjp/ui API" };
  }

  // Relative imports may reference DATA/fixtures only — never a local COMPONENT
  // module. A locally-invented wrapper component is the exact anti-pattern: a
  // consumer who copies the example cannot import a module that is local to us.
  if (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/")) {
    const resolved = path.resolve(path.dirname(filePath), specifier);
    if (resolved === fixtureRoot || resolved.startsWith(`${fixtureRoot}${path.sep}`)) {
      return { ok: true };
    }
    if (resolvesToComponent(resolved)) {
      return {
        ok: false,
        reason:
          "imports a LOCAL component module (.tsx) — compose real @godxjp/ui components inline instead",
      };
    }
    if (resolvesToData(resolved)) return { ok: true };
    return { ok: false, reason: "unresolved relative import" };
  }

  // Only examples/fixtures may be imported by the examples/ path.
  if (specifier.startsWith("examples/")) {
    const ok = specifier.startsWith("examples/fixtures/") || specifier === "examples/fixtures";
    return { ok, reason: ok ? undefined : "only examples/fixtures may be imported by path" };
  }

  // Any other bare specifier is a real, installable npm package (react,
  // lucide-react, @godxjp/ui, zod, @tanstack/react-query, react-day-picker,
  // sonner, …) — a consumer can install it, so it is allowed.
  return { ok: true };
}

async function collectFiles(dir, suffix, out = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(full, suffix, out);
      continue;
    }
    if (entry.isFile() && full.endsWith(suffix)) out.push(full);
  }
  return out;
}

async function main() {
  const files = [
    ...(await collectFiles(examplesDir, ".preview.tsx")),
    ...(await collectFiles(docsDir, ".tsx")),
  ];
  const violations = [];

  for (const file of files) {
    const sourceText = await fs.readFile(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    for (const node of sourceFile.statements) {
      if (!ts.isImportDeclaration(node)) continue;
      const moduleSpecifier = node.moduleSpecifier;
      if (!ts.isStringLiteral(moduleSpecifier)) continue;

      const { ok, reason } = classifySpecifier(moduleSpecifier.text, file);
      if (!ok) violations.push({ file, specifier: moduleSpecifier.text, reason });
    }
  }

  if (violations.length === 0) {
    return 0;
  }

  console.error("[check:example-imports] Forbidden imports in preview examples/docs:");
  for (const { file, specifier, reason } of violations) {
    const rel = path.relative(rootDir, file);
    console.error(`- ${rel}: "${specifier}"${reason ? ` — ${reason}` : ""}`);
  }
  console.error(
    "\nExamples/docs must compose ONLY real @godxjp/ui components so consumers can copy them verbatim.",
  );

  return 1;
}

main()
  .then((code) => {
    if (code !== 0) process.exitCode = code;
  })
  .catch((error) => {
    console.error("[check:example-imports] Unexpected error:", error);
    process.exitCode = 1;
  });
