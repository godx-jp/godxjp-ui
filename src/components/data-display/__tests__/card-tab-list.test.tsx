import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { ruleSelectors } from "@/test/css-selector";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../card";
import { DataTable } from "../data-table";

/**
 * antd's `Card tabList` (gh#570) — the tab strip that belongs to the CARD, not to the page beside
 * it: under the title, inside the same border, on the same surface, with the card's own children
 * as the selected tab's body.
 *
 * Assertions are on ROLES and ACCESSIBLE NAMES, never on Tailwind classes (there is a gate for
 * that). Where the claim is geometric, it is made the way card-flush-through-tabs.test.tsx makes
 * it — `ruleSelectors` + `.matches()` against really rendered DOM — because jsdom performs no
 * layout and a string match on the stylesheet proves only that a rule SAYS something.
 */
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/card-layout.css"),
  "utf8",
);

const tabList = [
  { key: "all", tab: "すべて" },
  { key: "open", tab: "未対応" },
  { key: "closed", tab: "完了", disabled: true },
];

const rows = [
  { id: 1, name: "アルファ" },
  { id: 2, name: "ベータ" },
];

function Detail(props: React.ComponentProps<typeof Card>) {
  return (
    <Card tabList={tabList} {...props}>
      <CardHeader>
        <CardTitle>問い合わせ</CardTitle>
      </CardHeader>
      <CardContent flush>
        <DataTable
          data={rows}
          getRowId={(row) => String(row.id)}
          columns={[{ key: "name" as const, header: "名前" }]}
        />
      </CardContent>
      <CardFooter separated>footer</CardFooter>
    </Card>
  );
}

const cardOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="card"]')!;

describe("Card tabList — antd's API, name for name", () => {
  it("renders every entry as a real tab, labelled by `tab`", () => {
    renderWithUi(<Detail />);
    const strip = screen.getByRole("tablist");

    expect(
      within(strip)
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["すべて", "未対応", "完了"]);
  });

  it("`disabled` keeps the tab in the strip and out of the selection", () => {
    renderWithUi(<Detail />);

    expect(screen.getByRole("tab", { name: "完了" })).toBeDisabled();
  });

  it("opens the first selectable tab when no key is given — antd's own fallback", () => {
    renderWithUi(<Detail />);

    expect(screen.getByRole("tab", { name: "すべて" })).toHaveAttribute("aria-selected", "true");
  });

  it("`defaultActiveTabKey` opens that tab, uncontrolled", async () => {
    renderWithUi(<Detail defaultActiveTabKey="open" />);

    expect(screen.getByRole("tab", { name: "未対応" })).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("tab", { name: "すべて" }));
    expect(screen.getByRole("tab", { name: "すべて" })).toHaveAttribute("aria-selected", "true");
  });

  it("`onTabChange` reports the antd KEY, not an index or an event", async () => {
    const onTabChange = vi.fn();
    renderWithUi(<Detail onTabChange={onTabChange} />);

    await userEvent.click(screen.getByRole("tab", { name: "未対応" }));

    expect(onTabChange).toHaveBeenCalledWith("open");
  });

  it("`activeTabKey` is CONTROLLED — the card does not move itself", async () => {
    const onTabChange = vi.fn();
    renderWithUi(<Detail activeTabKey="all" onTabChange={onTabChange} />);

    await userEvent.click(screen.getByRole("tab", { name: "未対応" }));

    expect(onTabChange).toHaveBeenCalledWith("open");
    expect(screen.getByRole("tab", { name: "すべて" })).toHaveAttribute("aria-selected", "true");
  });

  it("the card's children ARE the selected tab's body, and move with the selection", async () => {
    const onTabChange = vi.fn();
    const { rerender } = renderWithUi(
      <Card tabList={tabList} activeTabKey="all" onTabChange={onTabChange}>
        <CardHeader>
          <CardTitle>問い合わせ</CardTitle>
        </CardHeader>
        <CardContent>すべての件数: 2</CardContent>
      </Card>,
    );

    expect(within(screen.getByRole("tabpanel")).getByText("すべての件数: 2")).toBeInTheDocument();

    rerender(
      <Card tabList={tabList} activeTabKey="open" onTabChange={onTabChange}>
        <CardHeader>
          <CardTitle>問い合わせ</CardTitle>
        </CardHeader>
        <CardContent>未対応の件数: 1</CardContent>
      </Card>,
    );

    expect(within(screen.getByRole("tabpanel")).getByText("未対応の件数: 1")).toBeInTheDocument();
  });

  it("`extra` is antd's tabBarExtraContent — it rides the tab bar, not the header", () => {
    renderWithUi(<Detail extra={<button type="button">新規</button>} />);

    const bar = screen.getByRole("tablist").closest(".ui-tabs-bar");
    expect(bar, "the strip is in a bar row once `extra` is present").not.toBeNull();
    expect(within(bar as HTMLElement).getByRole("button", { name: "新規" })).toBeInTheDocument();
  });

  it("`tabProps` reaches the Tabs underneath", () => {
    const { container } = renderWithUi(<Detail tabProps={{ variant: "card", centered: true }} />);
    const tabs = container.querySelector<HTMLElement>('[data-slot="tabs"]')!;

    expect(tabs).toHaveAttribute("data-variant", "card");
    expect(tabs).toHaveAttribute("data-centered", "true");
  });

  it("a Card WITHOUT tabList keeps byte-identical DOM — no strip, no wrapper, no attribute", () => {
    const { container } = renderWithUi(
      <Card>
        <CardContent>body</CardContent>
      </Card>,
    );

    expect(cardOf(container)).not.toHaveAttribute("data-tab-list");
    expect(container.querySelector('[data-slot="tabs"]')).toBeNull();
    expect(cardOf(container).firstElementChild).toHaveAttribute("data-slot", "card-content");
  });
});

