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
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <SplitPane aside={<nav aria-label="補助">サイド</nav>}>
        <main>本文</main>
      </SplitPane>,
    );
  });
});
