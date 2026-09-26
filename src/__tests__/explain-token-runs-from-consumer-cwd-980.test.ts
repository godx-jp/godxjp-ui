import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/**
 * explain-token ANSWERS FROM THE CONSUMER'S DIRECTORY (gh#980).
 *
 * docs/TOKEN-RESOLUTION.md tells a consumer to run
 * `node node_modules/@godxjp/ui/scripts/explain-token.mjs --<token>` from their own app. The script
 * took `process.cwd()` as the package root, so there it found no catalog and no CSS and printed
 * `no token matches` for `--font-size-xs` and `--radius-lg`, both of which ship. From this checkout's
 * root the two directories are the same, so every run here passed — the test therefore runs it from
 * a directory that is NOT the package.
 */
const SCRIPT = resolve("scripts/explain-token.mjs");
const elsewhere = mkdtempSync(join(tmpdir(), "explain-token-980-"));
afterAll(() => rmSync(elsewhere, { recursive: true, force: true }));

const run = (token: string) =>
  execFileSync(process.execPath, [SCRIPT, token], { cwd: elsewhere, encoding: "utf8" });

describe("explain-token from a consumer's cwd (gh#980)", () => {
  for (const token of ["--font-size-xs", "--radius-lg"]) {
    it(`finds ${token} and knows it is published`, () => {
      const out = run(token);
      expect(out).not.toContain("no token matches");
      expect(out).toContain("published: yes");
    });
  }
});
