/**
 * gh#728 — the brand cell gives room back, and the bar has an overflow contract.
 *
 * Measured on a consumer at a real 390px context with a 6:1 lockup at `--logo-size-sm`: the brand
 * stayed 143.7px at EVERY viewport (`.app-topbar-logo` declared no `flex` and kept `min-width:
 * auto` while `.app-topbar-custom` carried `min-width: 0` under a comment calling the logo "the
 * fixed part"), which left `.ui-topbar` 150.3px, `.ui-topbar-start` width 0, and the end cluster's
 * last cell painting at x=384.8 — off a 390px viewport. At 320px the deficit landed entirely on
 * the start cluster because `.ui-topbar-end` was `flex: 0 0 auto`, slicing its only cell to 22 of
 * 32px: the `partiallyObscured` shape gh#639 exists to catch.
 *
 * Reproduced and re-measured in Chromium on /isolate/layout-app-shell-narrow-bar (320/390/768/1440,
 * LTR + RTL): brand 144 -> 48 (no `logoCompact`) / 24 (with one) at 390, `.ui-topbar` 150 -> 246,
 * start cluster 0 -> 32/32, end cluster 150/204 -> 204/204, last end cell fully inside the
 * viewport, and 7/7 cells reaching full visibility when focused at 320.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppShell } from "../app-shell";
import { Topbar } from "../topbar";
import { TopbarItem } from "../topbar-item";

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const shellCss = strip(readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8"));
const layoutCss = strip(readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8"));
const shellTokens = strip(
  readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8"),
);

/** The rule body for `selector`, as authored (declarations only). */
function ruleBody(css: string, selector: string): string {
  const index = css.indexOf(selector);
  expect(index, `${selector} not found`).toBeGreaterThan(-1);
  return css.slice(index + selector.length).split("}")[0];
}

