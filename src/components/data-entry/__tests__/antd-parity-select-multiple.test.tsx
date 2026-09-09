import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";

import { Select } from "../select";

/**
 * antd `Select mode="multiple"` — "pick several from ONE flat, searchable option list".
 *
 * This was the biggest remaining input gap: TagInput is free text with no `options`, TreeSelect is
 * hierarchical, Cascader is paths, Transfer is two panes. None of them can stand in, and the
 * no-duplication rule forbids a second component — so `Select` grew the mode instead.
 *
 * What is pinned here is the BEHAVIOUR that separates a multi-select from a single one: the panel
 * stays open across picks, a second click on a row deselects it, `maxCount` refuses rather than
 * trims, and the form posts one field per value.
 */

const OPTIONS = [
  { value: "tokyo", label: "東京" },
  { value: "osaka", label: "大阪" },
  { value: "kyoto", label: "京都" },
];

function trigger() {
  return screen.getByRole("combobox");
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(trigger());
  return screen.findByRole("listbox");
}

describe('Select mode="multiple" — picking', () => {
  it("the panel STAYS OPEN across picks and each pick adds to the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select mode="multiple" options={OPTIONS} aria-label="都市" onValueChange={onValueChange} />,
    );
    const listbox = await openPanel(user);

    await user.click(within(listbox).getByRole("option", { name: "東京" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["tokyo"], [OPTIONS[0]]);
    // Still open — a multi-pick is a RUN of gestures, not one.
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(within(screen.getByRole("listbox")).getByRole("option", { name: "大阪" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["tokyo", "osaka"], [OPTIONS[0], OPTIONS[1]]);
  });

  it("a second click on a picked row REMOVES it (toggle) and fires onDeselect", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo"]}
        onValueChange={onValueChange}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />,
    );
    const listbox = await openPanel(user);
    await user.click(within(listbox).getByRole("option", { name: "東京" }));

    expect(onValueChange).toHaveBeenLastCalledWith([], []);
    expect(onDeselect).toHaveBeenCalledWith("tokyo", OPTIONS[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("the listbox declares aria-multiselectable and marks each picked row aria-selected", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select mode="multiple" options={OPTIONS} aria-label="都市" defaultValue={["osaka"]} />,
    );
    const listbox = await openPanel(user);

    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(within(listbox).getByRole("option", { name: "大阪" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(listbox).getByRole("option", { name: "東京" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});

describe('Select mode="multiple" — the trigger label', () => {
  it("shows every picked label at rest, resolved from the option list", async () => {
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo", "osaka"]}
      />,
    );
    await waitFor(() => expect(trigger()).toHaveTextContent("東京"));
    expect(trigger()).toHaveTextContent("大阪");
    expect(trigger()).toHaveAttribute("data-value", "tokyo,osaka");
  });

  it("maxTagCount collapses the rest into the shared +N overflow node", () => {
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo", "osaka", "kyoto"]}
        maxTagCount={1}
      />,
    );
    expect(trigger()).toHaveTextContent("東京");
    expect(trigger()).not.toHaveTextContent("大阪");
    // Same wording every other multi-value trigger in the library uses.
    expect(trigger()).toHaveTextContent("+2");
  });

  it("maxTagPlaceholder replaces the overflow node", () => {
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo", "osaka", "kyoto"]}
        maxTagCount={1}
        maxTagPlaceholder={(rest) => `ほか${rest.length}件`}
      />,
    );
    expect(trigger()).toHaveTextContent("ほか2件");
  });

  it("with nothing picked the placeholder shows", () => {
    renderWithUi(
      <Select mode="multiple" options={OPTIONS} aria-label="都市" placeholder="都市を選択" />,
    );
    expect(trigger()).toHaveTextContent("都市を選択");
  });
});

describe('Select mode="multiple" — maxCount', () => {
  it("REFUSES a pick past the ceiling instead of trimming afterwards", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo"]}
        maxCount={1}
        onValueChange={onValueChange}
      />,
    );
    const listbox = await openPanel(user);
    await user.click(within(listbox).getByRole("option", { name: "大阪" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("marks the rows that would break the ceiling aria-disabled BEFORE they are clicked", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo"]}
        maxCount={1}
      />,
    );
    const listbox = await openPanel(user);
    expect(within(listbox).getByRole("option", { name: "大阪" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // The already-picked row stays operable — it is the way back under the ceiling.
    expect(within(listbox).getByRole("option", { name: "東京" })).not.toHaveAttribute(
      "aria-disabled",
    );
  });
});

describe('Select mode="multiple" — clear + native submission', () => {
  it("the clear ✕ drops the whole selection at once", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo", "osaka"]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Xóa lựa chọn" }));
    expect(onValueChange).toHaveBeenCalledWith([], []);
  });

  it("posts ONE hidden field per value under the same name (native <select multiple>)", () => {
    const { container } = renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        name="cities"
        defaultValue={["tokyo", "kyoto"]}
      />,
    );
    const hidden = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="cities"]'),
    ).map((input) => input.value);
    expect(hidden).toEqual(["tokyo", "kyoto"]);
  });

  it("a controlled multiple select obeys its parent", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        options={OPTIONS}
        aria-label="都市"
        value={["tokyo"]}
        onValueChange={onValueChange}
      />,
    );
    const listbox = await openPanel(user);
    await user.click(within(listbox).getByRole("option", { name: "大阪" }));

    expect(onValueChange).toHaveBeenCalledWith(["tokyo", "osaka"], [OPTIONS[0], OPTIONS[1]]);
    // The parent ignored it, so the trigger must not drift away from the prop.
    expect(trigger()).toHaveAttribute("data-value", "tokyo");
  });
});

describe("Select — single mode is untouched", () => {
  it("still closes after a pick and still emits a bare string", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select options={OPTIONS} showSearch aria-label="都市" onValueChange={onValueChange} />,
    );
    const listbox = await openPanel(user);
    await user.click(within(listbox).getByRole("option", { name: "東京" }));

    expect(onValueChange).toHaveBeenCalledWith("tokyo", OPTIONS[0]);
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });
});
