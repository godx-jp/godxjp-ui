import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Segmented } from "../segmented";

/**
 * GDX-1281 — `shortLabel`: a bar whose full labels cannot share one row shows the short ones,
 * and the full label stays the accessible name. jsdom has no layout, so the wrap is stubbed: the
 * second item reports a second-row `offsetTop` while the full labels are on. The real geometry
 * at 320/390/1280 is held by segmented-short-label-1281-browser.test.ts.
 */
const OPTIONS = [
  { value: "inbox", label: "Waiting for me", shortLabel: "To approve", count: 3 },
  { value: "mine", label: "Sent by me", shortLabel: "Sent", count: 12 },
  { value: "all", label: "All" },
];

function stubWrappedLayout() {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(140);
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    const bar = this.closest('[data-slot="segmented"]');
    if (this.dataset.slot !== "segmented-item" || bar?.getAttribute("data-compact")) return 0;
    return [...bar!.children].indexOf(this) > 0 ? 30 : 0;
  });
}

afterEach(() => vi.restoreAllMocks());

describe("Segmented shortLabel (GDX-1281)", () => {
  it("without shortLabel nothing changes: no compact state, no extra label", () => {
    stubWrappedLayout();
    renderWithUi(
      <Segmented
        aria-label="Which requests"
        defaultValue="inbox"
        options={OPTIONS.map(({ shortLabel: _short, ...option }) => option)}
      />,
    );
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("data-compact");
    expect(document.querySelector('[data-slot="segmented-item-short-label"]')).toBeNull();
  });

  it("shows the full labels while they fit on one row", () => {
    renderWithUi(<Segmented aria-label="Which requests" defaultValue="inbox" options={OPTIONS} />);
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("data-compact");
    expect(document.querySelector('[data-slot="segmented-item-short-label"]')).toBeNull();
  });

  it("shows the short labels once the full ones wrap, and keeps the full accessible name", () => {
    stubWrappedLayout();
    renderWithUi(<Segmented aria-label="Which requests" defaultValue="inbox" options={OPTIONS} />);

    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-compact", "true");
    const shown = [...document.querySelectorAll('[data-slot="segmented-item"]')].map((item) =>
      [...item.querySelectorAll<HTMLElement>(".ui-segmented-item-label")]
        .map((label) => label.textContent)
        .join(""),
    );
    expect(shown).toEqual(["To approve", "Sent", "All"]);

    const inbox = screen.getByRole("radio", { name: "Waiting for me, 3" });
    expect(inbox.closest("label")).toHaveAttribute("title", "Waiting for me");
    expect(screen.getByRole("radio", { name: "Sent by me, 12" })).toBeInTheDocument();
    // An option with no short label keeps its label and takes no title.
    expect(screen.getByRole("radio", { name: "All" }).closest("label")).not.toHaveAttribute(
      "title",
    );
    // The short label is ink only; it never joins the name.
    expect(document.querySelector('[data-slot="segmented-item-short-label"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("a vertical bar never compacts", () => {
    stubWrappedLayout();
    renderWithUi(
      <Segmented aria-label="Which requests" vertical defaultValue="inbox" options={OPTIONS} />,
    );
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("data-compact");
  });
});
