import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Issue #171 gate: real VoiceOver/NVDA announcement evidence.
 *
 * Every record below is a deliberately synthetic FIXTURE used to prove the gate rejects (or
 * accepts) a shape. None of it is committed to `screen-reader-evidence.json`, and none of it is
 * evidence: only a human listening to a real screen reader can produce that.
 */

const COVERAGE_CONFIG = process.env.FRAME_COVERAGE_CONFIG ?? "frame-coverage.json";
const EVIDENCE_CONFIG = process.env.SCREEN_READER_EVIDENCE_CONFIG ?? "screen-reader-evidence.json";

type Json = Record<string, unknown>;

function readJson(file: string): Json {
  return JSON.parse(readFileSync(file, "utf8")) as Json;
}

function runGate(overrides: { coverage?: Json; evidence?: Json }): string {
  const directory = mkdtempSync(join(tmpdir(), "screen-reader-evidence-"));
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (overrides.coverage) {
    const coveragePath = join(directory, "coverage.json");
    writeFileSync(coveragePath, JSON.stringify(overrides.coverage));
    env.FRAME_COVERAGE_CONFIG = coveragePath;
  }
  if (overrides.evidence) {
    const evidencePath = join(directory, "evidence.json");
    writeFileSync(evidencePath, JSON.stringify(overrides.evidence));
    env.SCREEN_READER_EVIDENCE_CONFIG = evidencePath;
  }
  return execFileSync(process.execPath, ["scripts/check-screen-reader-evidence.mjs"], {
    encoding: "utf8",
    env,
    stdio: "pipe",
  });
}

function step(phase: string) {
  return {
    phase,
    command: `FIXTURE command for ${phase}`,
    announced: `FIXTURE announcement for ${phase}`,
  };
}

function fixtureRecord(overrides: Json = {}): Json {
  return {
    id: "fixture-record",
    owner: "data-entry/input",
    combinationId: "voiceover-safari-macos",
    operatingSystem: "macOS",
    operatingSystemVersion: "26.0.1 (25A362)",
    assistiveTechnology: "VoiceOver",
    assistiveTechnologyVersion: "10 (993)",
    browser: "Safari",
    browserVersion: "26.0.1",
    locale: "ja-JP",
    frameUrl: "https://example.test/isolate/data-entry-input",
    entryCommand: "VO-Right until the text field",
    journey: "FIXTURE journey",
    steps: [
      step("focus-entry"),
      step("value-change"),
      step("required-announcement"),
      step("help-announcement"),
      step("invalid-announcement"),
      step("error-announcement"),
    ],
    transcript: "FIXTURE transcript",
    captureMethod: "audio-recording",
    evidenceUrl: "https://example.test/fixture-recording.m4a",
    testedAt: "2026-07-15T00:00:00Z",
    tester: "fixture",
    verdict: "pass",
    ...overrides,
  };
}

function fullMatrixFor(owner: string, steps: Json[]): Json[] {
  const matrix: Json[] = [];
  for (const combination of [
    {
      combinationId: "voiceover-safari-macos",
      operatingSystem: "macOS",
      assistiveTechnology: "VoiceOver",
      browser: "Safari",
    },
    {
      combinationId: "nvda-firefox-windows",
      operatingSystem: "Windows",
      assistiveTechnology: "NVDA",
      browser: "Firefox",
    },
  ]) {
    for (const locale of ["ja-JP", "vi-VN"]) {
      matrix.push(
        fixtureRecord({
          ...combination,
          id: `fixture-${combination.combinationId}-${locale}`,
          owner,
          locale,
          steps,
        }),
      );
    }
  }
  return matrix;
}

