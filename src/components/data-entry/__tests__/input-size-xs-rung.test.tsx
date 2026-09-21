import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input";

/**
 * THE MOST-USED CONTROL WAS THE ONE MISSING THE BOTTOM RUNG.
 *
 * `InputProp.size` was `"sm" | "md" | "lg"`. Everything underneath `xs` already worked:
 *
 *   · `Input` renders `ui-control` and emits `data-size={size}`
 *   · `.ui-control[data-size="xs"]` (src/styles/control.css:1674) binds `--control-height-xs`
 *   · that rule was added FOR the select family, and its own comment says the token "existed
 *     with nothing reading it" — the same defect, one tier up, fixed there and not here
 *
 * So the restriction was type-level only, and it made the package's most-used control the one
 * control that could not sit in an `xs` row beside a `Select` or a `NumberInput` that could. No
 * behaviour explained it; a consumer could only discover it by the compiler saying no.
 *
 * This asserts the attribute reaches the DOM, which is what the CSS selects on. The height itself
 * is the token tier's business and `check:control-sizing` guards that.
 */
describe("Input carries the whole size ladder (xs|sm|md|lg)", () => {
  it.each(["xs", "sm", "md", "lg"] as const)("emits data-size=%s for the CSS to select", (size) => {
    const { container } = render(<Input size={size} aria-label="テスト" />);
    expect(container.querySelector(`[data-size="${size}"]`)).not.toBeNull();
  });

  it("keeps ui-control, which is what the size rule is scoped to", () => {
    const { container } = render(<Input size="xs" aria-label="テスト" />);
    expect(container.querySelector(".ui-control")).not.toBeNull();
  });
});
