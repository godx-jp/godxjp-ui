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
    // `role="radio"` is the real `<input>` react-aria renders; the painted dot is the `<label>`
    // around it and carries the slot (same split as Checkbox and Switch).
    expect(
      screen.getByRole("radio", { name: /Air/ }).closest('[data-slot="radio-group-item"]'),
    ).not.toBeNull();
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

describe("selector surface (godx-jp/id#501)", () => {
  it("keeps BOTH halves findable: the role on the input, the paint on data-slot", () => {
    // 23.0.0 dropped Radix, and with it the `role="radio"` attribute the painted <label> carried.
    // The role is now implicit on a real <input type="radio"> inside it, so the accessible tree is
    // unchanged — but every selector a consumer wrote as `[role="radio"]` silently returns 0. One
    // measured an a11y test flipping from red to GREEN on upgrade while the defect it checked was
    // still there: the rule had stopped seeing anything. Pin both halves so neither can vanish
    // quietly again.
    const { container } = renderWithUi(
      <Radio.Group options={shipMethods} defaultValue="air" aria-label="Ship method" />,
    );

    expect(screen.getByRole("radio", { name: /Air/ })).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="radio"]').length).toBe(shipMethods.length);
    expect(container.querySelectorAll('[data-slot="radio-group-item"]').length).toBe(
      shipMethods.length,
    );
    // And the attribute selector that used to work no longer does — stated, not implied.
    expect(container.querySelectorAll('[role="radio"]').length).toBe(0);
  });
});
