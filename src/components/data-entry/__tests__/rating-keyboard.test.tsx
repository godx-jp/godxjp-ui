import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rating } from "../rating";

describe("Rating — unhandled keys", () => {
  it("ignores a key it does not handle (default branch)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating max={5} onValueChange={onValueChange} aria-label="rate" />);
    const stars = screen.getAllByRole("radio");
    stars[0].focus();
    await user.keyboard("a"); // not an arrow/home/end → switch default → no selection
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
