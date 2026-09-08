import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { Checkbox } from "../checkbox";
import { Radio } from "../radio";
import { Segmented } from "../segmented";
import { Switch } from "../switch";
import { Rating } from "../rating";
import { Slider } from "../slider";

/**
 * Tri-state Checkbox — main spells antd's `indeterminate` as a THIRD value of `checked`, not as a
 * separate boolean flag, and that spelling survived the react-aria migration on purpose:
 * `checked` / `defaultChecked` / `onCheckedChange` are the pre-migration public names, and the
 * translation to react-aria's `isSelected` + `isIndeterminate` happens inside the component.
 *
 * These three cases arrived on a branch written against the flag API. Ported rather than dropped:
 * the repo had no DIRECT test of the tri-state contract — only an indirect one through Cascader —
 * so nothing was holding the mixed state to `aria-checked="mixed"`.
 */
/**
 * Tri-state Checkbox — main spells antd's `indeterminate` as a THIRD value of `checked`, not as a
 * separate boolean flag, and that spelling is deliberate: `checked` / `defaultChecked` /
 * `onCheckedChange` are the pre-migration public names, and the translation to react-aria's
 * `isSelected` + `isIndeterminate` happens inside the component.
 *
 * These cases arrived on a branch written before that migration, asserting `data-state` — a Radix
 * attribute the rewrite no longer emits, on an element the rewrite no longer renders (it is a
 * native `<input type="checkbox">` now, with an implicit role). Ported to the ACCESSIBLE state
 * instead, which is the thing that has to hold whatever the library underneath is: a partial
 * checkbox must read as mixed, not as unchecked.
 *
 * Worth porting rather than dropping — the repo had no DIRECT test of the tri-state contract, only
 * an indirect one through Cascader.
 */
describe("Checkbox — the tri-state `checked`", () => {
  it("reads as MIXED when partial, not as unchecked", () => {
    renderWithUi(<Checkbox aria-label="全選択" checked="indeterminate" />);
    const box = screen.getByRole("checkbox", { name: "全選択" });
    expect(box).toBePartiallyChecked();
    expect(box).not.toBeChecked();
  });

  it("returns to the plain checked state when the third value goes away", () => {
    const { rerender } = renderWithUi(<Checkbox aria-label="全選択" checked="indeterminate" />);
    expect(screen.getByRole("checkbox", { name: "全選択" })).toBePartiallyChecked();
    rerender(<Checkbox aria-label="全選択" checked={true} />);
    const box = screen.getByRole("checkbox", { name: "全選択" });
    expect(box).toBeChecked();
    expect(box).not.toBePartiallyChecked();
  });

  it("is unchecked when `checked` is omitted", () => {
    const box =
      renderWithUi(<Checkbox aria-label="同意" />) &&
      screen.getByRole("checkbox", { name: "同意" });
    expect(box).not.toBeChecked();
    expect(box).not.toBePartiallyChecked();
  });
});

const OPTIONS = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
];

describe("Radio.Group — antd `optionType` / `buttonStyle`", () => {
  it("optionType=button is PAINT: the roles stay radiogroup / radio", () => {
    renderWithUi(
      <Radio.Group aria-label="期間" options={OPTIONS} optionType="button" defaultValue="week" />,
    );
    const group = screen.getByRole("radiogroup", { name: "期間" });
    expect(group).toHaveAttribute("data-option-type", "button");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    // A row of aria-pressed buttons would permit "none chosen"; a radiogroup does not, and that
    // is exactly why this is a RadioGroup prop and not a ToggleGroup.
    expect(screen.getByRole("radio", { name: "週" })).toBeChecked();
  });

  it("arrow keys still move the selection inside the button bar", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <Radio.Group
        aria-label="期間"
        options={OPTIONS}
        optionType="button"
        defaultValue="day"
        onValueChange={onValueChange}
      />,
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "日" })).toHaveFocus();
    // Roving tabindex inside the bar: Tab enters it once, arrows move within it.
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "週" })).toHaveFocus();
    await user.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith("week");
  });

  it("buttonStyle only applies while optionType is button", () => {
    const { rerender } = renderWithUi(
      <Radio.Group
        aria-label="期間"
        options={OPTIONS}
        optionType="button"
        buttonStyle="solid"
        defaultValue="day"
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "期間" })).toHaveAttribute(
      "data-button-style",
      "solid",
    );
    rerender(
      <Radio.Group aria-label="期間" options={OPTIONS} buttonStyle="solid" defaultValue="day" />,
    );
    expect(screen.getByRole("radiogroup", { name: "期間" })).not.toHaveAttribute(
      "data-button-style",
    );
  });

  it("the default stays the dot list, unchanged", () => {
    renderWithUi(<Radio.Group aria-label="期間" options={OPTIONS} defaultValue="day" />);
    const group = screen.getByRole("radiogroup", { name: "期間" });
    expect(group).not.toHaveAttribute("data-option-type");
    expect(group).toHaveClass("ui-choice-group");
  });
});

