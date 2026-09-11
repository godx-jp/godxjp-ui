import { describe, expect, it } from "vitest";
import {
  APP_DATE_FORMAT_OPTIONS,
  getDateFormatLabel,
  resolveDefaultDateFormat,
} from "../date-format-labels";

describe("date-format-labels", () => {
  describe("resolveDefaultDateFormat", () => {
    it.each([
      ["vi", "dmy"],
      // ja → `ymd`, not `iso`: a Japanese business document writes 2026/05/01. The old default
      // is what made a Japanese-first consumer ship its own formatter as a stopgap.
      ["ja", "ymd"],
      ["en", "mdy"],
    ] as const)("locale %s → %s", (locale, expected) => {
      expect(resolveDefaultDateFormat(locale)).toBe(expected);
    });
  });

  describe("getDateFormatLabel", () => {
    it("returns Vietnamese label for dmy", () => {
      expect(getDateFormatLabel("dmy", "vi", "en")).toMatch(/Ngày|Tháng|Năm/);
    });

    it("returns Japanese ISO label", () => {
      expect(getDateFormatLabel("iso", "ja", "en")).toMatch(/YYYY-MM-DD/);
    });

    it("names the slash form apart from the hyphen form in Japanese", () => {
      // Two year-first presets one keystroke apart in a picker: the labels have to differ, or the
      // list reads as the same option twice.
      const ymd = getDateFormatLabel("ymd", "ja", "en");
      expect(ymd).toMatch(/YYYY\/MM\/DD/);
      expect(ymd).not.toBe(getDateFormatLabel("iso", "ja", "en"));
    });

    it("returns English label when locale is en", () => {
      expect(getDateFormatLabel("mdy", "en", "vi")).toMatch(/Month|Day|Year/i);
    });
  });

  it("exports option list for pickers", () => {
    expect(APP_DATE_FORMAT_OPTIONS.map((o) => o.value)).toEqual(["iso", "ymd", "dmy", "mdy"]);
  });
});
