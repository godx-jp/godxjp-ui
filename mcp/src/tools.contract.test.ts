import { describe, it, expect } from "vitest";

import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry.js";

/**
 * Contract-level guarantees that hold for EVERY tool regardless of payload.
 * The data-specific behaviour is covered in the per-domain test files.
 */

const TOOL_NAMES = TOOL_DEFINITIONS.map((t) => t.name);

describe("tool registry — shape", () => {
  it("declares a unique, well-formed set of tools", () => {
    expect(new Set(TOOL_NAMES).size).toBe(TOOL_NAMES.length); // no dupes
    for (const t of TOOL_DEFINITIONS) {
      expect(t.name).toMatch(/^[a-z_]+$/);
      expect(typeof t.description).toBe("string");
      expect(t.description.length).toBeGreaterThan(10);
      expect(t.inputSchema?.type).toBe("object");
    }
  });

  it("includes the consumer namespace + bug-report tools", () => {
    for (const n of [
      "list_consumer_skills",
      "get_consumer_skill",
      "route_consumer_task",
      "draft_bug_report",
    ]) {
      expect(TOOL_NAMES).toContain(n);
    }
  });
});

describe("tool registry — dispatch is total and never throws", () => {
  it("every declared tool is dispatchable (no definition/dispatch drift)", async () => {
    for (const t of TOOL_DEFINITIONS) {
      const out = await dispatchTool(t.name, {});
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
      expect(out).not.toMatch(/^Unknown tool:/);
    }
  });

  it("reports (not throws) an unknown tool", async () => {
    expect(await dispatchTool("does_not_exist", {})).toMatch(/^Unknown tool:/);
  });

  // Edge-case payloads: empty, missing required, null, unicode, whitespace,
  // wrong-type, very long. None may throw — every handler must degrade to a
  // string (guidance or "not found"), never crash the server.
  const EDGE_ARGS: Array<Record<string, unknown>> = [
    {},
    { name: "" },
    { name: "   " },
    { name: null },
    { name: 12345 },
    { name: "Bùtton — 日本語 — مرحبا" },
    { query: "" },
    { task: "   " },
    { symptom: "" },
    { jsx: "" },
    { number: -999 },
    { category: "not-a-real-category" },
    { skill: "", section: "" },
    { name: "x".repeat(5000) },
  ];

  it("tolerates adversarial payloads on every tool without throwing", async () => {
    for (const t of TOOL_DEFINITIONS) {
      for (const args of EDGE_ARGS) {
        const out = await dispatchTool(t.name, args);
        expect(typeof out, `${t.name} with ${JSON.stringify(args)}`).toBe("string");
        expect(out.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("draft_bug_report", () => {
  it("asks for summary when nothing useful is provided", async () => {
    const out = await dispatchTool("draft_bug_report", {});
    expect(out).toMatch(/summary/i);
    expect(out).not.toMatch(/gh issue create/); // no command without a title
  });

  it("with a full payload produces every required section + a gh command", async () => {
    const out = await dispatchTool("draft_bug_report", {
      summary: "Select trigger ignores size prop",
      repro: '<Select size="sm" /> renders at md height',
      expected: "trigger height = --control-height-sm",
      actual: "trigger height = --control-height (md)",
      component: "Select",
      rule: 2,
      version: "12.1.0",
      env: "Chrome 130 / macOS",
    });
    for (const section of [
      "## Summary",
      "## Affected",
      "## Reproduction",
      "## Expected",
      "## Actual",
      "## Environment",
    ]) {
      expect(out).toContain(section);
    }
    expect(out).toContain("`Select`");
    expect(out).toContain("#2");
    expect(out).toContain("12.1.0");
    expect(out).toMatch(/gh issue create --repo godx-jp\/godxjp-ui/);
    // Does not execute gh — only prints the command.
    expect(out).toMatch(/does NOT run gh/i);
  });

  it("flags an incomplete report (summary only) but still drafts", async () => {
    const out = await dispatchTool("draft_bug_report", { summary: "X is broken" });
    expect(out).toMatch(/Incomplete/i);
    expect(out).toMatch(/`repro`/);
    expect(out).toMatch(/gh issue create/); // still gives a fillable command
  });

  it("escapes single quotes so the gh --body stays shell-safe", async () => {
    const out = await dispatchTool("draft_bug_report", {
      summary: "it's broken",
      repro: "a'b",
    });
    expect(out).toContain("gh issue create");
    expect(out).toMatch(/'\\''/); // single-quote escaping present
  });
});
