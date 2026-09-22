import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * THE MODULE MUST BE IN THE BUILT OUTPUT, and nothing else checks that (gh#860).
 *
 * `preview/src/preload-recovery.ts` registered its listener at module scope and every entry point
 * wrote `import "./preload-recovery"`. `package.json` declares `sideEffects: false`, which is a
 * promise to the bundler that dropping a module nothing takes a binding from is safe — so Rollup
 * dropped it, and the stale-chunk self-heal **never shipped once**.
 *
 * Typecheck, lint and build stayed green the whole time. There is no runtime symptom either: it
 * only matters to a visitor holding a stale `index.html` after a deploy, and that visitor just
 * sees a page that does not load. The same trap took out the docs message catalogue in gh#858,
 * where it was at least loud — every page rendered raw `namespace.key.path`.
 *
 * So this asserts presence in the ARTEFACT, not in the source. A test that reads
 * `preload-recovery.ts` would have passed throughout the entire period the feature was missing —
 * which is the whole point: the source was always correct.
 */
const DIST = resolve(process.cwd(), "preview/dist/assets");

/** The module's own sessionStorage key — unique to it, and not something Vite's runtime emits. */
const MARKER = "godxjp-ui-preview:preload-reload-at";

describe("preload recovery reaches the built preview (gh#860)", () => {
  it.runIf(existsSync(DIST))("appears in a built chunk", () => {
    const chunks = readdirSync(DIST).filter((f) => f.endsWith(".js"));
    expect(chunks.length, "no built chunks — run `pnpm preview:build` first").toBeGreaterThan(0);

    const carrying = chunks.filter((f) => readFileSync(join(DIST, f), "utf8").includes(MARKER));

    expect(
      carrying.length,
      `\`${MARKER}\` is in none of ${chunks.length} chunks. The module was tree-shaken away — ` +
        "`sideEffects: false` deletes a side-effect-only import. Export a function and CALL it.",
    ).toBeGreaterThan(0);
  });

  /*
   * The source-side half. Not a substitute for the artefact check above — it is the guard that
   * says WHY, so the next person to "tidy" the entry points hits the reason rather than the
   * symptom six months later.
   */
  it("is an exported function that every entry point calls, never a bare import", () => {
    const module = readFileSync(resolve(process.cwd(), "preview/src/preload-recovery.ts"), "utf8");
    expect(module, "must export a function — a module-scope side effect is shakeable").toMatch(
      /export function installPreloadRecovery/,
    );

    for (const entry of ["main.tsx", "isolate-main.tsx", "frame-main.tsx", "showcase-main.tsx"]) {
      const source = readFileSync(resolve(process.cwd(), "preview/src", entry), "utf8");
      expect(source, `${entry} must not import it for its side effect alone`).not.toMatch(
        /^import "\.\/preload-recovery";$/m,
      );
      expect(source, `${entry} must CALL it — an import alone can be dropped`).toMatch(
        /installPreloadRecovery\(\)/,
      );
    }
  });
});
