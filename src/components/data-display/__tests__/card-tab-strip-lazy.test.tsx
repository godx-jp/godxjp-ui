/**
 * The FIRST tabbed card, with the strip chunk not yet loaded (no preload in this file): the
 * selected body is on screen at once — never a hole — and the real strip lands a tick later.
 * After that, a second tabbed card renders its strip in the same render (cached module).
 */
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Card, CardContent } from "../card";

const TABS = [
  { key: "a", tab: "Alpha" },
  { key: "b", tab: "Beta" },
];

describe("Card tab strip — lazy first load", () => {
  it("shows the body immediately, then the strip; later cards are synchronous", async () => {
    renderWithUi(
      <Card tabList={TABS}>
        <CardContent>First body</CardContent>
      </Card>,
    );
    expect(screen.getByText("First body")).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "Alpha" })).toBeInTheDocument();

    renderWithUi(
      <Card tabList={TABS}>
        <CardContent>Second body</CardContent>
      </Card>,
    );
    // Cached: the strip is there in the very first render of this card.
    expect(screen.getAllByRole("tablist")).toHaveLength(2);
  });
});
