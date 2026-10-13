import { afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";

// Capture the props Sonner's Toaster receives so the resolved `duration` can be asserted.
let lastProps: Record<string, unknown> = {};
vi.mock("sonner", () => ({
  Toaster: (props: Record<string, unknown>) => {
    lastProps = props;
    return null;
  },
}));

import { renderWithUi } from "@/test/render";
import { Toaster, parseToastDuration } from "../sonner";

/** `--toast-duration` reaches Sonner's numeric `duration` (gh#1253). */
describe("Toaster — --toast-duration", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--toast-duration");
    lastProps = {};
  });

  it("parses the two CSS time units and rejects everything else", () => {
    expect(parseToastDuration("4000ms")).toBe(4000);
    expect(parseToastDuration(" 6s ")).toBe(6000);
    expect(parseToastDuration("1.5s")).toBe(1500);
    expect(parseToastDuration("")).toBeUndefined();
    expect(parseToastDuration("initial")).toBeUndefined();
    expect(parseToastDuration("4000")).toBeUndefined();
    expect(parseToastDuration("0ms")).toBeUndefined();
  });

  it("reads the token from the cascade into duration", async () => {
    document.documentElement.style.setProperty("--toast-duration", "7s");
    renderWithUi(<Toaster />);
    await waitFor(() => expect(lastProps.duration).toBe(7000));
  });

  it("leaves Sonner's default when the token is unset", async () => {
    renderWithUi(<Toaster />);
    await waitFor(() => expect("duration" in lastProps).toBe(true));
    expect(lastProps.duration).toBeUndefined();
  });

  it("the Toaster's own duration prop wins over the token", async () => {
    document.documentElement.style.setProperty("--toast-duration", "7s");
    renderWithUi(<Toaster duration={2000} />);
    // let the mount effect run, then confirm the prop still holds
    await waitFor(() => expect(lastProps.duration).toBe(2000));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(lastProps.duration).toBe(2000);
  });

  it("names the close button in the active locale and keeps consumer toastOptions", () => {
    renderWithUi(<Toaster toastOptions={{ className: "mine" }} />);
    expect(lastProps.toastOptions).toMatchObject({
      closeButtonAriaLabel: "Đóng thông báo", // renderWithUi = vi
      className: "mine",
    });
  });
});
