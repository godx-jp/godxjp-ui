import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue, useIsMobile, useMediaQuery, useTimeoutFlag } from "../hooks";

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 200));
    expect(result.current).toBe("a");
  });

  it("updates only after `delay` ms of no change", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "b" });
    expect(result.current).toBe("a"); // not yet
    act(() => vi.advanceTimersByTime(199));
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });

  it("resets the timer on rapid changes (debounce)", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "b" });
    act(() => vi.advanceTimersByTime(150));
    rerender({ v: "c" });
    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe("a"); // 'b' never settled
    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe("c");
  });
});

describe("useTimeoutFlag", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is false while the signal is falsy", () => {
    const { result } = renderHook(({ s }) => useTimeoutFlag(s, 1000), {
      initialProps: { s: 0 },
    });
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe(false);
  });

  it("turns true when the signal flips truthy, then auto-hides after `ms`", () => {
    const { result, rerender } = renderHook(({ s }) => useTimeoutFlag(s, 1000), {
      initialProps: { s: 0 as number },
    });
    rerender({ s: 1 });
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });
});

describe("useMediaQuery / useIsMobile", () => {
  const listeners = new Set<() => void>();
  let currentMatches = false;

  beforeEach(() => {
    listeners.clear();
    currentMatches = false;
    vi.stubGlobal("matchMedia", (query: string) => ({
      // a getter so the hook's updateMatch() reads the CURRENT value, like a real MediaQueryList
      get matches() {
        return currentMatches;
      },
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      addListener: (cb: () => void) => listeners.add(cb),
      removeListener: (cb: () => void) => listeners.delete(cb),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("reflects the initial match and reacts to a change event", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(false);
    act(() => {
      currentMatches = true;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
  });

  it("useIsMobile delegates to the mobile breakpoint query", () => {
    currentMatches = true;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});
