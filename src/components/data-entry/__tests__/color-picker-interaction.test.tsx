import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, fireEvent } from "@/test/render";

import { ColorPicker } from "../color-picker";

/**
 * Behavioral interaction tests for ColorPicker — codified from real interaction so
 * future runs need no browser MCP (`pnpm test`).
 *
 * Real model (see color-picker.tsx):
 * - The hex <Input> shows `draft ?? value`. Typing updates a LOCAL draft only, so the
 *   text sticks while editing (it is NOT frozen).
 * - `commit` runs on blur or Enter: it normalizes (prepends `#` if missing) and validates
 *   against /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/. Valid → clears draft + fires
 *   onValueChange(normalized). Invalid → drops draft, reverting the field to `value`.
 * - The native type="color" swatch input fires onChange → commit directly.
 * - `disabled` disables both inputs.
 */

// vi default locale (see test/render): hex Input aria-label = "Mã màu hex".
const HEX_LABEL = "Mã màu hex";

function getHex() {
  return screen.getByRole("textbox", { name: HEX_LABEL }) as HTMLInputElement;
}

describe("ColorPicker — hex input interaction", () => {
  it("typing into the hex field STICKS while editing (draft, not frozen)", async () => {
    const user = userEvent.setup();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={() => {}} />);
    const hex = getHex();

    await user.clear(hex);
    await user.type(hex, "#ff0000");
    // Draft holds the typed text even though `value` prop is still #2563eb.
    expect(hex).toHaveValue("#ff0000");
  });

  it("Enter commits a valid hex → onValueChange fires with the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    const hex = getHex();

    await user.clear(hex);
    await user.type(hex, "#00ff00{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("#00ff00");
  });

  it("commit normalizes a missing '#' prefix", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    const hex = getHex();

    await user.clear(hex);
    await user.type(hex, "abcdef{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("#abcdef");
  });

  it("accepts the 3-digit short hex form", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    const hex = getHex();

    await user.clear(hex);
    await user.type(hex, "#f00{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("#f00");
  });

  it("blur commits a valid hex", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <>
        <ColorPicker value="#2563eb" onValueChange={onValueChange} />
        <button type="button">elsewhere</button>
      </>,
    );
    const hex = getHex();

    await user.clear(hex);
    await user.type(hex, "#123456");
    await user.click(screen.getByRole("button", { name: "elsewhere" }));
    expect(onValueChange).toHaveBeenCalledWith("#123456");
  });

  it("invalid hex on commit is rejected and the field reverts to value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    const hex = getHex();

    await user.clear(hex);
    await user.type(hex, "nothex{Enter}");
    // commit drops the draft → field shows the controlled value again.
    expect(hex).toHaveValue("#2563eb");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("controlled value prop is reflected in the hex field", () => {
    renderWithUi(<ColorPicker value="#abcdef" onValueChange={() => {}} />);
    expect(getHex()).toHaveValue("#abcdef");
  });

  it("native color swatch change fires onValueChange", () => {
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} />);
    // The type="color" input has aria-label "Chọn màu".
    const swatch = screen.getByLabelText("Chọn màu") as HTMLInputElement;
    fireEvent.change(swatch, { target: { value: "#abcdef" } });
    expect(onValueChange).toHaveBeenCalledWith("#abcdef");
  });
});

describe("ColorPicker — disabled & options", () => {
  it("disabled blocks editing the hex field and disables the swatch", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={onValueChange} disabled />);
    const hex = getHex();

    expect(hex).toBeDisabled();
    expect(screen.getByLabelText("Chọn màu")).toBeDisabled();
    await user.type(hex, "#ffffff");
    expect(hex).toHaveValue("#2563eb");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("showHexInput={false} hides the hex field but keeps the swatch", () => {
    renderWithUi(<ColorPicker value="#2563eb" onValueChange={() => {}} showHexInput={false} />);
    expect(screen.queryByRole("textbox", { name: HEX_LABEL })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Chọn màu")).toBeInTheDocument();
  });
});
