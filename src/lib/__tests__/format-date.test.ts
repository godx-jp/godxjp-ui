import { describe, expect, it, beforeEach } from "vitest";
import { getDateFnsLocale } from "../../app/locales";
import {
  detectFormatDateKind,
  disableLiveRelativeFormatting,
  formatDate,
  formatCalendarDate,
  resetDatetimeContextForTests,
  syncDatetimeContext,
} from "../datetime";

describe("formatDate (unified) — regression suite", () => {
  beforeEach(() => {
    resetDatetimeContextForTests();
    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Ho_Chi_Minh",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
  });

  it("auto-detects ISO date-only string", () => {
    expect(formatDate("2026-05-01")).toBe("2026-05-01");
    expect(detectFormatDateKind("2026-05-01")).toBe("date");
  });

  it("auto-detects HH:mm time string", () => {
    expect(formatDate("14:30", { kind: "auto" })).toBe("14:30");
    expect(detectFormatDateKind("14:30")).toBe("time");
  });

  it("auto-detects ISO datetime instant with timezone shift", () => {
    expect(formatDate("2026-05-01T14:30:00Z")).toMatch(/2026-05-01 21:30/);
  });

  it("uses AppProvider defaults when options omitted", () => {
    expect(formatDate("2026-05-01T14:30:00Z", { kind: "datetime" })).toMatch(/21:30/);
  });

  it("allows per-call timezone override", () => {
    expect(formatDate("2026-05-01T14:30:00Z", { kind: "datetime", timezone: "UTC" })).toMatch(
      /2026-05-01 14:30/,
    );
    expect(
      formatDate("2026-05-01T14:30:00Z", { kind: "datetime", timezone: "Asia/Tokyo" }),
    ).toMatch(/2026-05-01 23:30/);
  });

  it("formats calendar Date with kind calendar", () => {
    expect(formatDate(new Date(2026, 4, 2), { kind: "calendar" })).toBe("2026-05-02");
  });

  it("uses dateFormat from context for date-only strings (dmy)", () => {
    syncDatetimeContext({
      locale: "vi",
      timezone: "Asia/Ho_Chi_Minh",
      timeFormat: "24h",
      dateFormat: "dmy",
      dateFnsLocale: getDateFnsLocale("vi"),
    });
    expect(formatDate("2026-05-01")).toBe("01/05/2026");
  });

  it("uses dateFormat iso for ja default (yyyy-MM-dd)", () => {
    syncDatetimeContext({
      locale: "ja",
      timezone: "Asia/Tokyo",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("ja"),
    });
    expect(formatDate("2026-05-01")).toBe("2026-05-01");
    expect(formatDate("2026-05-01T14:30:00Z", { kind: "datetime" })).toMatch(/2026-05-01 23:30/);
  });

  it("uses dateFormat mdy for en (MM/dd/yyyy)", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "UTC",
      timeFormat: "12h",
      dateFormat: "mdy",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    expect(formatDate("2026-05-01")).toBe("05/01/2026");
  });

  it("uses deterministic absolute output for initial relative formatting", () => {
    const value = "2026-05-01T14:30:00Z";

    disableLiveRelativeFormatting();

    expect(formatDate(value, { kind: "relative" })).toBe(
      formatDate(value, { kind: "datetime" }),
    );
  });

  it("formatCalendarDate respects dateFormat override per call", () => {
    expect(formatCalendarDate(new Date(2026, 4, 2), { dateFormat: "dmy" })).toBe("02/05/2026");
  });

  it("returns em dash for empty values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});
