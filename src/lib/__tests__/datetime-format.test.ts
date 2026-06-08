import { beforeEach, describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../app/locales";
import {
  formatAppDate,
  formatAppDateLong,
  formatAppRelative,
  formatAppTime,
  formatCalendarDate,
  formatTimeOfDay,
  resetDatetimeContextForTests,
  syncDatetimeContext,
} from "../datetime";

const EN_HCM = {
  locale: "en" as const,
  timezone: "Asia/Ho_Chi_Minh",
  timeFormat: "24h" as const,
  dateFormat: "iso" as const,
  dateFnsLocale: getDateFnsLocale("en"),
};

describe("datetime/format — remaining formatters", () => {
  beforeEach(() => {
    resetDatetimeContextForTests();
    syncDatetimeContext(EN_HCM);
  });

  it("formatAppDate: ISO date-only string formats without timezone shifting", () => {
    expect(formatAppDate("2026-05-01")).toBe("2026-05-01");
  });

  it("formatAppDate: ISO instant uses the date part in app timezone", () => {
    // 23:30 UTC → next day in UTC+7
    expect(formatAppDate("2026-05-01T23:30:00Z")).toBe("2026-05-02");
  });

  it("formatAppDate / Time / Long / Relative all return the dash for null", () => {
    expect(formatAppDate(null)).toBe("—");
    expect(formatAppTime(undefined)).toBe("—");
    expect(formatAppDateLong(null)).toBe("—");
    expect(formatAppRelative(null)).toBe("—");
    expect(formatCalendarDate(null)).toBe("—");
    expect(formatTimeOfDay("")).toBe("—");
  });

  it("formatAppTime: 24h time in app timezone", () => {
    expect(formatAppTime("2026-05-01T14:30:00Z")).toBe("21:30");
  });

  it("formatAppDateLong: produces a long localized date (PPP)", () => {
    const out = formatAppDateLong("2026-05-01T03:00:00Z");
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/May/);
  });

  it("formatAppRelative: returns a suffixed relative phrase", () => {
    const out = formatAppRelative("2000-01-01T00:00:00Z");
    expect(out).toMatch(/ago/);
  });

  it("formatTimeOfDay: formats a valid HH:mm, echoes an invalid one", () => {
    expect(formatTimeOfDay("09:05")).toBe("09:05");
    // hhmmToTZDate returns null for an out-of-range value → the raw string is echoed
    expect(formatTimeOfDay("99:99")).toBe("99:99");
  });
});
