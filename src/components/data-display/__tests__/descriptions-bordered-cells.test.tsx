import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";

import { Descriptions } from "../descriptions";

// A bordered grid is one table: the gap utilities (utilities layer) would outrank the bordered `gap: 0`
// (components layer), leaving a column gap between cells and row rules that stop halfway across.
describe("Descriptions — bordered cells meet edge to edge", () => {
  const grid = (bordered: boolean, layout: "horizontal" | "vertical") =>
    render(
      <Descriptions bordered={bordered} layout={layout} columns={2}>
        <Descriptions.Item label="容器">缶</Descriptions.Item>
        <Descriptions.Item label="内容量">350ml</Descriptions.Item>
      </Descriptions>,
    ).container;

  it("emits no gap utility on a bordered grid or its items, and stretches the horizontal label cell", () => {
    const c = grid(true, "horizontal");
    expect(c.querySelector("dl")!.className).not.toMatch(/gap-/);
    const item = c.querySelector('[data-slot="descriptions-item"]')!;
    expect(item.className).not.toMatch(/gap-/);
    expect(item.className).toContain("items-stretch");
    expect(grid(true, "vertical").querySelector('[data-slot="descriptions-item"]')!.className).not.toMatch(/gap-/);
  });

  it("keeps the gaps and the shared baseline when not bordered", () => {
    const c = grid(false, "horizontal");
    expect(c.querySelector("dl")!.className).toContain("gap-x-[var(--descriptions-column-gap)]");
    expect(c.querySelector('[data-slot="descriptions-item"]')!.className).toContain("items-baseline");
  });

  it("draws the rule under each bordered item", () => {
    const css = readFileSync(resolve(__dirname, "../../../styles/data-display-layout.css"), "utf8");
    const rule = /\[data-slot="descriptions"\]\[data-bordered\] \[data-slot="descriptions-item"\] \{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toContain("box-shadow: 0 var(--descriptions-border-width");
  });
});
