import { afterEach, describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";

import { renderWithUi } from "@/test/render";
import { Toaster } from "../sonner";
import { toast } from "../use-toast";

/**
 * A CLOSE BUTTON ON THE TOASTS A READER MAY NEED TO KEEP (gh#1253).
 *
 * `toast.error` / `toast.warning` carry a ✕ by default; `toast.success` / `toast.info` stay
 * auto-dismiss only. Each assertion is scoped to the toast that holds its own message, because the
 * toaster is a stack and the previous test's toast may still be exiting.
 */
function toastOf(message: string): HTMLElement {
  const toastElement = screen.getByText(message).closest<HTMLElement>("[data-sonner-toast]");
  if (!toastElement) throw new Error(`no toast holds "${message}"`);
  return toastElement;
}

function closeButtonOf(message: string): HTMLButtonElement | null {
  return toastOf(message).querySelector<HTMLButtonElement>("button[data-close-button]");
}

describe("Toaster — close button by type", () => {
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it("toast.error renders a named close button", async () => {
    renderWithUi(<Toaster />);
    act(() => {
      toast.error("Save failed");
    });
    await screen.findByText("Save failed");
    const close = closeButtonOf("Save failed");
    expect(close).not.toBeNull();
    expect(close?.getAttribute("aria-label")).toBe("Đóng thông báo"); // renderWithUi = vi
  });

  it("toast.warning renders a close button", async () => {
    renderWithUi(<Toaster />);
    act(() => {
      toast.warning("Quota almost used");
    });
    await screen.findByText("Quota almost used");
    expect(closeButtonOf("Quota almost used")).not.toBeNull();
  });

  it("toast.success and toast.info do not", async () => {
    renderWithUi(<Toaster />);
    act(() => {
      toast.success("Saved");
      toast.info("Sync scheduled");
    });
    await screen.findByText("Saved");
    await screen.findByText("Sync scheduled");
    expect(closeButtonOf("Saved")).toBeNull();
    expect(closeButtonOf("Sync scheduled")).toBeNull();
  });

  it("a per-call closeButton: false still opts an error out", async () => {
    renderWithUi(<Toaster />);
    act(() => {
      toast.error("Quiet failure", { closeButton: false });
    });
    await screen.findByText("Quiet failure");
    expect(closeButtonOf("Quiet failure")).toBeNull();
  });

  it("keeps the rest of sonner's toast API on the wrapped function", () => {
    expect(typeof toast).toBe("function");
    for (const method of ["success", "info", "loading", "promise", "dismiss", "custom"] as const) {
      expect(typeof toast[method]).toBe("function");
    }
  });
});
