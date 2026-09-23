import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import { AppProvider, useAppContext } from "../app-provider";
import { readStoredPreferences } from "../storage";
import {
  APP_THEMES,
  applyThemeAxes,
  applyPrimaryColor,
  isAppTheme,
  PREFERS_DARK_SCHEME_QUERY,
  resolveAppTheme,
} from "../theme-axes";
import { AA_NORMAL_TEXT, contrastRatio } from "../tenant-theme";

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

describe("temporary primary palette", () => {
  it("restores the original palette across project switches and preserves other theme axes", () => {
    const root = document.createElement("div");
    root.dataset.theme = "dark";
    root.style.setProperty("--primary", "210 50% 50%", "important");
    const restoreFirst = applyPrimaryColor(root, "#ff0000");
    expect(root.style.getPropertyValue("--primary")).toBe("0 100% 50%");
    expect(root.style.getPropertyValue("--primary-hover")).not.toBe("");
    const restoreSecond = applyPrimaryColor(root, "#0000ff", "#ffffff");
    expect(root.style.getPropertyValue("--primary")).toBe("240 100% 50%");
    expect(root.style.getPropertyValue("--primary-foreground")).toBe("0 0% 100%");
    restoreSecond();
    expect(root.style.getPropertyValue("--primary")).toBe("0 100% 50%");
    restoreFirst();
    expect(root.style.getPropertyValue("--primary")).toBe("210 50% 50%");
    expect(root.style.getPropertyPriority("--primary")).toBe("important");
    expect(root.style.getPropertyValue("--primary-hover")).toBe("");
    expect(root.dataset.theme).toBe("dark");
  });

  it.each(["", "red", "#nope00", "#fff; color:red"])("ignores invalid input %s", (color) => {
    const root = document.createElement("div");
    const restore = applyPrimaryColor(root, color);
    expect(root.style.cssText).toBe("");
    restore();
    expect(root.style.cssText).toBe("");
  });

  /**
   * gh#887 — A RE-SEED MUST NOT THROW AWAY THE FLOOR IT JUST COMPUTED.
   *
   * The three brand INKS were reset to `initial` AFTER `...seed.vars` was spread, so the same call
   * that walked each ink to 4.5:1 on the surface deleted the result one line later and a re-seeded
   * tree fell back to the unclamped ramp step. The reset itself is not the bug and is still there:
   * it guards against an ancestor theme's literal pinned to the PREVIOUS brand (gh#678, gh#664).
   * What was wrong was the ORDER.
   */
  describe("the brand inks survive the stale-pin reset (gh#887)", () => {
    // `#FFD400` is the seed the theme lab measured at 1.18-2.06:1 — the whole point of the floor.
    const CITRON = "#FFD400";
    // The DARKEST surface brand ink lands on in the package's light theme: `--accent` #ebe9e5.
    const INK_SURFACE = "#ebe9e5";
    const INKS = ["--text-link", "--text-brand", "--text-primary"] as const;

    const hexOf = (triplet: string) => {
      const [h, s, l] = triplet.split(/[\s%]+/).map(Number);
      const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
      const channel = (n: number) => {
        const k = (n + h / 30) % 12;
        const v = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * v)
          .toString(16)
          .padStart(2, "0");
      };
      return `#${channel(0)}${channel(8)}${channel(4)}`;
    };

    it("writes them as real triplets, not as `initial`", () => {
      const root = document.createElement("div");
      applyPrimaryColor(root, CITRON);
      for (const ink of INKS) {
        const value = root.style.getPropertyValue(ink);
        expect(value).not.toBe("initial");
        expect(value).toMatch(/^[\d.]+ [\d.]+% [\d.]+%$/);
      }
    });

    it("each one clears WCAG 2.2 AA on the surface it lands on", () => {
      const root = document.createElement("div");
      applyPrimaryColor(root, CITRON);
      for (const ink of INKS) {
        const ratio = contrastRatio(hexOf(root.style.getPropertyValue(ink)), INK_SURFACE) ?? 0;
        expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      }
      // And the seed itself does NOT — otherwise the assertion above is vacuous.
      expect(contrastRatio(CITRON, INK_SURFACE) ?? 0).toBeLessThan(AA_NORMAL_TEXT);
    });

    it("still resets a stale pin an ancestor left behind", () => {
      // The reason the three resets exist. An ancestor's pin must not outrank the new seed — here
      // the seed's own literal is what defeats it, which is why the reset may sit before the spread.
      const ancestor = document.createElement("div");
      ancestor.style.setProperty("--text-link", "200 100% 20%");
      const root = document.createElement("div");
      ancestor.append(root);
      applyPrimaryColor(root, CITRON);
      expect(root.style.getPropertyValue("--text-link")).not.toBe("200 100% 20%");
    });

    it("restores what was there on unmount", () => {
      const root = document.createElement("div");
      const restore = applyPrimaryColor(root, CITRON);
      restore();
      for (const ink of INKS) expect(root.style.getPropertyValue(ink)).toBe("");
    });
  });
});
