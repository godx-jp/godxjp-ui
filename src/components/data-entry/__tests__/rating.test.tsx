import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rating } from "../rating";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Rating", () => {
  it("renders a radiogroup with `max` radio stars", () => {
    const { getByRole, getAllByRole } = render(<Rating max={5} aria-label="評価" />);
    expect(getByRole("radiogroup", { name: "評価" })).toBeInTheDocument();
    expect(getAllByRole("radio")).toHaveLength(5);
  });

  it("clicking a star selects it (uncontrolled) and fires onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getAllByRole } = render(<Rating onValueChange={onValueChange} aria-label="評価" />);
    const stars = getAllByRole("radio");
    await user.click(stars[2]);
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(stars[2]).toHaveAttribute("aria-checked", "true");
  });

  it("respects a controlled `value` (does not self-update)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getAllByRole } = render(
      <Rating value={2} onValueChange={onValueChange} aria-label="評価" />,
    );
    const stars = getAllByRole("radio");
    expect(stars[1]).toHaveAttribute("aria-checked", "true");
    await user.click(stars[4]);
    expect(onValueChange).toHaveBeenCalledWith(5);
    // value is controlled → still shows 2 until the parent updates it
    expect(stars[1]).toHaveAttribute("aria-checked", "true");
  });

  it("readOnly + disabled block selection", async () => {
    const user = userEvent.setup();
    const ro = vi.fn();
    const { getAllByRole, rerender } = render(
      <Rating value={3} readOnly onValueChange={ro} aria-label="評価" />,
    );
    await user.click(getAllByRole("radio")[0]);
    expect(ro).not.toHaveBeenCalled();
    const dis = vi.fn();
    rerender(<Rating value={3} disabled onValueChange={dis} aria-label="評価" />);
    await user.click(getAllByRole("radio")[0]);
    expect(dis).not.toHaveBeenCalled();
  });

  it("keyboard: Arrow steps, Home/End jump to bounds", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getAllByRole } = render(
      <Rating defaultValue={3} onValueChange={onValueChange} max={5} aria-label="評価" />,
    );
    const stars = getAllByRole("radio");
    stars[2].focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenLastCalledWith(2);
    await user.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    await user.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith(5);
  });

  it("exposes a single tab stop (roving tabindex) at the checked star", () => {
    const { getAllByRole } = render(<Rating value={3} aria-label="評価" />);
    const tabbable = getAllByRole("radio").filter((s) => s.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAttribute("aria-checked", "true");
  });

  it("submits the value via a hidden input when `name` is set", () => {
    const { container } = render(<Rating value={4} name="score" aria-label="評価" />);
    const hidden = container.querySelector('input[type="hidden"][name="score"]');
    expect(hidden).toHaveValue("4");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Rating value={3} aria-label="評価" />);
  });
});
