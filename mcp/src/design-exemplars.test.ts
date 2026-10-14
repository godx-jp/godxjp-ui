import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry.js";
import { DESIGN_MD, anatomySubsection, designSections } from "./data/design.js";
import { EXEMPLARS, exemplarPreviewUrl } from "./data/exemplars.js";
import { EXEMPLAR_SOURCES } from "./data/exemplars.generated.js";

const ROOT = join(import.meta.dirname, "../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("get_design (gh#1294 A)", () => {
  it("is a declared tool", () => {
    expect(TOOL_DEFINITIONS.map((t) => t.name)).toContain("get_design");
  });

  it("embeds DESIGN.md verbatim, and agent/DESIGN.md is the same file", () => {
    expect(DESIGN_MD).toBe(read("DESIGN.md"));
    expect(read("agent/DESIGN.md")).toBe(DESIGN_MD);
  });

  it("returns the whole document without a section", async () => {
    const out = await dispatchTool("get_design", {});
    expect(out).toContain("colors:");
    expect(out).toContain("## Overview");
    expect(out).toContain("## Known Gaps");
  });

  it("returns exactly one section when asked", async () => {
    const out = await dispatchTool("get_design", { section: "colors" });
    expect(out).toContain("## Colors");
    expect(out).not.toContain("## Typography");
    expect(out).not.toContain("## Overview");
  });

  it("resolves every section by its id", async () => {
    const sections = designSections();
    expect(sections.length).toBeGreaterThan(8);
    for (const s of sections) {
      const out = await dispatchTool("get_design", { section: s.id });
      expect(out, s.id).toContain(s.body);
    }
  });

  it("lists the section ids on an unknown section instead of dumping the document", async () => {
    const out = await dispatchTool("get_design", { section: "no-such-section" });
    expect(out).toMatch(/not found/i);
    expect(out).toContain("admin-screen-anatomy");
    expect(out).not.toContain("## Overview");
  });
});

describe("get_exemplar (gh#1294 F)", () => {
  it("is a declared tool", () => {
    expect(TOOL_DEFINITIONS.map((t) => t.name)).toContain("get_exemplar");
  });

  it("maps every archetype to a registered showcase whose embedded source matches disk", () => {
    const catalog = read("preview/src/showcase-catalog.ts");
    for (const e of EXEMPLARS) {
      expect(catalog, e.showcase).toContain(`id: "${e.showcase}"`);
      const file = `docs/showcase/${e.showcase}.tsx`;
      expect(existsSync(join(ROOT, file)), file).toBe(true);
      expect(EXEMPLAR_SOURCES[e.showcase], file).toBe(read(file));
    }
  });

  it("every anatomy heading exists in DESIGN.md", () => {
    for (const e of EXEMPLARS)
      for (const h of e.anatomy) expect(anatomySubsection(h), `${e.archetype} → ${h}`).toBeTruthy();
  });

  it("returns archetype, anatomy notes, source and the live preview URL", async () => {
    for (const e of EXEMPLARS) {
      const out = await dispatchTool("get_exemplar", { archetype: e.archetype });
      expect(out).toContain(e.archetype);
      expect(out).toContain(exemplarPreviewUrl(e.showcase));
      expect(out).toContain(anatomySubsection(e.anatomy[0])!);
      expect(out).toContain(EXEMPLAR_SOURCES[e.showcase]);
    }
  });

  it("resolves an alias", async () => {
    const out = await dispatchTool("get_exemplar", { archetype: "queue" });
    expect(out).toContain("table-approval-queue");
  });

  it("maps a form to the editor exemplar, not to settings (gh#1296)", async () => {
    for (const archetype of ["form", "editor", "edit"]) {
      const out = await dispatchTool("get_exemplar", { archetype });
      expect(out, archetype).toContain("docs/showcase/page-editor.tsx");
      expect(out, archetype).not.toContain("settings-account-sections");
      expect(out, archetype).toContain(anatomySubsection("Editor")!);
    }
  });

  it("has a reader exemplar for a long-form document page (gh#1296)", async () => {
    for (const archetype of ["reader", "document", "wiki"]) {
      const out = await dispatchTool("get_exemplar", { archetype });
      expect(out, archetype).toContain("docs/showcase/page-reader.tsx");
      expect(out, archetype).toContain(anatomySubsection("Reader")!);
    }
  });

  it("lists the archetypes when none or an unknown one is given", async () => {
    for (const args of [{}, { archetype: "spaceship" }]) {
      const out = await dispatchTool("get_exemplar", args);
      for (const e of EXEMPLARS) expect(out).toContain(e.archetype);
      expect(out).not.toContain("export default");
    }
  });

  it("points at the Pages project site preview-pages.yml deploys", () => {
    expect(read(".github/workflows/preview-pages.yml")).toContain("PREVIEW_BASE: /godxjp-ui/");
    expect(exemplarPreviewUrl("x")).toBe("https://godx-jp.github.io/godxjp-ui/showcase/x");
  });
});
