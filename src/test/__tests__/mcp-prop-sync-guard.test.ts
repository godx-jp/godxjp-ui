import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The guard used to split a prop type's members with a regex anchored at the start of each
 * member, so EVERY prop carrying a JSDoc comment was invisible to it and the gate stayed green
 * while the catalog drifted. These tests run the real script against a copied tree, then delete
 * a documented-and-commented prop from the catalog: a guard without teeth stays green here.
 */

const SCRIPT = resolve("scripts/check-mcp-prop-sync.mjs");
const PROP_GROUPS = ["general", "layout", "data-display", "data-entry", "feedback", "navigation"];

let dir: string | null = null;

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

/** Copy the guard's two inputs into a scratch root so a mutation cannot touch the repo. */
function scratchRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "mcp-prop-sync-"));
  mkdirSync(join(root, "mcp/src/data"), { recursive: true });
  mkdirSync(join(root, "src/props/components"), { recursive: true });
  copyFileSync("mcp/src/data/components.ts", join(root, "mcp/src/data/components.ts"));
  for (const g of PROP_GROUPS) {
    copyFileSync(
      `src/props/components/${g}.prop.ts`,
      join(root, `src/props/components/${g}.prop.ts`),
    );
  }
  return root;
}

function runGuard(cwd: string): { code: number; output: string } {
  try {
    return { code: 0, output: execFileSync("node", [SCRIPT], { cwd, encoding: "utf8" }) };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return { code: failure.status ?? 1, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}` };
  }
}

describe("check:mcp-prop-sync", () => {
  it("passes on the committed tree", () => {
    dir = scratchRoot();
    const { code, output } = runGuard(dir);
    expect(output).toContain("MCP prop sync guard passed");
    expect(code).toBe(0);
  });

  it("fails when a prop that carries a JSDoc comment is dropped from the catalog", () => {
    dir = scratchRoot();
    const catalog = join(dir, "mcp/src/data/components.ts");
    const src = readFileSync(catalog, "utf8");
    // `HeadingProp.weight` is declared under a JSDoc comment — the exact shape the guard missed.
    const at = src.indexOf('name: "weight",', src.indexOf('name: "Heading",'));
    const open = src.lastIndexOf("{", at);
    const close = src.indexOf("},", at) + "},\n".length;
    const drop = src.slice(open, close);
    expect(drop).toContain('name: "weight"');
    expect(drop).not.toContain('name: "level"');
    writeFileSync(catalog, src.slice(0, open) + src.slice(close));

    const { code, output } = runGuard(dir);
    expect(output).toContain("Heading: catalog is missing prop(s) `weight`");
    expect(code).toBe(1);
  });
});
