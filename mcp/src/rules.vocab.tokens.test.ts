import { describe, it, expect } from "vitest";

import { dispatchTool } from "./tools/registry.js";
import { CARDINAL_RULES } from "./data/rules.js";
import { PROP_VOCABULARY } from "./data/prop-vocabulary.js";
import { TOKENS } from "./data/tokens.js";

/** The three reference catalogs: rules, prop-vocabulary, tokens. Data-driven. */

describe("cardinal rules", () => {
  it("has a uniquely-numbered rule set", () => {
    const nums = CARDINAL_RULES.map((r) => r.number);
    expect(new Set(nums).size).toBe(nums.length);
    expect(CARDINAL_RULES.length).toBeGreaterThanOrEqual(34);
  });

  it.each(CARDINAL_RULES.map((r) => [r.number, r.title] as const))(
    "get_rule(%i) returns rule '%s'",
    async (number, title) => {
      const out = await dispatchTool("get_rule", { number });
      expect(out).toContain(`Rule ${number}`);
      expect(out).toContain(title);
    },
  );

  it("get_rule with no number returns the whole set", async () => {
    const out = await dispatchTool("get_rule", {});
    expect(out).toMatch(/Cardinal rules/);
    expect(out).toContain(CARDINAL_RULES[0].title);
  });

  it("get_rule reports (not throws) for an out-of-range number", async () => {
    expect(await dispatchTool("get_rule", { number: 99999 })).toMatch(/not found/i);
  });
});

describe("prop vocabulary", () => {
  it.each(PROP_VOCABULARY.map((v) => [v.name] as const))("get_vocab(%s) resolves", async (name) => {
    const out = await dispatchTool("get_vocab", { name });
    expect(out).toContain(name);
    expect(out).not.toMatch(/not found/i);
  });

  it("the 'Prop' suffix is optional (SizeProp ≡ Size)", async () => {
    const withSuffix = await dispatchTool("get_vocab", { name: "SizeProp" });
    const without = await dispatchTool("get_vocab", { name: "Size" });
    expect(withSuffix).toContain("SizeProp");
    expect(without).toContain("SizeProp");
  });

  it("get_vocab with no name lists every type", async () => {
    const out = await dispatchTool("get_vocab", {});
    expect(out).toMatch(/Prop vocabulary/);
    expect(out).toContain(PROP_VOCABULARY[0].name);
  });

  it("get_vocab reports (not throws) for an unknown name", async () => {
    expect(await dispatchTool("get_vocab", { name: "__nope__" })).toMatch(/not found/i);
  });
});

describe("design tokens", () => {
  const CATEGORIES = [...new Set(TOKENS.map((t) => t.category))];

  it("uses exactly the primitive/semantic/component tiers", () => {
    expect(CATEGORIES.sort()).toEqual(["component", "primitive", "semantic"]);
  });

  it.each(CATEGORIES)("get_tokens(category=%s) returns its tokens", async (category) => {
    const out = await dispatchTool("get_tokens", { category });
    expect(out).toContain(category);
    expect(out).not.toMatch(/^No tokens/);
  });

  it("get_tokens with no category returns all", async () => {
    const out = await dispatchTool("get_tokens", {});
    expect(out).toMatch(/Design tokens/);
  });

  it("an unknown category yields an explicit 'No tokens' (not a crash)", async () => {
    const out = await dispatchTool("get_tokens", { category: "color" });
    expect(out).toMatch(/No tokens/);
  });
});
