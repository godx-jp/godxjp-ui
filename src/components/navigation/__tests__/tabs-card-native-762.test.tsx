import * as React from "react";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";

import { Tabs } from "../tabs";

/*
 * gh#762 — "card tabs must be NATIVE". Building one saved-views strip on a consumer app took four
 * rounds, each hitting a different hole in the same place. Two of them (per-item `closable`, the
 * `line` trigger width) landed in gh#757; these are the two that did not.
 *
 * 1. THE PANEL DID NOT JOIN THE STRIP. `variant="card"` repaints the active face's block-end edge
 *    in the surface colour — antd's `genCardStyle` — but the package shipped no surface for it to
 *    open into, so the consumer had to pick a box and all three candidates were wrong (measured
 *    at 1440px: `<Card>` 8px gap + a second 1px border at a 9.708px radius, `<Card
 *    variant="borderless">` 8px gap, no box 8px gap). `bodied` is the missing half.
 *
 * 2. NO COUNT ON A TAB. 「未対応 12」 is the shape of every list screen, and the only way to get
 *    it was to put the number inside `label`, which loses the tone, the size and — the part this
 *    file guards — the accessible name: digits concatenated straight onto the label read
 *    «未対応12» (gh#734's measured defect on Button).
 */

const CARD_ITEMS = [
  { value: "a", label: "サマリ", content: <p>summary</p> },
  { value: "b", label: "明細", content: <p>detail</p> },
];

