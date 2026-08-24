import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Card, StatCard } from "../card";

const statCard = (c: HTMLElement) => c.querySelector("[data-stat-card]") as HTMLElement;
const card = (c: HTMLElement) => c.querySelector('[data-slot="card"]') as HTMLElement;

// `size` shipped from the v6 snapshot with EMPTY cva variants and no CSS ever read the
// `data-size` it emitted, so `size="compact"` was inert for its whole life while the props
// table and the StatCard guidance both advertised it. The old test here pinned the ATTRIBUTE
// ("defaults to compact"), which passed happily while the prop did nothing — the attribute was
// the only thing it ever produced. Card sizing is `density`, which is implemented and measured.
//
// DO NOT REPLACE THIS WITH A GENERIC "dead prop" GUARD. Two sessions have now built one
// ("every emitted data-* must be read by CSS") and both threw it away, because a prop in this
// system is legitimately honoured through three different routes:
//   (a) CSS reads the data-attribute      — Card `variant` / `density`
//   (b) a cva/`cn()` class carries it     — Button `size`/`variant`/`shape` → `ui-button--*`
//   (c) React context feeds children      — ToggleGroup, SelectTrigger `size`
// Measured outcome of the attempt here: with the Card `size` prop restored, the guard stayed
// GREEN on it (the `size` token matched inside the unrelated string `--stat-card-icon-size`),
// while flagging `Button.shape` — a prop that works — as dead. It missed the only bug it was
// written for and accused a healthy prop instead. A per-component assertion like the ones below
// is narrow, but it is right.
describe("Card — no dead size axis", () => {
  it("emits no data-size attribute", () => {
    const { container } = render(<Card>x</Card>);
    expect(card(container)).not.toHaveAttribute("data-size");
  });

  it("StatCard renders without one too", () => {
    const { container } = render(<StatCard label="売上" value="¥1,000" />);
    expect(statCard(container)).toBeInTheDocument();
    expect(statCard(container)).not.toHaveAttribute("data-size");
  });

  // The real sizing axis still works — density is what `compact` pretended to be.
  it("density is the sizing axis and reaches the DOM", () => {
    const { container } = render(<Card density="tight">x</Card>);
    expect(card(container)).toHaveAttribute("data-density", "tight");
  });
});
