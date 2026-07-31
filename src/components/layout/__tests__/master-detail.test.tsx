import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { MasterDetail } from "../master-detail";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

const layoutCss = read("../../../styles/layout.css");
const layoutTokens = read("../../../tokens/semantic/layout.css");
const root = (container: HTMLElement) => container.querySelector(".ui-master-detail")!;

describe("MasterDetail", () => {
  it("renders named master and detail regions, detail rail by default", () => {
    const { container, getByRole } = render(
      <MasterDetail
        master={<button type="button">Service A</button>}
        masterLabel="Services"
        detailLabel="Selected service"
      >
        <h2>Service A roles</h2>
      </MasterDetail>,
    );

    expect(getByRole("region", { name: "Services" })).toHaveTextContent("Service A");
    expect(getByRole("region", { name: "Selected service" })).toHaveTextContent("Service A roles");
    // The canonical composition of gh#223: fluid list + fixed-width DETAIL rail.
    expect(root(container)).toHaveAttribute("data-rail", "detail");
    expect(root(container)).toHaveAttribute("data-rail-width", "standard");
  });

  it("keeps master first in DOM order whichever region owns the rail", () => {
    for (const rail of ["detail", "master"] as const) {
      const { container } = render(
        <MasterDetail rail={rail} master={<div>Master</div>}>
          Detail
        </MasterDetail>,
      );
      const regions = container.querySelectorAll(".ui-master-detail > section");

      expect(root(container)).toHaveAttribute("data-rail", rail);
      expect(regions[0]).toHaveClass("ui-master-detail-master");
      expect(regions[1]).toHaveClass("ui-master-detail-detail");
    }
  });

  it("supports both token-owned rail presets", () => {
    for (const railWidth of ["compact", "standard"] as const) {
      const { container } = render(
        <MasterDetail railWidth={railWidth} master={<div>Master</div>}>
          Detail
        </MasterDetail>,
      );

      expect(root(container)).toHaveAttribute("data-rail-width", railWidth);
    }
  });

  it("leaves the collapse threshold to the theme token unless collapseBelow is set", () => {
    const { container } = render(<MasterDetail master={<div>Master</div>}>Detail</MasterDetail>);

    expect(root(container)).not.toHaveAttribute("data-collapse-below");
  });

  it("overrides the collapse threshold per instance", () => {
    for (const collapseBelow of ["sm", "md", "lg", "xl", false] as const) {
      const { container } = render(
        <MasterDetail collapseBelow={collapseBelow} master={<div>Master</div>}>
          Detail
        </MasterDetail>,
      );

      expect(root(container)).toHaveAttribute("data-collapse-below", String(collapseBelow));
    }
  });

  it("exposes the detail region as an aria-controls target and a focus target", () => {
    const { container, getByRole } = render(
      <MasterDetail
        detailId="team-detail"
        detailLabel="Team detail"
        master={
          <button type="button" aria-controls="team-detail">
            Core team
          </button>
        }
      >
        Detail
      </MasterDetail>,
    );

    const detail = container.querySelector("#team-detail")!;
    expect(detail).toHaveClass("ui-master-detail-detail");
    expect(detail).toHaveAttribute("tabindex", "-1");
    expect(getByRole("button")).toHaveAttribute("aria-controls", "team-detail");

    // The app moves focus to the new detail after a selection; -1 makes that possible.
    (detail as HTMLElement).focus();
    expect(document.activeElement).toBe(detail);
  });

  it("does not override consumer-owned selection semantics", () => {
    const { getByRole } = render(
      <MasterDetail
        master={
          <button type="button" aria-pressed="true">
            Selected service
          </button>
        }
      >
        Detail
      </MasterDetail>,
    );

    expect(getByRole("button", { pressed: true })).toHaveTextContent("Selected service");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <MasterDetail
        master={
          <button type="button" aria-pressed="true" aria-controls="detail-region">
            Service A
          </button>
        }
        masterLabel="Services"
        detailLabel="Selected service details"
        detailId="detail-region"
      >
        <h2>Roles</h2>
      </MasterDetail>,
    );
  });

  /*
   * Geometry contract (gh#223). jsdom has no layout engine, so the responsive behaviour is
   * asserted here as a CSS contract; the live numbers below were measured in Chromium against
   * this exact stylesheet, in a PageContainer at the required viewport matrix:
   *
   *   1440 (composition 1392px): master 1056px + detail rail 320px, side by side
   *   1024 (composition  976px): master  640px + detail rail 320px, side by side
   *    390 (composition  342px): stacked — master 342px above detail 342px
   */
  describe("responsive geometry contract", () => {
    it("drives every track and the gap from tokens", () => {
      expect(layoutTokens).toMatch(/--master-detail-rail-compact:\s*18\.75rem/);
      expect(layoutTokens).toMatch(/--master-detail-rail-standard:\s*20rem/);
      expect(layoutCss).toMatch(
        /\[data-rail-width="compact"\]\s*\{\s*--master-detail-rail-size:\s*var\(--master-detail-rail-compact\)/,
      );
      expect(layoutCss).toMatch(/\.ui-master-detail\s*\{[^}]*gap:\s*var\(--master-detail-gap\)/s);
      expect(layoutCss).toMatch(
        /\.ui-master-detail\s*\{[^}]*--master-detail-rail-size:\s*var\(--master-detail-rail-standard\)/s,
      );
    });

    it("owns the collapse threshold as a token, not a hard-coded query", () => {
      // A media/container-query CONDITION cannot read a var(); the flex-basis threshold can —
      // which is why the breakpoint lives in a calc() here (rule #45).
      expect(layoutTokens).toMatch(/--master-detail-collapse-below:\s*40rem/);
      expect(layoutCss).toMatch(
        /flex:\s*1 1 calc\(\(var\(--master-detail-collapse-below\) - 100%\) \* 999\)/,
      );
      expect(layoutCss).toMatch(
        /max\(\s*var\(--master-detail-rail-size\),\s*calc\(\(var\(--master-detail-collapse-below\) - 100%\) \* 999\)\s*\)/s,
      );
      expect(layoutCss).not.toMatch(/@container master-detail/);
    });

    it("keeps the composition direction-agnostic (RTL-safe)", () => {
      const start = layoutCss.indexOf(".ui-master-detail {");
      const block = layoutCss.slice(start, layoutCss.indexOf("@container responsive-grid", start));

      expect(block).toMatch(/min-inline-size:\s*0/);
      expect(block).not.toMatch(/\b(?:margin|padding|border)-(?:left|right)\b/);
      expect(block).not.toMatch(/\bmin-width:/);
    });
  });
});
