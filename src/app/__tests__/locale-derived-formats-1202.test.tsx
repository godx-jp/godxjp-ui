import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getDatetimeContext, resetDatetimeContextForTests } from "../../lib/datetime/sync";
import { AppProvider, useAppContext } from "../app-provider";

/**
 * gh#1202 — a Japanese user saw 10/02/2026. The date format was derived from the locale only at
 * mount and then STORED as if chosen, so a page once seen in English kept MM/DD/YYYY under ja.
 */
const KEY = "godxjp.test-1202";
let ctx: ReturnType<typeof useAppContext>;
function Probe() {
  ctx = useAppContext();
  return null;
}
const mount = (locale: "en" | "ja" | "vi" = "en") =>
  render(
    <AppProvider defaultLocale={locale} storageKey={KEY}>
      <Probe />
    </AppProvider>,
  );
const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? "{}");

beforeEach(() => window.localStorage.clear());
afterEach(() => window.localStorage.clear());

describe("date / time format follow the language until the viewer picks one (gh#1202)", () => {
  it("re-derives an unchosen format on a language switch, and does not store it", () => {
    mount("en");
    expect(ctx.dateFormat).toBe("mdy");
    act(() => ctx.setLocale("ja"));
    expect(ctx.dateFormat).toBe("ymd");
    expect(stored().locale).toBe("ja");
    expect(stored()).not.toHaveProperty("dateFormat");
    expect(stored()).not.toHaveProperty("timeFormat");
  });

  it("keeps a format the viewer picked across a language switch, and stores it as chosen", () => {
    mount("en");
    act(() => ctx.setDateFormat("dmy"));
    act(() => ctx.setLocale("ja"));
    expect(ctx.dateFormat).toBe("dmy");
    expect(stored()).toMatchObject({ dateFormat: "dmy", dateFormatChosen: true });
  });

  it("heals a value an older kit stored without the chosen flag", () => {
    // The real browser in the report: once English, now Japanese, MM/DD/YYYY frozen in storage.
    window.localStorage.setItem(KEY, JSON.stringify({ locale: "ja", dateFormat: "mdy" }));
    mount("en");
    expect(ctx.locale).toBe("ja");
    expect(ctx.dateFormat).toBe("ymd");
  });

  it("keeps a legacy unflagged value no locale derives (iso can only have been chosen)", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ locale: "ja", dateFormat: "iso" }));
    mount("en");
    expect(ctx.dateFormat).toBe("iso");
  });

  it("still honours a stored format that was picked", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ locale: "ja", dateFormat: "mdy", dateFormatChosen: true }),
    );
    mount("en");
    expect(ctx.dateFormat).toBe("mdy");
  });
});

describe("formatting with no AppProvider reads the page language (gh#1202)", () => {
  afterEach(() => {
    document.documentElement.lang = "";
    resetDatetimeContextForTests();
  });

  it("uses <html lang> (region dropped) instead of a fixed locale", () => {
    resetDatetimeContextForTests();
    document.documentElement.lang = "ja-JP";
    expect(getDatetimeContext()).toMatchObject({ locale: "ja", dateFormat: "ymd" });
    document.documentElement.lang = "en";
    expect(getDatetimeContext()).toMatchObject({ locale: "en", dateFormat: "mdy" });
  });

  it("falls back to the neutral default (en) for a language nobody registered", () => {
    resetDatetimeContextForTests();
    document.documentElement.lang = "fr";
    // v32 (gh#1219, decision A2): `<html lang>` if registered, else `en` — no longer `vi`.
    expect(getDatetimeContext().locale).toBe("en");
  });
});
