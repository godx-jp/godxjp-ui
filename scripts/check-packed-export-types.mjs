#!/usr/bin/env node
/**
 * Every declaration file a package's manifest promises is IN the tarball npm would publish.
 *
 * Why (33.22.1): `@godxjp/markdown` declared `"./codec": { "types": "./dist/codec/index.d.ts" }`
 * and shipped only `dist/codec/index.js`. Its two tsup configs build in parallel, and the one with
 * `clean: true` started its DTS pass after the codec config had written its `.d.ts`, so the file
 * was removed again. Nothing looked at the packed file list, and a consumer found out at
 * `import … from "@godxjp/markdown/codec"` with TS7016.
 *
 * For the kit and every satellite package: `npm pack --dry-run --json` (the exact file list npm
 * would publish, honouring `files` and `.npmignore`), then every `types` target in `exports`
 * (at any depth, conditions included) plus the top-level `types` / `typings` must be in it.
 * Fails closed when a package declares no types at all or `dist/` is absent — a gate that checks
 * nothing proves nothing. Run after `pnpm build && pnpm build:packages`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PACKAGES = [
  ".",
  "packages/markdown",
  "packages/editor",
  "packages/block-editor",
  "packages/chat",
];

/** Every string under a `types` key, at any depth of an `exports` map. */
function typesTargets(node, key, out) {
  if (typeof node === "string") {
    if (key === "types") out.push(node);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) typesTargets(v, k, out);
  }
  return out;
}

const errors = [];
for (const dir of PACKAGES) {
  const cwd = join(ROOT, dir);
  const manifest = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
  const name = manifest.name;
  if (!existsSync(join(cwd, "dist"))) {
    errors.push(`${name}: no dist/ — build first (pnpm build && pnpm build:packages)`);
    continue;
  }
  const targets = [
    ...new Set(
      [...typesTargets(manifest.exports, "", []), manifest.types, manifest.typings]
        .filter((t) => typeof t === "string")
        .map((t) => t.replace(/^\.\//, "")),
    ),
  ];
  if (targets.length === 0) {
    errors.push(`${name}: the manifest declares no types — nothing to check`);
    continue;
  }
  const [pack] = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
  const packed = new Set(pack.files.map((f) => f.path));
  const missing = targets.filter((t) => {
    if (!t.includes("*")) return !packed.has(t);
    const pattern = new RegExp(
      `^${t
        .split("*")
        .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join("[^]*")}$`,
    );
    return ![...packed].some((f) => pattern.test(f));
  });
  for (const t of missing)
    errors.push(`${name}: declares types "./${t}" but the tarball has no such file`);
  if (missing.length === 0)
    console.log(`✓ ${name}: ${targets.length} declared types file(s) packed`);
}

if (errors.length > 0) {
  console.error(`✗ check:packed-export-types\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
