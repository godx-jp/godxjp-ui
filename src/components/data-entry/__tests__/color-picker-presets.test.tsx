import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, fireEvent, within } from "@/test/render";

import { ColorPicker } from "../color-picker";
import { FormField } from "../form-field";
import type { ColorPickerPresetProp } from "../../../props/components/data-entry.prop";

/**
 * ColorPicker `presets` + `panelRender` (gh#1055) — antd ColorPicker's fixed palette, and the
 * presets-only mode antd builds with `panelRender={(_, { components: { Presets } }) => <Presets />}`.
 * Tags in godx-task #395 must pick from a palette, not free hex.
 *
 * Locale is vi (test/render): swatch "Chọn màu", hex "Mã màu hex", empty group "Trống".
 */

const PALETTE: ColorPickerPresetProp[] = [
  { label: "Recommended", colors: ["#ff0000", "#00ff00", "#0000ff"] },
  { label: "Recent", colors: ["#123456"], key: "recent" },
];

function radiosIn(groupName: string) {
  return within(screen.getByRole("radiogroup", { name: groupName })).getAllByRole("radio");
}

describe("ColorPicker presets — rendering and naming", () => {
  it("renders one radiogroup per preset group, named by its label, each swatch named by its hex", () => {
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={() => {}} presets={PALETTE} />);
    const recommended = radiosIn("Recommended");
    expect(recommended.map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "#ff0000",
      "#00ff00",
      "#0000ff",
    ]);
    expect(radiosIn("Recent")).toHaveLength(1);
    // The free picker is still there in the default panel.
    expect(screen.getByLabelText("Chọn màu")).toBeInTheDocument();
  });

  it("checks the swatch equal to value, case- and shorthand-insensitively (antd toCssString)", () => {
    renderWithUi(<ColorPicker value="#F00" onValueChange={() => {}} presets={PALETTE} />);
    const [red, green] = radiosIn("Recommended");
    expect(red).toBeChecked();
    expect(green).not.toBeChecked();
    expect(radiosIn("Recent")[0]).not.toBeChecked();
  });

  it("an empty group shows antd's localized Empty line instead of a radiogroup", () => {
    renderWithUi(<ColorPicker presets={[{ label: "Nothing", colors: [] }]} />);
    expect(screen.getByText("Trống")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("the palette is a group named by the FormField label, so presets-only mode stays named", () => {
    renderWithUi(
      <FormField id="tag-color" label="Tag colour">
        <ColorPicker
          id="tag-color"
          presets={PALETTE}
          panelRender={(_, { components: { Presets } }) => <Presets />}
        />
      </FormField>,
    );
    expect(screen.getByRole("group", { name: "Tag colour" })).toBeInTheDocument();
  });
});

describe("ColorPicker presets — selection", () => {
  it("clicking a swatch fires onValueChange with its hex", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="" onValueChange={onValueChange} presets={PALETTE} />);
    await user.click(radiosIn("Recommended")[1]!);
    expect(onValueChange).toHaveBeenCalledWith("#00ff00");
  });

  it("uncontrolled: the clicked swatch becomes checked and the hex field follows", async () => {
    const user = userEvent.setup();
    renderWithUi(<ColorPicker defaultValue="#ff0000" presets={PALETTE} />);
    await user.click(radiosIn("Recent")[0]!);
    expect(radiosIn("Recent")[0]).toBeChecked();
    expect(radiosIn("Recommended")[0]).not.toBeChecked();
    expect(screen.getByRole("textbox", { name: "Mã màu hex" })).toHaveValue("#123456");
  });

  it("keyboard (APG radio group): one tab stop per group, arrows move AND select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [color, setColor] = React.useState("#ff0000");
      return (
        <ColorPicker
          value={color}
          onValueChange={(next) => {
            onValueChange(next);
            setColor(next);
          }}
          presets={PALETTE}
          panelRender={(_, { components: { Presets } }) => <Presets />}
        />
      );
    }
    renderWithUi(<Controlled />);
    // First Tab lands on the group's disclosure trigger, the next on the CHECKED swatch.
    await user.tab();
    await user.tab();
    const [red, green] = radiosIn("Recommended");
    expect(red).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(green).toHaveFocus();
    expect(green).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("#00ff00");
  });

  it("disabled disables every swatch", () => {
    renderWithUi(<ColorPicker value="#ff0000" disabled presets={PALETTE} />);
    for (const radio of radiosIn("Recommended")) expect(radio).toBeDisabled();
  });
});

