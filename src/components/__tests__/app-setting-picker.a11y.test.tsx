import { describe, it } from "vitest";
import { AppSettingPicker } from "../navigation/app-setting-picker";
import { expectNoA11yViolations } from "@/test/a11y";

// AppSettingPicker is a provider-bound Select (locale/timezone/date/time); it
// must carry an accessible label and reads its value from <AppProvider>, which
// the shared render helper supplies.
describe("AppSettingPicker a11y", () => {
  it("has no axe violations for the locale picker", async () => {
    await expectNoA11yViolations(<AppSettingPicker kind="locale" />);
  });
});
