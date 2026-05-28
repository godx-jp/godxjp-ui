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
    });
  });

  describe("isAppDateFormat", () => {
    it("accepts known presets", () => {
      for (const format of APP_DATE_FORMATS) {
        expect(isAppDateFormat(format)).toBe(true);
      }
    });

    it("rejects unknown values", () => {
      expect(isAppDateFormat("ymd")).toBe(false);
      expect(isAppDateFormat(null)).toBe(false);
      expect(isAppDateFormat("")).toBe(false);
    });
  });
});