describe("Card tabList — the strip is IN the card's head", () => {
  it("strip, panel and footer are all inside the one card, in reading order", () => {
    const { container } = renderWithUi(<Detail />);
    const card = cardOf(container);
    const header = card.querySelector<HTMLElement>('[data-slot="card-header"]')!;
    const strip = screen.getByRole("tablist");
    const panel = screen.getByRole("tabpanel");
    const footer = card.querySelector<HTMLElement>('[data-slot="card-footer"]')!;

    for (const node of [header, strip, panel, footer]) {
      expect(card.contains(node), "every band is inside the card's border").toBe(true);
    }

    const follows = (a: Node, b: Node) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(follows(header, strip), "the strip sits UNDER the title").toBe(true);
    expect(follows(strip, panel), "the body sits under the strip").toBe(true);
    expect(follows(panel, footer), "the footer stays below the body").toBe(true);
  });

  it("header and footer stay DIRECT children of the card, so every `>` rule still reaches them", () => {
    const { container } = renderWithUi(<Detail />);
    const card = cardOf(container);

    expect(card.querySelector(':scope > [data-slot="card-header"]')).not.toBeNull();
    expect(card.querySelector(':scope > [data-slot="card-footer"]')).not.toBeNull();
    expect(card.querySelector(':scope > [data-slot="tabs"]')).not.toBeNull();
  });

  it("the panel adds NO second inset of its own — the card body still owns the column", () => {
    const { container } = renderWithUi(<Detail />);
    const panel = container.querySelector<HTMLElement>('[data-slot="tabs-panel"]')!;
    const zeroed = ruleSelectors(
      css,
      '[data-slot="card"] > [data-slot="tabs"] > [data-slot="tabs-panel"]',
    );
    const generic = ruleSelectors(css, '[data-slot="card"] [data-slot="tabs-panel"]');

    // Both rules match this panel, so ORDER and SPECIFICITY decide which inset survives.
    expect(generic.some((selector) => panel.matches(selector))).toBe(true);
    expect(zeroed.some((selector) => panel.matches(selector))).toBe(true);
    expect(css.indexOf(zeroed[0]!)).toBeGreaterThan(css.indexOf(generic[0]!));

    // And it must actually ZERO the inset. Selecting the right element and then re-applying
    // `--card-space-inset` would leave the body double-padded with the rule still in the file —
    // the shape of gh#554, one link further down the chain.
    const open = css.indexOf(
      "{",
      css.indexOf('[data-slot="card"] > [data-slot="tabs"] > [data-slot="tabs-panel"]'),
    );
    expect(css.slice(open + 1, css.indexOf("}", open)).trim()).toBe("padding: 0;");
  });
});

describe("Card tabList — a DataTable in a tab still reaches the card edge (gh#554)", () => {
  it("the flush body inside the panel is the SAME element the flush rules select", () => {
    const { container } = renderWithUi(<Detail />);
    const body = container.querySelector<HTMLElement>('[data-slot="card-content"]')!;
    const inline = ruleSelectors(css, '[data-slot="card-content"][data-flush] {');

    expect(body).toHaveAttribute("data-flush", "");
    expect(inline.some((selector) => body.matches(selector))).toBe(true);
  });

  it("and the table scroller under it is released too, by the rule that always released it", () => {
    const tableCss = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../styles/table-layout.css"),
      "utf8",
    );
    const { container } = renderWithUi(<Detail />);
    const scroller = container.querySelector<HTMLElement>(".ui-data-table-scroll")!;
    const released = ruleSelectors(
      tableCss,
      '[data-slot="card-content"][data-flush] .ui-data-table-scroll {',
    );

    expect(scroller, "the example really renders a DataTable scroller").not.toBeNull();
    expect(released.some((selector) => scroller.matches(selector))).toBe(true);
  });

  it("a NON-flush tab body keeps its inset — prose in a tab still reads correctly", () => {
    const { container } = renderWithUi(
      <Card tabList={tabList}>
        <CardContent>prose</CardContent>
      </Card>,
    );
    const body = container.querySelector<HTMLElement>('[data-slot="card-content"]')!;
    const inline = ruleSelectors(css, '[data-slot="card-content"][data-flush] {');

    expect(inline.some((selector) => body.matches(selector))).toBe(false);
  });
});
