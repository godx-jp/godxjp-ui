import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Card, CardFooter } from "../card";

/**
 * The three antd `Card` behaviours that no existing composition could reach.
 *
 * `docs/roadmap/parity-audit-data-display-feedback.md` §2.5 read `variant="outline"` as a
 * SUPERSET of antd's `bordered`/`variant` axis. It is not: `outline` drops the fill and keeps the
 * hairline, so antd's `borderless` — no edge, fill retained — had no spelling at all. The same
 * table read `actions` as covered by `CardFooter separated`, which packs children at the inline
 * end at their natural widths rather than dividing the band into equal cells. Both are checked here at the DOM
 * boundary; the geometry each one buys is proved from the shipped stylesheet in
 * `src/styles/__tests__/card-antd-parity.test.ts` (jsdom performs no layout).
 */
const q = (c: HTMLElement, slot: string) => c.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

describe("Card — antd `hoverable`", () => {
  it("emits data-hoverable when asked", () => {
    const { container } = render(<Card hoverable>body</Card>);
    expect(q(container, "card")).toHaveAttribute("data-hoverable", "");
  });

  it("is an INERT DEFAULT — an existing card keeps byte-identical DOM", () => {
    const { container: off } = render(<Card>body</Card>);
    expect(q(off, "card")).not.toHaveAttribute("data-hoverable");

    // `false` must be inert too, so a consumer may drive it from a boolean without the attribute
    // appearing as an empty string (which CSS `[data-hoverable]` would still match).
    const { container: explicit } = render(<Card hoverable={false}>body</Card>);
    expect(q(explicit, "card")).not.toHaveAttribute("data-hoverable");
  });

  it("composes with accent + perimeter rather than replacing them", () => {
    const { container } = render(
      <Card hoverable accent="info" accentPlacement="perimeter">
        body
      </Card>,
    );
    const card = q(container, "card");
    expect(card).toHaveAttribute("data-hoverable", "");
    expect(card).toHaveAttribute("data-accent", "info");
    expect(card).toHaveAttribute("data-accent-placement", "perimeter");
  });
});

describe('Card — antd `variant="borderless"`', () => {
  it("is a distinct variant value, not a spelling of `outline`", () => {
    const { container: borderless } = render(<Card variant="borderless">body</Card>);
    expect(q(borderless, "card")).toHaveAttribute("data-variant", "borderless");

    const { container: outline } = render(<Card variant="outline">body</Card>);
    expect(q(outline, "card")).toHaveAttribute("data-variant", "outline");
  });

  it("still carries a semantic accent — a quieter frame must not drop a signal", () => {
    const { container } = render(
      <Card variant="borderless" accent="destructive">
        body
      </Card>,
    );
    const card = q(container, "card");
    expect(card).toHaveAttribute("data-variant", "borderless");
    expect(card).toHaveAttribute("data-accent", "destructive");
  });
});

describe("CardFooter — antd `actions`", () => {
  it("is self-sufficient — `actions` alone needs neither chrome flag", () => {
    const { container } = render(
      <CardFooter actions>
        <span>a</span>
        <span>b</span>
      </CardFooter>,
    );
    const footer = q(container, "card-footer");
    expect(footer).toHaveAttribute("data-actions", "");
    expect(footer).not.toHaveAttribute("data-separated");
    expect(footer).not.toHaveAttribute("data-flush");
  });

  it("is an INERT DEFAULT — a Save/Cancel footer keeps byte-identical DOM", () => {
    const { container } = render(<CardFooter separated>actions</CardFooter>);
    expect(q(container, "card-footer")).not.toHaveAttribute("data-actions");
  });
});
