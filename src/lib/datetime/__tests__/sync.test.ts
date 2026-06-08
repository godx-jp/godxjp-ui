import { afterEach, describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../../app/locales";
import {
  canUseLiveRelativeFormatting,
  disableLiveRelativeFormatting,
  enableLiveRelativeFormatting,
  getDatetimeContext,
  resetDatetimeContextForTests,
  syncDatetimeContext,
} from "../sync";

afterEach(() => {
  resetDatetimeContextForTests();
});

describe("syncDatetimeContext", () => {
  it("derives dateFnsLocale from the locale when none is supplied", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Tokyo",
      timeFormat: "12h",
      dateFormat: "iso",
    });
    const ctx = getDatetimeContext();
    expect(ctx.locale).toBe("en");
    expect(ctx.timezone).toBe("Asia/Tokyo");
    expect(ctx.timeFormat).toBe("12h");
    expect(ctx.dateFormat).toBe("iso");
    expect(ctx.dateFnsLocale).toBe(getDateFnsLocale("en")); // fallback branch
  });

  it("uses an explicitly supplied dateFnsLocale", () => {
    const ja = getDateFnsLocale("ja");
    syncDatetimeContext({
      locale: "ja",
      timezone: "Asia/Tokyo",
      timeFormat: "24h",
      dateFormat: "ymd",
      dateFnsLocale: ja,
    });
    expect(getDatetimeContext().dateFnsLocale).toBe(ja);
  });
});

describe("live relative formatting toggle", () => {
  it("defaults to enabled and can be disabled / re-enabled", () => {
    expect(canUseLiveRelativeFormatting()).toBe(true);
    disableLiveRelativeFormatting();
    expect(canUseLiveRelativeFormatting()).toBe(false);
    enableLiveRelativeFormatting();
    expect(canUseLiveRelativeFormatting()).toBe(true);
  });
});

describe("resetDatetimeContextForTests", () => {
  it("restores the default vi context and re-enables live formatting", () => {
    syncDatetimeContext({
      locale: "en",
      timezone: "Asia/Tokyo",
      timeFormat: "12h",
      dateFormat: "iso",
    });
    disableLiveRelativeFormatting();
    resetDatetimeContextForTests();
    expect(getDatetimeContext().locale).toBe("vi");
    expect(getDatetimeContext().timezone).toBe("Asia/Ho_Chi_Minh");
    expect(canUseLiveRelativeFormatting()).toBe(true);
  });
});
