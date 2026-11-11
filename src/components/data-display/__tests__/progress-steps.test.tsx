import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Progress } from "../progress";

const steps = (c: HTMLElement) =>
  [...c.querySelectorAll<HTMLElement>(".ui-progress-step")].map((s) => s.dataset.state);

describe("Progress steps (antd)", () => {
  it("draws N segments with round(N × value / 100) filled, still one progressbar", () => {
    const { container } = renderWithUi(<Progress steps={3} value={33} label="3件中1件完了" />);
    expect(steps(container)).toEqual(["filled", "empty", "empty"]);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "33");
    expect(bar).toHaveAttribute("data-steps", "3");
    expect(container.querySelector(".ui-progress-bar")).toBeNull();
  });

  it("rounds like antd and clamps", () => {
    const { container, rerender } = renderWithUi(<Progress steps={5} value={50} />);
    expect(steps(container).filter((s) => s === "filled")).toHaveLength(3);
    rerender(<Progress steps={4} value={140} />);
    expect(steps(container)).toEqual(["filled", "filled", "filled", "filled"]);
    rerender(<Progress steps={4} value={0} />);
    expect(steps(container).every((s) => s === "empty")).toBe(true);
  });

  it("is ignored by the ring, and inert without steps", () => {
    const { container, rerender } = renderWithUi(<Progress shape="ring" steps={3} value={50} />);
    expect(container.querySelector(".ui-progress-step")).toBeNull();
    rerender(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("data-steps");
    expect(container.querySelector(".ui-progress-bar")).not.toBeNull();
  });
});
