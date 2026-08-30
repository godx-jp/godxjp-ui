import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { useEffect } from "react";
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
      const blocks = [
        ...layoutCss.matchAll(
          /@container split-pane \(min-width: ([\d.]+)rem\) \{([\s\S]*?)\n {2}\}/g,
        ),
      ];
      const thresholdFor = (value: string) =>
        Number(blocks.find((b) => b[2].includes(`data-aside-width="${value}"`))?.[1]);

      expect(thresholdFor("sm")).toBe(48);
      expect(thresholdFor("md")).toBe(48);
      expect(thresholdFor("lg")).toBe(64);
      expect(thresholdFor("lg") - 30).toBeGreaterThan(30);
    });
  });

  /*
   * `aside={null}` — the CLOSED rail. The reason this prop value exists is not the geometry
   * (a call site can always drop the whole component) but what dropping the component COSTS:
   * `threadOpen ? <SplitPane aside={<Thread />}>{page}</SplitPane> : page` changes the depth of
   * `{page}` in the React tree, so React remounts it — measured in a consumer as a message list
   * jumping from scrollTop 400 to the bottom the moment a thread opened. Closing through the
   * prop keeps every wrapper mounted, so there is nothing for React to remount.
   */
  describe("a closed rail (aside={null})", () => {
    const layoutCss = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../styles/layout.css"),
      "utf8",
    );

    it("renders NO aside element at all", () => {
      const { container } = render(<SplitPane aside={null}>本文</SplitPane>);
      expect(container.querySelector(".ui-split-pane-aside")).toBeNull();
      expect(container.querySelector("aside")).toBeNull();
    });

    it("keeps the wrapper chain — scope, pane, main — in BOTH states", () => {
      const wrappers = (el: HTMLElement) => [
        el.querySelector(".ui-split-pane-scope"),
        el.querySelector(".ui-split-pane-scope > .ui-split-pane"),
        el.querySelector(".ui-split-pane > .ui-split-pane-main"),
      ];
      const { container, rerender } = render(<SplitPane aside={null}>本文</SplitPane>);
      expect(wrappers(container).every(Boolean)).toBe(true);
      rerender(<SplitPane aside={<div>サイド</div>}>本文</SplitPane>);
      expect(wrappers(container).every(Boolean)).toBe(true);
    });

    it("publishes the state as ONE attribute on the pane, readable by CSS alone", () => {
      // A data attribute on `.ui-split-pane` — not a `:has()` or a child selector — is what lets
      // the stylesheet decide the geometry without depending on what the consumer nested inside.
      const { container, rerender } = render(<SplitPane aside={null}>本文</SplitPane>);
      expect(container.querySelector(".ui-split-pane")).toHaveAttribute("data-aside", "closed");
      rerender(<SplitPane aside={<div>サイド</div>}>本文</SplitPane>);
      // Open emits nothing, so no rule can match and the open state is unchanged (rule #44).
      expect(container.querySelector(".ui-split-pane")).not.toHaveAttribute("data-aside");
    });

    // THE test. jsdom runs no layout, but it does run React's reconciler, and identity of the
    // rendered node across a rerender is exactly the thing the bug destroyed.
    it("does NOT remount children when the rail opens or closes", () => {
      let mounts = 0;
      function Main() {
        useEffect(() => {
          mounts += 1;
        }, []);
        return <div data-testid="main-content">メッセージ一覧</div>;
      }

      const { getByTestId, rerender } = render(
        <SplitPane aside={null}>
          <Main />
        </SplitPane>,
      );
      const beforeOpen = getByTestId("main-content");
      expect(mounts).toBe(1);

      rerender(
        <SplitPane aside={<div>スレッド</div>}>
          <Main />
        </SplitPane>,
      );
      const afterOpen = getByTestId("main-content");
      expect(afterOpen).toBe(beforeOpen);
      expect(mounts).toBe(1);

      rerender(
        <SplitPane aside={null}>
          <Main />
        </SplitPane>,
      );
      const afterClose = getByTestId("main-content");
      expect(afterClose).toBe(beforeOpen);
      expect(mounts).toBe(1);
    });

    // jsdom applies no stylesheet, so "one column, no gap" can only be asserted from the source.
    it("collapses to ONE full-width column with no gap, per the CSS source", () => {
      const rule =
        layoutCss.match(/\.ui-split-pane\[data-aside="closed"\][^{]*\{[^}]*\}/)?.[0] ?? "";
      expect(rule).toMatch(/grid-template-columns: minmax\(0, 1fr\);/);
      expect(rule).toMatch(/gap: 0;/);
      // It has to outrank the two-column width presets, which are plain `.ui-split-pane[attr]`
      // rules: a closed pane must not pick up a 20/22/30rem rail track for an aside that is not
      // in the DOM. The extra attribute in the selector is what buys that.
      expect(rule).toMatch(/\[data-aside-width\]/);
    });

    it("has no axe violations when closed", async () => {
      await expectNoA11yViolations(
        <SplitPane aside={null}>
          <main>本文</main>
        </SplitPane>,
      );
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
