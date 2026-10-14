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
  ["a mobile app landing page hero", "imagegen-mobile"],
  ["a notion-like workspace document editor", "compose-a-screen"],
  ["a data heavy dashboard with an ops table", "compose-a-screen"],
  ["a brand identity logo guidelines board", "brandkit"],
  ["redesign and audit an existing page", "redesign"],
  ["a sign up form with validation", "taste"],
  ["loading and saving skeleton spinner states", "taste"],
  ["make it responsive mobile first with breakpoints", "taste"],
  ["ship complete code with no placeholder", "output"],
  ["gsap scrolltrigger scroll choreography for the marketing site", "gpt-tasteskill"],
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

describe("route_consumer_task — performance tasks reach app-performance", () => {
  it.each([
    "the screen is slow",
    "[Violation] 'click' handler took 240ms",
    "typing lags, too many re-renders",
    "bundle size is huge",
  ])("routes %s to app-performance/measure-first", async (task) => {
    const out = await dispatchTool("route_consumer_task", { task });
    expect(out).toContain("`app-performance`");
    expect(out).toContain("measure-first");
  });

  it("app-performance sections all resolve through get_consumer_skill", async () => {
    const overview = await dispatchTool("get_consumer_skill", { skill: "app-performance" });
    for (const section of ["measure-first", "filter-pane-memo", "heavy-panels", "bundle-budget"]) {
      expect(overview).toContain(section);
    }
    const body = await dispatchTool("get_consumer_skill", {
      skill: "app-performance",
      section: "filter-pane-memo",
    });
    expect(body).toContain("165ms");
  });
});

/**
 * gh#1294 — app screens go to compose-a-screen; the marketing-taste skills (soft, minimalist,
 * brutalist, gpt-tasteskill, imagegen-*) only when the task says landing / marketing / LP / hero.
 * Keywords match whole words, so "documents" does not hit a "document" or "doc" substring branch
 * and "context" does not hit "text".
 */
const MARKETING_SKILLS = [
  "soft",
  "minimalist",
  "brutalist",
  "gpt-tasteskill",
  "imagegen-web",
  "imagegen-mobile",
];

const APP_SCREENS: string[] = [
  "documents list page",
  "a dashboard for the ops team",
  "an analytics dashboard with charts",
  "a users table with filters",
  "an admin list of invoices",
  "the settings screen",
  "a workspace members page",
  "a knowledge base document viewer",
  "an edit form for a customer",
  "a premium-feeling settings page",
  "a linear-style issue list",
  "build a mobile app screen for approvals",
  "add gsap animation to the dashboard",
];

describe("route_consumer_task — app screens never reach marketing taste (gh#1294)", () => {
  it.each(APP_SCREENS)("'%s' → compose-a-screen, no marketing skill", (task) => {
    const hits = routeTask(task, { consumerOnly: true }).map((r) => r.skill);
    expect(hits, task).toContain("compose-a-screen");
    for (const skill of MARKETING_SKILLS) expect(hits, task).not.toContain(skill);
  });

  it("a page task gets compose-a-screen first and the contract right after it (gh#1296)", () => {
    const hits = routeTask("documents list page", { consumerOnly: true }).map((r) => r.skill);
    expect(hits.slice(0, 2)).toEqual(["compose-a-screen", "contract"]);
  });

  it("compose-a-screen comes before design-complex-admin for an admin console", () => {
    const hits = routeTask("an admin console", { consumerOnly: true }).map((r) => r.skill);
    expect(hits.indexOf("compose-a-screen")).toBeGreaterThanOrEqual(0);
    expect(hits.indexOf("compose-a-screen")).toBeLessThan(hits.indexOf("design-complex-admin"));
  });

  it("the app-screen route points at the design DNA", () => {
    const hit = routeTask("a dashboard", { consumerOnly: true }).find(
      (r) => r.skill === "compose-a-screen",
    );
    expect(hit?.alsoSee).toContain("design-to-page/dna");
  });

  it.each([
    ["a marketing landing page", "imagegen-web"],
    ["an LP for the spring campaign", "imagegen-web"],
    ["a hero section for the product site", "imagegen-web"],
  ])("'%s' still reaches marketing taste", (task, skill) => {
    expect(routeTask(task, { consumerOnly: true }).map((r) => r.skill)).toContain(skill);
  });

  it("a page task does not match the 'text' keyword inside 'context'", () => {
    const hits = routeTask("zzz context qqq").map((r) => r.skill);
    expect(hits).not.toContain("contract");
  });

  it("returns each skill/section at most once", () => {
    const hits = routeTask("a new page with a list and a form", { consumerOnly: true });
    const keys = hits.map((r) => `${r.skill}/${r.section}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

/**
 * gh#1296 — the synced CLAUDE.md says the loop routes to compose-a-screen, and an agent follows the
 * FIRST hit. A screen-building task (build / redesign / make a page, a list, an edit screen) must
 * get compose-a-screen first; the contract still follows it, and stays first when the task is
 * about the contract itself (spacing, a token, a colour, an audit finding).
 */
const FIRST_HIT: Array<[string, string]> = [
  ["redesign the page edit, view and reader screens", "compose-a-screen"],
  ["build the documents list page", "compose-a-screen"],
  ["make an edit page for a customer", "compose-a-screen"],
  ["how do i build a page", "compose-a-screen"],
  ["dựng form đăng nhập", "compose-a-screen"],
  ["a settings screen", "compose-a-screen"],
  ["gap 20px", "contract"],
  ["khoảng cách giữa hai thẻ", "contract"],
  ["màu chữ phụ", "contract"],
  ["fix the spacing on the settings page", "contract"],
  ["which token for the page background colour", "contract"],
  ["redesign and audit an existing page", "contract"],
];

describe("route_consumer_task — first hit (gh#1296)", () => {
  it.each(FIRST_HIT)("'%s' → %s first", (task, skill) => {
    const hits = routeTask(task, { consumerOnly: true }).map((r) => r.skill);
    expect(hits[0], task).toBe(skill);
    expect(hits, task).toContain("contract");
  });

  it("the rendered tool output lists compose-a-screen before the contract", async () => {
    const out = await dispatchTool("route_consumer_task", {
      task: "redesign the page edit screen",
    });
    expect(out.indexOf("`compose-a-screen`")).toBeGreaterThan(-1);
    expect(out.indexOf("`compose-a-screen`")).toBeLessThan(out.indexOf("`contract`"));
  });
});
