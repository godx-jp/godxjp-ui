import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Card, CardContent, CardFooter } from "../card";

const q = (c: HTMLElement, slot: string) => c.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

describe("Card — surface data attributes", () => {
  it("reflects variant / size / accent / density", () => {
    const { container } = render(
      <Card variant="muted" size="compact" accent="success" density="tight">
        body
      </Card>,
    );
    const card = q(container, "card");
    expect(card).toHaveAttribute("data-variant", "muted");
    expect(card).toHaveAttribute("data-size", "compact");
    expect(card).toHaveAttribute("data-accent", "success");
    expect(card).toHaveAttribute("data-density", "tight");
  });

  it("omits data-variant/data-size for the defaults", () => {
    const { container } = render(
      <Card variant="default" size="md">
        body
      </Card>,
    );
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
