import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs } from "../tabs";

const css = readFileSync(resolve(process.cwd(), "src/styles/navigation-layout.css"), "utf8");

const ITEMS = [
  { value: "home", label: "ホーム", content: "A" },
  { value: "shop", label: "店舗の運営", content: "B" },
];

describe("Tabs onAdd — an add button for every variant", () => {
  it.each(["default", "line", "card"] as const)(
    "%s: a named button after the tablist, the next Tab stop, calls onAdd",
    async (variant) => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(
        <Tabs
          variant={variant}
          items={ITEMS}
          defaultValue="home"
          onAdd={onAdd}
          addLabel="デスクトップを追加"
          extra={{ end: <button type="button">編集</button> }}
        />,
      );
      const add = screen.getByRole("button", { name: "デスクトップを追加" });
      const tablist = screen.getByRole("tablist");
      // Outside the tablist (a tablist owns only tabs), right after it in the DOM.
      expect(tablist.contains(add)).toBe(false);
      expect(tablist.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      await user.click(screen.getByRole("tab", { name: "ホーム" }));
      await user.tab();
      expect(add).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onAdd).toHaveBeenCalledTimes(1);
      const bar = add.closest('[data-slot="tabs-bar"]')!;
      expect(bar.getAttribute("data-add")).toBe(variant === "card" ? null : "inline");
    },
  );

  it("is absent without onAdd, and hideAdd removes it", () => {
    const { rerender } = render(<Tabs items={ITEMS} defaultValue="home" />);
    expect(document.querySelector('[data-slot="tabs-add"]')).toBeNull();
    rerender(<Tabs items={ITEMS} defaultValue="home" onAdd={() => {}} hideAdd />);
    expect(document.querySelector('[data-slot="tabs-add"]')).toBeNull();
  });

  it("on editable-card, onAdd wins over onEdit(event, 'add')", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onEdit = vi.fn();
    render(
      <Tabs
        variant="editable-card"
        items={ITEMS}
        defaultValue="home"
        onAdd={onAdd}
        onEdit={onEdit}
      />,
    );
    await user.click(document.querySelector<HTMLButtonElement>('[data-slot="tabs-add"]')!);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalledWith(expect.anything(), "add");
  });

  it("the inline strip is content-width and the line rail moves to the bar", () => {
    render(<Tabs variant="line" items={ITEMS} defaultValue="home" onAdd={() => {}} />);
    const list = screen.getByRole("tablist");
    expect(list.className).toContain("data-[orientation=horizontal]:w-auto");
    expect(css).toMatch(
      /\.ui-tabs-bar\[data-add="inline"\]\s*>\s*\[data-slot="tabs-list"\]\s*\{\s*flex:\s*0 1 auto;/,
    );
    expect(css).toMatch(
      /\.ui-tabs-bar\[data-add="inline"\]\[data-variant="line"\]::after\s*\{[^}]*inset-inline:\s*0;/,
    );
    expect(css).toMatch(
      /\.ui-tabs-bar\[data-add="inline"\] > \.ui-tabs-add\s*\{\s*margin-inline-end:\s*auto;/,
    );
  });
});
