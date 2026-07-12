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
    for (const dimension of [
      "isolated",
      "props",
      "composition",
      "journey",
      "responsive",
      "rtl",
      "a11y",
      "touch",
      "async",
    ]) {
      expect(report.totals[dimension].untested).toBe(0);
    }
    expect(report.totals.screenReader.untested).toBe(
      report.exports - report.totals.screenReader["not-applicable"],
    );
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

  it("rejects a screen-reader PASS without real AT evidence metadata", () => {
    const directory = mkdtempSync(join(tmpdir(), "screen-reader-evidence-"));
    const config = JSON.parse(readFileSync("frame-coverage.json", "utf8"));
    config.dimensions.screenReader = {
      status: "pass",
      reason: "This deliberately invalid fixture has no linked real-AT evidence.",
    };
    const configPath = join(directory, "coverage.json");
    const evidencePath = join(directory, "evidence.json");
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(evidencePath, JSON.stringify({ schemaVersion: 1, records: [] }));

    expect(() =>
      execFileSync(process.execPath, ["scripts/check-screen-reader-evidence.mjs"], {
        env: {
          ...process.env,
          FRAME_COVERAGE_CONFIG: configPath,
          SCREEN_READER_EVIDENCE_CONFIG: evidencePath,
        },
        stdio: "pipe",
      }),
    ).toThrow();
  });
});
