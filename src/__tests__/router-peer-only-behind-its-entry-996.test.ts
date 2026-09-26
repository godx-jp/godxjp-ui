import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `react-router-dom` IS REACHABLE FROM ONE ENTRY ONLY (gh#996).
 *
 * It is an OPTIONAL peer. `@godxjp/ui/query` re-exported `PrefetchLink`, whose module imported
 * the router at top level, so an Inertia app (no router installed) failed its Vite build on ANY
 * query import — `InfiniteQueryState` and `DataState` included (measured in godx-approval,
 * 30.9.0). The build fails on RESOLUTION, not execution, so what matters is whether the import
 * is reachable from the entry at all.
 *
 * This walks the static import graph from every JS entry in `package.json#exports` and allows
 * the router only behind `./react-router`. It fails on the old tree: `./query` reached it through
 * `prefetch-link.tsx`.
 */
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
  exports: Record<string, string | { import?: string }>;
};
const ROUTER = /^react-router(-dom)?$/;
const ALLOWED = new Set(["./react-router"]);

/** `dist/x/index.js` → `src/x/index.ts(x)`. */
function sourceOf(distPath: string): string | null {
  const base = resolve(distPath.replace(/^\.\/dist\//, "src/").replace(/\.js$/, ""));
  for (const ext of [".ts", ".tsx"]) if (existsSync(base + ext)) return base + ext;
  return null;
}

function resolveRelative(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec);
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(c) && /\.tsx?$/.test(c)) return c;
  }
  return null;
}

/** Bare specifiers reachable from `entry`, following relative VALUE imports (not `import type`). */
function reachablePackages(entry: string): Set<string> {
  const seen = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    for (const m of text.matchAll(
      /^\s*(import|export)\s+(?!type\b)(?:[^'";]*?\sfrom\s+)?["']([^"']+)["']/gm,
    )) {
      const spec = m[2];
      if (spec.startsWith(".")) {
        const next = resolveRelative(file, spec);
        if (next) queue.push(next);
      } else packages.add(spec);
    }
  }
  return packages;
}

const entries = Object.entries(pkg.exports)
  .map(([key, value]) => [key, typeof value === "string" ? value : value.import] as const)
  .filter((e): e is readonly [string, string] => !!e[1] && e[1].endsWith(".js"))
  .map(([key, dist]) => [key, sourceOf(dist)] as const)
  .filter((e): e is readonly [string, string] => !!e[1]);

describe("react-router-dom stays behind @godxjp/ui/react-router (gh#996)", () => {
  it("the walk sees the entries and the router at all — a lens checked on a known case", () => {
    expect(entries.length).toBeGreaterThan(10);
    const router = entries.find(([key]) => key === "./react-router");
    expect(router, "./react-router entry missing").toBeTruthy();
    expect([...reachablePackages(router![1])].some((p) => ROUTER.test(p))).toBe(true);
  });

  it("@godxjp/ui/query reaches its own dependencies but not the router", () => {
    const query = entries.find(([key]) => key === "./query")!;
    const reached = reachablePackages(query[1]);
    expect(reached.has("react"), "the walk found nothing — the lens is broken").toBe(true);
    expect([...reached].filter((p) => ROUTER.test(p))).toEqual([]);
  });

  it.each(entries.filter(([key]) => !ALLOWED.has(key)).map(([key, file]) => [key, file]))(
    "%s does not reach react-router-dom",
    (_key, file) => {
      expect([...reachablePackages(file)].filter((p) => ROUTER.test(p))).toEqual([]);
    },
  );
});
