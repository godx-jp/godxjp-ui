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
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "2",
      md: "3",
      lg: "5",
    });
  });

  it("the default (4) resolves to 2 / 3 / 4", () => {
    const { container } = render(<ResponsiveGrid>x</ResponsiveGrid>);
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "2",
      md: "3",
      lg: "4",
    });
  });

  it("an explicit {sm,md,lg} object passes through", () => {
    const { container } = render(
      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>x</ResponsiveGrid>,
    );
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "1",
      md: "2",
      lg: "4",
    });
  });

  it("object breakpoints fall back upward (sm→md→lg)", () => {
    const { container } = render(<ResponsiveGrid columns={{ sm: 2 }}>x</ResponsiveGrid>);
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "2",
      md: "2",
      lg: "2",
    });
  });

  it("a md-only object defaults sm to 1 and lg to md", () => {
    const { container } = render(<ResponsiveGrid columns={{ md: 3 }}>x</ResponsiveGrid>);
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "1",
      md: "3",
      lg: "3",
    });
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

describe("ResponsiveGrid — preset='pricing-plans' (3/3/1 contract)", () => {
  // The contract is expressed as the sm/md/lg container-query steps ResponsiveGrid already
  // resolves to CSS custom properties (same assertion style as the columns tests above — jsdom
  // does not evaluate @container, so the custom properties ARE the geometry contract). 1024px and
  // 1440px both land in the `lg` step (min-width: 64rem / 1024px, no step above it), so a single
  // `lg` assertion covers both reference widths; 390px is below the `sm` step (640px) and falls
  // through to the grid's un-queried 1-column base, which the `sm` value below also pins.
  it("resolves to 1 column below lg and 3 columns at lg — covering 390 / 1024 / 1440 (dxs-platform/platform#333)", () => {
    const { container } = render(
      <ResponsiveGrid preset="pricing-plans">
        <div>plan</div>
      </ResponsiveGrid>,
    );
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "1", // covers the 390px reference width (below the 640px sm step)
      md: "1",
      lg: "3", // covers BOTH the 1024px and 1440px reference widths (no step above lg)
    });
  });

  it("preset wins over columns when both are set", () => {
    const { container } = render(
      <ResponsiveGrid columns={4} preset="pricing-plans">
        <div>plan</div>
      </ResponsiveGrid>,
    );
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "1",
      md: "1",
      lg: "3",
    });
  });
});