describe("ColorPicker presets — collapsible groups (antd Collapse, defaultOpen)", () => {
  it("groups start open by default; defaultOpen={false} starts collapsed and toggles open", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <ColorPicker
        presets={[
          { label: "Open", colors: ["#ff0000"] },
          { label: "Closed", colors: ["#00ff00"], defaultOpen: false },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-expanded", "true");
    const closed = screen.getByRole("button", { name: "Closed" });
    expect(closed).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("radiogroup", { name: "Closed" })).not.toBeInTheDocument();
    await user.click(closed);
    expect(closed).toHaveAttribute("aria-expanded", "true");
    expect(radiosIn("Closed")).toHaveLength(1);
  });
});

describe("ColorPicker panelRender — presets-only mode", () => {
  it("renders only the palette: no native swatch, no hex field; the hidden input still submits", () => {
    const { container } = renderWithUi(
      <ColorPicker
        name="tag_color"
        value="#00ff00"
        presets={PALETTE}
        panelRender={(_, { components: { Presets } }) => <Presets />}
      />,
    );
    expect(screen.queryByLabelText("Chọn màu")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(radiosIn("Recommended")[1]).toBeChecked();
    expect(container.querySelector('input[type="hidden"][name="tag_color"]')).toHaveValue(
      "#00ff00",
    );
  });

  it("receives the default panel as its first argument (wrapping it keeps both parts)", () => {
    renderWithUi(
      <ColorPicker
        presets={PALETTE}
        panelRender={(panel) => <section aria-label="wrapped">{panel}</section>}
      />,
    );
    const wrapped = screen.getByRole("region", { name: "wrapped" });
    expect(within(wrapped).getByLabelText("Chọn màu")).toBeInTheDocument();
    expect(within(wrapped).getAllByRole("radio")).toHaveLength(4);
  });

  it("the Picker part keeps focus while typing (stable component identity across renders)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <ColorPicker
        defaultValue="#ff0000"
        presets={PALETTE}
        panelRender={(_, { components: { Picker, Presets } }) => (
          <>
            <Presets />
            <Picker />
          </>
        )}
      />,
    );
    const hex = screen.getByRole("textbox", { name: "Mã màu hex" });
    await user.clear(hex);
    await user.type(hex, "#abc");
    expect(hex).toHaveFocus();
    expect(hex).toHaveValue("#abc");
  });
});

describe("ColorPicker without presets — unchanged", () => {
  it("keeps the original inline row: no panel attribute, no palette, same children", () => {
    const { container } = renderWithUi(
      <ColorPicker id="c" name="c" value="#2563eb" onValueChange={() => {}} />,
    );
    const root = container.querySelector(".ui-color-picker")!;
    expect(root).not.toHaveAttribute("data-panel");
    const children = [...root.children];
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveClass("ui-color-picker-swatch");
    expect(children[1]).toHaveClass("ui-color-picker-hex");
    expect(children[2]).toHaveAttribute("type", "hidden");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});

describe("ColorPicker hex input — IME composition (gh#1054)", () => {
  it("the Enter that confirms an IME conversion does not commit", () => {
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    const hex = screen.getByRole("textbox", { name: "Mã màu hex" });
    fireEvent.change(hex, { target: { value: "#00ff00" } });
    fireEvent.keyDown(hex, { key: "Enter", isComposing: true });
    fireEvent.keyDown(hex, { key: "Enter", keyCode: 229 });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(hex, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("#00ff00");
  });
});
