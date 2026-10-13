import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";

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
    delete document.documentElement.dataset.theme;
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

  // `data-theme` is what AppProvider actually writes; `.dark` is only the legacy alias. A
  // class-only read reported "light" on a dark page, and a class-only observer never fired at all.
  // Rendered WITHOUT AppProvider: AppProvider applies its own theme axis to `<html data-theme>`
  // after mount ("light" here), and the Toaster now re-renders under its context (it reads `t()`
  // for the close button's label, gh#1253) — so under renderWithUi the truthful answer after
  // mount is "light", and this case would only measure who wrote the attribute last.
  it("resolves to dark from `data-theme` on the root element", () => {
    document.documentElement.dataset.theme = "dark";
    render(<Toaster />);
    expect(lastProps.theme).toBe("dark");
  });

  it("reacts to a `data-theme` change on the root element", async () => {
    renderWithUi(<Toaster />);
    expect(lastProps.theme).toBe("light");
    await act(async () => {
      document.documentElement.dataset.theme = "dark";
    });
    await waitFor(() => expect(lastProps.theme).toBe("dark"));
  });

  it("forwards extra props (e.g. position override)", () => {
    renderWithUi(<Toaster position="top-center" />);
    expect(lastProps.position).toBe("top-center");
  });
});
