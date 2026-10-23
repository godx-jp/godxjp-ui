import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";
import { FormField } from "../form-field";

/*
 * The calendar DIALOG was always named 「Mở lịch」 / 「カレンダーを開く」, whatever field opened it
 * (gino-cloud VD-328: the trigger read 「Mở lịch cho Ngày bắt đầu gián đoạn」, the dialog it opened
 * read 「Mở lịch」, and every day button inside was announced as being in dialog 「Mở lịch」).
 * gh#551 fixed the same collision on the trigger; the dialog kept the generic string.
 *
 * The dialog now takes the field's name: the field label first (FormField's `aria-labelledby`,
 * or a caller's own), then a caller `aria-label`, then `triggerLabel`, then the old default.
 */
async function openWith(name: string) {
  await userEvent.setup().click(screen.getByRole("button", { name }));
  return screen.getByRole("dialog");
}

describe("DatePicker calendar dialog name (gino VD-328)", () => {
  it("is labelled by the FormField label", async () => {
    renderWithUi(
      <FormField id="suspended_from" label="Ngày bắt đầu gián đoạn">
        <DatePicker id="suspended_from" triggerLabel="Mở lịch cho Ngày bắt đầu gián đoạn" />
      </FormField>,
    );
    const dialog = await openWith("Mở lịch cho Ngày bắt đầu gián đoạn");
    expect(screen.getByRole("dialog", { name: "Ngày bắt đầu gián đoạn" })).toBe(dialog);
  });

  it("is labelled by the field label for a range too", async () => {
    renderWithUi(
      <FormField id="period" label="Thời gian">
        <DatePicker id="period" range />
      </FormField>,
    );
    await openWith("Mở lịch");
    expect(screen.getByRole("dialog", { name: "Thời gian" })).toBeTruthy();
  });

  it("takes a caller aria-label when there is no label element", async () => {
    renderWithUi(<DatePicker aria-label="受験日" />);
    await openWith("Mở lịch");
    expect(screen.getByRole("dialog", { name: "受験日" })).toBeTruthy();
  });

  it("falls back to triggerLabel outside a field", async () => {
    renderWithUi(<DatePicker triggerLabel="開始日のカレンダーを開く" />);
    await openWith("開始日のカレンダーを開く");
    expect(screen.getByRole("dialog", { name: "開始日のカレンダーを開く" })).toBeTruthy();
  });

  it("keeps the catalogue default when nothing names the field", async () => {
    renderWithUi(<DatePicker />);
    await openWith("Mở lịch");
    expect(screen.getByRole("dialog", { name: "Mở lịch" })).toBeTruthy();
  });
});
