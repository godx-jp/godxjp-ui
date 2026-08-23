import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { SplitPane } from "../split-pane";
import { expectNoA11yViolations } from "@/test/a11y";

describe("SplitPane", () => {
  it("renders the main content and the aside", () => {
    const { getByText, container } = render(
      <SplitPane aside={<nav>サイド</nav>}>
        <main>本文</main>
      </SplitPane>,
    );
    expect(getByText("本文")).toBeInTheDocument();
    expect(getByText("サイド")).toBeInTheDocument();
    expect(container.querySelector(".ui-split-pane-aside")?.tagName).toBe("ASIDE");
  });

  it("defaults asideWidth to md and honours an override", () => {
    const { container, rerender } = render(<SplitPane aside={<div>a</div>}>x</SplitPane>);
    expect(container.querySelector(".ui-split-pane")).toHaveAttribute("data-aside-width", "md");
    rerender(
      <SplitPane aside={<div>a</div>} asideWidth="sm">
        x
      </SplitPane>,
    );
    expect(container.querySelector(".ui-split-pane")).toHaveAttribute("data-aside-width", "sm");
    rerender(
      <SplitPane aside={<div>a</div>} asideWidth="lg">
        x
      </SplitPane>,
    );
    expect(container.querySelector(".ui-split-pane")).toHaveAttribute("data-aside-width", "lg");
  });

  // The attribute assertions above pass whether or not anything styles the
  // value — jsdom applies no stylesheet, so a preset accepted by the type and
  // styled nowhere looks identical to a working one. These read the CSS.
  describe("the preset each value names", () => {
    const layoutCss = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../styles/layout.css"),
      "utf8",
    );

    it.each([
      ["sm", "20rem"],
      ["md", "22rem"],
      ["lg", "30rem"],
    ])("gives %s a rail of %s", (value, width) => {
      expect(layoutCss).toMatch(
        new RegExp(
          `\\.ui-split-pane\\[data-aside-width="${value}"\\]\\s*\\{[^}]*minmax\\(0, 1fr\\) ${width}`,
        ),
      );
    });

    it("splits later for the widest rail than for the narrow ones", () => {
      // A rail wider than the main column is not a rail. At the 48rem threshold
      // the other two use, 30rem of aside would leave 16.5rem of main — so `lg`
      // waits for 64rem, and this is the assertion that says the two numbers
      // move together rather than one of them drifting.
      const blocks = [...layoutCss.matchAll(/@container split-pane \(min-width: ([\d.]+)rem\) \{([\s\S]*?)\n  \}/g)];
      const thresholdFor = (value: string) =>
        Number(blocks.find((b) => b[2].includes(`data-aside-width="${value}"`))?.[1]);

      expect(thresholdFor("sm")).toBe(48);
      expect(thresholdFor("md")).toBe(48);
      expect(thresholdFor("lg")).toBe(64);
      expect(thresholdFor("lg") - 30).toBeGreaterThan(30);
    });
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <SplitPane aside={<nav aria-label="補助">サイド</nav>}>
        <main>本文</main>
      </SplitPane>,
    );
  });
});
