import { describe, expect, it } from "vitest";

// The visual-audit CLI's output-shaping is PURE (no browser), so it is unit-tested here.
// The browser-driving end-to-end path is covered by scripts/visual-audit-smoke.mjs (CI).
// Importing the module must NOT execute the CLI (it is guarded by an import.meta.url check).
import {
  buildFinding,
  buildResult,
  buildBootstrapError,
  exitCodeFor,
  TESTED_VERSIONS,
  // @ts-expect-error — plain .mjs script module, no types
} from "../../../scripts/visual-audit.mjs";

describe("TESTED_VERSIONS (documented peer range)", () => {
  it("declares a tested range for both required peers + axe-core", () => {
    for (const key of ["playwright", "@axe-core/playwright", "axe-core"]) {
      expect(TESTED_VERSIONS[key].range).toMatch(/>=/);
      expect(TESTED_VERSIONS[key].tested).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});

describe("buildFinding", () => {
  it("resolves severity + standard from the rule catalog", () => {
    const f = buildFinding("axe-violations", "http://x/", "boom");
    expect(f).toMatchObject({ url: "http://x/", rule: "axe-violations", severity: "warn" });
    expect(f.standard).toContain("WCAG");
  });
  it("falls back to warn for an unknown rule id", () => {
    expect(buildFinding("nope", "http://x/", "m").severity).toBe("warn");
  });
});

describe("buildResult — status distinguishes infra from product findings", () => {
  it('is "ok" when every page audited with zero infra errors', () => {
    const r = buildResult({ findings: [buildFinding("axe-violations", "u", "m")], pages: 2 });
    expect(r.status).toBe("ok");
    expect(r.summary).toEqual({ errors: 0, warnings: 1, pages: 2, infrastructureErrors: 0 });
    expect(r.errors).toEqual([]);
    expect(r.tool).toBe(TESTED_VERSIONS);
  });

  it('is "partial" when some pages loaded and others failed to navigate', () => {
    const r = buildResult({
      findings: [buildFinding("emoji-rendered", "u1", "m")],
      errors: [{ url: "u2", stage: "navigate", message: "could not load page: x" }],
      pages: 2,
    });
    expect(r.status).toBe("partial");
    expect(r.summary.infrastructureErrors).toBe(1);
  });

  it('is "error" when NO page could be audited (all navigations failed)', () => {
    const r = buildResult({
      errors: [{ url: "u1", stage: "navigate", message: "could not load page: x" }],
      pages: 1,
    });
    expect(r.status).toBe("error");
    // A tool failure must NOT read as a clean pass — warnings/errors are 0 but status flags it.
    expect(r.summary.infrastructureErrors).toBe(1);
  });

  it("counts a product error (severity error) toward summary.errors", () => {
    const f = { url: "u", rule: "x", severity: "error", message: "m" };
    expect(buildResult({ findings: [f], pages: 1 }).summary.errors).toBe(1);
  });
});

describe("buildBootstrapError — never interpretable as zero violations", () => {
  it("has null summary + a bootstrap error entry", () => {
    const r = buildBootstrapError("missing peers", "install them");
    expect(r.status).toBe("error");
    expect(r.summary).toBeNull();
    expect(r.findings).toEqual([]);
    expect(r.errors[0]).toMatchObject({
      stage: "bootstrap",
      message: "missing peers",
      hint: "install them",
    });
  });
  it("omits hint when not provided", () => {
    expect(buildBootstrapError("no url").errors[0]).not.toHaveProperty("hint");
  });
});

describe("exitCodeFor", () => {
  it("2 for a total/bootstrap failure", () => {
    expect(exitCodeFor(buildBootstrapError("x"))).toBe(2);
    expect(exitCodeFor(buildResult({ errors: [{ stage: "navigate" }], pages: 1 }))).toBe(2);
  });
  it("1 for a partial run", () => {
    expect(
      exitCodeFor(buildResult({ findings: [], errors: [{ stage: "navigate" }], pages: 2 })),
    ).toBe(1);
  });
  it("1 for a product error, 0 for warnings only", () => {
    const err = buildResult({ findings: [{ severity: "error" }], pages: 1 });
    expect(exitCodeFor(err)).toBe(1);
    const warn = buildResult({ findings: [buildFinding("emoji-rendered", "u", "m")], pages: 1 });
    expect(exitCodeFor(warn)).toBe(0);
  });
  it("--strict turns any finding into a non-zero exit", () => {
    const warn = buildResult({ findings: [buildFinding("emoji-rendered", "u", "m")], pages: 1 });
    expect(exitCodeFor(warn, { strict: true })).toBe(1);
    expect(exitCodeFor(buildResult({ pages: 1 }), { strict: true })).toBe(0);
  });
});
