import { describe, expect, it } from "vitest";
import { translate, translateCurrent, resetI18nLocale, syncI18nLocale } from "../translate";

describe("i18n translate", () => {
  it("returns primary locale message", () => {
    expect(translate("vi", "en", "common.cancel")).toBe("Hủy");
    expect(translate("en", "vi", "common.cancel")).toBe("Cancel");
  });

  it("falls back when key missing in primary", () => {
    expect(translate("vi", "en", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("interpolates params", () => {
    expect(translate("en", "vi", "common.selectedCount", { count: 3 })).toBe("3 selected");
  });

  it("syncI18nLocale drives translateCurrent", () => {
    resetI18nLocale();
    syncI18nLocale("ja", "en");
    expect(translateCurrent("common.retry")).toBe("再試行");
  });
});
