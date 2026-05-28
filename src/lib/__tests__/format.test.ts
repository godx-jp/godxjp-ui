import { describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../app/locales";
import { syncDatetimeContext } from "../datetime";
import {
  formatBytes,
  formatCurrency,
  formatDateTime,
  formatRelative,
  formatTime,
  humanError,
  shortId,
} from "../format";

describe("format helpers", () => {
  it("formatDateTime returns dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });

  it("formatDateTime formats ISO string in synced timezone", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "UTC",
      timeFormat: "24h",
      dateFormat: "iso",
      dateFnsLocale: getDateFnsLocale("en"),
    });
    expect(formatDateTime("2026-05-01T14:30:00Z")).toMatch(/2026-05-01 14:30/);
  });

  it("formatTime respects 12h vs 24h", () => {
    const d = "2026-05-01T14:30:00Z";
    expect(formatTime(d, { timeFormat: "24h" })).toMatch(/\d{2}:\d{2}/);
    expect(formatTime(d, { timeFormat: "12h" })).toMatch(/PM|AM|am|pm/);
  });

  it("formatRelative returns relative phrase", () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    expect(formatRelative(recent)).toMatch(/minute/i);
  });

  it("formatBytes scales units", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });

  it("formatCurrency formats minor units", () => {
    expect(formatCurrency(1995, "USD")).toMatch(/19\.95/);
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
