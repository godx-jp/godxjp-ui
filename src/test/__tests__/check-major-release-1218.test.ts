import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

/** gh#1218 — the publish job refuses a new major without a real English migration note. */
const SCRIPT = path.resolve("scripts/check-major-release.mjs");
const LONG_AGO = "2026-01-01T00:00:00Z";
const words = (n: number) =>
  Array.from({ length: n }, (_, i) => `word${i % 9 ? "s" : ""}`).join(" ");

function run(args: string[], note?: string) {
  const root = mkdtempSync(path.join(tmpdir(), "major-gate-"));
  if (note !== undefined) {
    mkdirSync(path.join(root, "docs", "migrations"), { recursive: true });
    writeFileSync(path.join(root, "docs", "migrations", "v32.md"), note);
  }
  const r = spawnSync(process.execPath, [SCRIPT, "--root", root, ...args], { encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

const GOOD = `# Migrating to v32\n\n## Breaking changes\n\n${words(200)}\n\n## How to upgrade\n\n${words(100)}\n`;

describe("check-major-release (gh#1218)", () => {
  it("lets a minor or patch through without a note", () => {
    const r = run(["--tag", "v31.32.0", "--published", "31.31.8", "--published-at", LONG_AGO]);
    expect(r.status, r.out).toBe(0);
  });

  it("refuses a new major with no migration note", () => {
    const r = run(["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", LONG_AGO]);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/docs\/migrations\/v32\.md is missing/);
  });

  it("refuses an empty or stub note, and one without the required sections", () => {
    const stub = run(
      ["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", LONG_AGO],
      "# v32\nTODO\n",
    );
    expect(stub.status).toBe(1);
    expect(stub.out).toMatch(/words of prose/);
    expect(stub.out).toMatch(/Breaking changes/);
    expect(stub.out).toMatch(/How to upgrade/);
  });

  it("refuses a note that is not English", () => {
    const vi = `# v32\n\n## Breaking changes\n\n${"Thay đổi lớn về định dạng ngày và ngôn ngữ mặc định. ".repeat(40)}\n\n## How to upgrade\n\n${words(60)}`;
    const r = run(["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", LONG_AGO], vi);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/not English/);
  });

  it("refuses a major less than 90 days after the previous one, unless the owner allows it", () => {
    const recent = new Date(Date.now() - 20 * 86_400_000).toISOString();
    const refused = run(
      ["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", recent],
      GOOD,
    );
    expect(refused.status).toBe(1);
    expect(refused.out).toMatch(/90/);
    const allowed = run(
      ["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", recent, "--allow-off-cycle"],
      GOOD,
    );
    expect(allowed.status, allowed.out).toBe(0);
    expect(allowed.out).toMatch(/off-cycle major allowed/);
  });

  it("accepts the owner's off-cycle approval written in the note (a tag push has no inputs)", () => {
    const recent = new Date(Date.now() - 20 * 86_400_000).toISOString();
    const note = `${GOOD}\nOff-cycle approved: owner 2026-10-09 (single v32 batch, #1205)\n`;
    const r = run(["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", recent], note);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/off-cycle major allowed/);
  });

  it("passes a complete English note on cadence", () => {
    const r = run(["--tag", "v32.0.0", "--published", "31.31.8", "--published-at", LONG_AGO], GOOD);
    expect(r.status, r.out).toBe(0);
  });
});
