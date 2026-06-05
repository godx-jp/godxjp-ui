import { describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../app/locales";
import { syncDatetimeContext } from "../datetime";
import {
  formatAppDateTime,
  formatAppRelative,
  formatAppTime,
  formatBytes,
  formatCurrency,
  humanError,
  shortId,
} from "../format";

describe("format helpers", () => {
  it("formatAppDateTime returns dash for null", () => {
    expect(formatAppDateTime(null)).toBe("—");
  });

  it("formatAppDateTime formats ISO string in synced timezone", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "UTC",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    expect(formatAppDateTime("2026-05-01T14:30:00Z")).toMatch(/2026-05-01 14:30/);
  });

  it("formatAppTime respects 12h vs 24h", () => {
    const d = "2026-05-01T14:30:00Z";
    expect(formatAppTime(d, { timeFormat: "24h" })).toMatch(/\d{2}:\d{2}/);
    expect(formatAppTime(d, { timeFormat: "12h" })).toMatch(/PM|AM|am|pm/);
  });

  it("formatAppRelative returns relative phrase", () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    expect(formatAppRelative(recent)).toMatch(/minute/i);
  });

  it("formatBytes scales units with a locale-correct number", () => {
    // Pin the locale so the decimal separator is deterministic (default is the synced locale).
    expect(formatBytes(512, "en-US")).toBe("512 B");
    expect(formatBytes(2048, "en-US")).toBe("2.0 KB");
    expect(formatBytes(2048, "vi")).toBe("2,0 KB"); // locale separator, not a hardcoded "."
  });

  it("formatCurrency formats minor units in the given locale", () => {
    expect(formatCurrency(1995, "USD", "en-US")).toMatch(/\$19\.95/);
    expect(formatCurrency(100000, "JPY", "ja-JP")).toMatch(/￥|¥/); // 0 minor units from CLDR
  });

  it("shortId truncates long ids", () => {
    expect(shortId("0123456789abcdef")).toBe("01234567…");
  });

  it("humanError extracts message from Error", () => {
    expect(humanError(new Error("fail"))).toBe("fail");
    expect(humanError(new Error("500 Bad: body"))).toBe("body");
  });

  it("humanError returns generic for non-Error", () => {
    expect(humanError("plain")).toMatch(/retry|thử lại|再試行/i);
  });
});
