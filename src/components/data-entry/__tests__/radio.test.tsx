import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Radio } from "../radio";

const shipMethods = [
  { label: "Air — 3–5 ngày", value: "air" },
  { label: "Sea — 14–21 ngày", value: "sea" },
  { label: "Express Osaka", value: "express", disabled: true },
];

describe("Radio.Group", () => {
  it("renders radiogroup from options", () => {
    renderWithUi(<Radio.Group options={shipMethods} defaultValue="air" aria-label="Ship method" />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-slot", "radio-group");
    expect(screen.getByRole("radio", { name: /Air/ })).toHaveAttribute(
      "data-slot",
      "radio-group-item",
    );
    expect(screen.getByRole("radio", { name: /Air/ })).toBeChecked();
  });

  it("calls onValueChange when selection changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Radio.Group options={shipMethods} defaultValue="air" onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("radio", { name: /Sea/ }));
    expect(onValueChange).toHaveBeenCalledWith("sea");
  });

  it("skips disabled options", async () => {
    const user = userEvent.setup();
    renderWithUi(<Radio.Group options={shipMethods} defaultValue="air" />);
    expect(screen.getByRole("radio", { name: /Express Osaka/ })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: /Express Osaka/ }));
    expect(screen.getByRole("radio", { name: /Air/ })).toBeChecked();
  });
});

describe("Radio namespace", () => {
  it("exposes Group on Radio.Group", () => {
    expect(Radio.Group).toBeDefined();
  });
});
