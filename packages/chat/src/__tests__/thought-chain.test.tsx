import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { ThoughtChain, ThoughtChainItem } from "../thought-chain";
import type { ThoughtChainItemsProp } from "../thought-chain";

/**
 * ThoughtChain behaviour — the assistant's reasoning, step by step (Ant Design X `ThoughtChain`).
 *
 * The two things Ant's own chain does NOT have are asserted hardest: a collapsible step that can
 * be opened from the keyboard and says so (`<div onClick>` there), and a status that is a WORD as
 * well as a glyph (a tinted icon there, and nothing else).
 */

const STEPS: ThoughtChainItemsProp[] = [
  { key: "read", title: "資料を読む", description: "3件", status: "success" },
  { key: "search", title: "社内規程を検索", status: "loading" },
  { key: "write", title: "下書きを書く", status: "abort" },
];

const CHAIN = "思考";

describe("ThoughtChain — the shape", () => {
  it("is an ORDERED list, so each step's position is announced", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={STEPS} />);

    const list = screen.getByRole("list", { name: CHAIN });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("falls back to a localized chain name", () => {
    renderWithUi(<ThoughtChain items={STEPS} />);

    expect(screen.getByRole("list", { name: "Các bước suy luận" })).toBeInTheDocument();
  });

  it("numbers a step that brings no icon, 1-based as in Ant X", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={[{ key: "a", title: "一歩目" }]} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("lets a step bring its own glyph instead of the ordinal", () => {
    renderWithUi(
      <ThoughtChain label={CHAIN} items={[{ key: "a", title: "一歩目", icon: <span>★</span> }]} />,
    );

    expect(screen.getByText("★")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("drops the glyph column entirely on `icon: false` — Ant's own escape", () => {
    const { container } = renderWithUi(
      <ThoughtChain label={CHAIN} items={[{ key: "a", title: "一歩目", icon: false }]} />,
    );

    expect(container.querySelector('[data-slot="thought-chain-icon"]')).toBeNull();
  });

  it("carries `line` as an attribute so the connector is a token decision", () => {
    const { container } = renderWithUi(<ThoughtChain label={CHAIN} items={STEPS} line="dashed" />);
    expect(container.querySelector('[data-slot="thought-chain"]')).toHaveAttribute(
      "data-line",
      "dashed",
    );

    const { container: off } = renderWithUi(
      <ThoughtChain label={CHAIN} items={STEPS} line={false} />,
    );
    expect(off.querySelector('[data-slot="thought-chain"]')).toHaveAttribute("data-line", "none");
  });

  it("renders description, content and footer where the step asks for them", () => {
    renderWithUi(
      <ThoughtChain
        label={CHAIN}
        items={[
          {
            key: "a",
            title: "一歩目",
            description: "説明",
            content: <p>本文</p>,
            footer: <span>脚注</span>,
          },
        ]}
      />,
    );

    expect(screen.getByText("説明")).toBeInTheDocument();
    expect(screen.getByText("本文")).toBeInTheDocument();
    expect(screen.getByText("脚注")).toBeInTheDocument();
  });
});

describe("ThoughtChain — the status is a word, not only a glyph", () => {
  it("says how each step ended", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={STEPS} />);

    expect(screen.getByText("xong")).toBeInTheDocument();
    expect(screen.getByText("đang chạy")).toBeInTheDocument();
    expect(screen.getByText("đã dừng")).toBeInTheDocument();
  });

  it("says so when a step failed", () => {
    renderWithUi(
      <ThoughtChain label={CHAIN} items={[{ key: "a", title: "一歩目", status: "error" }]} />,
    );

    expect(screen.getByText("thất bại")).toBeInTheDocument();
  });

  it("says nothing when a step has no status", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={[{ key: "a", title: "一歩目" }]} />);

    expect(screen.queryByText("xong")).not.toBeInTheDocument();
    expect(screen.queryByText("thất bại")).not.toBeInTheDocument();
  });
});

