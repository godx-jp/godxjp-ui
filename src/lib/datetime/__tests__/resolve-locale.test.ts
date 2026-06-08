import { describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../../app/locales";
import { formatAppDate } from "../format";

const date = new Date(2026, 2, 15);

describe("datetime resolveLocale (via formatAppDate locale option)", () => {
  it("accepts a string locale code (resolved to a date-fns locale)", () => {
    expect(typeof formatAppDate(date, { locale: "en" })).toBe("string");
  });

  it("accepts an explicit date-fns Locale object", () => {
    expect(typeof formatAppDate(date, { locale: getDateFnsLocale("ja") })).toBe("string");
  });

  it("falls back to the synced context locale when none is given", () => {
    expect(typeof formatAppDate(date)).toBe("string");
  });
});
