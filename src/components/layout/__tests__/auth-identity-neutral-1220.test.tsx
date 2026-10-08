import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { AppPresetContext } from "../../../app/preset";
import { godxPreset } from "../../../themes/godx";
import { AuthIdentity } from "../auth-identity";

/**
 * gh#1220 (v32 row 6) — a neutral package draws no product's logo.
 *
 * 31.x rendered the GoDX mark whenever `brand` was omitted, and pulled the 21 KB master artwork
 * into every bundle that used the block. Now the mark comes from the active PRESET or from the
 * caller; with neither there is none, and the artwork module is not in the block's import graph.
 */

const ROOT = process.cwd();
const ARTWORK = "src/brand/godx-artwork.generated.ts";

const logoOf = (container: HTMLElement) => container.querySelector('[data-slot="logo"]');

describe("AuthIdentity without a preset (gh#1220)", () => {
  it("renders no mark when `brand` is omitted", () => {
    const { container } = render(<AuthIdentity title="Sign in" />);
    expect(logoOf(container)).toBeNull();
    const root = container.querySelector('[data-slot="auth-identity"]')!;
    // The h1 is the first thing in the block — no empty artwork slot ahead of it.
    expect(root.firstElementChild).toBe(screen.getByRole("heading", { level: 1 }));
  });

  it("renders no mark when `brand` is null", () => {
    const { container } = render(<AuthIdentity title="Sign in" brand={null} />);
    expect(logoOf(container)).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("AuthIdentity with a preset (gh#1220)", () => {
  const withPreset = (ui: ReactElement) =>
    render(<AppPresetContext.Provider value={godxPreset}>{ui}</AppPresetContext.Provider>);

  it("an omitted `brand` takes the preset's mark — the GoDX preset gives the 31.x mark", () => {
    const { container } = withPreset(<AuthIdentity title="GoDX ID" />);
    const mark = logoOf(container)!;
    expect(mark).toHaveAttribute("data-mark", "godx");
    expect(mark).toHaveAttribute("data-tone", "success");
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("an explicit `brand` still wins over the preset", () => {
    const { container } = withPreset(
      <AuthIdentity title="Sign in" brand={<svg data-testid="consumer-lockup" />} />,
    );
    expect(screen.getByTestId("consumer-lockup")).toHaveAttribute("aria-hidden", "true");
    expect(logoOf(container)).toBeNull();
  });

  it("`brand={null}` opts out even under a preset", () => {
    const { container } = withPreset(<AuthIdentity title="Sign in" brand={null} />);
    expect(logoOf(container)).toBeNull();
  });
});

/**
 * The static import graph of `auth-identity.tsx`, following every runtime (non-`import type`)
 * relative specifier. A barrel re-export counts: a bundler without perfect tree-shaking keeps it,
 * and the claim being tested is that the artwork is not reachable at all.
 */
function importGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const resolveSpecifier = (from: string, spec: string): string | undefined => {
    const base = resolve(dirname(from), spec);
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      join(base, "index.ts"),
      join(base, "index.tsx"),
    ]) {
      if (existsSync(candidate) && /\.(ts|tsx)$/.test(candidate)) return candidate;
    }
    return undefined;
  };
  const visit = (file: string) => {
    const rel = relative(ROOT, file);
    if (seen.has(rel)) return;
    seen.add(rel);
    const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    const specifiers = [
      ...code.matchAll(/\b(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s*["']([^"']+)["']/g),
      ...code.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g),
      ...code.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
    ].map((m) => m[1]!);
    for (const spec of specifiers) {
      if (!spec.startsWith(".")) continue;
      const target = resolveSpecifier(file, spec);
      if (target) visit(target);
    }
  };
  visit(join(ROOT, entry));
  return seen;
}

describe("the GoDX artwork is not in AuthIdentity's import graph (gh#1220)", () => {
  it("auth-identity.tsx reaches no GoDX artwork module", () => {
    const graph = importGraph("src/components/layout/auth-identity.tsx");
    // Sanity: the walk follows real edges (the typography module is a direct import).
    expect(graph.has("src/components/general/typography.tsx")).toBe(true);
    expect(graph.has(ARTWORK)).toBe(false);
    expect([...graph].filter((f) => f.startsWith("src/brand/"))).toEqual([]);
  });

  it("the walker does see the artwork where it IS imported — the GoDX preset", () => {
    expect(importGraph("src/themes/godx.ts").has(ARTWORK)).toBe(true);
  });
});
