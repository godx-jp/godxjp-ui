import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Entry = { export: string; owner: string; frameFile: string; frameId: string };
const coveredOwners = new Set([
  "charts/line-chart",
  "charts/bar-chart",
  "charts/area-chart",
  "charts/pie-chart",
  "data-display/badge",
  "data-display/list-row",
  "data-display/avatar",
  "data-display/card",
  "data-display/table",
  "data-display/descriptions",
  "data-display/data-table",
  "data-display/empty-state",
  "data-display/progress",
  "data-display/tree-list",
  "data-display/timeline",
  "data-display/popover",
  "data-display/scroll-area",
  "data-display/collapsible",
  "data-display/accordion",
  "data-display/hover-card",
  "data-display/carousel",
  "general/button",
  "general/typography",
  "general/logo",
]);

describe("display public export frame contract", () => {
  it("directly renders every mapped public export/subpart in its owner frame", () => {
    const report = JSON.parse(
      execFileSync(process.execPath, ["scripts/check-frame-coverage.mjs"], { encoding: "utf8" }),
    ) as { entries: Entry[] };
    const entries = report.entries.filter(({ owner }) => coveredOwners.has(owner));
    expect(entries.length).toBeGreaterThan(50);
    for (const entry of entries) {
      const source = readFileSync(join(process.cwd(), entry.frameFile), "utf8");
      expect(source, `${entry.export} missing from ${entry.frameFile}`).toMatch(
        new RegExp(`<${entry.export}(?:<|\\s|>)`),
      );
    }
  });
});
