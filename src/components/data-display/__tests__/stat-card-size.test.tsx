import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { StatCard } from "../card";

const card = (c: HTMLElement) => c.querySelector("[data-stat-card]") as HTMLElement;

describe("StatCard — explicit size", () => {
  it("honours an explicit size instead of the compact default", () => {
    const { container } = render(<StatCard label="売上" value="¥1,000" size="md" />);
    // size="md" flows through (the `size` side of `size ?? "compact"`) → no data-size=compact
    expect(card(container)).not.toHaveAttribute("data-size", "compact");
  });

  it("defaults to compact when no size is given", () => {
    const { container } = render(<StatCard label="売上" value="¥1,000" />);
    expect(card(container)).toHaveAttribute("data-size", "compact"); // the ?? "compact" branch
  });
});
