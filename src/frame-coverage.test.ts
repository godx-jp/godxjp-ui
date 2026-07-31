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

  it("registers every public export in the #163 ledger and never reports a gap as a pass", () => {
    const report = JSON.parse(
      execFileSync(
        process.execPath,
        ["scripts/check-frame-coverage-ledger.mjs", "--format", "json"],
        { encoding: "utf8" },
      ),
    );

    expect(report.errors).toEqual([]);
    expect(report.schemaVersion).toBe(2);
    // Every public export and compound subcomponent is linked to the ledger (issue #163 item 1).
    expect(report.totals.exports).toBeGreaterThan(200);
    // Every dimension of every export is in exactly one of the three states (item 3).
    expect(report.totals.covered + report.totals.untested + report.totals.notApplicable).toBe(
      report.totals.dimensionCells,
    );
    // The honest state of #163: an enormous UNTESTED backlog. It must stay visible, never be
    // rounded up to a pass, and never be silently converted into coverage.
    expect(report.totals.untested).toBeGreaterThan(0);
    expect(report.totals.covered).toBeLessThan(report.totals.dimensionCells / 2);
    expect(report.verdictLegend.untested).toMatch(/NOT a pass/i);
    // The issue's "Initial known gaps" stay tracked.
    expect(report.knownGaps).toBeGreaterThanOrEqual(9);
    expect(report.openKnownGaps.length).toBeGreaterThan(0);
    // Executed sweeps are recorded, never inferred.
    expect(report.sweeps.geometry.failingCells).toBeLessThanOrEqual(
      report.baseline.geometryFailingCells,
    );
    expect(report.sweeps.axe.failingFrames).toBeLessThanOrEqual(report.baseline.axeFailingFrames);
  });

  const withLedger = (mutate: (ledger: Record<string, never>) => void) => {
    const directory = mkdtempSync(join(tmpdir(), "frame-coverage-ledger-"));
    const ledger = JSON.parse(readFileSync("preview/frame-coverage.ledger.json", "utf8"));
    mutate(ledger);
    const ledgerPath = join(directory, "ledger.json");
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    return () =>
      execFileSync(process.execPath, ["scripts/check-frame-coverage-ledger.mjs"], {
        env: { ...process.env, FRAME_COVERAGE_LEDGER: ledgerPath },
        stdio: "pipe",
      });
  };

  it("rejects a hand-written covered verdict with no evidence chain", () => {
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ledger as any).components.Button.dimensions.responsive = "covered:declared-case:invented";
      }),
    ).toThrow();
  });

  it("rejects a declared responsive case that omits the required viewport matrix", () => {
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ledger as any).cases = [
          {
            id: "partial-viewports",
            export: "Button",
            dimensions: ["responsive"],
            frame: "docs/general/button/index.tsx",
            case: "Responsive",
            evidence: ["docs/general/button/index.tsx"],
            viewports: [1440],
            verifiedBy: "fixture",
            verifiedIn: "https://example.test/pr",
            verifiedAt: "2026-07-30T00:00:00Z",
          },
        ];
      }),
    ).toThrow();
  });

  it("ratchets: a coverage regression against the recorded baseline fails closed", () => {
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ledger as any).components.Button.baseline.covered += 2;
      }),
    ).toThrow();
  });

  it("ratchets: the required viewport baseline cannot be weakened", () => {
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ledger as any).policy.viewports.required = [1024, 1440];
      }),
    ).toThrow();
  });

  it("ratchets: an issue #163 known gap cannot be deleted or waived", () => {
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const l = ledger as any;
        l.policy.knownGaps = l.policy.knownGaps.filter(
          (gap: { id: string }) => gap.id !== "data-table-contract-gaps",
        );
      }),
    ).toThrow();
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ledger as any).policy.notApplicable = [
          {
            target: "DataTable",
            dimension: "async",
            reason:
              "We would prefer not to test the asynchronous lifecycle of this table right now.",
            reviewedBy: "fixture",
            reviewedIn: "https://example.test/pr",
            reviewedAt: "2026-07-30T00:00:00Z",
          },
        ];
      }),
    ).toThrow();
  });

  // The frames ratchet has two directions. This used to assert the first one by CLEARING
  // `knownMissingFrames` — which only failed while some export genuinely lacked a frame.
  // `layout/legal-document-shell` was that export; it now has one (its `sourceAliases` entry
  // for the directory docs form landed), so the repo is at ZERO missing frames and clearing an
  // already-empty list is a no-op that asserts nothing. Direction 1 (an unbaselined frameless
  // export is a hard failure) cannot be synthesised from the ledger, because the checker derives
  // the frame rows from the real repo and only `FRAME_COVERAGE_LEDGER` is overridable — it is
  // enforced by `scripts/check-frame-coverage.mjs` instead, which is exactly the gate that caught
  // legal-document-shell. Direction 2 is reachable and is what we pin here: the baseline may only
  // ever SHRINK, so a stale entry naming an export that now HAS a frame must fail rather than
  // silently keep reserving debt that was already paid off.
  it("ratchets: a baseline entry for an export that now HAS a frame fails, so the floor only tightens", () => {
    expect(
      withLedger((ledger) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ledger as any).baseline.knownMissingFrames = ["layout/legal-document-shell"];
      }),
    ).toThrow();
  });

  it("records zero missing frames today, so every public export reaches a /frame route", () => {
    const ledger = JSON.parse(readFileSync("preview/frame-coverage.ledger.json", "utf8"));
    expect(ledger.baseline.knownMissingFrames).toEqual([]);
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
