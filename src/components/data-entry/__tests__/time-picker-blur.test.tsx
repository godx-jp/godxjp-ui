import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimePicker } from "../time-picker";

const field = () => screen.getByRole("combobox");

describe("TimePicker — input blur normalisation", () => {
  it("blur normalises a loose typed time to canonical HH:mm", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker />);
    await user.type(field(), "9:30");
    await user.tab();
    expect(field()).toHaveValue("09:30"); // normalized ?? branch
  });

  it("blur reverts unparseable text to the last valid value", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    await user.clear(field());
    await user.type(field(), "zz");
    await user.tab();
    expect(field()).toHaveValue("09:00"); // isValidHhmm(value) ? value branch
  });
});
