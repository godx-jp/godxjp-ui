import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Actions, ActionsCopy, ActionsFeedback, ActionsItem } from "../actions";
import type { ActionsItemsProp } from "../actions";

/**
 * Actions behaviour — the strip under an assistant message (Ant Design X `Actions`).
 *
 * Ant X renders each action as `<div onClick>` with the label in a Tooltip only, so the two things
 * asserted hardest here are the two it does not have: every action has an accessible NAME, and the
 * strip is reachable and traversable from the keyboard.
 */

const ITEMS: ActionsItemsProp[] = [
  { key: "copy", label: "コピー" },
  { key: "retry", label: "やり直す" },
  { key: "delete", label: "削除", danger: true },
];

describe("Actions — the strip", () => {
  it("is a toolbar with a name, and every action is a named control", () => {
    renderWithUi(<Actions label="回答の操作" items={ITEMS} />);

    const toolbar = screen.getByRole("toolbar", { name: "回答の操作" });
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("button", { name: "コピー" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "やり直す" })).toBeInTheDocument();
  });

  it("falls back to a localized toolbar name", () => {
    renderWithUi(<Actions items={ITEMS} />);

    expect(screen.getByRole("toolbar", { name: "Thao tác với tin nhắn" })).toBeInTheDocument();
  });

  it("names an action after its key when it has no label — never nameless", () => {
    renderWithUi(<Actions label="回答の操作" items={[{ key: "regenerate" }]} />);

    expect(screen.getByRole("button", { name: "regenerate" })).toBeInTheDocument();
  });

  it("reports key, item and keyPath exactly as Ant X does", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(<Actions label="回答の操作" items={ITEMS} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "やり直す" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toMatchObject({
      key: "retry",
      keyPath: ["retry"],
      item: { key: "retry", label: "やり直す" },
    });
  });

  it("lets a per-item handler WIN — the strip's onClick does not also fire", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onItemClick = vi.fn();
    renderWithUi(
      <Actions
        label="回答の操作"
        items={[{ key: "copy", label: "コピー", onItemClick }]}
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "コピー" }));

    expect(onItemClick).toHaveBeenCalledWith({ key: "copy", label: "コピー", onItemClick });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("costs ONE Tab for the whole strip, and the arrows move inside it", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <>
        <Actions label="回答の操作" items={ITEMS} />
        <button type="button">after</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "コピー" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "やり直す" })).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "削除" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "コピー" })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("mirrors the arrows under dir=rtl", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <div dir="rtl">
        <Actions label="回答の操作" items={ITEMS} />
      </div>,
    );

    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "やり直す" })).toHaveFocus();
  });

  it("folds `subItems` behind one trigger and reports the nested keyPath", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(
      <Actions
        label="回答の操作"
        onClick={onClick}
        items={[
          {
            key: "more",
            label: "その他",
            subItems: [
              { key: "share", label: "共有" },
              { key: "report", label: "報告", danger: true },
            ],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "その他" }));
    await user.click(await screen.findByRole("menuitem", { name: "共有" }));

    expect(onClick.mock.calls[0][0]).toMatchObject({
      key: "share",
      keyPath: ["share", "more"],
      item: { key: "share", label: "共有" },
    });
  });

  it("hands an `actionRender` item straight through", () => {
    renderWithUi(
      <Actions
        label="回答の操作"
        items={[{ key: "custom", actionRender: <span>差し込み</span> }]}
      />,
    );

    expect(screen.getByText("差し込み")).toBeInTheDocument();
  });

  it("carries the variant and the fade as attributes, so both are token decisions", () => {
    const { container } = renderWithUi(
      <Actions label="回答の操作" items={ITEMS} variant="outlined" fadeInLeft />,
    );

    const toolbar = container.querySelector('[data-slot="actions"]');
    expect(toolbar).toHaveAttribute("data-variant", "outlined");
    expect(toolbar).toHaveAttribute("data-fade-in");
    expect(toolbar).toHaveAttribute("data-fade-in-inline");
  });
});

describe("ActionsItem — the status table", () => {
  it("announces `loading` instead of only swapping a glyph", () => {
    renderWithUi(<ActionsItem defaultIcon={<span />} label="読み上げ" status="loading" />);

    const button = screen.getByRole("button", { name: "読み上げ · đang tải" });
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("says so when the action failed", () => {
    renderWithUi(<ActionsItem defaultIcon={<span />} label="読み上げ" status="error" />);

    expect(screen.getByRole("button", { name: "読み上げ · thất bại" })).toBeInTheDocument();
  });

  it("uses `runningIcon` while running and `defaultIcon` at rest", () => {
    const { rerender } = renderWithUi(
      <ActionsItem
        defaultIcon={<span data-testid="rest" />}
        runningIcon={<span data-testid="running" />}
        label="読み上げ"
      />,
    );
    expect(screen.getByTestId("rest")).toBeInTheDocument();

    rerender(
      <ActionsItem
        defaultIcon={<span data-testid="rest" />}
        runningIcon={<span data-testid="running" />}
        label="読み上げ"
        status="running"
      />,
    );
    expect(screen.getByTestId("running")).toBeInTheDocument();
    expect(screen.queryByTestId("rest")).not.toBeInTheDocument();
  });

  it("leaves the name alone at rest", () => {
    renderWithUi(<ActionsItem defaultIcon={<span />} label="読み上げ" />);

    expect(screen.getByRole("button", { name: "読み上げ" })).toBeInTheDocument();
  });
});

describe("ActionsCopy", () => {
  it("writes the text and SAYS it copied, not only paints a tick", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    renderWithUi(<ActionsCopy text="回答の本文" onCopy={onCopy} />);

    await user.click(screen.getByRole("button", { name: "Sao chép" }));

    expect(await navigator.clipboard.readText()).toBe("回答の本文");
    expect(onCopy).toHaveBeenCalledWith("回答の本文");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Đã sao chép"));
  });

  it("reports nothing when the clipboard refuses", async () => {
    const user = userEvent.setup();
    const denied = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("denied"));
    const onCopy = vi.fn();
    renderWithUi(<ActionsCopy text="回答の本文" onCopy={onCopy} />);

    await user.click(screen.getByRole("button", { name: "Sao chép" }));

    expect(denied).toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    denied.mockRestore();
  });
});

describe("ActionsFeedback", () => {
  it("keeps BOTH buttons on screen and states the opinion with aria-pressed", () => {
    renderWithUi(<ActionsFeedback value="dislike" />);

    expect(screen.getByRole("button", { name: "Không hữu ích" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Ant X hides this one once an opinion is recorded; here it stays reachable.
    expect(screen.getByRole("button", { name: "Hữu ích" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("records an opinion", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<ActionsFeedback onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Hữu ích" }));
    expect(onChange).toHaveBeenCalledWith("like");
  });

  it("clears it on a second click, exactly as Ant X does", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<ActionsFeedback value="like" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Hữu ích" }));
    expect(onChange).toHaveBeenCalledWith("default");
  });

  it("switches straight from one opinion to the other", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<ActionsFeedback value="like" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Không hữu ích" }));
    expect(onChange).toHaveBeenCalledWith("dislike");
  });
});
