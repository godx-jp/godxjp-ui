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
      ["ja", "iso"],
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

    it("returns English label when locale is en", () => {
      expect(getDateFormatLabel("mdy", "en", "vi")).toMatch(/Month|Day|Year/i);
    });
  });

  it("exports option list for pickers", () => {
    expect(APP_DATE_FORMAT_OPTIONS.map((o) => o.value)).toEqual(["iso", "dmy", "mdy"]);
  });
});
