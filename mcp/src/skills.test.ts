import { describe, it, expect } from "vitest";

import { dispatchTool } from "./tools/registry.js";
import { SKILLS, findSkill, isConsumerSkill } from "./data/skills-index.js";

/** Skill index + the consumer-namespace filtering (the core/consumer split). */

const AUDIENCES = ["core", "consumer", "both"];

describe("skill index integrity", () => {
  it("has uniquely-identified skills with valid audiences", () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SKILLS) {
      expect(AUDIENCES, `${s.id} audience`).toContain(s.audience);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.whenToUse.length).toBeGreaterThan(0);
      expect(s.sections.length).toBeGreaterThan(0);
    }
  });

  it("every section has a unique id and a non-empty body within its skill", () => {
    for (const s of SKILLS) {
      const secIds = s.sections.map((x) => x.id);
      expect(new Set(secIds).size, `${s.id} section ids`).toBe(secIds.length);
      for (const sec of s.sections) {
        expect(sec.title.length, `${s.id}/${sec.id} title`).toBeGreaterThan(0);
        expect(sec.tagline.length, `${s.id}/${sec.id} tagline`).toBeGreaterThan(0);
        expect(sec.body.trim().length, `${s.id}/${sec.id} body`).toBeGreaterThan(20);
      }
    }
  });

  it("ships both consumer build skills + the core hard-contract", () => {
    expect(findSkill("design-to-page")?.audience).toBe("consumer");
    expect(findSkill("compose-a-screen")?.audience).toBe("consumer");
    expect(findSkill("component-discipline")?.audience).toBe("core");
  });
});

describe("get_skill_section (full surface)", () => {
  // Drive EVERY (skill, section) pair — no sampling.
  const PAIRS = SKILLS.flatMap((s) => s.sections.map((sec) => [s.id, sec.id, sec.title] as const));

  it.each(PAIRS)("get_skill_section(%s, %s) returns '%s'", async (skill, section, title) => {
    const out = await dispatchTool("get_skill_section", { skill, section });
    expect(out).toContain(title);
  });

  it("no section id lists the available sections", async () => {
    const out = await dispatchTool("get_skill_section", { skill: SKILLS[0].id, section: "" });
    expect(out).toContain("Sections");
  });

  it("unknown skill / unknown section report (not throw)", async () => {
    expect(await dispatchTool("get_skill_section", { skill: "__nope__", section: "x" })).toMatch(
      /not found/i,
    );
    expect(
      await dispatchTool("get_skill_section", { skill: SKILLS[0].id, section: "__nope__" }),
    ).toMatch(/not in skill/i);
  });
});

describe("consumer namespace — core skills are hidden", () => {
  it("list_consumer_skills shows consumer/both and omits core", async () => {
    const out = await dispatchTool("list_consumer_skills", {});
    for (const s of SKILLS) {
      if (isConsumerSkill(s)) expect(out, `${s.id} should be listed`).toContain(s.id);
      else expect(out, `${s.id} (core) should be hidden`).not.toContain(`## ${s.id} `);
    }
    // The known core skill is hidden.
    expect(out).not.toContain("## component-discipline");
  });

  it("get_consumer_skill refuses a core-only skill", async () => {
    const out = await dispatchTool("get_consumer_skill", {
      skill: "component-discipline",
      section: "real-primitives",
    });
    expect(out).toMatch(/CORE-only/i);
    expect(out).not.toContain("## Props"); // didn't leak the body
  });

  it("get_consumer_skill serves a consumer skill normally", async () => {
    const out = await dispatchTool("get_consumer_skill", {
      skill: "design-to-page",
      section: "map-to-primitives",
    });
    expect(out).toContain("Map every block");
  });

  it("every consumer skill is fully reachable through get_consumer_skill", async () => {
    for (const s of SKILLS.filter(isConsumerSkill)) {
      for (const sec of s.sections) {
        const out = await dispatchTool("get_consumer_skill", { skill: s.id, section: sec.id });
        expect(out, `${s.id}/${sec.id}`).toContain(sec.title);
      }
    }
  });
});
