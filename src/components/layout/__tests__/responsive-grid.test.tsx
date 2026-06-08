import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { ResponsiveGrid } from "../responsive-grid";

function vars(el: HTMLElement) {
  return {
    sm: el.style.getPropertyValue("--responsive-grid-sm"),
    md: el.style.getPropertyValue("--responsive-grid-md"),
    lg: el.style.getPropertyValue("--responsive-grid-lg"),
  };
}

describe("ResponsiveGrid — column resolution", () => {
  it("a numeric columns clamps sm≤2 / md≤3 and keeps lg", () => {
    const { container } = render(<ResponsiveGrid columns={5}>x</ResponsiveGrid>);
    expect(vars(container.firstChild as HTMLElement)).toEqual({ sm: "2", md: "3", lg: "5" });
  });

  it("the default (4) resolves to 2 / 3 / 4", () => {
    const { container } = render(<ResponsiveGrid>x</ResponsiveGrid>);
    expect(vars(container.firstChild as HTMLElement)).toEqual({ sm: "2", md: "3", lg: "4" });
  });

  it("an explicit {sm,md,lg} object passes through", () => {
    const { container } = render(
      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>x</ResponsiveGrid>,
    );
    expect(vars(container.firstChild as HTMLElement)).toEqual({ sm: "1", md: "2", lg: "4" });
  });

  it("object breakpoints fall back upward (sm→md→lg)", () => {
    const { container } = render(<ResponsiveGrid columns={{ sm: 2 }}>x</ResponsiveGrid>);
    expect(vars(container.firstChild as HTMLElement)).toEqual({ sm: "2", md: "2", lg: "2" });
  });

  it("a md-only object defaults sm to 1 and lg to md", () => {
    const { container } = render(<ResponsiveGrid columns={{ md: 3 }}>x</ResponsiveGrid>);
    expect(vars(container.firstChild as HTMLElement)).toEqual({ sm: "1", md: "3", lg: "3" });
  });

  it("renders its children", () => {
    const { getByText } = render(
      <ResponsiveGrid columns={2}>
        <div>子</div>
      </ResponsiveGrid>,
    );
    expect(getByText("子")).toBeInTheDocument();
  });
});
