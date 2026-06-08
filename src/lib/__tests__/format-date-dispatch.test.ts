import { beforeEach, describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../app/locales";
import { formatDate, isFormatDateValue } from "../datetime/format-date";
import { resetDatetimeContextForTests, syncDatetimeContext } from "../datetime";

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

const INSTANT = "2026-05-01T14:30:00Z"; // 21:30 in UTC+7

describe("formatDate — empty guards", () => {
  it("returns the dash for null / undefined / empty / whitespace", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("   ")).toBe("—");
  });

  it("returns the dash for an invalid Date", () => {
    expect(formatDate(new Date("nope"))).toBe("—");
  });
});

describe("formatDate — string kinds (explicit)", () => {
  it("auto-detects a valid HH:mm as a time", () => {
    expect(formatDate("09:05")).toBe("09:05");
  });
  it('kind="time" on an instant falls through to formatAppTime', () => {
    expect(formatDate(INSTANT, { kind: "time" })).toBe("21:30");
  });
  it('kind="date" formats the date part', () => {
    expect(formatDate(INSTANT, { kind: "date" })).toBe("2026-05-01");
  });
  it('kind="long" produces a long localized date', () => {
    expect(formatDate(INSTANT, { kind: "long" })).toMatch(/May/);
  });
  it('kind="datetime" (default) shows date + time', () => {
    expect(formatDate(INSTANT, { kind: "datetime" })).toMatch(/2026-05-01 21:30/);
  });
  it('kind="relative" returns a phrase', () => {
    expect(formatDate("2000-01-01T00:00:00Z", { kind: "relative" })).toBeTruthy();
  });
});

describe("formatDate — Date object kinds", () => {
  const d = new Date(INSTANT);
  it("calendar flag formats calendar parts", () => {
    expect(formatDate(new Date(2026, 4, 2), { calendar: true })).toBe("2026-05-02");
  });
  it('kind="date" on a Date uses calendar formatting', () => {
    expect(formatDate(new Date(2026, 4, 2), { kind: "date" })).toBe("2026-05-02");
  });
  it('kind="time" / "long" / "datetime" on a Date', () => {
    expect(formatDate(d, { kind: "time" })).toBe("21:30");
    expect(formatDate(d, { kind: "long" })).toMatch(/May/);
    expect(formatDate(d, { kind: "datetime" })).toMatch(/21:30/);
  });
  it('kind="relative" on a Date', () => {
    expect(formatDate(new Date("2000-01-01T00:00:00Z"), { kind: "relative" })).toBeTruthy();
  });
});

describe("isFormatDateValue", () => {
  it("accepts valid Date, HH:mm and date strings", () => {
    expect(isFormatDateValue(new Date())).toBe(true);
    expect(isFormatDateValue("14:30")).toBe(true);
    expect(isFormatDateValue("2026-05-01")).toBe(true);
  });
  it("rejects invalid Date, non-strings and empties", () => {
    expect(isFormatDateValue(new Date("nope"))).toBe(false);
    expect(isFormatDateValue(123)).toBe(false);
    expect(isFormatDateValue("")).toBe(false);
    expect(isFormatDateValue("   ")).toBe(false);
    expect(isFormatDateValue("not a date")).toBe(false);
  });
});