describe("ThoughtChain — the disclosure", () => {
  const COLLAPSIBLE: ThoughtChainItemsProp[] = [
    { key: "a", title: "一歩目", content: <p>一歩目の出力</p>, collapsible: true },
    { key: "b", title: "二歩目", content: <p>二歩目の出力</p>, collapsible: true },
  ];

  it("is a real button that reports its state", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={COLLAPSIBLE} />);

    expect(screen.getByRole("button", { name: "一歩目" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens from the keyboard and points at the body it opened", async () => {
    const user = userEvent.setup();
    renderWithUi(<ThoughtChain label={CHAIN} items={COLLAPSIBLE} />);

    const trigger = screen.getByRole("button", { name: "一歩目" });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const bodyId = trigger.getAttribute("aria-controls");
    expect(bodyId).toBeTruthy();
    expect(document.getElementById(bodyId!)).toHaveTextContent("一歩目の出力");
  });

  it("UNMOUNTS the body while collapsed by default, as Ant's destroyOnHidden does", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={COLLAPSIBLE} />);

    expect(screen.queryByText("一歩目の出力")).not.toBeInTheDocument();
  });

  it("keeps the body mounted when destroyOnHidden is false", () => {
    renderWithUi(
      <ThoughtChain label={CHAIN} items={[{ ...COLLAPSIBLE[0], destroyOnHidden: false }]} />,
    );

    // In the DOM, but hidden — which is the whole difference between the two settings.
    const body = screen.getByText("一歩目の出力").closest("[hidden]");
    expect(body).not.toBeNull();
  });

  it("shows the body of a step that is not collapsible at all", () => {
    renderWithUi(
      <ThoughtChain label={CHAIN} items={[{ key: "a", title: "一歩目", content: <p>出力</p> }]} />,
    );

    expect(screen.getByText("出力")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "一歩目" })).not.toBeInTheDocument();
  });

  it("honours defaultExpandedKeys", () => {
    renderWithUi(<ThoughtChain label={CHAIN} items={COLLAPSIBLE} defaultExpandedKeys={["b"]} />);

    expect(screen.getByRole("button", { name: "二歩目" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "一歩目" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("takes a CONTROLLED expandedKeys and only reports the next set", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    renderWithUi(
      <ThoughtChain label={CHAIN} items={COLLAPSIBLE} expandedKeys={["a"]} onExpand={onExpand} />,
    );

    await user.click(screen.getByRole("button", { name: "二歩目" }));

    expect(onExpand).toHaveBeenCalledWith(["a", "b"]);
    // Controlled: the chain does not move itself.
    expect(screen.getByRole("button", { name: "二歩目" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

describe("ThoughtChainItem — the standalone step", () => {
  it("is NOT a control when it has no onClick", () => {
    renderWithUi(<ThoughtChainItem title="ツールを呼び出した" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("ツールを呼び出した")).toBeInTheDocument();
  });

  it("becomes a real button the moment it is clickable — Ant leaves it a div", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(<ThoughtChainItem title="ツールを呼び出した" onClick={onClick} />);

    const button = screen.getByRole("button", { name: /ツールを呼び出した/ });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(<ThoughtChainItem title="ツール" onClick={onClick} disabled />);

    await user.click(screen.getByRole("button", { name: /ツール/ }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("carries the variant as an attribute", () => {
    const { container } = renderWithUi(<ThoughtChainItem title="ツール" variant="outlined" />);

    expect(container.querySelector('[data-slot="thought-chain-item"]')).toHaveAttribute(
      "data-variant",
      "outlined",
    );
  });

  it("defaults to Ant's `solid`", () => {
    const { container } = renderWithUi(<ThoughtChainItem title="ツール" />);

    expect(container.querySelector('[data-slot="thought-chain-item"]')).toHaveAttribute(
      "data-variant",
      "solid",
    );
  });

  it("spells its status out here too", () => {
    renderWithUi(<ThoughtChainItem title="ツール" status="error" />);

    expect(screen.getByText("thất bại")).toBeInTheDocument();
  });
});
