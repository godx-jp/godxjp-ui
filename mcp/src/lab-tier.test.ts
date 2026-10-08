import { describe, expect, it } from "vitest";

import { COMPONENTS } from "./data/components.js";
import { dispatchTool } from "./tools/registry.js";

/**
 * v32 #1223, decision B3 — the `@godxjp/ui/lab` contract as the MCP serves it: lab entries are
 * kept and answerable, but they are NOT in the default agent context.
 */
const LAB = COMPONENTS.filter((c) => c.tier === "lab");
const CORE = COMPONENTS.filter((c) => c.tier !== "lab");

describe("the lab tier (#1223)", () => {
  it("is exactly the fifteen B1 components, each importing from @godxjp/ui/lab", () => {
    expect(LAB.map((c) => c.name).sort()).toEqual(
      [
        "Anchor",
        "Carousel",
        "DraggablePanel",
        "EmojiPicker",
        "FloatButton",
        "LegalDocumentShell",
        "Marquee",
        "Masonry",
        "MegaMenu",
        "OrgChart",
        "PageCover",
        "RangeTimeline",
        "SortableList",
        "TextDiff",
        "TimelineGrid",
      ].sort(),
    );
    for (const c of LAB) expect(c.importPath, c.name).toBe("@godxjp/ui/lab");
  });

  it("list_primitives leaves lab out by default and says how many it left out", async () => {
    const out = await dispatchTool("list_primitives", {});
    for (const c of LAB) expect(out).not.toContain(`**${c.name}**`);
    for (const c of CORE.slice(0, 20)) expect(out).toContain(`**${c.name}**`);
    expect(out).toContain(`${LAB.length} opt-in`);
  });

  it('list_primitives tier="lab" lists only lab; tier="all" lists both', async () => {
    const lab = await dispatchTool("list_primitives", { tier: "lab" });
    for (const c of LAB) expect(lab).toContain(`**${c.name}**`);
    expect(lab).not.toContain(`**${CORE[0]!.name}**`);
    const all = await dispatchTool("list_primitives", { tier: "all" });
    expect(all).toContain(`${COMPONENTS.length} components`);
  });

  it("search_components hides lab by default but points at it instead of answering 'no match'", async () => {
    const out = await dispatchTool("search_components", { query: "carousel" });
    expect(out).not.toMatch(/^- \*\*Carousel\*\*/m);
    expect(out).toContain("**Carousel**");
    expect(out).toContain('tier="lab"');
    const lab = await dispatchTool("search_components", { query: "carousel", tier: "lab" });
    expect(lab).toMatch(/^- \*\*Carousel\*\*/m);
  });

  it("get_component still answers a lab entry by name, flagged as lab", async () => {
    const out = await dispatchTool("get_component", { name: "Marquee" });
    expect(out).toContain("# Marquee");
    expect(out).toContain("LAB tier");
    expect(out).toContain('from "@godxjp/ui/lab"');
  });
});
