import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { Flex } from "../flex";

/**
 * The rules a Flex printed for its raw breakpoints. React hoists a `<style precedence>` into the
 * head and dedupes it by `href`, so this reads the DOCUMENT rather than the rendered subtree —
 * and the node count is itself the dedupe assertion.
 */
const printedRules = () =>
  [...document.head.querySelectorAll('style[data-precedence="ui-flex-raw-breakpoint"]')].map(
    (node) => node.textContent ?? "",
  );

/**
 * Hoisted styles outlive the render that printed them (that is what hoisting IS), so the head is
 * swept between cases. Each case also uses its OWN width, so React's per-document dedupe can
 * never be mistaken for a rule this case failed to print.
 */
beforeEach(() => {
  for (const node of document.head.querySelectorAll(
    'style[data-precedence="ui-flex-raw-breakpoint"]',
  )) {
    node.remove();
  }
});

describe("Flex raw breakpoints — the escape hatch the token steps never had (gh#528)", () => {
  it("emits nothing at all when neither raw width is given (inert default)", () => {
    const { container } = render(<Flex>ナビゲーション</Flex>);
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).not.toHaveAttribute("data-hide-below-raw");
    expect(flex).not.toHaveAttribute("data-hide-from-raw");
    expect(printedRules()).toHaveLength(0);
  });

  it("leaves the measurement on the DOM, the way gapRaw/padRaw do — so escapes stay countable", () => {
    const { container } = render(
      <>
        <Flex hideBelowRaw={900}>ナビゲーション</Flex>
        <Flex hideFromRaw={905}>メニュー</Flex>
      </>,
    );

    expect(container.querySelector('[data-hide-below-raw="900"]')).toBeInTheDocument();
    expect(container.querySelector('[data-hide-from-raw="905"]')).toBeInTheDocument();
  });

  it("prints one media rule per raw width, keyed on the value it folds at", () => {
    render(<Flex hideBelowRaw={910}>ナビゲーション</Flex>);

    expect(printedRules()).toEqual([
      '@media (width < 910px){.ui-flex[data-hide-below-raw="910"]{display:none}}',
    ]);
  });

  it("prints the inverse rule for hideFromRaw", () => {
    render(<Flex hideFromRaw={915}>メニュー</Flex>);

    expect(printedRules()).toEqual([
      '@media (width >= 915px){.ui-flex[data-hide-from-raw="915"]{display:none}}',
    ]);
  });

  /**
   * The seam is the whole point. `< N` and `>= N` partition the width axis with no overlap and no
   * hole, so at EVERY width exactly one of the pair is hidden. An inclusive `<= N` paired with
   * `>= N` — the shape a consumer hand-rolled out of `max-[900px]:` — hides BOTH at exactly N,
   * and that one-pixel hole is what this prop exists to make unreachable (gh#528).
   */
  it("hides exactly one of the pair at every width, including the seam", () => {
    render(
      <>
        <Flex hideBelowRaw={920}>ナビゲーション</Flex>
        <Flex hideFromRaw={920}>メニュー</Flex>
      </>,
    );
    const rules = printedRules().join("\n");
    const below = Number(rules.match(/\(width < (\d+)px\)/)![1]);
    const from = Number(rules.match(/\(width >= (\d+)px\)/)![1]);
    const hiddenAt = (width: number) => Number(width < below) + Number(width >= from);

    expect(hiddenAt(919)).toBe(1);
    expect(hiddenAt(920)).toBe(1);
    expect(hiddenAt(921)).toBe(1);
  });

  it("dedupes the rule across every Flex asking to fold at the same width", () => {
    render(
      <>
        <Flex hideBelowRaw={930}>ナビゲーション</Flex>
        <Flex hideBelowRaw={930}>ロゴ</Flex>
        <Flex hideBelowRaw={930}>言語</Flex>
      </>,
    );

    expect(printedRules()).toHaveLength(1);
  });

  it("wins over the token step, which then emits nothing — the gapRaw contract", () => {
    const { container } = render(
      <Flex hideBelow="md" hideBelowRaw={940}>
        ナビゲーション
      </Flex>,
    );
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).toHaveAttribute("data-hide-below-raw", "940");
    expect(flex).not.toHaveAttribute("data-hide-below");
  });

  it("keeps the token step untouched when no raw width is given", () => {
    const { container } = render(<Flex hideBelow="md">ナビゲーション</Flex>);
    const flex = container.querySelector(".ui-flex")!;

    expect(flex).toHaveAttribute("data-hide-below", "md");
    expect(printedRules()).toHaveLength(0);
  });

  /**
   * The value is interpolated into CSS TEXT. A JS caller has no compiler to stop it handing over
   * a string that closes the media block early, or a NaN, so anything that is not a finite number
   * is treated as absent rather than printed.
   */
  it("ignores a value that is not a finite number instead of printing it into the rule", () => {
    const { container } = render(
      <>
        <Flex hideBelowRaw={"950px){} body{display:none}" as unknown as number}>ナビ</Flex>
        <Flex hideFromRaw={Number.NaN}>メニュー</Flex>
      </>,
    );

    expect(container.querySelector("[data-hide-below-raw]")).toBeNull();
    expect(container.querySelector("[data-hide-from-raw]")).toBeNull();
    expect(printedRules()).toHaveLength(0);
  });
});
