import { describe, expect, it } from "vitest";
import {
  APP_DATE_FORMATS,
  getDatePattern,
  getDateTimePattern,
  isAppDateFormat,
} from "../date-formats";

describe("date-formats", () => {
  describe("getDatePattern", () => {
    it.each([
      ["iso", "yyyy-MM-dd"],
      // The Japanese business form. It is a SEPARATE value from `iso` because the separator is the
      // whole difference: a 請求書 is written 2026/05/01, never 2026-05-01.
      ["ymd", "yyyy/MM/dd"],
      ["dmy", "dd/MM/yyyy"],
      ["mdy", "MM/dd/yyyy"],
    ] as const)("maps %s → %s", (format, pattern) => {
      expect(getDatePattern(format)).toBe(pattern);
    });
  });

  describe("getDateTimePattern", () => {
    it("combines date pattern + 24h time", () => {
      expect(getDateTimePattern("24h", "iso")).toBe("yyyy-MM-dd HH:mm");
      expect(getDateTimePattern("24h", "dmy")).toBe("dd/MM/yyyy HH:mm");
    });

    it("combines date pattern + 12h time", () => {
      expect(getDateTimePattern("12h", "mdy")).toBe("MM/dd/yyyy h:mm a");
      expect(getDateTimePattern("24h", "ymd")).toBe("yyyy/MM/dd HH:mm");
    });
  });

  describe("isAppDateFormat", () => {
    it("accepts known presets", () => {
      for (const format of APP_DATE_FORMATS) {
        expect(isAppDateFormat(format)).toBe(true);
      }
    });

    it("rejects unknown values", () => {
      // `ymd` used to be the example of an unknown value here. It is a preset now, which is why
      // the guard reads APP_DATE_FORMATS instead of repeating the union: a value added to the list
      // and forgotten in the guard would be rejected out of storage and silently reset.
      expect(isAppDateFormat("ydm")).toBe(false);
      expect(isAppDateFormat(null)).toBe(false);
      expect(isAppDateFormat("")).toBe(false);
    });
  });
});
