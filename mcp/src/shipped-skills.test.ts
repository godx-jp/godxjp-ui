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
const SHIPPED = ["godxjp-ui-design", "godxjp-ui-form", "godxjp-ui-navigation"];
const ROOT = join(__dirname, "..", "..");

describe("shipped skills are consumer skills (gh#1527)", () => {
  it("list_consumer_skills names all three, on top of the 18 hand-written ones", async () => {
    const out = await dispatchTool("list_consumer_skills", {});
    for (const id of SHIPPED) expect(out, id).toContain(`## ${id} —`);
    expect(SKILLS.filter(isConsumerSkill)).toHaveLength(21);
  });

  it("get_consumer_skill serves the SKILL.md text itself, section by section", async () => {
    const overview = await dispatchTool("get_consumer_skill", { skill: "godxjp-ui-navigation" });
    expect(overview).toContain("hard-rules");
    expect(overview).toContain("references-principles");

    const body = await dispatchTool("get_consumer_skill", {
      skill: "godxjp-ui-navigation",
      section: "overview",
    });
    expect(body).toContain("where does the first click go");

    const refs = await dispatchTool("get_consumer_skill", {
      skill: "godxjp-ui-navigation",
      section: "references-principles",
    });
    const principles = readFileSync(
      join(ROOT, "skills/godxjp-ui-navigation/references/principles.md"),
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
    ["reorganise the sidebar menu and breadcrumbs", "godxjp-ui-navigation"],
    ["change a role's landing page in the menu", "godxjp-ui-navigation"],
    ["a create form for a customer", "godxjp-ui-form"],
    ["design review of the topbar and status chips", "godxjp-ui-design"],
  ])("route_consumer_task '%s' reaches %s", (task, skill) => {
    const hits = routeTask(task, { consumerOnly: true });
    const hit = hits.find((r) => r.skill === skill);
    expect(hit, task).toBeDefined();
    expect(findSection(hit!.skill, hit!.section), task).toBeDefined();
    for (const ref of hit!.alsoSee ?? []) {
      const [s, sec] = ref.split("/");
      expect(findSection(s, sec), ref).toBeDefined();
    }
  });
});
