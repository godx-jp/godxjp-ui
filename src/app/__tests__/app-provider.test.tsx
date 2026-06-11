import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, renderHook, act, waitFor } from "@testing-library/react";
import * as React from "react";
import { AppProvider, useAppContext } from "../app-provider";
import { getAppRequestHeaders, resetAppRequestHeaders } from "../request-headers";
import { resetI18nLocale } from "../../i18n/translate";
import { formatDate, resetDatetimeContextForTests } from "../../lib/datetime";
import { readStoredPreferences, writeStoredPreferences } from "../storage";

const STORAGE_KEY = "godxjp.app.test";

function wrapper(props: React.PropsWithChildren<{ persist?: boolean }>) {
  return (
    <AppProvider
      storageKey={STORAGE_KEY}
      persist={props.persist ?? false}
      defaultLocale="vi"
      fallbackLocale="en"
      defaultTimezone="Asia/Tokyo"
    >
      {props.children}
    </AppProvider>
  );
}

describe("AppProvider", () => {
  beforeEach(() => {
    resetAppRequestHeaders();
    resetI18nLocale();
    resetDatetimeContextForTests();
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it("initializes locale and timezone and syncs request headers", () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => wrapper({ children }),
    });

    expect(result.current.locale).toBe("vi");
    expect(result.current.timezone).toBe("Asia/Tokyo");
    expect(getAppRequestHeaders()).toEqual({
      "x-locale": "vi",
      "x-timezone": "Asia/Tokyo",
      "x-time-format": "24h",
      "x-date-format": "dmy",
    });
  });

  it("syncs datetime context before children render", () => {
    function DirectFormatter() {
      return <span>{formatDate("2026-05-01T14:30:00Z", { kind: "datetime" })}</span>;
    }

    const { getByText } = render(
      <AppProvider
        storageKey={STORAGE_KEY}
        persist={false}
        defaultLocale="ja"
        defaultTimezone="Asia/Tokyo"
        defaultDateFormat="iso"
        defaultTimeFormat="24h"
      >
        <DirectFormatter />
      </AppProvider>,
    );

    expect(getByText("2026-05-01 23:30")).toBeInTheDocument();
  });

  it("updates headers when locale and timezone change", () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => wrapper({ children }),
    });

    act(() => {
      result.current.setLocale("ja");
      result.current.setTimezone("Asia/Ho_Chi_Minh");
      result.current.setTimeFormat("12h");
      result.current.setDateFormat("iso");
    });

    expect(result.current.requestHeaders).toEqual({
      "x-locale": "ja",
      "x-timezone": "Asia/Ho_Chi_Minh",
      "x-time-format": "12h",
      "x-date-format": "iso",
    });
    expect(getAppRequestHeaders()["x-locale"]).toBe("ja");
  });

  it("persists preferences to localStorage", () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => wrapper({ children, persist: true }),
    });

    act(() => {
      result.current.setLocale("en");
      result.current.setTimezone("UTC");
      result.current.setTimeFormat("12h");
      result.current.setDateFormat("mdy");
    });

    // Theme axes ride in the same persisted object (defaults: light / default / default;
    // brand opt-out → undefined). readStoredPreferences drops undefined brand.
    expect(readStoredPreferences(STORAGE_KEY)).toEqual({
      locale: "en",
      timezone: "UTC",
      timeFormat: "12h",
      dateFormat: "mdy",
      theme: "light",
      density: "default",
      fontSize: "default",
      brand: undefined,
    });
  });

  it("restores persisted preferences after hydration", async () => {
    writeStoredPreferences(STORAGE_KEY, {
      locale: "ja",
      timezone: "Asia/Singapore",
      timeFormat: "12h",
      dateFormat: "iso",
    });

    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => wrapper({ children, persist: true }),
    });

    await waitFor(() => {
      expect(result.current.locale).toBe("ja");
      expect(result.current.timezone).toBe("Asia/Singapore");
      expect(result.current.timeFormat).toBe("12h");
      expect(result.current.dateFormat).toBe("iso");
    });
  });

  it("calls onLocaleChange and onTimezoneChange", () => {
    const onLocaleChange = vi.fn();
    const onTimezoneChange = vi.fn();

    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider
          storageKey={STORAGE_KEY}
          persist={false}
          onLocaleChange={onLocaleChange}
          onTimezoneChange={onTimezoneChange}
        >
          {children}
        </AppProvider>
      ),
    });

    act(() => {
      result.current.setLocale("en");
      result.current.setTimezone("UTC");
    });

    expect(onLocaleChange).toHaveBeenCalledWith("en");
    expect(onTimezoneChange).toHaveBeenCalledWith("UTC");
  });

  it("derives default time format from locale when defaultTimeFormat is locale", () => {
    const { result: enResult } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false} defaultLocale="en">
          {children}
        </AppProvider>
      ),
    });
    expect(enResult.current.timeFormat).toBe("12h");

    const { result: viResult } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false} defaultLocale="vi">
          {children}
        </AppProvider>
      ),
    });
    expect(viResult.current.timeFormat).toBe("24h");
  });

  it("derives default date format from locale when defaultDateFormat is locale", () => {
    const { result: enResult } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false} defaultLocale="en">
          {children}
        </AppProvider>
      ),
    });
    expect(enResult.current.dateFormat).toBe("mdy");

    const { result: viResult } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false} defaultLocale="vi">
          {children}
        </AppProvider>
      ),
    });
    expect(viResult.current.dateFormat).toBe("dmy");

    const { result: jaResult } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false} defaultLocale="ja">
          {children}
        </AppProvider>
      ),
    });
    expect(jaResult.current.dateFormat).toBe("iso");
  });

  it("throws outside AppProvider", () => {
    expect(() => renderHook(() => useAppContext())).toThrow(/AppProvider/);
  });

  it("exposes timezoneOptions on context when configured", () => {
    const zones = ["Asia/Tokyo", "Asia/Ho_Chi_Minh"] as const;
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false} timezoneOptions={zones}>
          {children}
        </AppProvider>
      ),
    });
    expect(result.current.timezoneOptions).toEqual(zones);
  });

  it("timezoneOptions undefined means full IANA list in picker", () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={STORAGE_KEY} persist={false}>
          {children}
        </AppProvider>
      ),
    });
    expect(result.current.timezoneOptions).toBeUndefined();
  });

  it("calls onDateFormatChange when date format updates", () => {
    const onDateFormatChange = vi.fn();
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider
          storageKey={STORAGE_KEY}
          persist={false}
          onDateFormatChange={onDateFormatChange}
        >
          {children}
        </AppProvider>
      ),
    });

    act(() => {
      result.current.setDateFormat("iso");
    });

    expect(onDateFormatChange).toHaveBeenCalledWith("iso");
  });
});
