import { afterEach, describe, expect, it, vi } from "vitest";

// Capture the subscribe fn Toaster hands to useSyncExternalStore so we can invoke
// it directly with `document` undefined — the no-op SSR cleanup branch.
let capturedSubscribe: ((onStoreChange: () => void) => () => void) | null = null;

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useSyncExternalStore: (
      subscribe: (onStoreChange: () => void) => () => void,
      _getSnapshot: () => unknown,
      getServerSnapshot?: () => unknown,
    ) => {
      capturedSubscribe = subscribe;
      return getServerSnapshot ? getServerSnapshot() : "light";
    },
  };
});

vi.mock("sonner", () => ({
  Toaster: () => null,
}));

import { renderToString } from "react-dom/server";
import { Toaster } from "../sonner";

describe("Toaster — useDocumentTheme subscribe SSR guard", () => {
  afterEach(() => {
    capturedSubscribe = null;
    vi.unstubAllGlobals();
  });

  it("subscribe returns a no-op cleanup when document is undefined", () => {
    // render to capture the subscribe closure
    renderToString(<Toaster />);
    expect(capturedSubscribe).toBeInstanceOf(Function);

    // Simulate SSR: no document global. The guard returns a no-op teardown
    // without touching window.matchMedia / MutationObserver.
    vi.stubGlobal("document", undefined);
    const cleanup = capturedSubscribe!(() => {});
    expect(typeof cleanup).toBe("function");
    // calling it must not throw
    expect(() => cleanup()).not.toThrow();
  });
});
