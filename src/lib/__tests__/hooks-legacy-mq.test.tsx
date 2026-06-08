import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useMediaQuery } from "../hooks";

afterEach(() => vi.unstubAllGlobals());

describe("useMediaQuery — legacy MediaQueryList API", () => {
  it("falls back to addListener/removeListener when addEventListener is absent", () => {
    let listener: () => void = () => {};
    let current = false;
    const removeListener = vi.fn();
    const mql = {
      get matches() {
        return current;
      },
      addListener: (cb: () => void) => {
        listener = cb;
      },
      removeListener,
      // intentionally NO addEventListener → exercises the legacy branch
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mql),
    );

    const { result, unmount } = renderHook(() => useMediaQuery("(max-width: 600px)"));
    expect(result.current).toBe(false);

    // a media change flows through the legacy listener
    current = true;
    act(() => listener());
    expect(result.current).toBe(true);

    // cleanup detaches via removeListener
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });
});
