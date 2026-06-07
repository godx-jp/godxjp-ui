import { describe, it, expect } from "vitest";

import { dispatchTool } from "./tools/registry.js";
import { routeTask } from "./data/skills-index.js";

/**
 * route_task / route_consumer_task — assert every keyword branch resolves and
 * the consumer router never points at a core skill. Backtick-wrapping in the
 * output disambiguates substrings (`taste` ≠ `gpt-tasteskill`).
 */

const BRANCHES: Array<[string, string]> = [
  ["a premium awwwards agency hero", "soft"],
  ["a marketing landing page hero", "imagegen-web"],
  ["a mobile app onboarding flow", "imagegen-mobile"],
  ["a notion-like workspace document editor", "minimalist"],
  ["a data heavy dashboard with an ops table", "brutalist"],
  ["a brand identity logo guidelines board", "brandkit"],
  ["redesign and audit an existing page", "redesign"],
  ["a sign up form with validation", "taste"],
  ["loading and saving skeleton spinner states", "taste"],
  ["make it responsive mobile first with breakpoints", "taste"],
  ["ship complete code with no placeholder", "output"],
  ["gsap scrolltrigger scroll choreography pinning", "gpt-tasteskill"],
  ["from image to code, design first", "image-to-code"],
  ["implement the design handoff bundle mockup prototype", "design-to-page"],
  ["compose a screen, a new page from a brief", "compose-a-screen"],
  ["report a bug, file a gh issue, the library is broken", "compose-a-screen"],
];

describe("route_task — keyword branches", () => {
  it.each(BRANCHES)("'%s' routes to %s", async (task, skill) => {
    const out = await dispatchTool("route_task", { task });
    expect(out).toContain(`\`${skill}\``);
  });

  it("an unmatched task falls back to the taste baseline", async () => {
    const out = await dispatchTool("route_task", { task: "zzz qqq nonsense xyzzy" });
    expect(out).toContain("`taste`");
    expect(out).toMatch(/No keyword match/i);
  });

  it("an empty task asks for a description", async () => {
    expect(await dispatchTool("route_task", { task: "" })).toMatch(/Describe the task/i);
  });
});

describe("route_consumer_task — never points at core", () => {
  it("routes consumer build tasks to consumer skills", async () => {
    const out = await dispatchTool("route_consumer_task", {
      task: "implement the design handoff bundle",
    });
    expect(out).toContain("`design-to-page`");
    expect(out).toContain("(consumer)");
  });

  it("falls back to compose-a-screen (a consumer default), never taste-only core", async () => {
    const out = await dispatchTool("route_consumer_task", { task: "zzz qqq nonsense" });
    expect(out).toContain("`compose-a-screen`");
  });

  it("no consumer routing ever surfaces the core component-discipline skill", () => {
    for (const [task] of BRANCHES) {
      const results = routeTask(task, { consumerOnly: true });
      for (const r of results) {
        expect(r.skill, `task='${task}'`).not.toBe("component-discipline");
      }
    }
  });
});
