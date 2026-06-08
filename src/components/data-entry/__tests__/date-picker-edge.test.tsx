import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

const field = () => screen.getByRole("combobox");

describe("DatePicker — input handler edges", () => {
  it("uses an explicit placeholder when provided", () => {
    renderWithUi(<DatePicker placeholder="日付を選択" />);
    expect(field()).toHaveAttribute("placeholder", "日付を選択");
  });

  it("Escape while the calendar is closed is a no-op", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 1)} />);
    expect(field()).toHaveAttribute("aria-expanded", "false");
    await user.type(field(), "{Escape}"); // `&& open` is false → nothing happens
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("a key the field does not handle does not open the calendar", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 1)} />);
    field().focus();
    await user.keyboard("{ArrowUp}"); // only ArrowDown opens; ArrowUp is ignored
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });
});
