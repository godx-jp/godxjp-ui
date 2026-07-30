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
      "composition",
      "journey",
      "responsive",
      "rtl",
      "a11y",
      "touch",
      "async",
    ]) {
      expect(report.totals[dimension].untested).toBeGreaterThan(0);
      expect(report.totals[dimension].untested).toBeLessThanOrEqual(report.exports);
    }
    // Prop completeness is derived from exact TypeScript API + case evidence. Until every
    // component case is authored, gaps must remain visible instead of inheriting a global PASS.
    expect(report.totals.props.untested).toBeGreaterThan(0);
    expect(report.totals.props.pass).toBeLessThan(report.exports);
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

  it("counts exact public prop evidence and preserves visible gaps", () => {
    const report = JSON.parse(
      execFileSync(process.execPath, ["scripts/check-component-case-evidence.mjs"], {
        encoding: "utf8",
      }),
    );

    expect(report.callableComponents).toBeGreaterThan(200);
    expect(report.coveredProps + report.untestedProps).toBe(report.publicProps);
    expect(report.coveredProps).toBeGreaterThan(0);
    expect(report.untestedProps).toBeGreaterThan(0);
    expect(report.fullyCoveredComponents).toBeGreaterThanOrEqual(8);
  });

  it("fails closed when a completed component loses prop evidence", () => {
    const directory = mkdtempSync(join(tmpdir(), "component-case-evidence-"));
    const evidence = JSON.parse(readFileSync("component-case-evidence.json", "utf8"));
    delete evidence.components.Input.props.allowClear;
    const evidencePath = join(directory, "evidence.json");
    writeFileSync(evidencePath, JSON.stringify(evidence));

    expect(() =>
      execFileSync(process.execPath, ["scripts/check-component-case-evidence.mjs"], {
        env: { ...process.env, COMPONENT_CASE_EVIDENCE: evidencePath },
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
    const evidence = JSON.parse(readFileSync("screen-reader-evidence.json", "utf8"));
    writeFileSync(evidencePath, JSON.stringify(evidence));

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

  it("rejects an Axe snapshot presented as screen-reader evidence", () => {
    const directory = mkdtempSync(join(tmpdir(), "screen-reader-evidence-"));
    const evidence = JSON.parse(readFileSync("screen-reader-evidence.json", "utf8"));
    evidence.records.push({
      id: "invalid-axe-record",
      owner: "data-entry/select",
      combinationId: "voiceover-safari-macos",
      operatingSystem: "macOS",
      operatingSystemVersion: "26.0.1 (25A362)",
      assistiveTechnology: "VoiceOver",
      assistiveTechnologyVersion: "10",
      browser: "Safari",
      browserVersion: "26",
      locale: "ja-JP",
      frameUrl: "https://example.test/select",
      journey: "Open and select an option",
      transcript: "Select, collapsed",
      captureMethod: "axe-accessibility-tree",
      evidenceUrl: "https://example.test/axe-snapshot.json",
      testedAt: "2026-07-15T00:00:00Z",
      tester: "fixture",
      verdict: "pass",
    });
    const evidencePath = join(directory, "evidence.json");
    writeFileSync(evidencePath, JSON.stringify(evidence));

    expect(() =>
      execFileSync(process.execPath, ["scripts/check-screen-reader-evidence.mjs"], {
        env: { ...process.env, SCREEN_READER_EVIDENCE_CONFIG: evidencePath },
        stdio: "pipe",
      }),
    ).toThrow();
  });

  it("requires every AT/browser and locale record before an owner can PASS", () => {
    const directory = mkdtempSync(join(tmpdir(), "screen-reader-evidence-"));
    const config = JSON.parse(readFileSync("frame-coverage.json", "utf8"));
    config.ownerOverrides = {
      ...config.ownerOverrides,
      "data-entry/input": { screenReader: { status: "pass" } },
    };
    const evidence = JSON.parse(readFileSync("screen-reader-evidence.json", "utf8"));
    evidence.records.push({
      id: "input-vo-ja-only",
      owner: "data-entry/input",
      combinationId: "voiceover-safari-macos",
      operatingSystem: "macOS",
      operatingSystemVersion: "26.0.1 (25A362)",
      assistiveTechnology: "VoiceOver",
      assistiveTechnologyVersion: "10",
      browser: "Safari",
      browserVersion: "26",
      locale: "ja-JP",
      frameUrl: "https://example.test/input",
      journey: "Focus, enter invalid text, correct it",
      transcript: "Name, edit text, required",
      captureMethod: "audio-recording",
      evidenceUrl: "https://example.test/recording.mov",
      testedAt: "2026-07-15T00:00:00Z",
      tester: "fixture",
      verdict: "pass",
    });
    const configPath = join(directory, "coverage.json");
    const evidencePath = join(directory, "evidence.json");
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(evidencePath, JSON.stringify(evidence));

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
