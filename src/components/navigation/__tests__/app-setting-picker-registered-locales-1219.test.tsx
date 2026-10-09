import { describe, expect, it } from "vitest";

import { registerLocale } from "../../../app/locales";
import { AppSettingPicker } from "../app-setting-picker";
import { renderWithUi, screen, userEvent } from "@/test/render";

/**
 * v32 (gh#1219): the language picker lists every REGISTERED locale, not just vi/en/ja. A locale a
 * host registers is named in its own language (an endonym), the convention for a language picker.
 */
describe("AppSettingPicker kind=locale lists registered locales (gh#1219)", () => {
  it("offers a runtime-registered locale, named in itself, beside the built-ins", async () => {
    registerLocale({ code: "de" });
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="inline" value="en" onValueChange={() => {}} />,
    );
    await userEvent.setup().click(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: "Deutsch" })).toBeInTheDocument();
    // The built-ins keep their translated labels (the test page is lang="vi").
    expect(screen.getAllByRole("option").length).toBeGreaterThanOrEqual(4);
  });
});
