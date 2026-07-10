import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Progress } from "../progress";

const bar = () => screen.getByRole("progressbar");

describe("Progress", () => {
  it("reports the value via aria and sets the bar width", () => {
    const { container } = render(<Progress value={40} />);
    expect(bar()).toHaveAttribute("aria-valuenow", "40");
    expect(bar()).toHaveAttribute("aria-valuetext", "40%");
    expect(container.querySelector(".ui-progress-bar")).toHaveStyle({ width: "40%" });
  });

  it("clamps values above 100 and below 0", () => {
    const { rerender } = render(<Progress value={150} />);
    expect(bar()).toHaveAttribute("aria-valuenow", "100");
    expect(bar()).toHaveAttribute("aria-valuetext", "100%");
    rerender(<Progress value={-25} />);
    expect(bar()).toHaveAttribute("aria-valuenow", "0");
  });

  it("defaults the tone to success and honours an explicit warning/destructive tone", () => {
    const { rerender } = render(<Progress value={50} />);
    expect(bar()).toHaveAttribute("data-tone", "success");
    rerender(<Progress value={50} tone="warning" />);
    expect(bar()).toHaveAttribute("data-tone", "warning");
    rerender(<Progress value={50} tone="destructive" />);
    expect(bar()).toHaveAttribute("data-tone", "destructive");
  });

  // Over-capacity (issue #108): an over-limit meter (e.g. 252%) must read differently from a full
  // one. `over` opts value out of the 100 clamp — the bar width still caps at 100% (aria-valuenow),
  // but data-over marks the hatch, the tone auto-goes destructive, and aria-valuetext shows the
  // real ratio so 252% ≠ 100%.
  it("renders an over-capacity fill when over is set and value exceeds 100", () => {
    const { container } = render(<Progress value={252} over />);
    expect(bar()).toHaveAttribute("data-over", "");
    expect(bar()).toHaveAttribute("data-tone", "destructive");
    expect(bar()).toHaveAttribute("aria-valuenow", "100");
    expect(bar()).toHaveAttribute("aria-valuetext", "252%");
    expect(container.querySelector(".ui-progress-bar")).toHaveStyle({ width: "100%" });
  });

  it("still clamps and skips the over state without the over prop, and lets tone override in over mode", () => {
    const { rerender } = render(<Progress value={252} />);
    expect(bar()).not.toHaveAttribute("data-over");
    expect(bar()).toHaveAttribute("aria-valuetext", "100%");
    expect(bar()).toHaveAttribute("data-tone", "success");
    // An explicit tone wins even when over.
    rerender(<Progress value={110} over tone="warning" />);
    expect(bar()).toHaveAttribute("data-over", "");
    expect(bar()).toHaveAttribute("data-tone", "warning");
  });

  it("wires aria-labelledby + a visible label when label is provided", () => {
    render(<Progress value={60} label="アップロード" />);
    expect(screen.getByText("アップロード")).toBeInTheDocument();
    expect(bar()).toHaveAttribute("aria-labelledby");
    expect(bar()).not.toHaveAttribute("aria-label");
  });

  it("falls back to aria-label and no label node when label is omitted", () => {
    const { container } = render(<Progress value={60} />);
    expect(bar()).toHaveAttribute("aria-label", "Progress");
    expect(bar()).not.toHaveAttribute("aria-labelledby");
    expect(container.querySelector(".ui-progress-label")).toBeNull();
  });
});
