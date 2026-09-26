import { afterEach, describe, expect, it } from "vitest";
import { getDateFnsLocale } from "../../../app/locales";
import { resolveHydrationSafeTimezone } from "../../../app/timezones";
import { formatDate } from "../format-date";
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
      dateFormat: "mdy",
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
    // AppProvider's OWN unconfigured answer, from the same function (gh#968) — this used to pin
    // `Asia/Ho_Chi_Minh`, i.e. it locked in the disagreement the issue is about.
    expect(getDatetimeContext().timezone).toBe(resolveHydrationSafeTimezone("browser"));
    expect(canUseLiveRelativeFormatting()).toBe(true);
  });
});

describe("the fallback says the same thing AppProvider says (gh#968)", () => {
  it("unconfigured means UTC — not a zone that looks right when it is wrong", () => {
    resetDatetimeContextForTests();
    // The bare literal on purpose, beside the function-based assertion above: if someone changed
    // BOTH to a plausible-looking zone, the shared function would still agree with itself.
    expect(getDatetimeContext().timezone).toBe("UTC");
    expect(getDatetimeContext().timezone).not.toBe("Asia/Ho_Chi_Minh");
  });

  it("an instant formatted before AppProvider syncs reads as UTC, visibly not local", () => {
    // The consumer's actual failure: a JST attendance stamp shown 2 hours off, looking normal.
    // 05:30Z is 14:30 in Tokyo and 12:30 in Ho Chi Minh; unconfigured it must be neither.
    resetDatetimeContextForTests();
    const shown = formatDate("2026-05-01T05:30:00Z", { kind: "datetime" });
    expect(shown).toContain("05:30");
    expect(shown).not.toContain("12:30");
    expect(shown).not.toContain("14:30");
  });

  it("once AppProvider syncs, its zone wins — the fallback only covers the gap", () => {
    resetDatetimeContextForTests();
    syncDatetimeContext({
      locale: "ja",
      timezone: "Asia/Tokyo",
      timeFormat: "24h",
      dateFormat: "iso",
    });
    expect(formatDate("2026-05-01T05:30:00Z", { kind: "datetime" })).toContain("14:30");
  });
});
