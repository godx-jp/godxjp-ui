import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SKILLS, findSection, isConsumerSkill, routeTask } from "./data/skills-index.js";
import { dispatchTool } from "./tools/registry.js";

/*
 * gh#1527 — the three skills shipped at the repo root (`skills/<id>/SKILL.md`, in the npm tarball)
 * were reachable only through `gx skills`. A consumer copied one into its own repo, the copy
 * drifted, and the drift shipped. The MCP now serves the same files, so a consumer keeps no copy.
 */
const SHIPPED = ["godxjp-ui-brand-surface", "godxjp-ui-design"];
const ROOT = join(__dirname, "..", "..");

describe("shipped skills are consumer skills (gh#1527)", () => {
  it("list_consumer_skills names both, on top of the 17 hand-written ones", async () => {
    const out = await dispatchTool("list_consumer_skills", {});
    for (const id of SHIPPED) expect(out, id).toContain(`## ${id} —`);
    expect(SKILLS.filter(isConsumerSkill)).toHaveLength(19);
  });

  it("get_consumer_skill serves the SKILL.md text itself, section by section", async () => {
    const overview = await dispatchTool("get_consumer_skill", { skill: "godxjp-ui-design" });
    expect(overview).toContain("references-forms");
    expect(overview).toContain("references-navigation-principles");

    const refs = await dispatchTool("get_consumer_skill", {
      skill: "godxjp-ui-design",
      section: "references-navigation-principles",
    });
    const principles = readFileSync(
      join(ROOT, "skills/godxjp-ui-design/references/navigation-principles.md"),
      "utf8",
    );
    expect(refs).toContain(principles.trim().split("\n").slice(-1)[0]);
  });

  it("every section of every shipped skill is a verbatim slice of its SKILL.md", () => {
    for (const id of SHIPPED) {
      const file = readFileSync(join(ROOT, "skills", id, "SKILL.md"), "utf8");
      const skill = SKILLS.find((s) => s.id === id)!;
      expect(skill.whenToUse.length, id).toBeGreaterThan(20);
      for (const section of skill.sections.filter((s) => !s.id.startsWith("references-"))) {
        expect(file, `${id}/${section.id}`).toContain(section.body);
      }
    }
  });

  it.each([
    ["reorganise the sidebar menu and breadcrumbs", "godxjp-ui-design", "references-navigation"],
    ["change a role's landing page in the menu", "godxjp-ui-design", "references-navigation"],
    ["a create form for a customer", "godxjp-ui-design", "references-forms"],
    ["design review of the topbar and status chips", "godxjp-ui-design", "overview"],
    ["an admin console with tenants", "godxjp-ui-design", "references-complex-admin"],
    ["make the login screen more expressive", "godxjp-ui-brand-surface", "when-it-applies"],
    ["art direction for the onboarding", "godxjp-ui-brand-surface", "when-it-applies"],
  ])("route_consumer_task '%s' reaches %s/%s", (task, skill, section) => {
    const hits = routeTask(task, { consumerOnly: true });
    const hit = hits.find((r) => r.skill === skill && r.section === section);
    expect(hit, task).toBeDefined();
    expect(findSection(hit!.skill, hit!.section), task).toBeDefined();
    for (const ref of hit!.alsoSee ?? []) {
      const [s, sec] = ref.split("/");
      expect(findSection(s, sec), ref).toBeDefined();
    }
  });

  it.each([
    ["godxjp-ui-form", "references-forms", "Form rules"],
    ["godxjp-ui-navigation", "references-navigation", "where does the first click go"],
    ["design-complex-admin", "references-complex-admin", "Lock the ENTITY MODEL"],
  ])("the merged id %s still answers, from godxjp-ui-design/%s", async (old, section, text) => {
    const out = await dispatchTool("get_consumer_skill", { skill: old });
    expect(out).toContain(`merged into "godxjp-ui-design" (section \`${section}\`)`);
    expect(out).toContain(text);
  });
});
