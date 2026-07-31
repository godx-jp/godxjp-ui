import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  describe("bounded master viewport (gh#231)", () => {
    it("is unbounded by default — no scroll container, no extra tab stop", () => {
      const { container } = render(<MasterDetail master={<div>Master</div>}>Detail</MasterDetail>);

      expect(root(container)).toHaveAttribute("data-master-viewport", "auto");
      // `auto` matches no CSS rule, so the region keeps growing with its content exactly as
      // before, and it must NOT become focusable (an unbounded region never scrolls).
      expect(container.querySelector(".ui-master-detail-master")).not.toHaveAttribute("tabindex");
    });

    it("selects a token-owned preset and makes the region keyboard-scrollable", () => {
      for (const masterViewport of ["compact", "standard"] as const) {
        const { container } = render(
          <MasterDetail masterViewport={masterViewport} masterLabel="Members" master={<div>M</div>}>
            Detail
          </MasterDetail>,
        );

        expect(root(container)).toHaveAttribute("data-master-viewport", masterViewport);
        // WCAG 2.1.1 / axe scrollable-region-focusable: a scroll container must be reachable
        // and scrollable with the keyboard alone, even with nothing focusable inside it.
        expect(container.querySelector(".ui-master-detail-master")).toHaveAttribute(
          "tabindex",
          "0",
        );
      }
    });

    it("does not trap focus inside the bounded region", async () => {
      const user = userEvent.setup();
      const { getByRole } = render(
        <>
          <button type="button">Before</button>
          <MasterDetail
            masterViewport="compact"
            masterLabel="Members"
            detailLabel="Selected member"
            master={
              <>
                <button type="button">Row one</button>
                <button type="button">Row two</button>
              </>
            }
          >
            <button type="button">Detail action</button>
          </MasterDetail>
        </>,
      );

      const region = getByRole("region", { name: "Members" });
      getByRole("button", { name: "Before" }).focus();

      // Tab reaches the scroll region itself (so it can be scrolled by keyboard)…
      await user.tab();
      expect(document.activeElement).toBe(region);
      // …then walks THROUGH its rows and out the far side. Nothing is trapped.
      await user.tab();
      expect(document.activeElement).toBe(getByRole("button", { name: "Row one" }));
      await user.tab();
      expect(document.activeElement).toBe(getByRole("button", { name: "Row two" }));
      await user.tab();
      expect(document.activeElement).toBe(getByRole("button", { name: "Detail action" }));

      // …and Shift+Tab walks back out the near side.
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(region);
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(getByRole("button", { name: "Before" }));
    });

    it("has no axe violations with a bounded, long collection", async () => {
      await expectNoA11yViolations(
        <MasterDetail
          masterViewport="compact"
          masterLabel="Members"
          detailLabel="Selected member"
          detailId="member-detail"
          master={
            <ul>
              {Array.from({ length: 40 }, (_, i) => (
                <li key={i}>
                  <button type="button" aria-controls="member-detail" aria-pressed={i === 0}>
                    {`Member ${i + 1}`}
                  </button>
                </li>
              ))}
            </ul>
          }
        >
          <h2>Member 1</h2>
        </MasterDetail>,
      );
    });
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

    /*
     * Bounded master viewport (gh#231). Measured in Chromium against this stylesheet, in the
     * docs frame, with a 200-row collection (see the numbers reported on the issue):
     *
     *   masterViewport="auto"     390px → master 3,749px tall, detail pushed to y≈3,935
     *   masterViewport="compact"  390px → master  320px tall, detail at y≈4xx (scrolls in place)
     */
    it("bounds the master viewport from tokens only when a preset is selected", () => {
      expect(layoutTokens).toMatch(/--master-detail-master-viewport-compact:\s*20rem/);
      expect(layoutTokens).toMatch(/--master-detail-master-viewport-standard:\s*28rem/);
      expect(layoutTokens).toMatch(/--master-detail-master-viewport-inset:\s*var\(--space-1\)/);
      expect(layoutCss).toMatch(
        /\[data-master-viewport="compact"\]\s*>\s*\.ui-master-detail-master\s*\{\s*max-block-size:\s*var\(--master-detail-master-viewport-compact\)/,
      );
      expect(layoutCss).toMatch(
        /\[data-master-viewport="standard"\]\s*>\s*\.ui-master-detail-master\s*\{\s*max-block-size:\s*var\(--master-detail-master-viewport-standard\)/,
      );
      // `auto` must never be a selector — the default has to stay literally unstyled.
      expect(layoutCss).not.toMatch(/\[data-master-viewport="auto"\]/);
      // No raw pixel geometry anywhere in the bound.
      expect(layoutCss).not.toMatch(/max-block-size:\s*\d/);
    });

    it("gives the bounded region scroll containment and focus-ring room", () => {
      const start = layoutCss.indexOf('.ui-master-detail[data-master-viewport="compact"]');
      const block = layoutCss.slice(start, layoutCss.indexOf("}", start));

      expect(block).toMatch(/overflow-y:\s*auto/);
      expect(block).toMatch(/overscroll-behavior:\s*contain/);
      expect(block).toMatch(/padding:\s*var\(--master-detail-master-viewport-inset\)/);
      expect(block).toMatch(/scroll-padding-block:\s*var\(--master-detail-master-viewport-inset\)/);
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
