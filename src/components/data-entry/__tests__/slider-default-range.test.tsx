import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Slider } from "../slider";
import { sliderMin, sliderMax } from "./slider-test-utils";

describe("Slider — no value/defaultValue", () => {
  it("renders over the [min, max] range when neither value nor defaultValue is given", () => {
    // values falls back to [min, max], driving the thumb mapping + range
    renderWithUi(<Slider min={0} max={50} aria-label="範囲" />);
    const thumb = screen.getByRole("slider");
    expect(sliderMin(thumb)).toBe(0);
    expect(sliderMax(thumb)).toBe(50);
  });
});
