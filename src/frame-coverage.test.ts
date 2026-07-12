import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("frame coverage checker", () => {
  it("enumerates public visual exports and emits honest totals", () => {
    const report = JSON.parse(
      execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], { encoding: "utf8" }),
    );
    expect(report.exports).toBeGreaterThan(200);
    expect(report.frames).toBeGreaterThan(50);
    for (const dimension of Object.values(report.totals) as Array<Record<string, number>>) {
      expect(Object.values(dimension).reduce((total, count) => total + count, 0)).toBe(
        report.exports,
      );
    }
    expect(report.totals.props.untested).toBe(report.exports);
    expect(report.totals.touch.untested).toBe(report.exports);
    expect(report.totals.screenReader.untested).toBe(report.exports);
    expect(report.totals.isolated.pass).toBeGreaterThan(0);
  });

  it("fails closed for an unreasoned malformed status", () => {
    const directory = mkdtempSync(join(tmpdir(), "frame-coverage-"));
    const config = JSON.parse(readFileSync("frame-coverage.json", "utf8"));
    config.dimensions.rtl = { status: "unknown", reason: "" };
    const configPath = join(directory, "invalid.json");
    writeFileSync(configPath, JSON.stringify(config));
    expect(() =>
      execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], {
        env: { ...process.env, FRAME_COVERAGE_CONFIG: configPath },
        stdio: "pipe",
      }),
    ).toThrow();
  });
});
