import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { isDevelopment } from "../dev";

/**
 * `process` IS NOT A BROWSER GLOBAL, AND THIS PACKAGE SHIPPED NINE RAW READS OF IT.
 *
 * Eight modules asked `process.env.NODE_ENV` to decide whether to emit a development warning.
 * Three guarded the read with `typeof process !== "undefined"`; five did not. Nothing in the build
 * replaces it: `tsup.config.ts` declares no `define`, and on the PUBLISHED tarball of 23.4.4
 * `grep -o 'process\\.env' dist` returns 9 hits, raw, across
 *
 *   separator · password-input · form-field · float-button · typography · error-surface ·
 *   app-shell · data-table
 *
 * Found by measurement, not by reading: this repo's own preview app (Vite 8, dev mode) renders
 * `/isolate/data-entry-password-strength` as "Preview render failed — process is not defined",
 * six DOM nodes and nothing else. `PasswordInput` is one of the five unguarded modules and that
 * page renders it. Most consumer toolchains define `process.env.NODE_ENV` and paper over it,
 * which is precisely why five unguarded reads survived eight releases — the ones that do not
 * define it get a blank screen instead of a warning.
 *
 * TWO ASSERTIONS, because either one alone leaves the door open:
 *   1. the helper does not throw where `process` is absent, and answers `false` there;
 *   2. no module under `src/components/**` reads `process.env` at all any more, so a tenth site
 *      cannot be added without this failing.
 */

const ROOT = process.cwd();

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isDevelopment() survives a world without `process`", () => {
  it("answers false instead of throwing when `process` is undefined", () => {
    vi.stubGlobal("process", undefined);
    expect(() => isDevelopment()).not.toThrow();
    expect(isDevelopment()).toBe(false);
  });

  it("fails SAFE, not loud: an absent `process` means warnings go quiet, never a throw", () => {
    // The trade, stated as a test so it is a decision rather than an accident. Where `process` is
    // absent we cannot tell dev from production. A missing console warning costs a developer one
    // hint; a component that throws while rendering costs the user the whole page.
    vi.stubGlobal("process", undefined);
    expect(isDevelopment()).toBe(false);
  });

  it("still reports dev when NODE_ENV says so, and not in production", () => {
    vi.stubGlobal("process", { env: { NODE_ENV: "development" } });
    expect(isDevelopment()).toBe(true);
    vi.stubGlobal("process", { env: { NODE_ENV: "production" } });
    expect(isDevelopment()).toBe(false);
  });

  it("`process` present but `env` missing answers false, and does not throw", () => {
    // Not a contrived case — it is the one that exposed the real bug. Written as
    // `process.env?.NODE_ENV`, this threw here, because the `?.` does not survive the build (see
    // the next test). The truthiness check that replaced it does.
    vi.stubGlobal("process", {});
    expect(() => isDevelopment()).not.toThrow();
    expect(isDevelopment()).toBe(false);
  });

  it("THE COMPILED FUNCTION still carries the guard — the source is not the thing that runs", () => {
    /*
     * This is the assertion that would have caught the original defect, and nothing else here
     * would have. The first version of this helper read `process.env?.NODE_ENV`, which LOOKS
     * guarded; dumping `isDevelopment.toString()` out of the real vitest pipeline gave
     *
     *     return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
     *
     * with the `?.` gone — a bundler `define` matches the text `process.env` and substitutes
     * through it, discarding the chain. Every source-level assertion about that file passed while
     * the shipped code was unguarded. So this one reads the FUNCTION, after transformation.
     */
    const compiled = isDevelopment.toString();
    expect(compiled, "the typeof guard is what stops `process is not defined`").toMatch(
      /typeof process === "undefined"/,
    );
    expect(
      compiled,
      "optional chaining on process.env is erased by the build — do not rely on it",
    ).not.toMatch(/process\.env\?\./);
    expect(
      compiled,
      "the replaceable literal must survive so a consumer's production build can fold the warnings away",
    ).toContain('process.env.NODE_ENV !== "production"');
  });
});

/** Every `.ts`/`.tsx` under `dir`, minus `__tests__`. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(ROOT, rel)).isDirectory()) {
      if (entry === "__tests__") continue;
      out.push(...sourceFiles(rel));
    } else if (/\.tsx?$/.test(entry)) {
      out.push(rel);
    }
  }
  return out;
}

describe("no component reads process.env directly", () => {
  it("src/components/** goes through isDevelopment(), so the guard cannot drift again", () => {
    const offenders = sourceFiles("src/components").filter((file) =>
      /\bprocess\s*\.\s*env\b/.test(readFileSync(join(ROOT, file), "utf8")),
    );
    expect(
      offenders,
      "use isDevelopment() from src/lib/dev — `process` is not defined in a browser",
    ).toEqual([]);
  });

  it("the helper itself is the only place the global is touched", () => {
    // If this file list ever grows, the reason has to be written down here rather than discovered
    // by a consumer whose bundler does not define `process`.
    const readers = sourceFiles("src").filter(
      (file) => /\bprocess\s*\.\s*env\b/.test(readFileSync(join(ROOT, file), "utf8")),
    );
    expect(readers).toEqual(["src/lib/dev.ts"]);
  });
});
