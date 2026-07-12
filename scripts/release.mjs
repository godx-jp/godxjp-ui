#!/usr/bin/env node
/**
 * Coordinated release for the monorepo — publish @godxjp/ui and/or @godxjp/ui-mcp with one
 * command so the library and its MCP tooling stay in lockstep (no more "publish twice by hand").
 * The MCP is PINNED to the lib's version (one shared line) so a catalog version always tells you
 * exactly which library build it describes. Enforced by scripts/check-release-lockstep.mjs.
 *
 * Usage:
 *   node scripts/release.mjs --ui patch --mcp sync   # both — mcp adopts the new ui version (NORM)
 *   node scripts/release.mjs --mcp sync              # mcp-only fix at the CURRENT ui version
 *                                                    # (fails on npm if that version exists)
 *   --ui: patch | minor | major | skip      --mcp: sync | skip
 *
 * A UI bump REQUIRES --mcp sync (a ui-only release is refused) so the two never split — the exact
 * drift issue #140 fixes (ui 16.9.2 / mcp 16.7.2 / server 16.7.0 all disagreeing).
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const uiBump = flag("--ui", "skip");
const mcpBump = flag("--mcp", "skip");
const VALID_UI = new Set(["patch", "minor", "major", "skip"]);
const VALID_MCP = new Set(["sync", "skip"]);

if (!VALID_UI.has(uiBump) || !VALID_MCP.has(mcpBump) || (uiBump === "skip" && mcpBump === "skip")) {
  console.error("Usage: node scripts/release.mjs --ui <patch|minor|major|skip> --mcp <sync|skip>");
  process.exit(1);
}

// LOCKSTEP GUARD (issue #140): @godxjp/ui-mcp is version-pinned to @godxjp/ui — one shared line.
// So a UI bump MUST re-publish the MCP at the same new version (even a no-catalog-change release
// only touches the MCP's version field). Refusing the ui-alone combo here is the enforcement that
// stops the runtime package and its catalog from drifting apart.
if (uiBump !== "skip" && mcpBump !== "sync") {
  console.error(
    "✗ Lockstep: bumping @godxjp/ui requires --mcp sync so the catalog republishes at the same\n" +
      "  version. Releasing the library without its MCP is what let ui/mcp versions drift (#140).\n" +
      "  Re-run with: node scripts/release.mjs --ui " +
      uiBump +
      " --mcp sync",
  );
  process.exit(1);
}

const run = (cmd, cwd) => {
  console.log(`\n$ ${cmd}${cwd ? `  (in ${cwd})` : ""}`);
  execSync(cmd, { stdio: "inherit", cwd });
};
const versionOf = (dir = ".") => JSON.parse(readFileSync(`${dir}/package.json`, "utf8")).version;

// Rewrite a single top-level string field in a package.json, preserving formatting well enough for
// a clean diff (the file stays 2-space-indented JSON with a trailing newline).
const setPkgField = (dir, field, value) => {
  const path = `${dir}/package.json`;
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg[field] = value;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
};

// Refuse to release from a dirty tree — release commits must be clean + reviewable.
if (execSync("git status --porcelain", { encoding: "utf8" }).trim()) {
  console.error("✗ Working tree is not clean — commit or stash first.");
  process.exit(1);
}

if (uiBump !== "skip") {
  run("pnpm run verify:release"); // typecheck + lint + check:mcp-sync + build + test
  run(`npm version ${uiBump} --no-git-tag-version`);
  run("npm publish --access public");
  console.log(`✓ published @godxjp/ui@${versionOf()}`);
}

if (mcpBump === "sync") {
  const uiVersion = versionOf();
  // Refresh the mutual compatibility metadata BEFORE building/publishing so the packed artifacts
  // carry the correct pointers: the UI declares the catalog version it ships with, and the catalog
  // declares the minor-pinned UI range it describes. check:mcp-lockstep enforces both.
  const [major, minor] = uiVersion.split(".");
  setPkgField(".", "godxUiMcp", uiVersion);
  setPkgField("mcp", "godxUiCompatibility", `${major}.${minor}.x`);
  // Pin the MCP to the lib's (possibly just-bumped) version — one shared line.
  run(`npm version ${uiVersion} --no-git-tag-version --allow-same-version`, "mcp");
  run("pnpm build", "mcp");
  run("npm publish --access public", "mcp");
  console.log(`✓ published @godxjp/ui-mcp@${versionOf("mcp")}`);
}

// Fail-closed: refuse to commit a release whose two packages are not in lockstep.
run("node scripts/check-release-lockstep.mjs");

run("git add package.json mcp/package.json");
const uiPart = uiBump !== "skip" ? `@godxjp/ui@${versionOf()}` : null;
const mcpPart = mcpBump !== "skip" ? `@godxjp/ui-mcp@${versionOf("mcp")}` : null;
run(`git commit -m "chore(release): ${[uiPart, mcpPart].filter(Boolean).join(" · ")}"`);
console.log("\n✓ Released. Push the commit when ready.");