describe("Tabs bodied — the strip and the panel are one object (gh#762)", () => {
  it("marks the root bodied for the card variants, which is what the CSS joins on", () => {
    const { container } = renderWithUi(<Tabs variant="card" bodied items={CARD_ITEMS} />);
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-bodied", "true");
  });

  it("marks it for editable-card too — the saved-views strip the issue draws", () => {
    const { container } = renderWithUi(
      <Tabs variant="editable-card" bodied onEdit={() => {}} items={CARD_ITEMS} />,
    );
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute("data-bodied", "true");
  });

  it.each(["default", "line"] as const)(
    "emits NOTHING for variant=%s — the pill strip floats and the line strip's body is its Card",
    (variant) => {
      const { container } = renderWithUi(<Tabs variant={variant} bodied items={CARD_ITEMS} />);
      expect(container.querySelector('[data-slot="tabs"]')).not.toHaveAttribute("data-bodied");
    },
  );

  it("emits nothing without the prop, so every 28.0.0 card strip keeps its exact DOM", () => {
    const { container } = renderWithUi(<Tabs variant="card" items={CARD_ITEMS} />);
    expect(container.querySelector('[data-slot="tabs"]')).not.toHaveAttribute("data-bodied");
  });

  it("keeps the panel a real tabpanel — a body is paint, never a change of role", async () => {
    renderWithUi(<Tabs variant="card" bodied items={CARD_ITEMS} />);
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("summary");

    await userEvent.click(screen.getByRole("tab", { name: "明細" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("detail");
  });
});

describe("TabItemProp.count — the counter, and above all its accessible name (gh#762)", () => {
  it('reads "<label>, <count> <countLabel>" — never the concatenated «未対応12»', () => {
    renderWithUi(
      <Tabs
        variant="line"
        items={[
          {
            value: "open",
            label: "未対応",
            count: 12,
            countLabel: "件の課題",
            content: <p>open</p>,
          },
        ]}
      />,
    );
    // The name a screen reader announces. `getByRole` runs the real accessible-name
    // computation, so the `aria-hidden` pill is excluded and only the sr-only clause counts.
    expect(screen.getByRole("tab", { name: "未対応, 12 件の課題" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "未対応12" })).toBeNull();
  });

  it("falls back to the bare number when the label already carries the meaning", () => {
    renderWithUi(
      <Tabs
        variant="line"
        items={[{ value: "open", label: "未対応", count: 3, content: <p>open</p> }]}
      />,
    );
    expect(screen.getByRole("tab", { name: "未対応, 3" })).toBeInTheDocument();
  });

  it("hides the pill from the accessibility tree, so the digits are announced once", () => {
    const { container } = renderWithUi(
      <Tabs
        variant="line"
        items={[{ value: "open", label: "未対応", count: 12, content: <p>open</p> }]}
      />,
    );
    const pill = container.querySelector('[data-slot="tabs-count"]');
    expect(pill).not.toBeNull();
    expect(pill).toHaveAttribute("aria-hidden", "true");
    expect(pill).toHaveTextContent("12");
  });

  it("formats through Intl in the active locale, never String(n)", () => {
    renderWithUi(
      <Tabs
        variant="line"
        items={[
          {
            value: "all",
            label: "全期間",
            count: 12345,
            overflowCount: 99999,
            content: <p>all</p>,
          },
        ]}
      />,
    );
    // AppProvider's test locale is vi, whose group separator is "." — asserting the literal
    // "12345" would pass under a hand-rolled String(n) and fail the localisation contract.
    const expected = new Intl.NumberFormat("vi").format(12345);
    expect(screen.getByRole("tab", { name: `全期間, ${expected}` })).toBeInTheDocument();
  });

  it("caps at overflowCount — 99 by default, the same cap Button and antd Badge use", () => {
    renderWithUi(
      <Tabs
        variant="line"
        items={[
          { value: "a", label: "既定", count: 340, content: null },
          { value: "b", label: "上げた", count: 340, overflowCount: 999, content: null },
        ]}
      />,
    );
    expect(screen.getByRole("tab", { name: "既定, 99+" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "上げた, 340" })).toBeInTheDocument();
  });

  it("draws a zero by default and drops it under showZero={false}", () => {
    const { container } = renderWithUi(
      <Tabs
        variant="line"
        items={[
          { value: "a", label: "保留", count: 0, content: null },
          { value: "b", label: "却下", count: 0, showZero: false, content: null },
        ]}
      />,
    );
    expect(screen.getByRole("tab", { name: "保留, 0" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "却下" })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="tabs-count"]')).toHaveLength(1);
  });

  it("adds no pill and no name clause when there is no count", () => {
    const { container } = renderWithUi(
      <Tabs variant="line" items={[{ value: "a", label: "サマリ", content: null }]} />,
    );
    expect(screen.getByRole("tab", { name: "サマリ" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="tabs-count"]')).toBeNull();
  });

  it("carries the count on a REMOVABLE card tab without disturbing the × or its shortcut", () => {
    const { container } = renderWithUi(
      <Tabs
        variant="editable-card"
        bodied
        onEdit={() => {}}
        items={[
          { value: "all", label: "すべて", count: 340, closable: false, content: null },
          { value: "mine", label: "自分", count: 12, content: null },
        ]}
      />,
    );
    const tabs = screen.getAllByRole("tab");
    // The × is on the closable one only — gh#757's measurement, re-asserted here because the
    // count renders between the label and the ×.
    expect(tabs[0]!.querySelector('[data-slot="tabs-tab-remove"]')).toBeNull();
    expect(tabs[1]!.querySelector('[data-slot="tabs-tab-remove"]')).not.toBeNull();
    expect(tabs[0]).not.toHaveAttribute("aria-keyshortcuts");
    expect(tabs[1]).toHaveAttribute("aria-keyshortcuts", "Delete");
    expect(container.querySelectorAll('[data-slot="tabs-count"]')).toHaveLength(2);
  });

  it("still removes on Delete with a count present — the APG route, not the × glyph", async () => {
    const removed: string[] = [];
    renderWithUi(
      <Tabs
        variant="editable-card"
        bodied
        onEdit={(target, action) => {
          if (action === "remove") removed.push(String(target));
        }}
        items={[
          { value: "all", label: "すべて", count: 340, content: null },
          { value: "mine", label: "自分", count: 12, content: null },
        ]}
      />,
    );
    screen.getByRole("tab", { name: "すべて, 99+" }).focus();
    await userEvent.keyboard("{Delete}");
    expect(removed).toEqual(["all"]);
  });
});
