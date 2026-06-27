import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Topbar } from "../topbar";

describe("Topbar — slot bar", () => {
  it("renders the start / center / end clusters the consumer passes", () => {
    const { container } = render(
      <Topbar
        start={<span data-testid="brand">godx</span>}
        center={<span data-testid="search">検索</span>}
        end={<span data-testid="user">田中</span>}
      />,
    );
    expect(container.querySelector('[data-slot="topbar"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="topbar-start"]')).toContainElement(
      screen.getByTestId("brand"),
    );
    expect(container.querySelector('[data-slot="topbar-center"]')).toContainElement(
      screen.getByTestId("search"),
    );
    expect(container.querySelector('[data-slot="topbar-end"]')).toContainElement(
      screen.getByTestId("user"),
    );
  });

  it("omits a slot wrapper when that slot is empty (no baked chrome)", () => {
    const { container } = render(<Topbar start={<span>godx</span>} />);
    expect(container.querySelector('[data-slot="topbar-start"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="topbar-center"]')).toBeNull();
    expect(container.querySelector('[data-slot="topbar-end"]')).toBeNull();
  });

  it("renders fully custom children instead of the slots when provided", () => {
    const { container } = render(
      <Topbar start={<span>ignored</span>}>
        <div data-testid="custom">custom bar</div>
      </Topbar>,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="topbar-start"]')).toBeNull();
  });

  it("forwards className and arbitrary props onto the bar", () => {
    const { container } = render(<Topbar className="custom-bar" aria-label="メイン" />);
    const bar = container.querySelector('[data-slot="topbar"]');
    expect(bar).toHaveClass("ui-topbar", "custom-bar");
    expect(bar).toHaveAttribute("aria-label", "メイン");
  });
});