// Each assertion spawns the frame-coverage build plus the gate, so the global 8s budget is short.
describe("screen-reader evidence gate (#171)", { timeout: 60_000 }, () => {
  it("validates the committed ledger with every export still untested", () => {
    const output = runGate({});
    expect(output).toContain("screen-reader evidence valid");

    const report = JSON.parse(
      execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], { encoding: "utf8" }),
    ) as { exports: number; totals: Record<string, Record<string, number>> };
    // No export may be promoted by infrastructure work. Only a human AT run can do that.
    expect(report.totals.screenReader.pass).toBe(0);
    expect(report.totals.screenReader.untested).toBe(
      report.exports - report.totals.screenReader["not-applicable"],
    );
  });

  it("encodes the seven issue-171 owner cohorts and the required AT/browser/locale matrix", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as {
      policy: {
        requiredLocales: string[];
        combinations: Array<{ id: string; appliesTo: string }>;
        cohorts: Array<{ id: string; owners: string[]; requiredPhases: string[] }>;
      };
    };
    // The seven issue-171 cohorts must all still be there. The gate lets policy ADD cohorts (it
    // only refuses to see a baseline one omitted or weakened), which is how owners that are
    // announced but never operated — a role="img" chart summary, an aria-busy skeleton — get a
    // truthful phase set instead of being forced to evidence an `activation` they cannot have.
    expect(evidence.policy.cohorts.map((cohort) => cohort.id)).toEqual(
      expect.arrayContaining([
        "data-structures",
        "landmarks-page-structure",
        "live-async-feedback",
        "navigation-composites",
        "native-form-controls",
        "overlays",
        "selection-composites",
      ]),
    );
    expect(evidence.policy.requiredLocales).toEqual(["ja-JP", "vi-VN"]);
    expect(evidence.policy.combinations.map((combination) => combination.id)).toEqual([
      "voiceover-safari-macos",
      "nvda-firefox-windows",
      "nvda-chrome-windows-complex",
    ]);
    const byId = new Map(evidence.policy.cohorts.map((cohort) => [cohort.id, cohort]));
    // Form owners must prove error/help/required/invalid; live owners must prove recovery.
    for (const phase of ["required-announcement", "help-announcement", "invalid-announcement"]) {
      expect(byId.get("native-form-controls")?.requiredPhases).toContain(phase);
    }
    for (const phase of ["loading-announcement", "success-announcement", "recovery-announcement"]) {
      expect(byId.get("live-async-feedback")?.requiredPhases).toContain(phase);
    }
    // Overlays must prove escape-close and focus-return.
    expect(byId.get("overlays")?.requiredPhases).toEqual(
      expect.arrayContaining(["escape-close", "focus-return"]),
    );
    // Each of the owners named in the issue is mapped to exactly one cohort.
    const seen = new Map<string, string>();
    for (const cohort of evidence.policy.cohorts) {
      for (const owner of cohort.owners) {
        expect(seen.has(owner)).toBe(false);
        seen.set(owner, cohort.id);
      }
    }
    expect(seen.get("layout/app-shell")).toBe("landmarks-page-structure");
    expect(seen.get("data-entry/input")).toBe("native-form-controls");
    expect(seen.get("data-entry/select")).toBe("selection-composites");
    expect(seen.get("feedback/dialog")).toBe("overlays");
    expect(seen.get("navigation/tabs")).toBe("navigation-composites");
    expect(seen.get("data-display/data-table")).toBe("data-structures");
    expect(seen.get("feedback/sonner")).toBe("live-async-feedback");
  });

  it("rejects a screenReader PASS with no linked evidence record at all", () => {
    const coverage = readJson(COVERAGE_CONFIG) as Json & { ownerOverrides?: Json };
    coverage.ownerOverrides = {
      ...(coverage.ownerOverrides ?? {}),
      "data-entry/select": { screenReader: { status: "pass" } },
    };
    expect(() => runGate({ coverage })).toThrow(/screenReader PASS lacks/);
  });

  it("rejects a record that has no structured journey steps", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    const record = fixtureRecord();
    delete record.steps;
    evidence.records = [record];
    expect(() => runGate({ evidence })).toThrow(/steps must be a non-empty transcript/);
  });

  it("rejects a record that has no entry command", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [fixtureRecord({ entryCommand: "" })];
    expect(() => runGate({ evidence })).toThrow(/missing entryCommand/);
  });

  it("rejects a form-owner PASS whose journey omits the invalid/error announcements", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [fixtureRecord({ steps: [step("focus-entry"), step("value-change")] })];
    expect(() => runGate({ evidence })).toThrow(
      /native-form-controls evidence has no invalid-announcement/,
    );
  });

  it("rejects a live/async owner PASS whose journey omits the recovery announcement", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [
      fixtureRecord({
        owner: "feedback/sonner",
        steps: [
          step("loading-announcement"),
          step("success-announcement"),
          step("error-announcement"),
        ],
      }),
    ];
    expect(() => runGate({ evidence })).toThrow(
      /live-async-feedback evidence has no recovery-announcement/,
    );
  });

  it("rejects an overlay PASS whose journey omits escape-close and focus-return", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [
      fixtureRecord({
        owner: "feedback/dialog",
        steps: [step("focus-entry"), step("internal-navigation")],
      }),
    ];
    expect(() => runGate({ evidence })).toThrow(/overlays evidence has no escape-close/);
  });

  it("rejects evidence for an owner that is not mapped to a cohort", () => {
    // `layout/flex` is a reviewed not-applicable owner: a bare flex div owns no announcement, so
    // it belongs to no cohort and cannot carry AT evidence either. (Every other owner is mapped,
    // which is the point — an unmapped owner can never be promoted out of untested.)
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [fixtureRecord({ owner: "layout/flex" })];
    expect(() => runGate({ evidence })).toThrow(/is not mapped to a policy cohort/);
  });

  it("rejects an unknown journey phase", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [
      fixtureRecord({ steps: [{ phase: "vibes", command: "x", announced: "y" }] }),
    ];
    expect(() => runGate({ evidence })).toThrow(/unknown journey phase vibes/);
  });

  it("rejects a not-applicable ledger export that has no reviewed reason", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { policy: { notApplicable: Json[] } };
    evidence.policy.notApplicable = [];
    expect(() => runGate({ evidence })).toThrow(/requires a reviewed policy.notApplicable entry/);
  });

  it("rejects a reviewed not-applicable entry whose reason is not a real reason", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & {
      policy: { notApplicable: Array<Json & { reason: string }> };
    };
    evidence.policy.notApplicable[0].reason = "n/a";
    expect(() => runGate({ evidence })).toThrow(/reason must explain why no AT journey exists/);
  });

  it("refuses to waive an interactive cohort owner as not-applicable", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { policy: { notApplicable: Json[] } };
    evidence.policy.notApplicable.push({
      target: "data-entry/select",
      scope: "owner",
      reason: "A deliberately invalid attempt to waive a fully interactive selection composite.",
      reviewedBy: "fixture",
      reviewedIn: "https://example.test/review",
      reviewedAt: "2026-07-15T00:00:00Z",
    });
    expect(() => runGate({ evidence })).toThrow(/cannot be waived/);
  });

  it("rejects a weakened cohort phase policy", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & {
      policy: { cohorts: Array<{ id: string; requiredPhases: string[] }> };
    };
    const cohort = evidence.policy.cohorts.find((entry) => entry.id === "native-form-controls");
    if (cohort) cohort.requiredPhases = ["focus-entry"];
    expect(() => runGate({ evidence })).toThrow(/baseline requiredPhases cannot drop/);
  });

  it("rejects an Axe or accessibility-tree capture presented as AT speech", () => {
    const evidence = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    evidence.records = [
      fixtureRecord({
        captureMethod: "axe-accessibility-tree",
        evidenceUrl: "https://example.test/axe-snapshot.json",
      }),
    ];
    expect(() => runGate({ evidence })).toThrow(/captureMethod must identify a real AT speech/);
  });

  it("promotes an owner only once the complete AT/browser × locale matrix passes", () => {
    const steps = [
      step("focus-entry"),
      step("value-change"),
      step("required-announcement"),
      step("help-announcement"),
      step("invalid-announcement"),
      step("error-announcement"),
    ];
    const coverage = readJson(COVERAGE_CONFIG) as Json & { ownerOverrides?: Json };
    coverage.ownerOverrides = {
      ...(coverage.ownerOverrides ?? {}),
      "data-entry/input": { screenReader: { status: "pass" } },
    };
    const matrix = fullMatrixFor("data-entry/input", steps);

    const partial = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    partial.records = matrix.slice(0, 3);
    expect(() => runGate({ coverage, evidence: partial })).toThrow(/screenReader PASS lacks/);

    const complete = readJson(EVIDENCE_CONFIG) as Json & { records: Json[] };
    complete.records = matrix;
    expect(runGate({ coverage, evidence: complete })).toContain("1 passing owner(s)");
  });
});
