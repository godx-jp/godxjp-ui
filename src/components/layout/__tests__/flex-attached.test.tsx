import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Flex } from "../flex";
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
      <Flex attached>
        <NumberInput aria-label="間隔" defaultValue={2} />
        <Select aria-label="単位" defaultValue="week" options={UNITS} />
      </Flex>,
    );
    expect(group()).toHaveAttribute("data-orientation", "horizontal");
    expect(group()).not.toHaveAttribute("role");
  });

  it("both children stay independently reachable and operable by role/label", async () => {
    const user = userEvent.setup();
    const onNumberChange = vi.fn();
    renderWithUi(
      <Flex attached>
        <NumberInput aria-label="間隔" defaultValue={2} onValueChange={onNumberChange} />
        <Select aria-label="単位" defaultValue="week" options={UNITS} />
      </Flex>,
    );

    const numberField = screen.getByRole("spinbutton", { name: "間隔" });
    const unitField = screen.getByRole("combobox", { name: "単位" });
    expect(numberField).toBeInTheDocument();
    expect(unitField).toBeInTheDocument();

    await user.clear(numberField);
    await user.type(numberField, "3");
    expect(onNumberChange).toHaveBeenCalled();
  });

  it('`direction="col"` is the vertical seam, `"row"` the horizontal one', () => {
    const { rerender } = renderWithUi(
      <Flex attached direction="col">
        <NumberInput aria-label="間隔" />
      </Flex>,
    );
    expect(group()).toHaveAttribute("data-orientation", "vertical");

    rerender(
      <Flex attached direction="row">
        <NumberInput aria-label="間隔" />
      </Flex>,
    );
    expect(group()).toHaveAttribute("data-orientation", "horizontal");
  });

  it("`fullWidth` marks the row so it fills its parent (antd `block`)", () => {
    renderWithUi(
      <Flex attached fullWidth>
        <NumberInput aria-label="間隔" />
      </Flex>,
    );
    expect(group()).toHaveAttribute("data-full-width", "true");
  });

  it("omitted `fullWidth` emits no attribute at all", () => {
    renderWithUi(
      <Flex attached>
        <NumberInput aria-label="間隔" />
      </Flex>,
    );
    expect(group()).not.toHaveAttribute("data-full-width");
  });

  it("`density` scopes a `.ui-density-*` class, the same one Form/FormRoot already emit", () => {
    renderWithUi(
      <Flex attached density="compact">
        <NumberInput aria-label="間隔" />
      </Flex>,
    );
    expect(group().className).toContain("ui-density-compact");
  });

  it("FormField wrapping SpaceCompact — ONE label for the pair (antd 毎[N][週▾]ごと row)", () => {
    renderWithUi(
      <FormField label="繰り返し間隔">
        <Flex attached>
          <NumberInput aria-label="間隔の数" defaultValue={2} />
          <Select aria-label="単位" defaultValue="week" options={UNITS} />
        </Flex>
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

  it('an explicit `role` opts out of the auto role="group" promotion', () => {
    renderWithUi(
      <Flex attached role="presentation" aria-label="間隔">
        <NumberInput aria-label="間隔" />
      </Flex>,
    );
    expect(group()).toHaveAttribute("role", "presentation");
  });

  it('wraps each child in exactly one `[data-slot="space-compact-item"]` box, even when a child\'s own root is `display: contents` (gh#919)', () => {
    renderWithUi(
      <Flex attached fullWidth>
        <NumberInput aria-label="間隔" defaultValue={2} />
        <Select aria-label="単位" defaultValue="week" options={UNITS} />
      </Flex>,
    );
    // Exactly one wrapper per React child — `.ui-select-root` (display: contents) and its
    // `<template>` sibling must NOT show up as extra direct children the `> *` CSS used to hit.
    const items = group().querySelectorAll(':scope > [data-slot="space-compact-item"]');
    expect(items).toHaveLength(2);
    expect(group().children).toHaveLength(2);
    // The SELECT's wrapper holds the trigger through the display:contents root, not a bare div.
    expect(items[1].querySelector('[data-slot="select-trigger"]')).toBeInTheDocument();
    expect(items[1].querySelector("template")).toBeInTheDocument();
  });
});
