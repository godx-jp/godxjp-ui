import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Steps } from "../steps";

describe("Steps — compact size", () => {
  it("uses text-xs for the title and description when size=sm", () => {
    render(<Steps items={[{ title: "申込", description: "書類提出" }]} size="sm" />);
    // compact → text-xs on both the title and the description (the `compact ?` branch)
    expect(screen.getByText("申込").className).toContain("text-xs");
    expect(screen.getByText("書類提出").className).toContain("text-xs");
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
