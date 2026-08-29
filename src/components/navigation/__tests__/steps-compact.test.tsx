import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Steps } from "../steps";

describe("Steps — compact size", () => {
  it("uses text-xs for the title and description when size=sm", () => {
    render(<Steps items={[{ title: "申込", description: "書類提出" }]} size="sm" />);
    // compact → text-xs on both the title and the description (the `compact ?` branch)
    // Compact sizing moved from a `text-xs` utility to `data-compact` on the title/description,
    // so the step's type scale is a token a service can retune (#319).
    expect(screen.getByText("申込")).toHaveAttribute("data-compact");
    expect(screen.getByText("書類提出")).toHaveAttribute("data-compact");
  });

  it("renders the inline numbered authorization rail with status semantics", () => {
    const { container } = render(
      <Steps
        type="inline"
        value={1}
        items={[{ title: "コード入力" }, { title: "確認" }, { title: "完了" }]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(container.querySelector(".ui-steps-inline")).not.toBeNull();
    expect(items[0]).toHaveAttribute("data-status", "finish");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[1]).toHaveAttribute("data-status", "process");
    expect(items[1].querySelector(".sr-only")).not.toBeNull();
    expect(container.querySelectorAll(".ui-steps-inline-separator")).toHaveLength(2);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("picks the inline progression glyph through `separator`, defaulting to the chevron (gh#12)", () => {
    const items = [{ title: "コード入力" }, { title: "確認" }];

    // Default — the breadcrumb-flavoured chevron the row has always used.
    const { container: chevron } = render(<Steps type="inline" items={items} />);
    expect(chevron.querySelector(".ui-steps-inline-separator")).toHaveClass("lucide-chevron-right");

    // The canonical hosted-identity marker: an arrow reads "then", a chevron reads "drill into".
    const { container: arrow } = render(<Steps type="inline" separator="arrow" items={items} />);
    const glyph = arrow.querySelector(".ui-steps-inline-separator");
    expect(glyph).toHaveClass("lucide-arrow-right");
    // Both glyphs point along the reading direction, so both must flip under dir="rtl".
    expect(glyph).toHaveClass("rtl:rotate-180");
    // Decorative — the step's own status text carries the meaning.
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("preserves an explicit error state in the inline appearance", () => {
    const { container } = render(
      <Steps
        type="inline"
        value={1}
        status="error"
        items={[{ title: "入力" }, { title: "確認" }]}
      />,
    );
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("data-status", "error");
    expect(screen.getAllByRole("listitem")[1].querySelector(".sr-only")).not.toBeNull();
    expect(container.querySelector('[data-status="error"]')).not.toBeNull();
  });
});
