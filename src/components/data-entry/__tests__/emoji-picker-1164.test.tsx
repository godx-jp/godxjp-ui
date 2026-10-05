import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { EmojiPicker } from "../emoji-picker";
import { render, renderWithUi, screen, userEvent, waitFor, within } from "@/test/render";

/**
 * gh#1164 — the page icon picker: CLDR keyword search in the active language (emojibase-data,
 * loaded on first open), a WAI-ARIA grid, recents, "remove icon".
 */
function Ja({ onValueChange }: { onValueChange: (v: string | null) => void }) {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <AppProvider persist={false} defaultLocale="ja">
      <EmojiPicker
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onValueChange(v);
        }}
        recentsKey="test-emoji-recents"
      />
    </AppProvider>
  );
}

beforeEach(() => localStorage.clear());

describe("EmojiPicker (gh#1164)", () => {
  it("searches Japanese keywords and picks with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Ja onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "アイコンを選ぶ" }));
    await user.type(await screen.findByRole("searchbox", { name: "絵文字を検索" }), "爆笑");
    const grid = await screen.findByRole("grid");
    expect(within(grid).getByRole("gridcell", { name: "笑い転げる" })).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("🤣");
    expect(JSON.parse(localStorage.getItem("test-emoji-recents")!)).toEqual(["🤣"]);
  });

  it("moves through the grid by cell and by row, one tab stop", async () => {
    const user = userEvent.setup();
    render(<Ja onValueChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "アイコンを選ぶ" }));
    const grid = await screen.findByRole("grid");
    const cells = within(grid).getAllByRole("gridcell");
    expect(cells.filter((c) => c.tabIndex === 0)).toHaveLength(1);
    cells[0]!.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(cells[1]));
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(cells[9]));
    await user.keyboard("{Home}");
    await waitFor(() => expect(document.activeElement).toBe(cells[8]));
  });

  it("shows a Recent tab once something was picked, and removes the icon", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    localStorage.setItem("test-emoji-recents", JSON.stringify(["🚀"]));
    render(<Ja onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "アイコンを選ぶ" }));
    const recent = await screen.findByRole("tab", { name: "最近使った絵文字" });
    expect(recent).toHaveAttribute("aria-selected", "true");
    await user.click(await screen.findByRole("gridcell", { name: /ロケット/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("🚀");
    await user.click(screen.getByRole("button", { name: "アイコンを選ぶ" }));
    await user.click(await screen.findByRole("button", { name: "アイコンを削除" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("searches Vietnamese keywords in a Vietnamese app", async () => {
    const user = userEvent.setup();
    renderWithUi(<EmojiPicker defaultValue={null} recentsKey="test-emoji-recents" />);
    await user.click(screen.getByRole("button", { name: "Chọn biểu tượng" }));
    await user.type(await screen.findByRole("searchbox", { name: "Tìm emoji" }), "tên lửa");
    expect(await screen.findByRole("gridcell", { name: /tên lửa/ })).toHaveTextContent("🚀");
  });
});
