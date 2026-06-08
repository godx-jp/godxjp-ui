import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TagInput } from "../tag-input";

const field = () => screen.getByRole("textbox");

describe("TagInput — controlled / placeholder / empty blur", () => {
  it("controlled value: commit emits onValueChange without self-mutating", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagInput value={["経費"]} onValueChange={onValueChange} aria-label="タグ" />);
    await user.type(field(), "出張{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(["経費", "出張"]);
    // controlled → still shows only the prop value until the parent updates it
    expect(screen.getByText("経費")).toBeInTheDocument();
    expect(screen.queryByText("出張")).toBeNull();
  });

  it("hides the placeholder once at least one tag exists", () => {
    render(<TagInput value={["x"]} placeholder="タグを追加" aria-label="t" />);
    expect(field()).not.toHaveAttribute("placeholder");
  });

  it("shows the placeholder when empty", () => {
    render(<TagInput placeholder="タグを追加" aria-label="t" />);
    expect(field()).toHaveAttribute("placeholder", "タグを追加");
  });

  it("blurring an empty draft does not commit", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagInput onValueChange={onValueChange} aria-label="t" />);
    await user.click(field());
    await user.tab(); // blur with empty draft → no-op
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