describe("Segmented — antd `block` / `vertical` / `size`", () => {
  it("block marks the bar so every choice takes an equal share of the width", () => {
    renderWithUi(<Segmented aria-label="表示" options={OPTIONS} block defaultValue="day" />);
    expect(screen.getByRole("radiogroup", { name: "表示" })).toHaveAttribute("data-block", "true");
  });

  it("vertical changes the ARROW KEYS, not just the layout", () => {
    renderWithUi(<Segmented aria-label="表示" options={OPTIONS} vertical defaultValue="day" />);
    // Radix reads `orientation` to decide which arrows move the roving focus, so a bar that only
    // changed direction in CSS would still be driven by ←/→.
    expect(screen.getByRole("radiogroup", { name: "表示" })).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("size lands as the tier attribute the control-height rule reads", () => {
    renderWithUi(<Segmented aria-label="表示" options={OPTIONS} size="lg" defaultValue="day" />);
    expect(screen.getByRole("radiogroup", { name: "表示" })).toHaveAttribute("data-size", "lg");
  });

  it("defaults are unchanged: horizontal, not block, no size attribute", () => {
    renderWithUi(<Segmented aria-label="表示" options={OPTIONS} defaultValue="day" />);
    const bar = screen.getByRole("radiogroup", { name: "表示" });
    expect(bar).toHaveAttribute("data-orientation", "horizontal");
    expect(bar).not.toHaveAttribute("data-block");
    expect(bar).not.toHaveAttribute("data-size");
  });
});

describe("Switch — antd `loading` / `checkedChildren`", () => {
  it("loading refuses the change but KEEPS the control in the tab order", () => {
    const onCheckedChange = vi.fn();
    renderWithUi(<Switch aria-label="公開" loading onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole("switch", { name: "公開" });
    fireEvent.click(toggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute("aria-busy", "true");
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    // `disabled` would have thrown a keyboard user's focus to the next field mid-save.
    expect(toggle).not.toBeDisabled();
  });

  it("is operable again once loading clears", () => {
    const onCheckedChange = vi.fn();
    const { rerender } = renderWithUi(
      <Switch aria-label="公開" loading onCheckedChange={onCheckedChange} />,
    );
    rerender(<Switch aria-label="公開" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "公開" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("shows exactly ONE of checkedChildren / unCheckedChildren, and hides it from AT", () => {
    const { container, rerender } = renderWithUi(
      <Switch aria-label="公開" checkedChildren="有効" unCheckedChildren="無効" checked={false} />,
    );
    const content = container.querySelector('[data-slot="switch-content"]')!;
    expect(content).toHaveTextContent("無効");
    // `role="switch"` + `aria-checked` already say on/off; reading the word too says it twice.
    expect(content).toHaveAttribute("aria-hidden", "true");
    rerender(
      <Switch aria-label="公開" checkedChildren="有効" unCheckedChildren="無効" checked={true} />,
    );
    expect(container.querySelector('[data-slot="switch-content"]')).toHaveTextContent("有効");
  });

  it("renders no content slot at all when neither is given", () => {
    const { container } = renderWithUi(<Switch aria-label="公開" />);
    expect(container.querySelector('[data-slot="switch-content"]')).toBeNull();
  });
});

describe("Rating — antd `count` / `allowHalf` / `allowClear` / `character` / `tooltips`", () => {
  it("count sets the number of symbols and wins over the older `max`", () => {
    renderWithUi(<Rating aria-label="評価" count={3} max={7} />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("allowHalf adds a half hit area per symbol WITHOUT doubling the radios", () => {
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Rating aria-label="評価" allowHalf onValueChange={onValueChange} />,
    );
    // The ARIA scale still has exactly `count` steps — a half is a position inside a step.
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    const halves = container.querySelectorAll('[data-slot="rating-half"]');
    expect(halves).toHaveLength(5);
    fireEvent.click(halves[2]);
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);
  });

  it("allowHalf steps the keyboard by a half too", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Rating aria-label="評価" allowHalf defaultValue={3} onValueChange={onValueChange} />,
    );
    fireEvent.keyDown(screen.getAllByRole("radio")[2], { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(3.5);
  });

  it("allowClear drops the value back to 0 when the chosen step is chosen again", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <Rating aria-label="評価" allowClear defaultValue={3} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getAllByRole("radio")[2]);
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("without allowClear the same click re-selects the same value (antd's default is off here)", () => {
    const onValueChange = vi.fn();
    renderWithUi(<Rating aria-label="評価" defaultValue={3} onValueChange={onValueChange} />);
    fireEvent.click(screen.getAllByRole("radio")[2]);
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it("character replaces the glyph, per index when it is a function", () => {
    renderWithUi(<Rating aria-label="評価" count={3} character={(i) => <span>{`第${i}`}</span>} />);
    expect(screen.getByText("第1")).toBeInTheDocument();
    expect(screen.getByText("第3")).toBeInTheDocument();
  });

  it("tooltips reach the ACCESSIBLE NAME, not a hover-only title", () => {
    renderWithUi(<Rating aria-label="評価" count={3} tooltips={["不満", "普通", "満足"]} />);
    // A `title` is invisible to a keyboard and to touch; the label is not.
    expect(screen.getAllByRole("radio")[2].getAttribute("aria-label")).toContain("満足");
  });
});

describe("Slider — antd `range` / `marks` / `dots` / `included` / `reverse` / `tooltip`", () => {
  it("range=true gives two thumbs even before a value has arrived", () => {
    renderWithUi(<Slider aria-label="価格帯" range />);
    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("range=false keeps ONE thumb even when the value arrives as an array", () => {
    renderWithUi(<Slider aria-label="音量" range={false} defaultValue={[20, 80]} />);
    expect(screen.getAllByRole("slider")).toHaveLength(1);
  });

  it("marks render a labelled tick per entry, positioned as a fraction of the rail", () => {
    const { container } = renderWithUi(
      <Slider aria-label="評点" min={0} max={100} marks={{ 0: "0%", 50: "半分", 100: "100%" }} />,
    );
    const marks = container.querySelectorAll('[data-slot="slider-mark"]');
    expect(marks).toHaveLength(3);
    expect(marks[1]).toHaveTextContent("半分");
    expect((marks[1] as HTMLElement).style.getPropertyValue("--slider-mark-offset-inline")).toBe(
      "50%",
    );
  });

  it("reverse mirrors the mark positions, and maps onto Radix's `inverted`", () => {
    const { container } = renderWithUi(
      <Slider aria-label="評点" min={0} max={100} reverse marks={{ 25: "四分の一" }} />,
    );
    const mark = container.querySelector('[data-slot="slider-mark"]') as HTMLElement;
    expect(mark.style.getPropertyValue("--slider-mark-offset-inline")).toBe("75%");
  });

  it("dots draw a tick per step, and nothing at all without the prop", () => {
    const { container, rerender } = renderWithUi(
      <Slider aria-label="評点" min={0} max={10} step={5} dots defaultValue={[5]} />,
    );
    expect(container.querySelectorAll('[data-slot="slider-dot"]')).toHaveLength(3);
    rerender(<Slider aria-label="評点" min={0} max={10} step={5} defaultValue={[5]} />);
    expect(container.querySelectorAll('[data-slot="slider-dot"]')).toHaveLength(0);
  });

  it("included=false stops painting the filled span", () => {
    const { container, rerender } = renderWithUi(
      <Slider aria-label="評点" defaultValue={[40]} marks={{ 40: "40" }} />,
    );
    expect(container.querySelector('[data-slot="slider-range"]')).toBeTruthy();
    rerender(
      <Slider aria-label="評点" defaultValue={[40]} included={false} marks={{ 40: "40" }} />,
    );
    expect(container.querySelector('[data-slot="slider-range"]')).toBeNull();
  });

  it("tooltip renders a formatted bubble per thumb, hidden from AT", () => {
    const { container } = renderWithUi(
      <Slider
        aria-label="音量"
        defaultValue={[40]}
        tooltip={{ formatter: (value) => `${value}%` }}
      />,
    );
    const bubble = container.querySelector('[data-slot="slider-tooltip"]')!;
    expect(bubble).toHaveTextContent("40%");
    // The thumb already announces its value through role=slider + aria-valuenow.
    expect(bubble).toHaveAttribute("aria-hidden", "true");
  });

  it("no tooltip is rendered by default", () => {
    const { container } = renderWithUi(<Slider aria-label="音量" defaultValue={[40]} />);
    expect(container.querySelector('[data-slot="slider-tooltip"]')).toBeNull();
  });
});
