import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Steps } from "../steps";

const ITEMS = [{ title: "申込" }, { title: "審査" }, { title: "完了" }];

/** Ant Design 6.6.2 parity, read off `antd/es/steps/index.d.ts` (BaseStepsProps). */
describe("Steps — antd `percent`", () => {
  it("exposes the CURRENT step's completion as a real progressbar", () => {
    render(<Steps items={ITEMS} value={1} percent={40} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("draws exactly ONE arc, on the current step, never on the finished or waiting ones", () => {
    render(<Steps items={ITEMS} value={1} percent={40} />);
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(1);
    // The arc belongs to the second step — the one `aria-current="step"` marks.
    const currentStep = screen.getAllByRole("listitem")[1];
    expect(currentStep).toContainElement(bars[0]);
  });

  it("clamps out-of-range values instead of painting a broken arc (antd bounds 0–100)", () => {
    const { rerender } = render(<Steps items={ITEMS} value={0} percent={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<Steps items={ITEMS} value={0} percent={-20} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("feeds the paint a 0–1 ratio, so the arc reads the same token the marker does", () => {
    const { container } = render(<Steps items={ITEMS} value={1} percent={25} />);
    expect(
      container
        .querySelector<HTMLElement>(".ui-steps-progress")
        ?.style.getPropertyValue("--steps-progress-ratio"),
    ).toBe("0.25");
  });

  it("no `percent` means no progressbar at all — the arc is opt-in", () => {
    render(<Steps items={ITEMS} value={1} />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("is ignored by `inline`, which has no marker to draw into", () => {
    render(<Steps items={ITEMS} value={1} percent={40} type="inline" />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});

describe('Steps — antd `type="navigation"`', () => {
  it("marks the rail so the slab paint can select it", () => {
    const { container } = render(<Steps items={ITEMS} value={1} type="navigation" />);
    expect(container.querySelector(".ui-steps-list")).toHaveAttribute("data-type", "navigation");
  });

  it("draws a chevron between slabs and drops the default hairline connector", () => {
    const { container } = render(<Steps items={ITEMS} value={1} type="navigation" />);
    // One separator per join, never a trailing one.
    expect(container.querySelectorAll(".ui-steps-nav-separator")).toHaveLength(ITEMS.length - 1);
    // The rail's own connector would otherwise be painted straight through those glyphs.
    expect(container.querySelectorAll("[data-connector]")).toHaveLength(0);
  });

  it("the DEFAULT type keeps its connector and grows no chevrons", () => {
    const { container } = render(<Steps items={ITEMS} value={1} />);
    expect(container.querySelectorAll(".ui-steps-nav-separator")).toHaveLength(0);
    expect(container.querySelectorAll("[data-connector]")).toHaveLength(ITEMS.length - 1);
  });

  it("keeps the full title/status semantics of the default rail", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Steps items={ITEMS} value={1} type="navigation" onValueChange={onValueChange} />);

    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    await user.click(screen.getByText("完了"));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });
});
