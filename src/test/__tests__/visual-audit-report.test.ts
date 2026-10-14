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
  ACCEPTANCE_PENDING,
  DEFAULT_VIEWPORTS,
  PROBE_RULES,
  allRules,
  evaluateProbes,
  isTrackedUppercaseLabel,
  parseViewports,
  // @ts-expect-error — plain .mjs script module, no types
} from "../../../scripts/visual-audit.mjs";

describe("TESTED_VERSIONS (documented peer range)", () => {
  it("declares a tested range for the required peer", () => {
    for (const key of ["playwright"]) {
      expect(TESTED_VERSIONS[key].range).toMatch(/>=/);
      expect(TESTED_VERSIONS[key].tested).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});

describe("buildFinding", () => {
  it("resolves severity + standard from the rule catalog", () => {
    const f = buildFinding("target-size-min", "http://x/", "boom");
    expect(f).toMatchObject({ url: "http://x/", rule: "target-size-min", severity: "warn" });
    expect(f.standard).toContain("WCAG");
  });
  it("falls back to warn for an unknown rule id", () => {
    expect(buildFinding("nope", "http://x/", "m").severity).toBe("warn");
  });
});

describe("buildResult — status distinguishes infra from product findings", () => {
  it('is "ok" when every page audited with zero infra errors', () => {
    const r = buildResult({ findings: [buildFinding("target-size-min", "u", "m")], pages: 2 });
    expect(r.status).toBe("ok");
    expect(r.summary).toMatchObject({ errors: 0, warnings: 1, pages: 2, infrastructureErrors: 0 });
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

describe("--widths parsing (ADR width matrix)", () => {
  it("defaults to the six ADR viewports", () => {
    expect(
      parseViewports(null).map((v: { width: number; height: number }) => `${v.width}x${v.height}`),
    ).toEqual(["320x900", "390x844", "768x1024", "1024x900", "1280x900", "844x390"]);
    expect(parseViewports(null)).toBe(DEFAULT_VIEWPORTS);
  });
  it("accepts WxH lists and bare widths (height 900)", () => {
    expect(parseViewports("390x844, 1440")).toEqual([
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]);
  });
  it("refuses garbage instead of silently auditing nothing", () => {
    expect(() => parseViewports("phone")).toThrow(/WIDTH/);
    expect(() => parseViewports("")).toThrow(/no viewport/);
  });
});

describe("acceptance line — never 'done'", () => {
  it("zero machine failures earns only the pending line", () => {
    expect(buildResult({ pages: 1 }).acceptance).toBe(ACCEPTANCE_PENDING);
    expect(ACCEPTANCE_PENDING).toBe("probes passed; independent acceptance pending");
  });
  it("any finding or infra error withholds it", () => {
    const warn = buildResult({ findings: [buildFinding("emoji-rendered", "u", "m")], pages: 1 });
    expect(warn.acceptance).not.toMatch(/pending/);
    const infra = buildResult({ errors: [{ stage: "navigate" }], pages: 1 });
    expect(infra.acceptance).not.toMatch(/pending/);
  });
  it("counts unmapped items and pending checklist lines", () => {
    const cell = evaluateProbes({}, { url: "u", viewport: { width: 390, height: 844 } });
    const r = buildResult({ pages: 1, matrix: [cell.cell], unmapped: [{ rule: "x" }] });
    expect(r.summary.unmapped).toBe(1);
    expect(r.summary.checklistPending).toBe(cell.cell.checklist.length);
  });
});

describe("probe catalog", () => {
  it("every probe/checklist id is MCP-safe and printed by --rules", () => {
    const ids = allRules().map((r: { id: string }) => r.id);
    for (const r of PROBE_RULES) {
      expect(r.id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(ids).toContain(r.id);
      expect(["probe", "checklist"]).toContain(r.kind);
    }
    expect(PROBE_RULES.find((r: { id: string }) => r.id.startsWith("c03")).kind).toBe("checklist");
  });
});

describe("evaluateProbes — per-rule predicates on synthetic measurements", () => {
  const phone = { width: 390, height: 844 };
  const desk = { width: 1280, height: 900 };
  const run = (raw: object, viewport = phone) => evaluateProbes(raw, { url: "u", viewport });
  const rules = (out: { findings: { rule: string }[] }) => out.findings.map((f) => f.rule);

  it("C01: 1.5px tolerance on document excess and clips; recoverable clips are exempt", () => {
    expect(
      rules(run({ c01: { scrollers: [{ element: "document", excess: 1.5 }], clips: [] } })),
    ).toEqual([]);
    const out = run({
      c01: {
        scrollers: [{ element: "document", excess: 10 }],
        clips: [
          { kind: "icon", element: "svg#a", px: 6, axis: "y", clipper: "div", recoverable: false },
          {
            kind: "text",
            element: "span#b",
            px: 30,
            axis: "x",
            clipper: "span",
            recoverable: true,
          },
        ],
      },
    });
    expect(out.findings.map((f: { element: string }) => f.element)).toEqual(["document", "svg#a"]);
    expect(out.findings[0].threshold).toMatchObject({ value: 1.5, origin: "repo-chosen" });
  });

  it("C02: 8ch floor after padding, hint must fit or be visible elsewhere", () => {
    const field = (o: object) => ({
      c02: { mapped: [{ element: "input#s", chPx: 8, placeholder: "", placeholderPx: 0, ...o }] },
    });
    expect(rules(run(field({ contentPx: 63 })))).toEqual(["c02-search-usable"]);
    expect(rules(run(field({ contentPx: 64 })))).toEqual([]);
    expect(
      rules(run(field({ contentPx: 80, placeholder: "Search all", placeholderPx: 90 }))),
    ).toEqual(["c02-search-usable"]);
    expect(
      rules(
        run(
          field({
            contentPx: 80,
            placeholder: "Search all",
            placeholderPx: 90,
            hintElsewhere: true,
          }),
        ),
      ),
    ).toEqual([]);
  });

  it("C02: an unmapped search-looking field is reported, not passed", () => {
    const out = run({ c02: { mapped: [], candidates: [{ element: "input", reason: "r" }] } });
    expect(out.cell.rules["c02-search-usable"]).toBe("unmapped");
    expect(out.unmapped).toHaveLength(1);
  });

  it("C04: compact only — visible name, missing trigger, nameless trigger, inert trigger", () => {
    const acc = (o: object) => ({
      c04: { mapped: [{ element: "button#a", nameVisible: false, nameText: "", ...o }] },
    });
    const ok = { element: "button#a", name: "Account", hasPopup: true, opens: true };
    expect(rules(run(acc({ trigger: ok })))).toEqual([]);
    expect(rules(run(acc({ trigger: ok, nameVisible: true, nameText: "Famgia" })))).toEqual([
      "c04-compact-account-name",
    ]);
    expect(rules(run(acc({ trigger: null })))).toEqual(["c04-compact-account-name"]);
    expect(rules(run(acc({ trigger: { ...ok, name: "" } })))).toEqual(["c04-compact-account-name"]);
    expect(rules(run(acc({ trigger: { ...ok, hasPopup: false } })))).toEqual([
      "c04-compact-account-name",
    ]);
    expect(rules(run(acc({ trigger: { ...ok, opens: false } })))).toEqual([
      "c04-compact-account-name",
    ]);
    const wide = run(acc({ trigger: null, nameVisible: true }), desk);
    expect(rules(wide)).toEqual([]);
    expect(wide.cell.rules["c04-compact-account-name"]).toBe("not-applicable-at-width");
  });

  it("C05: inset ≤ 24px passes, 56px fails, desktop not applicable", () => {
    expect(rules(run({ c05: { mapped: [{ element: "div", insetPx: 24 }] } }))).toEqual([]);
    expect(rules(run({ c05: { mapped: [{ element: "div", insetPx: 56 }] } }))).toEqual([
      "c05-compact-editor-inset",
    ]);
    expect(rules(run({ c05: { mapped: [{ element: "div", insetPx: 56 }] } }, desk))).toEqual([]);
  });

  it("C06: 2 direct + 1 overflow passes; 3+1, 2+2, wrapped single-row, small target, empty overflow fail", () => {
    const g = (o: object) => ({
      c06: {
        mapped: [
          {
            element: "div#g",
            direct: 2,
            overflow: 1,
            rows: 1,
            singleRow: false,
            smallTargets: [],
            overflowMenus: [{ element: "b", items: 2 }],
            ...o,
          },
        ],
      },
    });
    expect(rules(run(g({})))).toEqual([]);
    expect(rules(run(g({ rows: 2 })))).toEqual([]); // wrapping is allowed
    expect(rules(run(g({ direct: 3 })))).toEqual(["c06-compact-actions"]);
    expect(rules(run(g({ overflow: 2 })))).toEqual(["c06-compact-actions"]);
    expect(rules(run(g({ rows: 2, singleRow: true })))).toEqual(["c06-compact-actions"]);
    expect(
      rules(run(g({ smallTargets: [{ element: "b#t", name: "Pin", width: 16, height: 16 }] }))),
    ).toEqual(["c06-compact-actions"]);
    expect(rules(run(g({ overflowMenus: [{ element: "b", items: 0 }] })))).toEqual([
      "c06-compact-actions",
    ]);
  });

  it("C10/C11: desktop only, 8px and 2px repo-chosen tolerances", () => {
    expect(
      rules(run({ c10: { mapped: [{ element: "b", edge: "end", distancePx: 8 }] } }, desk)),
    ).toEqual([]);
    expect(
      rules(run({ c10: { mapped: [{ element: "b", edge: "end", distancePx: 9 }] } }, desk)),
    ).toEqual(["c10-rail-toggle-attached"]);
    expect(
      rules(run({ c10: { mapped: [{ element: "b", edge: "end", distancePx: 90 }] } })),
    ).toEqual([]);
    expect(
      rules(run({ c11: { mapped: [{ element: "s", column: "c", deltaPx: 2 }] } }, desk)),
    ).toEqual([]);
    expect(
      rules(run({ c11: { mapped: [{ element: "s", column: "c", deltaPx: 196 }] } }, desk)),
    ).toEqual(["c11-search-keyline"]);
    expect(
      run({ c11: { mapped: [], endAligned: true } }, desk).cell.rules["c11-search-keyline"],
    ).toBe("not-applicable-end-aligned");
  });

  it("C12: uppercase AND ≤12px AND ≥0.04em; literal codes exempt", () => {
    const l = {
      element: "h2",
      text: "PAGES",
      fontPx: 11,
      trackingEm: 0.08,
      uppercase: true,
      literal: false,
    };
    expect(isTrackedUppercaseLabel(l)).toBe(true);
    expect(isTrackedUppercaseLabel({ ...l, fontPx: 13 })).toBe(false);
    expect(isTrackedUppercaseLabel({ ...l, trackingEm: 0.03 })).toBe(false);
    expect(isTrackedUppercaseLabel({ ...l, uppercase: false })).toBe(false);
    expect(isTrackedUppercaseLabel({ ...l, literal: true })).toBe(false);
    expect(rules(run({ c12: { mapped: [l] } }))).toEqual(["c12-tracked-uppercase-label"]);
  });

  it("checklist rules and the per-width checklist are always pending", () => {
    const out = run({});
    expect(out.cell.rules["c03-single-brand"]).toBe("checklist");
    expect(out.cell.rules["c09-progress-role"]).toBe("checklist");
    const ids = out.cell.checklist.map((c: { rule: string }) => c.rule);
    expect(ids).toContain("c03-single-brand");
    expect(ids).toContain("c05-compact-editor-inset");
    expect(ids).not.toContain("c11-search-keyline"); // desktop-only line at a phone width
    expect(out.cell.checklist.every((c: { status: string }) => c.status === "pending")).toBe(true);
  });
});
