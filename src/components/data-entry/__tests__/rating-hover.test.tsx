import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Rating } from "../rating";

const filledCount = (c: HTMLElement) => c.querySelectorAll(".ui-rating-star-filled").length;

describe("Rating — hover preview", () => {
  it("previews the fill up to the hovered star and reverts on leave", () => {
    const { container } = render(<Rating max={5} aria-label="rate" />);
    const stars = screen.getAllByRole("radio");
    expect(filledCount(container)).toBe(0);

    fireEvent.mouseEnter(stars[3]); // 4th star
    expect(filledCount(container)).toBe(4);

    fireEvent.mouseLeave(stars[3]);
    expect(filledCount(container)).toBe(0); // back to the committed value (none)
  });

  it("does not preview when read-only (non-interactive)", () => {
    const { container } = render(<Rating max={5} value={2} readOnly aria-label="rate" />);
    const stars = screen.getAllByRole("radio");
    expect(filledCount(container)).toBe(2);
    fireEvent.mouseEnter(stars[4]); // hovering must not change the fill
    expect(filledCount(container)).toBe(2);
  });
});
