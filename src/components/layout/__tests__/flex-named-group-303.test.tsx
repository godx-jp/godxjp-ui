/**
 * Flex — a NAMED Flex is a `role="group"`, never a named bare `<div>` (gh#303).
 *
 * FormField wires its contract onto its single child with `cloneElement`. When that child is a
 * Flex wrapping a composite field (range from/to pair, 年/月 combo), the naming attributes landed
 * on a role-less `<div>` — invalid ARIA (axe `aria-allowed-attr`, critical, measured on 4 real
 * app screens / 5 nodes: `aria-label`/`aria-labelledby`/`aria-required` on `.ui-flex`).
 *
 * The fix: a Flex that carries a naming attribute and no explicit `role` defaults to
 * `role="group"` and keeps only what the group role allows — `aria-errormessage` folds into
 * `aria-describedby`, widget-only `aria-required`/`aria-invalid` are dropped (the
 * pickGroupFieldA11y policy). Each assertion fails against the previous bare-div rendering.
 */
import { describe, expect, it } from "vitest";

import { Flex } from "../flex";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Flex named-group semantics (gh#303)", () => {
  it("defaults to role='group' when named, folding the error id and dropping widget-only aria", () => {
    const { container } = renderWithUi(
      <Flex
        id="search_amount"
        aria-label="請求金額"
        aria-labelledby="search_amount-label"
        aria-describedby="search_amount-helper"
        aria-errormessage="search_amount-error"
        aria-required
        aria-invalid
      >
        <span>〜</span>
      </Flex>,
    );
    const el = container.querySelector<HTMLElement>(".ui-flex");
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("role", "group");
    expect(el).toHaveAttribute("aria-label", "請求金額");
    expect(el).toHaveAttribute("aria-labelledby", "search_amount-label");
    // Error id folded into the description; the widget-only pair never reaches the DOM.
    expect(el).toHaveAttribute("aria-describedby", "search_amount-helper search_amount-error");
    expect(el).not.toHaveAttribute("aria-errormessage");
    expect(el).not.toHaveAttribute("aria-required");
    expect(el).not.toHaveAttribute("aria-invalid");
  });

  it("stays a plain layout div (no role) when unnamed", () => {
    const { container } = renderWithUi(
      <Flex>
        <span>content</span>
      </Flex>,
    );
    const el = container.querySelector<HTMLElement>(".ui-flex");
    expect(el).not.toBeNull();
    expect(el).not.toHaveAttribute("role");
  });

  it("an explicit role opts out — the caller owns the attribute set", () => {
    const { container } = renderWithUi(
      <Flex role="region" aria-label="一括操作" aria-required>
        <span>content</span>
      </Flex>,
    );
    const el = container.querySelector<HTMLElement>(".ui-flex");
    expect(el).toHaveAttribute("role", "region");
    expect(el).toHaveAttribute("aria-label", "一括操作");
    expect(el).toHaveAttribute("aria-required", "true");
  });

  it("a named Flex passes axe (the exact aria-allowed-attr shape measured in the app)", async () => {
    await expectNoA11yViolations(
      <>
        <span id="search_model_name-label">型番</span>
        <Flex
          id="search_model_name"
          aria-labelledby="search_model_name-label"
          aria-label="型番"
          aria-required
        >
          <span>〜</span>
        </Flex>
      </>,
    );
  });
});
