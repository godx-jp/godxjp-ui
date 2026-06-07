import { describe, it, expect } from "vitest";

import { RESOURCE_DEFINITIONS, readResource } from "./resources/registry.js";
import { COMPONENTS } from "./data/components.js";
import { PATTERNS } from "./data/patterns.js";
import { CARDINAL_RULES } from "./data/rules.js";
import { TOKENS } from "./data/tokens.js";

describe("resource registry", () => {
  it("declares well-formed resources under the godx-ui scheme", () => {
    expect(RESOURCE_DEFINITIONS.length).toBeGreaterThan(0);
    for (const r of RESOURCE_DEFINITIONS) {
      expect(r.uri).toMatch(/^godx-ui:\/\//);
      expect(typeof r.name).toBe("string");
      expect(typeof r.mimeType).toBe("string");
    }
  });

  it("the rules resource name tracks the real rule count (no '34' drift)", () => {
    const rules = RESOURCE_DEFINITIONS.find((r) => r.uri === "godx-ui://rules");
    expect(rules?.name).toContain(String(CARDINAL_RULES.length));
  });

  it("reads every declared (non-templated) resource", async () => {
    for (const r of RESOURCE_DEFINITIONS) {
      const text = await readResource(r.uri);
      expect(text.length, r.uri).toBeGreaterThan(0);
    }
  });

  it("reads every templated resource variant", async () => {
    const comp = await readResource(`godx-ui://components/${COMPONENTS[0].name}`);
    expect(comp).toContain(COMPONENTS[0].name);

    const cat = [...new Set(TOKENS.map((t) => t.category))][0];
    const toks = await readResource(`godx-ui://tokens/${cat}`);
    expect(toks).toContain(cat);

    const rule = await readResource(`godx-ui://rules/${CARDINAL_RULES[0].number}`);
    expect(rule).toContain(CARDINAL_RULES[0].title);

    const pat = await readResource(`godx-ui://patterns/${PATTERNS[0].name}`);
    expect(pat).toContain(PATTERNS[0].name);
  });

  it("reads EVERY component + rule + pattern by template (full round-trip)", async () => {
    for (const c of COMPONENTS) {
      expect(await readResource(`godx-ui://components/${c.name}`)).toContain(c.name);
    }
    for (const r of CARDINAL_RULES) {
      expect(await readResource(`godx-ui://rules/${r.number}`)).toContain(r.title);
    }
    for (const p of PATTERNS) {
      expect(await readResource(`godx-ui://patterns/${p.name}`)).toContain(p.name);
    }
  });

  it("throws on unknown / malformed resource uris", async () => {
    await expect(readResource("godx-ui://nope")).rejects.toThrow();
    await expect(readResource("godx-ui://components/__nope__")).rejects.toThrow();
    await expect(readResource("godx-ui://rules/99999")).rejects.toThrow();
    await expect(readResource("godx-ui://patterns/__nope__")).rejects.toThrow();
    await expect(readResource("not-even-a-godx-uri")).rejects.toThrow();
  });
});
