import { afterEach, describe, expect, it } from "vitest";
import * as React from "react";
import { act, render, renderHook } from "@testing-library/react";
import { AppProvider, useAppContext } from "../app-provider";
import { readStoredPreferences } from "../storage";

/**
 * `persist` takes a LIST as well as a boolean, because the preference axes do not share an owner.
 *
 * A hosted app resolves the locale per request (cookie / account row / header) and hands it to the
 * provider as a prop — but storage is read AFTER the props, so a stored locale wins over the one
 * the server just sent. With a single all-or-nothing flag the only escape is `persist={false}`,
 * which also throws away the viewer's theme. Naming the axes keeps both owners.
 */

const KEY = "godxjp.app.persist-axes.test";

afterEach(() => localStorage.removeItem(KEY));

function mount(persist: Parameters<typeof AppProvider>[0]["persist"], locale: "ja" | "en" = "ja") {
  return renderHook(() => useAppContext(), {
    wrapper: ({ children }) => (
      <AppProvider storageKey={KEY} persist={persist} defaultLocale={locale}>
        {children}
      </AppProvider>
    ),
  });
}

describe("per-axis persistence", () => {
  it("writes only the named axes, and leaves the server-owned ones out of storage", () => {
    const { result } = mount(["theme", "density"]);

    act(() => result.current.setTheme("dark"));
    act(() => result.current.setDensity("compact"));
    act(() => result.current.setLocale("en"));

    const stored = readStoredPreferences(KEY);
    expect(stored.theme).toBe("dark");
    expect(stored.density).toBe("compact");
    expect(stored.locale).toBeUndefined();
  });

  it("does not let an unnamed stored axis override the prop on the next mount", () => {
    // Written by an earlier build that persisted everything — the exact shape that made a hosted
    // app pin itself to a stale locale.
    localStorage.setItem(KEY, JSON.stringify({ locale: "en", theme: "dark" }));

    const { result } = mount(["theme"], "ja");

    expect(result.current.locale).toBe("ja");
    expect(result.current.theme).toBe("dark");
  });

  it("keeps `true` meaning every axis and `false` meaning none", () => {
    const all = mount(true);
    act(() => all.result.current.setTheme("dark"));
    act(() => all.result.current.setLocale("en"));
    expect(readStoredPreferences(KEY).theme).toBe("dark");
    expect(readStoredPreferences(KEY).locale).toBe("en");

    localStorage.removeItem(KEY);
    const none = mount(false);
    act(() => none.result.current.setTheme("dark"));
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("survives an inline array — a new identity every render must not reset the axes", () => {
    // A consumer writes `persist={["theme"]}` inline, so the array is a NEW OBJECT on every
    // render of its parent. Keyed by identity, the init effect re-runs on each of those renders
    // and snaps every axis back to its initial prop — the chosen theme included. This mounts the
    // provider under a parent that actually re-renders, because `renderHook`'s bare `rerender()`
    // does not re-create the wrapper's props and cannot show the difference.
    // Measured on an axis that is NOT persisted: a persisted one is restored from storage on the
    // re-run, so it cannot tell a stable memo from a re-initialising one. `locale` is left to the
    // server here, so a re-run snaps it back to `defaultLocale` and the runtime choice is lost.
    let bump: () => void = () => {};
    let api: ReturnType<typeof useAppContext> | undefined;

    function Probe() {
      api = useAppContext();
      return null;
    }

    function Parent() {
      const [, setTick] = React.useState(0);
      bump = () => setTick((t) => t + 1);
      return (
        <AppProvider storageKey={KEY} persist={["theme"]} defaultLocale="ja">
          <Probe />
        </AppProvider>
      );
    }

    render(<Parent />);
    act(() => api!.setTheme("dark"));
    act(() => api!.setLocale("en"));
    expect(api!.locale).toBe("en");

    act(() => bump());
    act(() => bump());

    expect(api!.locale).toBe("en");
    expect(api!.theme).toBe("dark");
  });
});
