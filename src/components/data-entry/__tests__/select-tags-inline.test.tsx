import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select } from "../select";

describe("TagInput", () => {
  it("Enter commits the draft as a tag and clears the field", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole, getByText } = render(
      <Select mode="tags" open={false} onValueChange={onValueChange} aria-label="タグ" />,
    );
    const input = getByRole("textbox");
    await user.type(input, "経費{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(["経費"]);
    expect(getByText("経費")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("comma also commits; duplicates are ignored", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <Select
        mode="tags"
        open={false}
        defaultValue={["a"]}
        onValueChange={onValueChange}
        aria-label="タグ"
      />,
    );
    const input = getByRole("textbox");
    await user.type(input, "b,");
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
    onValueChange.mockClear();
    await user.type(input, "a{Enter}"); // duplicate
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Backspace on an empty draft removes the last tag", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <Select
        mode="tags"
        open={false}
        defaultValue={["x", "y"]}
        onValueChange={onValueChange}
        aria-label="タグ"
      />,
    );
    await user.click(getByRole("textbox"));
    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenCalledWith(["x"]);
  });

  it("the per-tag remove button deletes that tag", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <Select
        mode="tags"
        open={false}
        defaultValue={["経費", "交通費"]}
        onValueChange={onValueChange}
        aria-label="タグ"
      />,
    );
    await user.click(getByRole("button", { name: /経費/ }));
    expect(onValueChange).toHaveBeenCalledWith(["交通費"]);
  });

  it("blur commits a non-empty draft", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <div>
        <Select mode="tags" open={false} onValueChange={onValueChange} aria-label="タグ" />
        <button>外</button>
      </div>,
    );
    await user.type(getByRole("textbox"), "未確定");
    await user.click(getByRole("button", { name: "外" }));
    expect(onValueChange).toHaveBeenCalledWith(["未確定"]);
  });

  it("submits the joined value via a hidden input when `name` is set", () => {
    const { container } = render(
      <Select mode="tags" open={false} value={["a", "b"]} name="tags" aria-label="タグ" />,
    );
    expect(container.querySelector('input[type="hidden"][name="tags"]')).toHaveValue("a,b");
  });

  it("disabled hides the remove buttons and blocks the field", () => {
    const { getByRole, queryByRole } = render(
      <Select mode="tags" open={false} value={["a"]} disabled aria-label="タグ" />,
    );
    expect(getByRole("textbox")).toBeDisabled();
    expect(queryByRole("button")).toBeNull();
  });

  it("disabled marks the container aria-disabled so its dimmed chips are exempt from the contrast check (gh#175)", () => {
    // The disabled control is dimmed to --disabled-opacity; that composite drops the chip
    // text/background contrast below AA. `aria-disabled` flags it as an inactive control so the
    // rendered a11y check (axe color-contrast) skips it — parity with native disabled controls.
    const { container } = render(
      <Select mode="tags" open={false} value={["a", "b"]} disabled aria-label="タグ" />,
    );
    expect(container.querySelector('[data-slot="tag-input"]')).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("enabled does not set aria-disabled (only the disabled state is inactive)", () => {
    const { container } = render(
      <Select mode="tags" open={false} value={["a"]} aria-label="タグ" />,
    );
    expect(container.querySelector('[data-slot="tag-input"]')).not.toHaveAttribute("aria-disabled");
  });
});
