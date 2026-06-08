import { afterEach, describe, expect, it, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";

// Capture the props Sonner's Toaster receives so we can assert the resolved `theme`.
let lastProps: Record<string, unknown> = {};
vi.mock("sonner", () => ({
  Toaster: (props: Record<string, unknown>) => {
    lastProps = props;
    return null;
  },
}));

import { renderWithUi } from "@/test/render";
import { Toaster } from "../sonner";

describe("Toaster — useDocumentTheme", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("resolves to light by default", () => {
    document.documentElement.classList.remove("dark");
    renderWithUi(<Toaster />);
    expect(lastProps.theme).toBe("light");
  });

  it("resolves to dark when the root has the `dark` class", () => {
    document.documentElement.classList.add("dark");
    renderWithUi(<Toaster />);
    expect(lastProps.theme).toBe("dark");
  });

  it("reacts to a class change on the root element", async () => {
    document.documentElement.classList.remove("dark");
    renderWithUi(<Toaster />);
    expect(lastProps.theme).toBe("light");
    await act(async () => {
      document.documentElement.classList.add("dark");
    });
    // the MutationObserver callback fires on a microtask → wait for the re-render
    await waitFor(() => expect(lastProps.theme).toBe("dark"));
  });

  it("forwards extra props (e.g. position override)", () => {
    renderWithUi(<Toaster position="top-center" />);
    expect(lastProps.position).toBe("top-center");
  });
});
