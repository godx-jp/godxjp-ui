import { describe, expect, it, beforeEach } from "vitest";
import { getDateFnsLocale } from "../../app/locales";
import {
  formatAppDateTime,
  formatCalendarDate,
  formatTimeOfDay,
  normalizeHhmm,
  resetDatetimeContextForTests,
  syncDatetimeContext,
} from "../datetime";

describe("datetime (timezone-aware)", () => {
  beforeEach(() => {
    resetDatetimeContextForTests();
  });

  it("formatAppDateTime shifts instant by timezone", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Ho_Chi_Minh",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    // 2026-05-01T14:30:00Z → 21:30 in Ho Chi Minh (UTC+7)
    expect(formatAppDateTime("2026-05-01T14:30:00Z")).toMatch(/2026-05-01 21:30/);
  });

  it("formatAppDateTime differs across timezones", () => {
    const iso = "2026-05-01T14:30:00Z";
    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Tokyo",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    expect(formatAppDateTime(iso)).toMatch(/2026-05-01 23:30/);

    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Ho_Chi_Minh",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    expect(formatAppDateTime(iso)).toMatch(/2026-05-01 21:30/);
  });

  it("formatCalendarDate uses calendar parts in app timezone", () => {
    syncDatetimeContext({
      locale: "vi",
      timezone: "Asia/Tokyo",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("vi"),
    });
    const picked = new Date(2026, 4, 2); // May 2 local — treated as calendar date
    expect(formatCalendarDate(picked)).toBe("2026-05-02");
  });

  it("formatTimeOfDay respects 12h format", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Ho_Chi_Minh",
      timeFormat: "12h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    expect(formatTimeOfDay("14:30")).toMatch(/2:30 PM/);
  });

  it("normalizeHhmm pads single-digit hours", () => {
    expect(normalizeHhmm("9:30")).toBe("09:30");
    expect(normalizeHhmm("25:00")).toBeNull();
  });
});
