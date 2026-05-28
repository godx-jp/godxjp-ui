import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Checkbox } from "../checkbox";

const exportDocs = [
  { label: "Commercial invoice", value: "invoice" },
  { label: "Packing list", value: "packing" },
  { label: "MSDS (pin lithium)", value: "msds" },
];

describe("Checkbox.Group", () => {
  it("renders group from options with default selection", () => {
    renderWithUi(
      <Checkbox.Group options={exportDocs} defaultValue={["invoice"]} aria-label="Export docs" />,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Commercial invoice/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Packing list/ })).not.toBeChecked();
  });

  it("toggles values and calls onChange with array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <Checkbox.Group options={exportDocs} defaultValue={["invoice"]} onChange={onChange} />,
    );

    await user.click(screen.getByRole("checkbox", { name: /Packing list/ }));
    expect(onChange).toHaveBeenLastCalledWith(["invoice", "packing"]);

    await user.click(screen.getByRole("checkbox", { name: /Commercial invoice/ }));
    expect(onChange).toHaveBeenLastCalledWith(["packing"]);
  });
});

describe("Checkbox namespace", () => {
  it("exposes Group on Checkbox.Group", () => {
    expect(Checkbox.Group).toBeDefined();
  });
});
