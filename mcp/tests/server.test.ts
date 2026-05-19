import { describe, it, expect } from "vitest";
import { TOOL_DEFINITIONS, dispatchTool } from "../src/tools/registry.js";
import { SKILLS, routeTask, findSection } from "../src/data/skills-index.js";
import { COMPONENTS } from "../src/data/components.js";
import { CARDINAL_RULES } from "../src/data/rules.js";
import { ANTI_AI_TELLS } from "../src/data/anti-ai-tells.js";

describe("tool registry", () => {
  it("exposes ≥ 15 tools, each with name + description + inputSchema", () => {
    expect(TOOL_DEFINITIONS.length).toBeGreaterThanOrEqual(15);
    for (const t of TOOL_DEFINITIONS) {
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.inputSchema).toBeTruthy();
    }
  });

  it("returns a markdown error for unknown tool", async () => {
    const out = await dispatchTool("not_a_real_tool", {});
    expect(out).toContain("Unknown tool");
  });
});

describe("list_skills", () => {
  it("returns metadata for every bundled skill (compact, ~1KB)", async () => {
    const out = await dispatchTool("list_skills", {});
    expect(out.length).toBeLessThan(5000); // compact
    for (const s of SKILLS) {
      expect(out).toContain(s.id);
      expect(out).toContain(s.name);
    }
  });
});

describe("get_skill_section", () => {
  it("returns one section body, not the whole skill", async () => {
    const out = await dispatchTool("get_skill_section", {
      skill: "soft",
      section: "vibe-archetypes",
    });
    expect(out).toContain("Ethereal Glass");
    expect(out).toContain("Editorial Luxury");
    // Should NOT include unrelated sections from the same skill
    expect(out).not.toContain("Double-Bezel");
  });

  it("lists sections when skill is given but no section", async () => {
    const out = await dispatchTool("get_skill_section", {
      skill: "taste",
      section: "",
    });
    expect(out).toContain("mobile-first");
    expect(out).toContain("one-intent-per-screen");
  });

  it("reports unknown skill", async () => {
    const out = await dispatchTool("get_skill_section", {
      skill: "no-such-skill",
      section: "anything",
    });
    expect(out).toContain("not found");
  });
});

describe("route_task", () => {
  it("routes premium agency hero to soft/vibe-archetypes", async () => {
    const out = await dispatchTool("route_task", {
      task: "premium agency landing page hero",
    });
    expect(out).toContain("soft");
    expect(out).toContain("vibe-archetypes");
  });

  it("routes form work to taste/form-discipline", async () => {
    const out = await dispatchTool("route_task", { task: "build a sign up form" });
    expect(out).toContain("taste");
    expect(out).toContain("form-discipline");
  });

  it("falls back to taste baseline for unmatched tasks", async () => {
    const results = routeTask("xyzpdq nonsense gibberish");
    expect(results[0].skill).toBe("taste");
  });

  it("response stays under 2KB (token-efficient)", async () => {
    const out = await dispatchTool("route_task", { task: "premium hero design" });
    expect(out.length).toBeLessThan(2000);
  });
});

describe("get_component", () => {
  it("returns Button API with all canonical props", async () => {
    const out = await dispatchTool("get_component", { name: "Button" });
    expect(out).toContain("Button");
    expect(out).toContain("variant");
    expect(out).toContain("primary");
    expect(out).toContain("destructive");
  });

  it("reports unknown component", async () => {
    const out = await dispatchTool("get_component", { name: "NotARealPrimitive" });
    expect(out).toContain("not found");
  });
});

describe("get_rule", () => {
  it("returns rule 34 (storybook source = real code)", async () => {
    const out = await dispatchTool("get_rule", { number: 34 });
    expect(out).toContain("Storybook");
    expect(out).toContain("react-docgen");
  });

  it("returns full list when number omitted", async () => {
    const out = await dispatchTool("get_rule", {});
    expect(out).toContain(`Cardinal rules (${CARDINAL_RULES.length})`);
  });
});

describe("lint_jsx", () => {
  it("catches Tag color='error' v5.0 migration", async () => {
    const out = await dispatchTool("lint_jsx", {
      jsx: `<Tag color="error">失敗</Tag>`,
    });
    expect(out).toContain("destructive");
  });

  it("catches raw <button>", async () => {
    const out = await dispatchTool("lint_jsx", {
      jsx: `<button onClick={x}>Click</button>`,
    });
    expect(out).toContain("Button");
  });

  it("catches Inter font (anti-AI-tell)", async () => {
    const out = await dispatchTool("lint_jsx", {
      jsx: `<div style={{ fontFamily: "Inter, sans-serif" }}>x</div>`,
    });
    expect(out).toContain("Inter");
    expect(out).toContain("Geist");
  });

  it("catches Acme placeholder content", async () => {
    const out = await dispatchTool("lint_jsx", {
      jsx: `<Card title="Acme Corp" />`,
    });
    expect(out).toContain("placeholder");
  });

  it("returns ✅ for clean snippet", async () => {
    const out = await dispatchTool("lint_jsx", {
      jsx: `<Button variant="primary">保存</Button>`,
    });
    expect(out).toContain("✅");
  });
});

describe("get_anti_ai_tell", () => {
  it("returns full body + fix for a known tell", async () => {
    const tell = ANTI_AI_TELLS[0];
    const out = await dispatchTool("get_anti_ai_tell", { name: tell.name });
    expect(out).toContain(tell.name);
    expect(out).toContain("Symptom");
    expect(out).toContain("Fix");
  });
});

describe("get_redesign_check", () => {
  it("matches by symptom fragment", async () => {
    const out = await dispatchTool("get_redesign_check", { symptom: "Inter" });
    expect(out).toContain("Inter");
    expect(out).toContain("Fix");
  });
});

describe("list_primitives", () => {
  it("returns every component grouped", async () => {
    const out = await dispatchTool("list_primitives", {});
    expect(out).toContain(`${COMPONENTS.length} components`);
    expect(out).toContain("Button");
    expect(out).toContain("data-entry");
  });

  it("filters by group", async () => {
    const out = await dispatchTool("list_primitives", { group: "data-entry" });
    expect(out).toContain("Input");
    expect(out).toContain("Form");
    // No general-group items
    expect(out).not.toContain("general\n\n");
  });
});

describe("data integrity", () => {
  it("every skill has at least one section", () => {
    for (const s of SKILLS) {
      expect(s.sections.length).toBeGreaterThan(0);
      for (const sec of s.sections) {
        expect(sec.id).toBeTruthy();
        expect(sec.title).toBeTruthy();
        expect(sec.body).toBeTruthy();
      }
    }
  });

  it("findSection works for every declared section", () => {
    for (const s of SKILLS) {
      for (const sec of s.sections) {
        expect(findSection(s.id, sec.id)).toBeTruthy();
      }
    }
  });

  it("every component has props, example, group", () => {
    for (const c of COMPONENTS) {
      expect(c.name).toBeTruthy();
      expect(c.group).toBeTruthy();
      expect(c.example).toBeTruthy();
      expect(c.props.length).toBeGreaterThan(0);
    }
  });
});
