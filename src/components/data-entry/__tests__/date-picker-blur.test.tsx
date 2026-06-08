import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

const field = () => screen.getByRole("combobox");

describe("DatePicker — blur normalisation", () => {
  it("blur keeps a parseable date as canonical ISO (parsed branch)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker onValueChange={onValueChange} />);
    await user.type(field(), "2026-03-20");
    await user.tab(); // onBlur: parsed present → setText(toIsoDate(parsed))
    expect(field()).toHaveValue("2026-03-20");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.any(Date));
  });
});
