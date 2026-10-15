import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

/*
 * A date-time TYPED into a `showTime` field, in the exact format the field displays, must commit
 * on blur as it does on Enter. `needConfirm` (on by default with `showTime`) gated the blur path,
 * so tabbing away normalised the text to the typed date-time while `onValueChange` never fired —
 * a controlled form (qc.godx.jp "Manufactured on") saved no value at all.
 */
function Controlled({ spy, showTime }: { spy: (date: unknown) => void; showTime?: boolean }) {
  const [value, setValue] = React.useState<Date | undefined>();
  return (
    <>
      <DatePicker
        showTime={showTime}
        value={value}
        onValueChange={(date) => {
          spy(date);
          setValue(date as Date | undefined);
        }}
      />
      <button type="button">elsewhere</button>
    </>
  );
}

const field = () => screen.getAllByRole("combobox")[0];
const parts = (date: Date) => [
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
];

describe("DatePicker — typed text commits like a pick", () => {
  it.each(["enter", "blur"] as const)("showTime: displayed format commits on %s", async (how) => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithUi(<Controlled spy={spy} showTime />);
    await user.click(field());
    await user.type(field(), "2026-10-13 06:00");
    if (how === "enter") await user.keyboard("{Enter}");
    else await user.click(screen.getByText("elsewhere"));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(parts(spy.mock.calls[0][0] as Date)).toEqual([2026, 9, 13, 6, 0]);
    expect(field()).toHaveValue("2026-10-13 06:00");
  });

  it("showTime: an unparseable entry on blur keeps the previous value", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithUi(<Controlled spy={spy} showTime />);
    await user.click(field());
    await user.type(field(), "2026-10-13 06:00{Enter}");
    spy.mockClear();
    await user.clear(field());
    await user.type(field(), "not a date");
    await user.click(screen.getByText("elsewhere"));

    expect(spy).not.toHaveBeenCalledWith(undefined);
    expect(field()).toHaveValue("2026-10-13 06:00");
  });

  it("date only: displayed format commits on blur", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    renderWithUi(<Controlled spy={spy} />);
    await user.type(field(), "2026-10-13");
    await user.click(screen.getByText("elsewhere"));

    expect(spy).toHaveBeenLastCalledWith(expect.any(Date));
    expect(parts(spy.mock.calls.at(-1)![0] as Date).slice(0, 3)).toEqual([2026, 9, 13]);
    expect(field()).toHaveValue("2026-10-13");
  });
});
