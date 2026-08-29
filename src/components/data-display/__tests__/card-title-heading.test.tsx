import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { CardTitle } from "../card";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * A consumer-supplied utility, hoisted so the literal appears once as a FIXTURE rather than as an
 * assertion about how the component is painted. What is under test is pass-through: whatever class
 * the consumer hands in survives `cn()` onto the rendered node.
 */
const CONSUMER_CLASS = "text-primary";

describe("CardTitle — semantic heading level (#154)", () => {
  it("defaults to an <h3> (unchanged) so existing usage is untouched", () => {
    const { getByRole } = render(<CardTitle>概要</CardTitle>);
    const heading = getByRole("heading", { level: 3 });
    expect(heading.tagName).toBe("H3");
    expect(heading).toHaveAttribute("data-slot", "card-title");
    expect(heading).toHaveTextContent("概要");
  });

  it("renders the chosen `level` as the matching heading element (h1–h4)", () => {
    const { getByRole, rerender } = render(<CardTitle level={2}>Section</CardTitle>);
    expect(getByRole("heading", { level: 2 }).tagName).toBe("H2");
    rerender(<CardTitle level={4}>Nested</CardTitle>);
    expect(getByRole("heading", { level: 4 }).tagName).toBe("H4");
  });

  it("keeps the same card-title styling hook regardless of level (size is token-driven, not level-driven)", () => {
    const { getByRole } = render(<CardTitle level={2}>T</CardTitle>);
    expect(getByRole("heading", { level: 2 })).toHaveAttribute("data-slot", "card-title");
  });

  it("renders a non-heading element via `as` (title that is not a section heading)", () => {
    const { queryByRole, getByText } = render(<CardTitle as="p">ラベル</CardTitle>);
    // Not announced as a heading — no heading role in the tree.
    expect(queryByRole("heading")).toBeNull();
    expect(getByText("ラベル").tagName).toBe("P");
  });

  it("forwards className and other props onto the rendered element", () => {
    const { getByRole } = render(
      <CardTitle level={2} className={CONSUMER_CLASS} id="t1">
        X
      </CardTitle>,
    );
    const heading = getByRole("heading", { level: 2 });
    expect(heading).toHaveClass(CONSUMER_CLASS);
    expect(heading).toHaveAttribute("id", "t1");
  });

  it("has no axe violations in a valid outline (h1 → h2 card title)", async () => {
    await expectNoA11yViolations(
      <main>
        <h1>ページ見出し</h1>
        <CardTitle level={2}>セクション見出し</CardTitle>
      </main>,
    );
  });
});
