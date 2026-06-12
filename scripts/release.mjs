#!/usr/bin/env node
/**
 * Coordinated release for the monorepo — publish @godxjp/ui and/or @godxjp/ui-mcp with one
 * command so the library and its MCP tooling stay in lockstep (no more "publish twice by hand").
 * The MCP is PINNED to the lib's version (one shared 13.x line) so a catalog version always
 * tells you exactly which library build it describes.
 *
 * Usage:
 *   node scripts/release.mjs --ui patch --mcp sync   # both — mcp adopts the new ui version
 *   node scripts/release.mjs --ui minor              # ui only (mcp skipped)
 *   node scripts/release.mjs --mcp sync              # mcp only, at the CURRENT ui version
 *                                                    # (fails on npm if that version exists)
 *   --ui: patch | minor | major | skip      --mcp: sync | skip
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const uiBump = flag("--ui", "skip");
const mcpBump = flag("--mcp", "skip");
const VALID_UI = new Set(["patch", "minor", "major", "skip"]);
const VALID_MCP = new Set(["sync", "skip"]);

if (
  !VALID_UI.has(uiBump) ||
  !VALID_MCP.has(mcpBump) ||
  (uiBump === "skip" && mcpBump === "skip")
) {
  console.error(
    "Usage: node scripts/release.mjs --ui <patch|minor|major|skip> --mcp <sync|skip>",
  );
  process.exit(1);
}

const run = (cmd, cwd) => {
  console.log(`\n$ ${cmd}${cwd ? `  (in ${cwd})` : ""}`);
  execSync(cmd, { stdio: "inherit", cwd });
};
const versionOf = (dir = ".") => JSON.parse(readFileSync(`${dir}/package.json`, "utf8")).version;

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
  run("pnpm build", "mcp");
  // Pin the MCP to the lib's (possibly just-bumped) version — one shared line.
  run(`npm version ${versionOf()} --no-git-tag-version --allow-same-version`, "mcp");
  run("npm publish --access public", "mcp");
  console.log(`✓ published @godxjp/ui-mcp@${versionOf("mcp")}`);
}

run("git add package.json mcp/package.json");
const uiPart = uiBump !== "skip" ? `@godxjp/ui@${versionOf()}` : null;
const mcpPart = mcpBump !== "skip" ? `@godxjp/ui-mcp@${versionOf("mcp")}` : null;
run(`git commit -m "chore(release): ${[uiPart, mcpPart].filter(Boolean).join(" · ")}"`);
console.log("\n✓ Released. Push the commit when ready.");
