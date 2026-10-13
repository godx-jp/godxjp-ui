import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";

import { AppProvider, useAppContext } from "../app-provider";
import { readStoredPreferences, writeStoredPreferences } from "../storage";
import { godxPreset } from "../../themes/godx";

/**
 * gh#1282 — the godx preset pinned `timeZone: "Asia/Ho_Chi_Minh"`, AppProvider used it as the
 * default zone, and `persist` wrote that default to storage. A viewer in Tokyo saw 06:13 JST as
 * 04:13. Now the preset pins nothing, only a zone the viewer PICKED is stored, and the pinned value
 * an older kit left behind (unflagged) is dropped on hydration.
 */
const KEY = "godxjp.app.test-1282";
const BROWSER_ZONE = "Asia/Tokyo";

function wrapper({ children }: React.PropsWithChildren) {
  return (
    <AppProvider preset={godxPreset} storageKey={KEY} persist={["timezone"]}>
      {children}
    </AppProvider>
  );
}

describe("godx preset timezone (gh#1282)", () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
    const real = Intl.DateTimeFormat.prototype.resolvedOptions;
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (
      this: Intl.DateTimeFormat,
    ) {
      return { ...real.call(this), timeZone: BROWSER_ZONE };
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(KEY);
  });

  it("the preset pins no zone", () => {
    expect(godxPreset.timeZone).toBeUndefined();
  });

  it("an app on the preset shows the viewer's browser zone, not Vietnam's", async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    await waitFor(() => expect(result.current.timezone).toBe(BROWSER_ZONE));
  });

  it("a default zone is not written to storage — only a picked one, with its flag", async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    await waitFor(() => expect(result.current.timezone).toBe(BROWSER_ZONE));
    act(() => result.current.setLocale("en"));
    expect(readStoredPreferences(KEY).timezone).toBeUndefined();
    act(() => result.current.setTimezone("Europe/Berlin"));
    expect(readStoredPreferences(KEY)).toMatchObject({
      timezone: "Europe/Berlin",
      timezoneChosen: true,
    });
  });

  it("the unflagged Asia/Ho_Chi_Minh an older kit stored is dropped on hydration", async () => {
    writeStoredPreferences(KEY, { timezone: "Asia/Ho_Chi_Minh" });
    const { result } = renderHook(() => useAppContext(), { wrapper });
    await waitFor(() => expect(result.current.timezone).toBe(BROWSER_ZONE));
  });

  it("a PICKED Asia/Ho_Chi_Minh is kept", async () => {
    writeStoredPreferences(KEY, { timezone: "Asia/Ho_Chi_Minh", timezoneChosen: true });
    const { result } = renderHook(() => useAppContext(), { wrapper });
    await waitFor(() => expect(result.current.timezone).toBe("Asia/Ho_Chi_Minh"));
  });

  it("any other unflagged zone from an older kit is kept as before", async () => {
    writeStoredPreferences(KEY, { timezone: "America/New_York" });
    const { result } = renderHook(() => useAppContext(), { wrapper });
    await waitFor(() => expect(result.current.timezone).toBe("America/New_York"));
  });
});
