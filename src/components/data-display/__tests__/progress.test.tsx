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

  it("defaults the tone to success and honours an explicit warning tone", () => {
    const { rerender } = render(<Progress value={50} />);
    expect(bar()).toHaveAttribute("data-tone", "success");
    rerender(<Progress value={50} tone="warning" />);
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
