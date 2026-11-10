/**
 * gh#1544 — a controlled RadioGroup with nothing chosen yet must be reachable by keyboard.
 *
 * `value` was typed `string`, so a consumer wrote `value={choice ?? ""}`. react-aria read `""` as a
 * selected key that matches no radio, gave every radio `tabIndex=-1`, and Tab skipped the whole
 * group. `""` (and `null`) now mean "nothing chosen": the first enabled radio takes the tab stop,
 * exactly as in an uncontrolled group, and the group STAYS controlled.
 */
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Button } from "../../general/button";
import { RadioGroup, RadioGroupRoot, RadioItem } from "../radio";

const OPTIONS = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

describe("RadioGroup with nothing chosen (gh#1544)", () => {
  it('value="" leaves the first radio tabbable and Tab reaches it', async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Button>Before</Button>
        <RadioGroup aria-label="Pick" value="" onValueChange={() => {}} options={OPTIONS} />
      </>,
    );
    const [first] = screen.getAllByRole("radio");
    expect(first).toHaveAttribute("tabindex", "0");
    expect(screen.getAllByRole("radio").every((r) => !(r as HTMLInputElement).checked)).toBe(true);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.tab();
    expect(first).toHaveFocus();
  });

  it("value={null} is accepted and means the same", () => {
    renderWithUi(
      <RadioGroup aria-label="Pick" value={null} onValueChange={() => {}} options={OPTIONS} />,
    );
    expect(screen.getAllByRole("radio")[0]).toHaveAttribute("tabindex", "0");
  });

  it('"" stays CONTROLLED: a click reports the value but the parent decides', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <RadioGroup aria-label="Pick" value="" onValueChange={onValueChange} options={OPTIONS} />,
    );
    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    // The parent never re-rendered with "b", so nothing is checked.
    expect(screen.getByRole("radio", { name: "B" })).not.toBeChecked();
  });

  it("the issue's repro round-trips: null → pick → checked", async () => {
    const user = userEvent.setup();
    function Repro() {
      const [v, setV] = useState<string | null>(null);
      return (
        <RadioGroup aria-label="Pick" value={v ?? ""} onValueChange={setV} options={OPTIONS} />
      );
    }
    renderWithUi(<Repro />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "A" })).toHaveFocus();
    await user.keyboard("[ArrowDown]");
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });

  it('the children path (RadioGroupRoot) maps "" the same way', () => {
    renderWithUi(
      <RadioGroupRoot aria-label="Pick" value="">
        <RadioItem value="a" aria-label="A" />
        <RadioItem value="b" aria-label="B" />
      </RadioGroupRoot>,
    );
    expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("tabindex", "0");
  });

  it("a real selection still owns the tab stop (negative case)", () => {
    renderWithUi(
      <RadioGroup aria-label="Pick" value="b" onValueChange={() => {}} options={OPTIONS} />,
    );
    expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("tabindex", "0");
  });
});
