import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * v32 #1221 — the SIL Open Font License requires its text to travel with the font files. The real
 * `scripts/copy-styles.mjs` is run into a scratch dir (COPY_STYLES_DIST), so the check needs no
 * prior `pnpm build` and cannot be skipped on a CI shard.
 */
let dist = "";

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), "copy-styles-1221-"));
  execFileSync("node", ["scripts/copy-styles.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, COPY_STYLES_DIST: dist },
    stdio: "pipe",
  });
});

afterAll(() => rmSync(dist, { recursive: true, force: true }));

describe("bundled font files ship with their licence", () => {
  it("copies OFL.txt beside the woff2 files", () => {
    const fonts = join(dist, "styles", "fonts");
    expect(readdirSync(fonts).filter((f) => f.endsWith(".woff2")).length).toBeGreaterThan(0);
    expect(existsSync(join(fonts, "OFL.txt"))).toBe(true);
    expect(readFileSync(join(fonts, "OFL.txt"), "utf8")).toContain("SIL OPEN FONT LICENSE");
  });
});
