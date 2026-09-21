import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * NO SCRIPT MAY REACH INTO `node_modules/.bin/`.
 *
 * `gen-agent-catalog.mjs` and `gen-brand.mjs` both shipped spawning
 * `node_modules/.bin/esbuild`. Locally that path existed, because esbuild is a transitive PEER of
 * vite and this machine's pnpm hoist happened to link its bin. On every CI runner it did not:
 *
 *     Error: spawnSync …/node_modules/.bin/esbuild ENOENT
 *
 * Four jobs failed at once — `verify:ci:static`, and three test shards — and the release they were
 * part of could not publish. The tell is that nothing was WRONG with the code: it depended on a
 * package it never declared, so "is it installed" had no answer anyone could check.
 *
 * A declared dependency imported by NAME is that answer. `import { build } from "esbuild"` fails at
 * install time if the package is missing, which is a failure with an owner; a missing bin path
 * fails at run time on someone else's machine, which is a failure with none.
 *
 * This guard is cheap and total: no file under scripts/ may name that directory at all.
 */
const SCRIPTS = join(process.cwd(), "scripts");

function scriptFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return scriptFiles(path);
    return /\.(mjs|js|cjs|ts)$/.test(entry.name) ? [path] : [];
  });
}

describe("build scripts depend on declared packages, not on a hoisted bin (the 28.5.0 CI break)", () => {
  it("no script spawns anything from node_modules/.bin", () => {
    const offenders = scriptFiles(SCRIPTS)
      .filter((file) => {
        const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
        return source.includes("node_modules/.bin");
      })
      .map((file) => file.slice(SCRIPTS.length + 1));

    expect(
      offenders,
      "import the package by name instead — a bin path is resolvable on the machine that wrote it " +
        "and nowhere else, and it fails at RUN time rather than at install time",
    ).toEqual([]);
  });

  it("esbuild is a declared devDependency, so importing it by name resolves", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(
      pkg.devDependencies?.esbuild,
      "scripts/gen-agent-catalog.mjs and scripts/gen-brand.mjs import esbuild directly",
    ).toBeTruthy();
  });
});
