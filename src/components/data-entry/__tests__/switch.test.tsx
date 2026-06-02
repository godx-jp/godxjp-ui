import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import userEvent from "@testing-library/user-event";

import { ChoiceField } from "../choice-field";
import { Switch } from "../switch";

describe("Switch", () => {
  it("links label to switch and submits hidden 0/1", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <form aria-label="test">
        <ChoiceField id="active" label="Active">
          <Switch id="active" name="is_active" defaultChecked={false} />
        </ChoiceField>
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

  it("wires aria-invalid on the switch", () => {
    renderWithUi(
      <ChoiceField id="flag" label="Flag">
        <Switch id="flag" name="flag" aria-invalid defaultChecked />
      </ChoiceField>,
    );

    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");
  });

  it("supports controlled checked state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    renderWithUi(
      <ChoiceField id="dg" label="Dangerous goods">
        <Switch id="dg" name="is_dg" checked={false} onCheckedChange={onCheckedChange} />
      </ChoiceField>,
    );

    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
