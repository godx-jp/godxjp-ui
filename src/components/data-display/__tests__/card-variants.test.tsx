import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Card, CardContent, CardFooter } from "../card";

const q = (c: HTMLElement, slot: string) => c.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

describe("Card — surface data attributes", () => {
  it("reflects variant / accent / density", () => {
    const { container } = render(
      <Card variant="muted" accent="success" density="tight">
        body
      </Card>,
    );
    const card = q(container, "card");
    expect(card).toHaveAttribute("data-variant", "muted");
    expect(card).toHaveAttribute("data-accent", "success");
    expect(card).toHaveAttribute("data-density", "tight");
  });

  it("draws the accent on the perimeter when asked, and on the edge by default (gh#12)", () => {
    // SCR-117 needs a full attention border in a NON-primary tone. `variant="featured"` draws a
    // perimeter but is brand-toned by definition, so the tone and its placement are two props.
    const { container: perimeter } = render(
      <Card accent="attention" accentPlacement="perimeter">
        body
      </Card>,
    );
    const card = q(perimeter, "card");
    expect(card).toHaveAttribute("data-accent", "attention");
    expect(card).toHaveAttribute("data-accent-placement", "perimeter");

    // INERT DEFAULT: an existing accented card must keep byte-identical DOM.
    const { container: edge } = render(<Card accent="attention">body</Card>);
    expect(q(edge, "card")).not.toHaveAttribute("data-accent-placement");
    const { container: explicit } = render(
      <Card accent="attention" accentPlacement="edge">
        body
      </Card>,
    );
    expect(q(explicit, "card")).not.toHaveAttribute("data-accent-placement");
  });

  it("omits data-variant/data-size for the defaults", () => {
    const { container } = render(<Card variant="default">body</Card>);
    const card = q(container, "card");
    expect(card).not.toHaveAttribute("data-variant");
    expect(card).not.toHaveAttribute("data-size");
  });
});

describe("CardFooter / CardContent — flush + separated", () => {
  it("sets data-separated and data-flush on the footer", () => {
    const { container } = render(
      <CardFooter separated flush>
        actions
      </CardFooter>,
    );
    const footer = q(container, "card-footer");
    expect(footer).toHaveAttribute("data-separated", "");
    expect(footer).toHaveAttribute("data-flush", "");
  });

  it("sets data-flush on flush content", () => {
    const { container } = render(<CardContent flush>x</CardContent>);
    expect(q(container, "card-content")).toHaveAttribute("data-flush", "");
  });
});
