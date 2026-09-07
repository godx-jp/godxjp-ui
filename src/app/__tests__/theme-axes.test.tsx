import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import { AppProvider, useAppContext } from "../app-provider";
import { readStoredPreferences } from "../storage";
import {
  APP_THEMES,
  applyThemeAxes,
  isAppTheme,
  PREFERS_DARK_SCHEME_QUERY,
  resolveAppTheme,
} from "../theme-axes";

/**
 * A controllable `prefers-color-scheme` — the setup file's stub is frozen at `matches: false` and
 * swallows listeners, so a live-follow assertion made against it can only ever pass vacuously.
 */
function mockPrefersDark(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = initial;
  vi.spyOn(window, "matchMedia").mockImplementation(
    (media: string) =>
      ({
        media,
        get matches() {
          return media === PREFERS_DARK_SCHEME_QUERY ? matches : false;
        },
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          listeners.delete(listener);
        },
      }) as unknown as MediaQueryList,
  );
  return {
    set(next: boolean) {
      matches = next;
      for (const listener of [...listeners]) {
        listener({ matches: next } as MediaQueryListEvent);
      }
    },
    listenerCount: () => listeners.size,
  };
}

function html() {
  return document.documentElement;
}

afterEach(() => {
  for (const k of ["theme", "brand", "density", "fontSize"]) delete html().dataset[k];
  html().style.removeProperty("--scaling");
  vi.restoreAllMocks();
});

describe("applyThemeAxes", () => {
  it("writes data-* attributes for set axes", () => {
    applyThemeAxes(html(), { theme: "dark", density: "compact", fontSize: "sm" });
    expect(html().dataset.theme).toBe("dark");
    expect(html().dataset.density).toBe("compact");
    expect(html().dataset.fontSize).toBe("sm"); // camelCase → data-font-size
  });

  it("sets data-brand for a preset and removes it for null (opt-out)", () => {
    applyThemeAxes(html(), { brand: "crm" });
    expect(html().dataset.brand).toBe("crm");
    applyThemeAxes(html(), { brand: null });
    expect(html().dataset.brand).toBeUndefined();
  });

  it("leaves untouched the axes not passed", () => {
    html().dataset.theme = "dark";
    applyThemeAxes(html(), { density: "comfortable" });
    expect(html().dataset.theme).toBe("dark");
    expect(html().dataset.density).toBe("comfortable");
  });

  it("sets inline --scaling for a number and removes it for null (defer to density)", () => {
    applyThemeAxes(html(), { scaling: 0.95 });
    expect(html().style.getPropertyValue("--scaling")).toBe("0.95");
    applyThemeAxes(html(), { scaling: null });
    expect(html().style.getPropertyValue("--scaling")).toBe("");
  });
});

describe("AppProvider theme axes", () => {
  it("applies the axis props onto <html> (brand opt-out → no data-brand)", () => {
    render(
      <AppProvider persist={false} density="compact" fontSize="sm" theme="dark">
        <div />
      </AppProvider>,
    );
    expect(html().dataset.density).toBe("compact");
    expect(html().dataset.fontSize).toBe("sm");
    expect(html().dataset.theme).toBe("dark");
    expect(html().dataset.brand).toBeUndefined();
  });

  it("emits data-brand when a brand preset is given", () => {
    render(
      <AppProvider persist={false} brand="logistics">
        <div />
      </AppProvider>,
    );
    expect(html().dataset.brand).toBe("logistics");
  });
});

describe("theme: system", () => {
  it('offers three choices and accepts "system" as a stored value', () => {
    expect(APP_THEMES).toEqual(["light", "dark", "system"]);
    expect(isAppTheme("system")).toBe(true);
  });

  it("resolves the choice against prefers-color-scheme", () => {
    const scheme = mockPrefersDark(true);
    expect(resolveAppTheme("system")).toBe("dark");
    scheme.set(false);
    expect(resolveAppTheme("system")).toBe("light");
  });

  it("passes an explicit light/dark choice through untouched (stored values keep working)", () => {
    mockPrefersDark(true);
    expect(resolveAppTheme("light")).toBe("light");
    expect(resolveAppTheme("dark")).toBe("dark");
  });

  it('never writes data-theme="system" — the DOM carries the RESOLUTION', () => {
    const scheme = mockPrefersDark(true);
    applyThemeAxes(html(), { theme: "system" });
    expect(html().dataset.theme).toBe("dark");
    scheme.set(false);
    applyThemeAxes(html(), { theme: "system" });
    expect(html().dataset.theme).toBe("light");
  });

  it("resolves to light where matchMedia does not exist (SSR / bare jsdom)", () => {
    // `resolveAppTheme` guards on the FUNCTION existing, so blank it out entirely.
    const original = window.matchMedia;
    const define = (value: unknown) =>
      Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value });
    define(undefined);
    expect(resolveAppTheme("system")).toBe("light");
    define(original);
  });

  it("follows the OS live — a listener, not a one-shot read at mount", () => {
    const scheme = mockPrefersDark(false);
    render(
      <AppProvider persist={false} theme="system">
        <div />
      </AppProvider>,
    );
    expect(html().dataset.theme).toBe("light");
    expect(scheme.listenerCount()).toBeGreaterThan(0);

    act(() => scheme.set(true));
    expect(html().dataset.theme).toBe("dark");

    act(() => scheme.set(false));
    expect(html().dataset.theme).toBe("light");
  });

  it("stops listening once the choice leaves system", () => {
    const scheme = mockPrefersDark(false);
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider persist={false} theme="system">
          {children}
        </AppProvider>
      ),
    });
    expect(scheme.listenerCount()).toBe(1);

    act(() => result.current.setTheme("light"));
    expect(scheme.listenerCount()).toBe(0);
    act(() => scheme.set(true));
    expect(html().dataset.theme).toBe("light");
  });

  it('persists the CHOICE, not the resolved value — storing "dark" would stop following the OS', () => {
    const storageKey = "godxjp.app.theme-system.test";
    localStorage.removeItem(storageKey);
    mockPrefersDark(true);
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ({ children }) => (
        <AppProvider storageKey={storageKey} persist>
          {children}
        </AppProvider>
      ),
    });

    act(() => result.current.setTheme("system"));

    expect(readStoredPreferences(storageKey).theme).toBe("system");
    expect(html().dataset.theme).toBe("dark");
    localStorage.removeItem(storageKey);
  });
});
