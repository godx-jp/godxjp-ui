import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { TOOL_DEFINITIONS } from "./tools/registry.js";
import { CARDINAL_RULES } from "./data/rules.js";
import { TOKENS } from "./data/tokens.js";
import { SKILLS } from "./data/skills-index.js";
import pkg from "../package.json";

/**
 * Anti-drift guards: docs + schemas must track the data, never a stale literal.
 * These catch the exact bugs this audit fixed (README "14 tools" / "34 rules",
 * get_tokens enum vs real token tiers).
 */

const readmePath = fileURLToPath(new URL("../README.md", import.meta.url));
const README = readFileSync(readmePath, "utf8");

describe("README tracks the real catalog", () => {
  it("the tools table header matches TOOL_DEFINITIONS.length", () => {
    expect(README).toContain(`Tools (${TOOL_DEFINITIONS.length})`);
    expect(README).not.toMatch(/Tools \(14\)/);
  });

  it("documents the actual cardinal-rule count, not a stale 34", () => {
    expect(README).toContain(String(CARDINAL_RULES.length));
    expect(README).not.toMatch(/34 cardinal rules/i);
  });

  it("names the consumer-namespace tools", () => {
    for (const n of ["list_consumer_skills", "route_consumer_task", "draft_bug_report"]) {
      expect(README).toContain(n);
    }
  });
});

describe("schema ↔ data sync", () => {
  it("has at least the 17 original + 4 new tools", () => {
    expect(TOOL_DEFINITIONS.length).toBeGreaterThanOrEqual(21);
  });

  it("get_tokens enum equals the real set of token tiers", () => {
    const getTokens = TOOL_DEFINITIONS.find((t) => t.name === "get_tokens");
    const enumVals = (getTokens?.inputSchema as { properties?: { category?: { enum?: string[] } } })
      .properties?.category?.enum;
    const real = [...new Set(TOKENS.map((t) => t.category))].sort();
    expect((enumVals ?? []).slice().sort()).toEqual(real);
  });

  it("every skill carries a valid audience", () => {
    for (const s of SKILLS) {
      expect(["core", "consumer", "both"], s.id).toContain(s.audience);
    }
  });
});

describe("server version", () => {
  it("serverInfo version tracks package.json — never hardcoded", () => {
    const src = readFileSync(fileURLToPath(new URL("./index.ts", import.meta.url)), "utf8");
    expect(src).toMatch(/version:\s*pkg\.version/);
    expect(src).not.toMatch(/version:\s*["']\d+\.\d+\.\d+["']/);
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
