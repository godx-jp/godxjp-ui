import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import userEvent from "@testing-library/user-event";

import { SwitchField } from "../switch-field";

describe("SwitchField", () => {
  it("links label to switch and submits hidden 0/1", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <form aria-label="test">
        <SwitchField id="active" name="is_active" label="Active" defaultChecked={false} />
      </form>,
    );

    const toggle = screen.getByRole("switch", { name: "Active" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    const hidden = document.querySelector('input[type="hidden"][name="is_active"]');
    expect(hidden).toHaveValue("0");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(hidden).toHaveValue("1");
  });

  it("shows error and wires aria-invalid on the switch", () => {
    renderWithUi(<SwitchField id="flag" name="flag" label="Flag" error="Invalid" defaultChecked />);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");
  });

  it("supports controlled checked state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    renderWithUi(
      <SwitchField
        id="dg"
        name="is_dg"
        label="Dangerous goods"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
