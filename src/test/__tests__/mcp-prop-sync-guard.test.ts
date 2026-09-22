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

  /*
   * gh#857. The member splitter counted `{([<` as opening and `})]>` as closing, so the `>` of an
   * ARROW — `onAnchoredChange?: (anchored: boolean) => void;` — drove nesting depth to −1 and no
   * later `;` ever split again. Every prop declared after the first arrow-returning prop in a type
   * was invisible: 541 props across 65 of the 210 prop types this guard reads.
   *
   * Tested THROUGH THE CLI, like the case above, rather than by exporting `literalFields`. The
   * bug was in the extractor but the failure was in the GATE: it reported success on a catalog it
   * had not finished reading. Running the real script is the only assertion that covers both, and
   * an exported helper could be made correct while the script still shipped the old copy.
   */
  it("sees a prop declared AFTER an arrow-returning prop", () => {
    dir = scratchRoot();
    const catalog = join(dir, "mcp/src/data/components.ts");
    const src = readFileSync(catalog, "utf8");
    // `ScrollAreaProp.label` is the member immediately after `onAnchoredChange?: (…) => void`.
    const at = src.indexOf('name: "label",', src.indexOf('name: "ScrollArea",'));
    const open = src.lastIndexOf("{", at);
    const close = src.indexOf("},", at) + "},\n".length;
    const drop = src.slice(open, close);
    expect(drop).toContain('name: "label"');
    writeFileSync(catalog, src.slice(0, open) + src.slice(close));

    const { code, output } = runGuard(dir);
    expect(output).toContain("ScrollArea: catalog is missing prop(s) `label`");
    expect(code).toBe(1);
  });

  /*
   * A member typed `never` is a TOMBSTONE, not a prop. `MasonryProp.gutter?: never` exists so that
   * arriving from antd's docs is a compile error naming `gap`; nothing can be passed for it, so
   * requiring a catalog entry would have the guard demand documentation for an API that does not
   * exist. Deleting Masonry's real `gap` entry must still fail, so the skip is narrow.
   */
  it("does not demand a catalog entry for a `never` tombstone, but still guards its real sibling", () => {
    dir = scratchRoot();
    const passing = runGuard(dir);
    expect(passing.output).toContain("MCP prop sync guard passed");
    expect(passing.output).not.toContain("gutter");

    const catalog = join(dir, "mcp/src/data/components.ts");
    const src = readFileSync(catalog, "utf8");
    const at = src.indexOf('name: "gap",', src.indexOf('name: "Masonry",'));
    const open = src.lastIndexOf("{", at);
    const close = src.indexOf("},", at) + "},\n".length;
    expect(src.slice(open, close)).toContain('name: "gap"');
    writeFileSync(catalog, src.slice(0, open) + src.slice(close));

    const { code, output } = runGuard(dir);
    expect(output).toContain("Masonry: catalog is missing prop(s) `gap`");
    expect(code).toBe(1);
  });
});
