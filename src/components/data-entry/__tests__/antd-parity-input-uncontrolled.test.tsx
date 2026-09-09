import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import { ColorPicker } from "../color-picker";
import { TagInput } from "../tag-input";

/**
 * THE CONTROLLED-WITHOUT-A-HANDLER FREEZE, pinned.
 *
 * `<ColorPicker />` used to destructure `value = "#2563eb"` with no `defaultValue` and no internal
 * state, so a picker with no wiring was permanently stuck on a brand blue baked into the framework:
 * every pick fired `onValueChange` into nothing and the swatch never moved. The triad
 * (`value` / `defaultValue` / `onValueChange`) is what makes the uncontrolled case work, and the
 * absence of a literal default is what keeps a brand colour out of `src/components/`.
 */

// vi is the default test locale (see test/render).
const HEX_LABEL = "Mã màu hex";
const SWATCH_LABEL = "Chọn màu";

function hexField() {
  return screen.getByRole("textbox", { name: HEX_LABEL }) as HTMLInputElement;
}
function swatch() {
  return screen.getByLabelText(SWATCH_LABEL) as HTMLInputElement;
}

describe("ColorPicker — uncontrolled (antd parity: the controlled triad)", () => {
  it("starts EMPTY: no brand colour is invented when nothing was given", () => {
    renderWithUi(<ColorPicker />);
    expect(hexField()).toHaveValue("");
    // The native swatch still needs a legal colour — the HTML default, not a design decision.
    expect(swatch()).toHaveValue("#000000");
  });

  it("an unwired picker is NOT frozen: a pick sticks with no onValueChange at all", () => {
    renderWithUi(<ColorPicker />);
    fireEvent.change(swatch(), { target: { value: "#ff0000" } });
    expect(swatch()).toHaveValue("#ff0000");
    expect(hexField()).toHaveValue("#ff0000");
  });

  it("defaultValue seeds the uncontrolled state and is then overwritten by a pick", () => {
    renderWithUi(<ColorPicker defaultValue="#123456" />);
    expect(hexField()).toHaveValue("#123456");
    fireEvent.change(swatch(), { target: { value: "#abcdef" } });
    expect(hexField()).toHaveValue("#abcdef");
  });

  it("uncontrolled still reports every commit through onValueChange", () => {
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker defaultValue="#123456" onValueChange={onValueChange} />);
    fireEvent.change(swatch(), { target: { value: "#abcdef" } });
    expect(onValueChange).toHaveBeenCalledWith("#abcdef");
  });

  it("a CONTROLLED picker still obeys its parent: value wins over an internal pick", () => {
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    fireEvent.change(swatch(), { target: { value: "#ff0000" } });
    expect(onValueChange).toHaveBeenCalledWith("#ff0000");
    // The parent ignored it, so the control must not drift away from the prop.
    expect(hexField()).toHaveValue("#2563eb");
  });
});

describe("ColorPicker — native form submission", () => {
  it("`name` emits a hidden field carrying the hex", () => {
    const { container } = renderWithUi(<ColorPicker name="brand" defaultValue="#00ff00" />);
    const hidden = container.querySelector('input[type="hidden"][name="brand"]');
    expect(hidden).toHaveValue("#00ff00");
  });

  it("an unset picker submits EMPTY, not the swatch's legal-but-invented #000000", () => {
    const { container } = renderWithUi(<ColorPicker name="brand" />);
    expect(container.querySelector('input[type="hidden"][name="brand"]')).toHaveValue("");
  });

  it("no `name` means no hidden field at all", () => {
    const { container } = renderWithUi(<ColorPicker defaultValue="#00ff00" />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

/**
 * JAPANESE INPUT. Between `compositionstart` and `compositionend` the box holds a CANDIDATE, and
 * the Enter that ends a conversion means "accept this 変換" — not "commit this field". TagInput
 * committed on every Enter, so 「とうきょう」→「東京」landed the half-converted reading as a tag
 * and swallowed the keystroke the IME needed. NumberInput / SearchInput / Textarea already guard
 * this (antd-parity-ime.test.tsx); TagInput was the hole.
 */
describe("TagInput — IME composition", () => {
  it("the Enter that CONFIRMS a conversion does not commit a tag", () => {
    const onValueChange = vi.fn();
    renderWithUi(<TagInput aria-label="タグ" onValueChange={onValueChange} />);
    const field = screen.getByRole("textbox");

    fireEvent.focus(field);
    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "とうきょう" } });
    // The IME swallows this Enter to accept the candidate.
    fireEvent.keyDown(field, { key: "Enter", isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(field).toHaveValue("とうきょう");
  });

  it("the Enter AFTER the conversion is confirmed commits the converted text", () => {
    const onValueChange = vi.fn();
    renderWithUi(<TagInput aria-label="タグ" onValueChange={onValueChange} />);
    const field = screen.getByRole("textbox");

    fireEvent.focus(field);
    fireEvent.compositionStart(field);
    fireEvent.change(field, { target: { value: "とうきょう" } });
    fireEvent.keyDown(field, { key: "Enter", isComposing: true });
    fireEvent.change(field, { target: { value: "東京" } });
    fireEvent.compositionEnd(field, { data: "東京" });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith(["東京"]);
  });

  it("Backspace mid-conversion does not eat the previous tag", () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <TagInput aria-label="タグ" defaultValue={["東京"]} onValueChange={onValueChange} />,
    );
    const field = screen.getByRole("textbox");

    fireEvent.compositionStart(field);
    // The draft is still "" as far as React state is concerned — without the composition guard
    // this Backspace would remove 東京 while the user was only deleting a kana.
    fireEvent.keyDown(field, { key: "Backspace", isComposing: true });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("TagInput — allowClear + readOnly", () => {
  it("no clear ✕ by default (antd's own default for a tags field)", () => {
    renderWithUi(<TagInput aria-label="タグ" defaultValue={["a", "b"]} />);
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
  });

  it("allowClear drops EVERY tag in one gesture and fires onClear", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    renderWithUi(
      <TagInput
        aria-label="タグ"
        defaultValue={["a", "b"]}
        allowClear
        onValueChange={onValueChange}
        onClear={onClear}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
    expect(onClear).toHaveBeenCalled();
  });

  it("the allowClear OBJECT form overrides the accessible label", () => {
    renderWithUi(
      <TagInput aria-label="タグ" defaultValue={["a"]} allowClear={{ label: "Reset tags" }} />,
    );
    expect(screen.getByRole("button", { name: "Reset tags" })).toBeInTheDocument();
  });

  it("readOnly keeps the value and the tab stop but withdraws every mutation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <TagInput
        aria-label="タグ"
        defaultValue={["東京"]}
        readOnly
        allowClear
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getByRole("textbox");
    // Still focusable (unlike `disabled`) …
    expect(field).not.toBeDisabled();
    expect(field).toHaveAttribute("readonly");
    // … and the tag is still there, but nothing can remove or add one.
    expect(screen.getByText("東京")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa 東京" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa" })).not.toBeInTheDocument();
    await user.type(field, "大阪{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("readOnly still submits its value natively", () => {
    const { container } = renderWithUi(
      <TagInput aria-label="タグ" name="tags" defaultValue={["a", "b"]} readOnly />,
    );
    expect(container.querySelector('input[type="hidden"][name="tags"]')).toHaveValue("a,b");
  });
});
