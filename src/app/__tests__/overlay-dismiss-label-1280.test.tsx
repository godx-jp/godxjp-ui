import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../app-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/feedback/dialog";

/** React Aria's visually hidden dismiss buttons (1×1px, tabindex -1) in the document. */
const dismissLabels = () =>
  [...document.querySelectorAll<HTMLButtonElement>('button[tabindex="-1"]')]
    .filter((button) => button.style.width === "1px" && button.style.height === "1px")
    .map((button) => button.getAttribute("aria-label"));

const openDialog = (
  <Dialog defaultOpen>
    <DialogContent aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>Title</DialogTitle>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

describe("overlay dismiss label (gh#1280)", () => {
  it("names React Aria's dismiss button from the catalogue under vi (React Aria has no vi)", async () => {
    render(
      <AppProvider defaultLocale="vi" persist={false}>
        {openDialog}
      </AppProvider>,
    );
    await waitFor(() => expect(dismissLabels().length).toBeGreaterThan(0));
    await waitFor(() => expect(new Set(dismissLabels())).toEqual(new Set(["Bỏ qua"])));
  });

  it("nested providers in different locales settle on the OUTERMOST one — no relabel loop", async () => {
    render(
      <AppProvider defaultLocale="vi" persist={false}>
        <AppProvider defaultLocale="en" persist={false}>
          {openDialog}
        </AppProvider>
      </AppProvider>,
    );
    await waitFor(() => expect(new Set(dismissLabels())).toEqual(new Set(["Bỏ qua"])));
    // Two observers fighting would keep rewriting the attribute; one owner leaves it alone.
    let writes = 0;
    const observer = new MutationObserver((records) => {
      writes += records.length;
    });
    observer.observe(document.body, { subtree: true, attributeFilter: ["aria-label"] });
    await new Promise((resolve) => setTimeout(resolve, 50));
    observer.disconnect();
    expect(writes).toBe(0);
    expect(new Set(dismissLabels())).toEqual(new Set(["Bỏ qua"]));
  });
});
