import * as React from "react";
import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";

import { renderWithUi } from "@/test/render";
import { PageContainer } from "../page-container";

/**
 * `PageContainer.extra` gains the `{ start, end }` slot map (gh#734).
 *
 * A record header reads identity → action cluster → PAGER LAST, and `extra` could not express
 * "after the actions", so four consumer screens kept a SECOND header band inside the body and the
 * app carried two header shapes. The union is `TabsExtraProp`'s — `Tabs.extra` already accepts
 * exactly this, and a second spelling of one axis is what `check:prop-vocabulary` exists to stop.
 *
 * MEASURED in Chromium (dev preview :6194, /isolate/layout-page-container), the header whose
 * `extra.end` is the record pager:
 *
 *   viewport   h1 (x, y)      actions (x, y)     pager (x, y)      overflow
 *   1440       24.0, 352.1    1054.9, 352.1      1281.1, 352.1     none
 *   390        16.0, 630.0    16.0, 709.9        16.0, 745.9       none (stacks, keeps the order)
 *
 * Header focus order at 1440: ホーム → 不具合 → エクスポート → コメント → 前のページ → 次のページ.
 * DOM order, focus order and visual order agree at both widths, which is the property the slot
 * exists for — the pager is last, and it is last in the accessibility tree too.
 */
describe("PageContainer extra as { start, end } (gh#734)", () => {
  it("renders the end slot AFTER the start slot in DOM order", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="不具合 #1042"
        extra={{
          start: <button type="button">コメント</button>,
          end: <nav aria-label="前後移動">12 / 48</nav>,
        }}
      />,
    );
    const extra = container.querySelector(".ui-page-header-extra")!;
    const order = [...extra.children].map((c) => c.tagName);
    expect(order).toEqual(["BUTTON", "NAV"]);
    // Position-in-document, not just child index: the pager follows the actions.
    expect(
      extra.children[0].compareDocumentPosition(extra.children[1]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("puts both slots in the accessibility tree, in that order", () => {
    renderWithUi(
      <PageContainer
        title="不具合 #1042"
        extra={{
          start: (
            <>
              <button type="button">エクスポート</button>
              <button type="button">コメント</button>
            </>
          ),
          end: (
            <nav aria-label="前後移動">
              <button type="button">前のページ</button>
              <button type="button">次のページ</button>
            </nav>
          ),
        }}
      />,
    );
    const header = screen.getByRole("banner", { hidden: true }) ?? document.querySelector("header");
    const names = [...(header as HTMLElement).querySelectorAll("button")].map((b) =>
      b.textContent?.trim(),
    );
    expect(names).toEqual(["エクスポート", "コメント", "前のページ", "次のページ"]);
    // The pager keeps its own landmark name, so it is reachable as a region, not a loose row.
    expect(
      within(header as HTMLElement).getByRole("navigation", { name: "前後移動" }),
    ).toBeTruthy();
  });

  it("is ABSENT when unused — a bare node still means what it always did", () => {
    const { container } = renderWithUi(
      <PageContainer title="不具合 #1042" extra={<button type="button">コメント</button>} />,
    );
    const extra = container.querySelector(".ui-page-header-extra")!;
    // Exactly the DOM a bare `extra` produced before this change: one child, no wrapper.
    expect(extra.children).toHaveLength(1);
    expect(extra.children[0].tagName).toBe("BUTTON");
    expect(container.querySelector("nav")).toBeNull();
  });

  it("renders only the end slot when that is all there is", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="不具合 #1042"
        extra={{ end: <nav aria-label="前後移動">12 / 48</nav> }}
      />,
    );
    const extra = container.querySelector(".ui-page-header-extra")!;
    expect(extra.children).toHaveLength(1);
    expect(extra.children[0].tagName).toBe("NAV");
  });

  it("renders no header-extra box at all when `extra` is omitted", () => {
    const { container } = renderWithUi(<PageContainer title="不具合 #1042" />);
    expect(container.querySelector(".ui-page-header-extra")).toBeNull();
  });

  it("renders no box for an EMPTY slot map either", () => {
    const { container } = renderWithUi(<PageContainer title="不具合 #1042" extra={{}} />);
    expect(container.querySelector(".ui-page-header-extra")).toBeNull();
  });

  it("does not wrap either slot — the tested overflow rule matches DIRECT children only", () => {
    // `.ui-page-header-extra > .ui-flex[data-direction="row"]` is what keeps an action group from
    // running over the <h1> (see styles/__tests__/page-header-extra-wrap.test.ts). A wrapper
    // element around a slot would silently disarm it, so neither slot gets one.
    const { container } = renderWithUi(
      <PageContainer
        title="不具合 #1042"
        extra={{
          start: <div className="ui-flex" data-direction="row" />,
          end: <div className="ui-flex" data-direction="row" />,
        }}
      />,
    );
    const extra = container.querySelector(".ui-page-header-extra")!;
    expect(extra.querySelectorAll(':scope > .ui-flex[data-direction="row"]')).toHaveLength(2);
  });
});
