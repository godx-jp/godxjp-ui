/**
 * gh#414 — Descriptions gains the two knobs that were keeping a hand-rolled ruled row alive at the
 * call site (`<Flex className="min-h-10 border-b border-border">`). Both default QUIET, so an
 * existing property grid renders exactly as before.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Descriptions } from "../descriptions";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");
const tokens = read("../../../tokens/components/descriptions.css");
const layout = read("../../../styles/data-display-layout.css");

describe("Descriptions row chrome (gh#414)", () => {
  it("ships both knobs OFF, the same shape PageContainer's dividers already have", () => {
    expect(tokens).toMatch(/--descriptions-row-border:\s*none;/);
    expect(tokens).toMatch(/--descriptions-row-min-height:\s*auto;/);
  });

  it("reads the knobs on the item row, on logical properties", () => {
    const start = layout.indexOf(
      '[data-slot="descriptions"]:not([data-bordered]) [data-slot="descriptions-item"]',
    );
    expect(start).toBeGreaterThan(-1);
    const rule = layout.slice(start, layout.indexOf("}", start));
    expect(rule).toContain("border-block-end: var(--descriptions-row-border);");
    expect(rule).toContain("min-block-size: var(--descriptions-row-min-height);");
    // Physical `border-bottom` / `min-height` would not flip, and this grid ships RTL.
    expect(rule).not.toMatch(/\bborder-bottom:|\bmin-height:/);
  });

  it("does not double the rule on a bordered grid, which already rules every cell edge", () => {
    // The opt-in rule is scoped away from `bordered`; the bordered grid keeps its own frame.
    expect(layout).toContain(
      '[data-slot="descriptions"]:not([data-bordered]) [data-slot="descriptions-item"]',
    );
    expect(layout).toMatch(
      /\[data-slot="descriptions"\]\[data-bordered\] \[data-slot="descriptions-item"\] \{/,
    );
  });

  it("keeps the item markup untouched — the chrome is entirely token-driven", () => {
    const { container } = renderWithUi(
      <Descriptions layout="horizontal">
        <Descriptions.Item label="ステータス">進行中</Descriptions.Item>
      </Descriptions>,
    );
    const item = container.querySelector('[data-slot="descriptions-item"]');
    expect(item).toHaveAttribute("data-layout", "horizontal");
    // No inline style and no extra class: turning the rule on is a theme declaration, not a prop.
    expect(item?.getAttribute("style")).toBeNull();
  });
});
