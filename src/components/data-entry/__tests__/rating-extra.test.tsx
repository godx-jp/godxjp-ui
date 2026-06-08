import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rating } from "../rating";

describe("Rating — remaining branches", () => {
  it("falls back to a default aria-label when none is provided", () => {
    render(<Rating max={5} />);
    expect(screen.getByRole("radiogroup").getAttribute("aria-label")).toBeTruthy();
  });

  it("makes the checked star the single tab stop (focusableStar = current)", () => {
    render(<Rating max={5} value={3} aria-label="r" />);
    const stars = screen.getAllByRole("radio");
    expect(stars[2]).toHaveAttribute("tabindex", "0"); // 3rd star is current
    expect(stars[0]).toHaveAttribute("tabindex", "-1");
  });

  it("a disabled rating ignores clicks (select bails when non-interactive)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating max={5} value={2} disabled onValueChange={onValueChange} aria-label="r" />);
    await user.click(screen.getAllByRole("radio")[4]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
