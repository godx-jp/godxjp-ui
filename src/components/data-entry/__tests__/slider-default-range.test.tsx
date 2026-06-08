import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Slider } from "../slider";

describe("Slider — no value/defaultValue", () => {
  it("renders over the [min, max] range when neither value nor defaultValue is given", () => {
    // values falls back to [min, max], driving the thumb mapping + range
    renderWithUi(<Slider min={0} max={50} aria-label="範囲" />);
    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuemax", "50");
  });
});
