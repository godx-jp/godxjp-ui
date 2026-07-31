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

  it("keeps intrinsic-width content inside its own clipping slot (gh#226)", () => {
    // The shrink contract lives in CSS (`.ui-topbar-start/center/end` clip their own overflow, and
    // `end` never shrinks) — see src/styles/__tests__/shell-responsive-geometry.test.ts. What the
    // component owes it is a real wrapper per cluster: rendering `start` bare, or merging two
    // clusters into one node, would remove the boundary the clip is applied to and let a long
    // tenant name push the user menu out of the viewport again.
    const { container } = render(
      <Topbar
        start={<span data-testid="tenant">株式会社ゴッドエックス 東京本社 管理コンソール</span>}
        center={<span data-testid="search">検索</span>}
        end={<span data-testid="user">田中</span>}
      />,
    );

    const slots = {
      start: container.querySelector('[data-slot="topbar-start"]'),
      center: container.querySelector('[data-slot="topbar-center"]'),
      end: container.querySelector('[data-slot="topbar-end"]'),
    };
    expect(slots.start).toHaveClass("ui-topbar-start");
    expect(slots.center).toHaveClass("ui-topbar-center");
    expect(slots.end).toHaveClass("ui-topbar-end");

    // Each cluster is a direct child of the bar — the flex line the shrink contract is written
    // against — and no cluster wraps another.
    const bar = container.querySelector('[data-slot="topbar"]');
    for (const slot of Object.values(slots)) {
      expect(slot?.parentElement).toBe(bar);
    }
    expect(slots.start).not.toContainElement(screen.getByTestId("user"));
    expect(slots.end).toContainElement(screen.getByTestId("user"));
  });

  it("forwards className and arbitrary props onto the bar", () => {
    const { container } = render(<Topbar className="custom-bar" aria-label="メイン" />);
    const bar = container.querySelector('[data-slot="topbar"]');
    expect(bar).toHaveClass("ui-topbar", "custom-bar");
    expect(bar).toHaveAttribute("aria-label", "メイン");
  });
});
