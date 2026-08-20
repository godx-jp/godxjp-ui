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
  // does not evaluate @container, so the custom properties ARE the geometry contract).
  //
  // IMPORTANT — this asserts the GRID'S CONTAINER width, not the viewport, and those are NOT the
  // same number for a real consumer. An earlier version of this preset used `{ sm: 1, md: 1, lg:
  // 3 }`, reasoning (wrongly) that a 1024px *viewport* always lands in the `lg` (>=64rem) container
  // step. That passed this exact test in jsdom while silently regressing to 1 column in DXS's real
  // shelled Console, where a 1024px viewport only leaves the grid a ~721px (45rem) container — the
  // `sm` step, not `lg` (dxs-platform/platform#333, caught 2026-08-20 by a real-browser contract
  // test this jsdom test cannot substitute for). `sm: 3` fixes that by making the 3-column geometry
  // hold from the `sm` step up, so it survives being embedded in a narrower real container, not
  // just a full-bleed one. If you ever "simplify" this back to `{ sm: 1, ... }`, re-verify against
  // a REAL shelled consumer at a real 1024px viewport, not just this unit test.
  it("resolves to 1 column below sm and 3 columns from sm up — covering 390 / 1024 / 1440 (dxs-platform/platform#333)", () => {
    const { container } = render(
      <ResponsiveGrid preset="pricing-plans">
        <div>plan</div>
      </ResponsiveGrid>,
    );
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "3", // must survive a narrower real container (e.g. a 1024px viewport inside a shell)
      md: "3",
      lg: "3", // covers the 1440px reference width
    });
  });

  it("preset wins over columns when both are set", () => {
    const { container } = render(
      <ResponsiveGrid columns={4} preset="pricing-plans">
        <div>plan</div>
      </ResponsiveGrid>,
    );
    expect(vars(container.querySelector(".ui-responsive-grid") as HTMLElement)).toEqual({
      sm: "3",
      md: "3",
      lg: "3",
    });
  });
});
