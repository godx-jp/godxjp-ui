import { describe, expect, it } from "vitest";

import { Reveal } from "../reveal";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "my-2";

describe("Reveal", () => {
  it("wraps content in a ui-reveal element with the reveal slot", () => {
    const { getByText, container } = renderWithUi(
      <Reveal>
        <p>コンテンツ</p>
      </Reveal>,
    );
    expect(getByText("コンテンツ")).toBeInTheDocument();
    const root = container.querySelector('[data-slot="reveal"]');
    expect(root).toHaveClass("ui-reveal");
    // delay defaults to 0 → no stagger attribute (enters immediately).
    expect(root).not.toHaveAttribute("data-reveal-delay");
  });

  it("emits the stagger ordinal as a data attribute for positive delays", () => {
    const { container } = renderWithUi(<Reveal delay={3}>x</Reveal>);
    expect(container.querySelector('[data-slot="reveal"]')).toHaveAttribute(
      "data-reveal-delay",
      "3",
    );
  });

  it("merges onto the single child (no wrapper div) when asChild", () => {
    const { container } = renderWithUi(
      <Reveal asChild delay={2} className="extra">
        <section className="panel">パネル</section>
      </Reveal>,
    );
    // No wrapper div: the <section> itself carries the reveal.
    expect(container.querySelector("div.ui-reveal")).toBeNull();
    const section = container.querySelector("section");
    expect(section).toHaveClass("ui-reveal", "panel", "extra");
    expect(section).toHaveAttribute("data-slot", "reveal");
    expect(section).toHaveAttribute("data-reveal-delay", "2");
  });

  it("forwards className and native props to the wrapper", () => {
    const { getByLabelText } = renderWithUi(
      <Reveal className={CONSUMER_CLASS} aria-label="region">
        y
      </Reveal>,
    );
    const root = getByLabelText("region");
    expect(root).toHaveClass("ui-reveal", CONSUMER_CLASS);
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <Reveal delay={1}>
        <p>アクセシブル</p>
      </Reveal>,
    );
  });
});