describe("AppShell brand cell shrinks on a narrow bar (gh#728)", () => {
  it("renders the single logo node untouched when no compact brand is given", () => {
    const { container } = render(
      <AppShell topbarSpan="full" logo={<span data-testid="lockup">GoDX Workspace</span>}>
        <div />
      </AppShell>,
    );
    const cell = container.querySelector(".app-topbar-logo");
    expect(cell?.querySelector(".app-topbar-brand")).toBeNull();
    expect(cell).toContainElement(screen.getByTestId("lockup"));
  });

  it("renders BOTH brand nodes, each in a box the breakpoint can drop", () => {
    const { container } = render(
      <AppShell
        topbarSpan="full"
        logo={<span data-testid="lockup">GoDX Workspace</span>}
        logoCompact={<span data-testid="mark">GoDX</span>}
      >
        <div />
      </AppShell>,
    );
    const boxes = container.querySelectorAll(".app-topbar-logo > .app-topbar-brand");
    expect(boxes).toHaveLength(2);
    // Full brand from the step UP, compact brand BELOW it — Flex's own vocabulary, so the two
    // are exact complements and no width can show or hide both.
    expect(boxes[0]).toHaveAttribute("data-hide-below", "sm");
    expect(boxes[0]).toContainElement(screen.getByTestId("lockup"));
    expect(boxes[1]).toHaveAttribute("data-hide-from", "sm");
    expect(boxes[1]).toContainElement(screen.getByTestId("mark"));
  });

  it("honours logoCompactBelow on the shared breakpoint scale", () => {
    const { container } = render(
      <AppShell
        topbarSpan="full"
        logo={<span>GoDX Workspace</span>}
        logoCompact={<span>GoDX</span>}
        logoCompactBelow="lg"
      >
        <div />
      </AppShell>,
    );
    const boxes = container.querySelectorAll(".app-topbar-brand");
    expect(boxes[0]).toHaveAttribute("data-hide-below", "lg");
    expect(boxes[1]).toHaveAttribute("data-hide-from", "lg");
  });

  it("gives the brand cell a shrink contract instead of its intrinsic width", () => {
    const body = ruleBody(shellCss, ".app-topbar-logo {");
    expect(body).toMatch(/max-inline-size: var\(--app-shell-brand-max-inline-size\);/);
    expect(body).toMatch(/min-inline-size: 0;/);
    expect(body).toMatch(/flex: 0 1 auto;/);
    // `clip` + the ring margin, never `hidden`: the same choice every other bar box makes.
    expect(body).toMatch(/overflow: clip;/);
    expect(body).toMatch(/overflow-clip-margin: var\(--focus-ring-clip-margin\);/);
  });

  it("caps the brand below the sm step and steps the library wordmark aside there", () => {
    const narrow = shellCss.slice(shellCss.indexOf("@media (width < 40rem) {"));
    expect(narrow).toMatch(
      /\.app-topbar-logo \{\s*max-inline-size: var\(--app-shell-brand-compact-max-inline-size\);/,
    );
    expect(narrow).toMatch(/\.app-topbar-logo \[data-slot="logo-wordmark"\] \{\s*display: none;/);
  });

  it("declares both caps as component tokens, the compact one at the bar's own height", () => {
    expect(shellTokens).toMatch(/--app-shell-brand-max-inline-size: none;/);
    expect(shellTokens).toMatch(
      /--app-shell-brand-compact-max-inline-size: var\(--app-shell-bar-height\);/,
    );
  });

  it.each(["sm", "md", "lg", "xl"] as const)(
    "%s: drops the brand box the step names, on the package's canonical scale",
    (step) => {
      const min = { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem" }[step];
      expect(layoutCss).toMatch(
        new RegExp(
          `@media \\(width < ${min}\\) \\{[^}]*\\.app-topbar-brand\\[data-hide-below="${step}"\\][^}]*display: none;`,
        ),
      );
      expect(layoutCss).toMatch(
        new RegExp(
          `@media \\(width >= ${min}\\) \\{[^}]*\\.app-topbar-brand\\[data-hide-from="${step}"\\][^}]*display: none;`,
        ),
      );
    },
  );

  it("keeps the brand boxes out of layout when the breakpoint is not deciding", () => {
    expect(ruleBody(shellCss, ".app-topbar-brand {")).toMatch(/display: contents;/);
  });
});

describe("Topbar overflow contract (gh#728)", () => {
  const bar = (props: { overflow?: "scroll" | "clip" }) =>
    render(
      <Topbar
        {...props}
        start={<TopbarItem aria-label="Overview" />}
        end={<TopbarItem aria-label="Account" />}
      />,
    );

  it("publishes scroll as the DEFAULT, so a consumer who does nothing stops clipping", () => {
    const { container } = bar({});
    expect(container.querySelector('[data-slot="topbar"]')).toHaveAttribute(
      "data-overflow",
      "scroll",
    );
  });

  it("publishes the opt-out verbatim", () => {
    const { container } = bar({ overflow: "clip" });
    expect(container.querySelector('[data-slot="topbar"]')).toHaveAttribute(
      "data-overflow",
      "clip",
    );
  });

  it("scrolls the BAR on the inline axis only, with the scrollbar suppressed", () => {
    const body = ruleBody(shellCss, '.ui-topbar[data-overflow="scroll"] {');
    expect(body).toMatch(/overflow-x: auto;/);
    expect(body).toMatch(/overscroll-behavior-inline: contain;/);
    expect(body).toMatch(/scrollbar-width: none;/);
    // The block axis keeps `clip` + its margin from the base rule, so the focus ring keeps its
    // room; scrolling both axes would shave it flush.
    expect(body).not.toMatch(/overflow-y|overflow:\s/);
    expect(shellCss).toMatch(
      /\.ui-topbar\[data-overflow="scroll"\]::-webkit-scrollbar \{\s*display: none;/,
    );
  });

  it("keeps the end cluster's cells whole rather than clamping them into the port", () => {
    const body = ruleBody(shellCss, '.ui-topbar[data-overflow="scroll"] > .ui-topbar-end {');
    expect(body).toMatch(/max-inline-size: none;/);
    expect(body).toMatch(/min-inline-size: auto;/);
  });

  it("floors the start cluster at ONE cell — not at its content, which includes a title", () => {
    const body = ruleBody(shellCss, '.ui-topbar[data-overflow="scroll"] > .ui-topbar-start {');
    expect(body).toMatch(/min-inline-size: var\(--topbar-item-min-width\);/);
    // A content floor here demanded 631px of a 720px bar for a 418px nowrap title at 1024px and
    // pushed the end cluster out of the bar — measured, and the reason this is not `auto`.
    expect(body).not.toMatch(/min-inline-size: auto/);
  });

  it("makes the end cluster shrinkable, so the deficit is no longer all the start cluster's", () => {
    expect(shellCss).toMatch(
      /\.ui-topbar-end \{\s*max-width: 100%;\s*flex: 0 1 auto;\s*margin-inline-start: auto;\s*\}/,
    );
  });
});
