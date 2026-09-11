import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/** Fail fast when a single test hangs (infinite loop, missing await, etc.). */
vi.setConfig({ testTimeout: 8_000 });

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

/** jsdom polyfills for Radix / cmdk */
if (typeof Element !== "undefined") {
  Object.assign(Element.prototype, {
    hasPointerCapture: () => false,
    setPointerCapture: () => undefined,
    releasePointerCapture: () => undefined,
    scrollIntoView: vi.fn(),
  });
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
);

if (typeof window.localStorage?.removeItem !== "function") {
  const storage = new Map<string, string>();

  vi.stubGlobal("localStorage", {
    get length() {
      return storage.size;
    },
    clear: vi.fn(() => {
      storage.clear();
    }),
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, String(value));
    }),
  });
}
