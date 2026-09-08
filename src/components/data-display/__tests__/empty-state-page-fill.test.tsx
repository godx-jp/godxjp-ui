import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ruleSelector } from "@/test/css-selector";
import { EmptyState } from "../empty-state";

/**
 * A `page` empty state is the page's BODY, so when PageContainer `fill` hands the body a definite
 * height the block must take that height and centre in it.
 *
 * Measured on the consumer dashboard at 1440x805 before the rule: body 217px inside a 757px main,
 * the block top-packed at y=240 with 348px of white under it. With `fill` alone the body grew to
 * 541px and the block stayed 201px — the void moved, it did not close. With this rule the block
 * resolves to 525px and its content centres.
 *
 * Asserted the way src/test/css-selector.ts prescribes: the selector is pulled OUT of the shipped
 * stylesheet and run with `.matches()` against really rendered DOM. A string match on the CSS
 * proves the rule says the right thing and nothing about WHICH nodes it reaches — and the whole
 * point of this rule is that it reaches `page` and leaves `section` / `compact` alone.
 */
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "../../../styles/layout.css"), "utf8");

const PAGE_FILL = '.ui-empty-state[data-variant="page"]';

/** The declaration block of the rule whose selector contains `anchor`. */
const ruleBlock = (anchor: string): string => {
  const at = css.indexOf(anchor);
  expect(at, `rule not found for anchor: ${anchor}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close).trim();
};

/** Scoped to its own container — two roots in one test would make `getByRole` ambiguous. */
const root = (variant: "page" | "section" | "compact") =>
  render(<EmptyState variant={variant} title="データなし" />).container
    .firstElementChild as HTMLElement;

describe("EmptyState — the page zero-state owns the page's remaining height", () => {
  it("declares the height and the centring, not one of the two", () => {
    const block = ruleBlock(PAGE_FILL);
    expect(block).toContain("min-block-size: 100%");
    expect(block).toContain("justify-content: center");
  });

  it("selects a really rendered page empty state", () => {
    expect(root("page").matches(ruleSelector(css, PAGE_FILL))).toBe(true);
  });

  it("leaves section and compact alone — they sit inside a host that owns its height", () => {
    const selector = ruleSelector(css, PAGE_FILL);
    expect(root("section").matches(selector)).toBe(false);
    expect(root("compact").matches(selector)).toBe(false);
  });

  it("is the default variant, so a page zero-state gets it without opting in", () => {
    const implicit = render(<EmptyState title="データなし" />).container
      .firstElementChild as HTMLElement;
    expect(implicit.getAttribute("role")).toBe("status");
    expect(implicit.matches(ruleSelector(css, PAGE_FILL))).toBe(true);
  });
});
