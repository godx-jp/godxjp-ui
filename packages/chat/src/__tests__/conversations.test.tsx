import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { Conversations } from "../conversations";
import type { ConversationsEntryProp } from "../conversations";

/**
 * Conversations behaviour — the session rail (Ant Design X `Conversations`).
 *
 * The rail is asserted through roles and accessible names only, never through a class: a rail that
 * paints correctly and cannot be driven from the keyboard is the exact defect gh#559 describes
 * (Ant X's own `<li onClick>` has no `tabIndex` and no key handling at all).
 */

const ITEMS: ConversationsEntryProp[] = [
  { key: "c1", label: "請求書の下書き" },
  { key: "c2", label: "経費精算の規則" },
  { key: "c3", label: "出張手当の確認" },
];

const RAIL = "会話";

function rows() {
  return within(screen.getByRole("list", { name: RAIL })).getAllByRole("button");
}

describe("Conversations — rows and selection", () => {
  it("renders one control per conversation inside a named list", () => {
    renderWithUi(<Conversations label={RAIL} items={ITEMS} />);

    expect(rows().map((row) => row.textContent)).toEqual([
      "請求書の下書き",
      "経費精算の規則",
      "出張手当の確認",
    ]);
  });

  it("marks the current conversation with aria-current, not colour alone", () => {
    renderWithUi(<Conversations label={RAIL} items={ITEMS} activeKey="c2" />);

    expect(screen.getByRole("button", { name: "経費精算の規則" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("button", { name: "請求書の下書き" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("reports the picked key AND the entry behind it, and moves an uncontrolled selection", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    renderWithUi(
      <Conversations
        label={RAIL}
        items={ITEMS}
        defaultActiveKey="c1"
        onActiveChange={onActiveChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "出張手当の確認" }));

    expect(onActiveChange).toHaveBeenCalledWith("c3", { key: "c3", label: "出張手当の確認" });
    expect(screen.getByRole("button", { name: "出張手当の確認" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("leaves a CONTROLLED activeKey where the owner put it", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    renderWithUi(
      <Conversations label={RAIL} items={ITEMS} activeKey="c1" onActiveChange={onActiveChange} />,
    );

    await user.click(screen.getByRole("button", { name: "経費精算の規則" }));

    expect(onActiveChange).toHaveBeenCalledWith("c2", expect.anything());
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("keeps a disabled conversation visible but unselectable", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    renderWithUi(
      <Conversations
        label={RAIL}
        items={[...ITEMS, { key: "c4", label: "アーカイブ済み", disabled: true }]}
        onActiveChange={onActiveChange}
      />,
    );

    const archived = screen.getByRole("button", { name: "アーカイブ済み" });
    expect(archived).toBeDisabled();
    await user.click(archived);
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it("draws a `{ type: 'divider' }` entry as a rule, and marks the dashed form", () => {
    const { container } = renderWithUi(
      <Conversations
        label={RAIL}
        items={[ITEMS[0], { type: "divider", key: "d1", dashed: true }, ITEMS[1]]}
      />,
    );

    const rule = container.querySelector(".ui-conversations-separator");
    expect(rule).not.toBeNull();
    expect(rule).toHaveAttribute("data-dashed", "true");
  });
});

describe("Conversations — one tab stop, roving inside it", () => {
  it("puts exactly one row in the tab order, and it is the current conversation", () => {
    renderWithUi(<Conversations label={RAIL} items={ITEMS} activeKey="c2" />);

    const tabbable = rows().filter((row) => row.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("経費精算の規則");
  });

  it("falls back to the first row when nothing is selected yet", () => {
    renderWithUi(<Conversations label={RAIL} items={ITEMS} />);

    expect(rows()[0]).toHaveAttribute("tabindex", "0");
    expect(rows()[1]).toHaveAttribute("tabindex", "-1");
  });

  it("walks the rail with the arrows and wraps at both ends", async () => {
    const user = userEvent.setup();
    renderWithUi(<Conversations label={RAIL} items={ITEMS} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "経費精算の規則" })).toHaveFocus();

    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("button", { name: "出張手当の確認" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    const user = userEvent.setup();
    renderWithUi(<Conversations label={RAIL} items={ITEMS} />);

    await user.tab();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "出張手当の確認" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();
  });

  it("does NOT rove onto a disabled row — a disabled control is not focusable", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Conversations
        label={RAIL}
        items={[ITEMS[0], { key: "cx", label: "アーカイブ済み", disabled: true }, ITEMS[1]]}
      />,
    );

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "経費精算の規則" })).toHaveFocus();
  });

  it("costs ONE Tab for the whole rail, not one per conversation", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Conversations label={RAIL} items={ITEMS} />
        <button type="button">after</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });
});

describe("Conversations — the per-row menu", () => {
  const MENU = {
    items: [
      { key: "rename", label: "名前を変更" },
      { key: "delete", label: "削除", danger: true },
    ],
  };

  it("names the trigger after the row it belongs to", () => {
    renderWithUi(<Conversations label={RAIL} items={ITEMS} menu={MENU} />);

    expect(
      screen.getByRole("button", { name: "Thao tác khác cho 請求書の下書き" }),
    ).toBeInTheDocument();
  });

  it("reports the command AND the conversation it was aimed at", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(<Conversations label={RAIL} items={ITEMS} menu={{ ...MENU, onClick }} />);

    await user.click(screen.getByRole("button", { name: "Thao tác khác cho 経費精算の規則" }));
    await user.click(await screen.findByRole("menuitem", { name: "削除" }));

    expect(onClick).toHaveBeenCalledWith({
      key: "delete",
      conversation: { key: "c2", label: "経費精算の規則" },
    });
  });

  it("accepts the per-row function form, and renders no trigger where it returns nothing", () => {
    renderWithUi(
      <Conversations
        label={RAIL}
        items={ITEMS}
        menu={(conversation) => (conversation.key === "c1" ? MENU : undefined)}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Thao tác khác cho 請求書の下書き" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Thao tác khác cho 経費精算の規則" }),
    ).not.toBeInTheDocument();
  });

  it("honours a caller-supplied trigger name", () => {
    renderWithUi(
      <Conversations
        label={RAIL}
        items={ITEMS}
        menu={{ ...MENU, triggerLabel: (c) => `${String(c.label)} を操作` }}
      />,
    );

    expect(screen.getByRole("button", { name: "請求書の下書き を操作" })).toBeInTheDocument();
  });

  it("reaches the trigger with the FORWARD arrow and comes back with the backward one", async () => {
    const user = userEvent.setup();
    renderWithUi(<Conversations label={RAIL} items={ITEMS} menu={MENU} />);

    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Thao tác khác cho 請求書の下書き" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();
  });

  it("mirrors that pair under dir=rtl — forward is ArrowLeft there", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <div dir="rtl">
        <Conversations label={RAIL} items={ITEMS} menu={MENU} />
      </div>,
    );

    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Thao tác khác cho 請求書の下書き" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();
  });

  it("gives a disabled conversation no menu at all", () => {
    renderWithUi(
      <Conversations
        label={RAIL}
        items={[{ key: "cx", label: "アーカイブ済み", disabled: true }]}
        menu={MENU}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Thao tác khác cho アーカイブ済み" }),
    ).not.toBeInTheDocument();
  });
});

describe("Conversations — grouping", () => {
  const GROUPED: ConversationsEntryProp[] = [
    { key: "c1", label: "請求書の下書き", group: "今日" },
    { key: "c2", label: "経費精算の規則", group: "先週" },
    { key: "c3", label: "出張手当の確認", group: "今日" },
  ];

  it("buckets rows where the FIRST member of each group appears, Ant X's ordering", () => {
    renderWithUi(<Conversations label={RAIL} items={GROUPED} groupable />);

    const today = within(screen.getByRole("list", { name: "今日" })).getAllByRole("button");
    expect(today.map((row) => row.textContent)).toEqual(["請求書の下書き", "出張手当の確認"]);
    expect(
      within(screen.getByRole("list", { name: "先週" }))
        .getAllByRole("button")
        .map((row) => row.textContent),
    ).toEqual(["経費精算の規則"]);
  });

  it("ignores `group` entirely while groupable is off", () => {
    renderWithUi(<Conversations label={RAIL} items={GROUPED} />);

    expect(rows()).toHaveLength(3);
    expect(screen.queryByRole("list", { name: "今日" })).not.toBeInTheDocument();
  });

  it("renders a custom heading, including the function form", () => {
    renderWithUi(
      <Conversations
        label={RAIL}
        items={GROUPED}
        groupable={{ label: (group) => `${group}の会話` }}
      />,
    );

    expect(screen.getByRole("list", { name: "今日の会話" })).toBeInTheDocument();
  });

  it("collapses a bucket from its heading, and says so with aria-expanded", async () => {
    const user = userEvent.setup();
    renderWithUi(<Conversations label={RAIL} items={GROUPED} groupable={{ collapsible: true }} />);

    const heading = screen.getByRole("button", { name: "今日" });
    expect(heading).toHaveAttribute("aria-expanded", "true");

    await user.click(heading);

    expect(heading).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "請求書の下書き" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "経費精算の規則" })).toBeInTheDocument();
  });

  it("puts the headings in the SAME roving order as the rows", async () => {
    const user = userEvent.setup();
    renderWithUi(<Conversations label={RAIL} items={GROUPED} groupable={{ collapsible: true }} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "今日" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "請求書の下書き" })).toHaveFocus();
  });

  it("takes a CONTROLLED expandedKeys and reports the next set through onExpand", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    renderWithUi(
      <Conversations
        label={RAIL}
        items={GROUPED}
        groupable={{ collapsible: true, expandedKeys: ["今日"], onExpand }}
      />,
    );

    expect(screen.getByRole("button", { name: "先週" })).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: "先週" }));

    expect(onExpand).toHaveBeenCalledWith(["今日", "先週"]);
    // Controlled: the rail does not move itself.
    expect(screen.getByRole("button", { name: "先週" })).toHaveAttribute("aria-expanded", "false");
  });

  it("honours defaultExpandedKeys for the uncontrolled form", () => {
    renderWithUi(
      <Conversations
        label={RAIL}
        items={GROUPED}
        groupable={{ collapsible: true, defaultExpandedKeys: ["先週"] }}
      />,
    );

    expect(screen.getByRole("button", { name: "今日" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "先週" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Conversations — creation", () => {
  it("renders the new-conversation button with a localized default and fires it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(<Conversations label={RAIL} items={ITEMS} creation={{ onClick }} />);

    await user.click(screen.getByRole("button", { name: "Hội thoại mới" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is absent unless asked for", () => {
    renderWithUi(<Conversations label={RAIL} items={ITEMS} />);
    expect(screen.queryByRole("button", { name: "Hội thoại mới" })).not.toBeInTheDocument();
  });
});
