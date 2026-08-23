import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { ListRow } from "../list-row";
import { Timeline } from "../timeline";
import { TreeList } from "../tree-list";
import type { TreeListItem } from "../tree-list";

/** Structural selectors in data-display-layout.css against really rendered DOM. */
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/data-display-layout.css"),
  "utf8",
);

describe("data-display-layout.css structural selectors select the rendered DOM", () => {
  it("tree item chevron sizing hits the chevron, not the type glyph after it", () => {
    const selector = ruleSelector(css, ".ui-tree-item > svg:first-child");
    const items: TreeListItem[] = [{ id: "a", title: "勘定科目" }];
    const { container } = renderWithUi(<TreeList items={items} />);

    const item = container.querySelector(".ui-tree-item")!;
    const svgs = [...item.querySelectorAll(":scope > svg")];
    expect(svgs.length, "a tree item renders chevron + glyph as direct children").toBe(2);
    expect(svgs[0].matches(selector)).toBe(true);
    expect(svgs[1].matches(selector)).toBe(false);
  });

  it("the last timeline item drops its trailing body padding", () => {
    const selector = ruleSelector(css, ".ui-timeline-item:last-child .ui-timeline-body");
    const { container } = renderWithUi(
      <Timeline
        items={[
          { title: "受付", time: "10:00" },
          { title: "出荷", time: "11:00" },
        ]}
      />,
    );

    const bodies = [...container.querySelectorAll(".ui-timeline-body")];
    expect(bodies).toHaveLength(2);
    expect(bodies[0].matches(selector)).toBe(false);
    expect(bodies[1].matches(selector)).toBe(true);
  });

  it("list rows keep a divider on every row but the last", () => {
    const selector = ruleSelector(css, '[data-slot="list-row"]:not(:last-child)');
    const { container } = renderWithUi(
      <div>
        <ListRow title="one" />
        <ListRow title="two" />
      </div>,
    );

    const rowEls = [...container.querySelectorAll('[data-slot="list-row"]')];
    expect(rowEls).toHaveLength(2);
    expect(rowEls[0].matches(selector)).toBe(true);
    expect(rowEls[1].matches(selector)).toBe(false);
  });
});
