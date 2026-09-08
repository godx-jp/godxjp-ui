import { describe, expect, it } from "vitest";
import { AppSettingPicker } from "../navigation/app-setting-picker";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi, screen } from "@/test/render";

// AppSettingPicker is a provider-bound Select (locale/timezone/date/time); it
// must carry an accessible label and reads its value from <AppProvider>, which
// the shared render helper supplies.
describe("AppSettingPicker a11y", () => {
  it("has no axe violations for the locale picker", async () => {
    await expectNoA11yViolations(<AppSettingPicker kind="locale" />);
  });

  it('has no axe violations for the bar cell (appearance="bar")', async () => {
    /*
     * `bar` drops the value text exactly as `icon` does, so the localized aria-label is again the
     * ONLY accessible name — and it changes the box and the hover surface, which is where a
     * contrast regression would land. Same drops, different paint, so it gets its own case rather
     * than riding on `icon`'s.
     */
    await expectNoA11yViolations(<AppSettingPicker kind="theme" appearance="bar" />);
  });

  it('has no axe violations for the icon-only (appearance="icon") locale trigger', async () => {
    await expectNoA11yViolations(<AppSettingPicker kind="locale" appearance="icon" />);
  });

  it("the icon-only trigger exposes an accessible name (never nameless)", () => {
    renderWithUi(<AppSettingPicker kind="locale" appearance="icon" />);
    expect(screen.getByRole("combobox")).toHaveAccessibleName();
  });
});
