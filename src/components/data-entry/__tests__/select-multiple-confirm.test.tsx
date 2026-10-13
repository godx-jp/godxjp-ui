import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { Select } from "../select";

/**
 * gh#1248 — `Select mode="multiple" needConfirm`: the commit model TimePicker and DatePicker
 * already have. Toggles move a DRAFT; only OK reports a change, once, with the whole set; Escape or
 * an outside click throws the draft away and the trigger keeps the committed values.
 */

const OPTIONS = [
  { value: "tokyo", label: "東京" },
  { value: "osaka", label: "大阪" },
  { value: "kyoto", label: "京都" },
];

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("combobox"));
  return screen.findByRole("listbox");
}

// renderWithUi renders in `vi`: `dataEntry.timePicker.confirm` and `common.clear`.
const OK = "Chọn";
const CLEAR = "Xóa";

const option = (name: string) => within(screen.getByRole("listbox")).getByRole("option", { name });

describe('Select mode="multiple" needConfirm (gh#1248)', () => {
  it("draft toggles do not report; OK reports once with every pick and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        needConfirm
        options={OPTIONS}
        aria-label="都市"
        onValueChange={onValueChange}
        onSelect={onSelect}
      />,
    );
    await openPanel(user);
    await user.click(option("東京"));
    await user.click(option("大阪"));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    // The list shows the draft…
    expect(option("東京")).toHaveAttribute("aria-selected", "true");
    expect(option("大阪")).toHaveAttribute("aria-selected", "true");
    // …while the trigger still shows the committed (empty) value.
    expect(screen.getByRole("combobox")).not.toHaveAttribute("data-value");

    await user.click(screen.getByRole("button", { name: OK }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["tokyo", "osaka"], [OPTIONS[0], OPTIONS[1]]);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("combobox")).toHaveAttribute("data-value", "tokyo,osaka");
  });

  it("Escape discards the draft: no change reported, the trigger keeps the committed tags", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        needConfirm
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["kyoto"]}
        onValueChange={onValueChange}
      />,
    );
    await openPanel(user);
    await user.click(option("東京"));
    await user.click(option("京都"));
    await user.keyboard("{Escape}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-value", "kyoto");
    expect(trigger).toHaveTextContent("京都");
    expect(trigger).not.toHaveTextContent("東京");

    // Reopening starts from the committed value, not the thrown-away draft.
    await openPanel(user);
    expect(option("京都")).toHaveAttribute("aria-selected", "true");
    expect(option("東京")).toHaveAttribute("aria-selected", "false");
  });

  it("an outside click discards the draft too", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        needConfirm
        options={OPTIONS}
        aria-label="都市"
        onValueChange={onValueChange}
      />,
    );
    await openPanel(user);
    await user.click(option("東京"));
    await user.click(document.body);

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox")).not.toHaveAttribute("data-value");
  });

  it("Clear empties the draft only; OK then commits the empty set", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        mode="multiple"
        needConfirm
        options={OPTIONS}
        aria-label="都市"
        defaultValue={["tokyo", "osaka"]}
        onValueChange={onValueChange}
      />,
    );
    await openPanel(user);
    await user.click(screen.getByRole("button", { name: CLEAR }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(option("東京")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("button", { name: CLEAR })).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveAttribute("data-value", "tokyo,osaka");

    await user.click(screen.getByRole("button", { name: OK }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith([], []);
  });

  it("a controlled close (open={false}) drops the draft too", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <Select
        mode="multiple"
        needConfirm
        open
        options={OPTIONS}
        aria-label="都市"
        onValueChange={onValueChange}
      />,
    );
    await user.click(await screen.findByRole("option", { name: "東京" }));
    expect(option("東京")).toHaveAttribute("aria-selected", "true");
    rerender(
      <Select
        mode="multiple"
        needConfirm
        open={false}
        options={OPTIONS}
        aria-label="都市"
        onValueChange={onValueChange}
      />,
    );
    rerender(
      <Select
        mode="multiple"
        needConfirm
        open
        options={OPTIONS}
        aria-label="都市"
        onValueChange={onValueChange}
      />,
    );
    expect(await screen.findByRole("option", { name: "東京" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("without needConfirm every toggle still commits at once (default unchanged)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select mode="multiple" options={OPTIONS} aria-label="都市" onValueChange={onValueChange} />,
    );
    await openPanel(user);
    await user.click(option("東京"));
    expect(onValueChange).toHaveBeenCalledWith(["tokyo"], [OPTIONS[0]]);
    expect(screen.queryByRole("button", { name: OK })).toBeNull();
  });

  it("maxTagCount collapses the confirmed picks into the shared overflow count", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select mode="multiple" needConfirm maxTagCount={1} options={OPTIONS} aria-label="都市" />,
    );
    await openPanel(user);
    await user.click(option("東京"));
    await user.click(option("大阪"));
    await user.click(option("京都"));
    await user.click(screen.getByRole("button", { name: OK }));

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("東京");
    // `dataEntry.selection.overflow` — the wording Cascader / TreeSelect / tags Select share.
    expect(trigger).toHaveTextContent("+2");
  });
});
