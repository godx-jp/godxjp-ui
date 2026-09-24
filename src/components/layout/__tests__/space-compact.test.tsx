import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { SpaceCompact } from "../space-compact";
import { NumberInput } from "../../data-entry/number-input";
import { Select } from "../../data-entry/select";
import { FormField } from "../../data-entry/form-field";

const UNITS = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

function group() {
  return document.querySelector('[data-slot="space-compact"]') as HTMLElement;
}

describe("SpaceCompact — the antd Space.Compact port", () => {
  it("defaults to a role-less horizontal row (a visual join, not a semantic group)", () => {
    renderWithUi(
      <SpaceCompact>
        <NumberInput aria-label="間隔" defaultValue={2} />
        <Select aria-label="単位" defaultValue="week" options={UNITS} />
      </SpaceCompact>,
    );
    expect(group()).toHaveAttribute("data-orientation", "horizontal");
    expect(group()).not.toHaveAttribute("role");
  });

  it("both children stay independently reachable and operable by role/label", async () => {
    const user = userEvent.setup();
    const onNumberChange = vi.fn();
    renderWithUi(
      <SpaceCompact>
        <NumberInput aria-label="間隔" defaultValue={2} onValueChange={onNumberChange} />
        <Select aria-label="単位" defaultValue="week" options={UNITS} />
      </SpaceCompact>,
    );

    const numberField = screen.getByRole("spinbutton", { name: "間隔" });
    const unitField = screen.getByRole("combobox", { name: "単位" });
    expect(numberField).toBeInTheDocument();
    expect(unitField).toBeInTheDocument();

    await user.clear(numberField);
    await user.type(numberField, "3");
    expect(onNumberChange).toHaveBeenCalled();
  });

  it("`vertical` sets the vertical orientation; an explicit `orientation` wins over it", () => {
    const { rerender } = renderWithUi(
      <SpaceCompact vertical>
        <NumberInput aria-label="間隔" />
      </SpaceCompact>,
    );
    expect(group()).toHaveAttribute("data-orientation", "vertical");

    rerender(
      <SpaceCompact vertical orientation="horizontal">
        <NumberInput aria-label="間隔" />
      </SpaceCompact>,
    );
    expect(group()).toHaveAttribute("data-orientation", "horizontal");
  });

  it("`fullWidth` marks the row so it fills its parent (antd `block`)", () => {
    renderWithUi(
      <SpaceCompact fullWidth>
        <NumberInput aria-label="間隔" />
      </SpaceCompact>,
    );
    expect(group()).toHaveAttribute("data-full-width", "true");
  });

  it("omitted `fullWidth` emits no attribute at all", () => {
    renderWithUi(
      <SpaceCompact>
        <NumberInput aria-label="間隔" />
      </SpaceCompact>,
    );
    expect(group()).not.toHaveAttribute("data-full-width");
  });

  it("`density` scopes a `.ui-density-*` class, the same one Form/FormRoot already emit", () => {
    renderWithUi(
      <SpaceCompact density="compact">
        <NumberInput aria-label="間隔" />
      </SpaceCompact>,
    );
    expect(group().className).toContain("ui-density-compact");
  });

  it("FormField wrapping SpaceCompact — ONE label for the pair (antd 毎[N][週▾]ごと row)", () => {
    renderWithUi(
      <FormField label="繰り返し間隔">
        <SpaceCompact>
          <NumberInput aria-label="間隔の数" defaultValue={2} />
          <Select aria-label="単位" defaultValue="week" options={UNITS} />
        </SpaceCompact>
      </FormField>,
    );
    // A role-less div cannot carry a naming attribute AT reads (axe aria-allowed-attr): FormField
    // clones aria-labelledby onto the SpaceCompact root, so it must promote itself to role="group"
    // — the same contract Flex already honours for a range/年月 pair.
    expect(screen.getByRole("group", { name: "繰り返し間隔" })).toBe(group());
    // The widgets underneath stay independently reachable by their OWN names.
    expect(screen.getByRole("spinbutton", { name: "間隔の数" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "単位" })).toBeInTheDocument();
  });

  it("an explicit `role` opts out of the auto role=\"group\" promotion", () => {
    renderWithUi(
      <SpaceCompact role="presentation" aria-label="間隔">
        <NumberInput aria-label="間隔" />
      </SpaceCompact>,
    );
    expect(group()).toHaveAttribute("role", "presentation");
  });
});
