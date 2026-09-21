import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/* THE TIMEOUT LIVES IN vitest.config.ts, AND THIS LINE USED TO MAKE THAT A LIE.
 *
 * `vi.setConfig({ testTimeout: 8_000 })` here overrides the config file at runtime, so the number
 * a reader finds in `vitest.config.ts` — the file whose whole job is to hold it — did nothing. I
 * raised that number to 20s to fix five CI timeouts, pushed it, and CI reported "Test timed out in
 * 8000ms" on the very next run. Two sources for one value, and the authoritative-looking one was
 * the dead one.
 *
 * The intent was right and is kept: fail fast when a test hangs, rather than letting a missing
 * `await` burn the job's whole budget. It is expressed once now, in the config, where it is
 * discoverable — with the measurement of why 8s was not enough recorded beside it.
 */

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
