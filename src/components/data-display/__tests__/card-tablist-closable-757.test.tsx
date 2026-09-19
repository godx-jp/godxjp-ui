import * as React from "react";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";

import { Card } from "../card";
import { Tabs } from "../../navigation/tabs";

/*
 * gh#757 — two gaps a consumer measured in a real browser while building a saved-views strip.
 *
 * 1. `CardTabItemProp` had no `closable`. antd's `CardTabListType` does, and `editable-card`
 *    reads it, so without it the strip was all-or-nothing: every tab got a ×, including the one
 *    that is not deletable (measured 3 removable where 2 was right). It could not be patched from
 *    the outside either — `Card` builds `items` AFTER spreading `...tabProps`, so a hand-written
 *    `items` never survived.
 *
 * 2. A `line` trigger kept the base `flex-1` and stretched. antd puts no `flex-grow` on a tab of
 *    any `type`; `card` was already fixed on exactly that reasoning, `line` was not. Measured on
 *    a 1200px strip: three tabs at 321px each for labels needing 83 / 84 / 56px, so the active
 *    underline ran 321px under a 56px label.
 */
describe("Card tabList — antd `closable` reaches the strip (gh#757)", () => {
  const tabs = [
    { key: "all", tab: "すべての課題", closable: false },
    { key: "mine", tab: "自分の未対応" },
    { key: "week", tab: "今週締切" },
  ];

  it("puts a remove button only on the tabs that allow it", () => {
    renderWithUi(
      <Card
        tabList={tabs}
        activeTabKey="all"
        tabProps={{ variant: "editable-card", hideAdd: true, onEdit: () => {} }}
      >
        body
      </Card>,
    );

    const removable = screen
      .getAllByRole("tab")
      .filter((tab) => tab.querySelector('[data-slot="tabs-tab-remove"]'));

    // Two, not three: 「すべての課題」 opted out.
    expect(removable).toHaveLength(2);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("leaves a tab removable when `closable` is not given — antd's own default", () => {
    renderWithUi(
      <Card
        tabList={[{ key: "a", tab: "A" }]}
        activeTabKey="a"
        tabProps={{ variant: "editable-card", hideAdd: true, onEdit: () => {} }}
      >
        body
      </Card>,
    );

    expect(screen.getByRole("tab").querySelector('[data-slot="tabs-tab-remove"]')).not.toBeNull();
  });
});

describe("Tabs variant=line — a trigger is content-width, like antd (gh#757)", () => {
  it("does not stretch the trigger to an equal share of the strip", () => {
    // The `items` API — the path `Card tabList` renders through, and the one the report measured.
    renderWithUi(
      <Tabs
        variant="line"
        defaultValue="a"
        items={[
          { value: "a", label: "短い", content: null },
          { value: "b", label: "もっとずっと長いラベル", content: null },
        ]}
      />,
    );

    for (const tab of screen.getAllByRole("tab")) {
      const flex = tab.className.split(/\s+/).filter((c) => /^flex-/.test(c));
      // `flex-1` is what made three tabs come out identical widths regardless of label.
      expect(flex).toContain("flex-none");
      expect(flex).not.toContain("flex-1");
    }
  });
});
