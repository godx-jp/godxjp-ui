import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { BranchScopePicker } from "../branch-scope-picker";
import { Transfer } from "../transfer";

/**
 * gh#1044 (3) — the pickers that still hard-coded their "no match" text take antd's
 * `notFoundContent` (Transfer: antd's `locale.notFoundContent`, which also takes a per-pane pair).
 */
describe("BranchScopePicker · notFoundContent (gh#1044)", () => {
  it("replaces the no-match line when the branch search finds nothing", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <BranchScopePicker
        branches={[{ id: "a", name: "Tokyo" }]}
        defaultValue={{ mode: "selected" }}
        notFoundContent="一致する支店はありません"
      />,
    );
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(await screen.findByText("一致する支店はありません")).toBeInTheDocument();
  });
});

describe("Transfer · locale.notFoundContent (gh#1044)", () => {
  const DATA = [{ key: "a", title: "Tokyo" }];

  it("replaces both panes' empty text with one node", () => {
    renderWithUi(
      <Transfer dataSource={[]} onValueChange={vi.fn()} locale={{ notFoundContent: "なし" }} />,
    );
    expect(screen.getAllByText("なし")).toHaveLength(2);
  });

  it("takes a [source, target] pair, as antd does", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Transfer
        dataSource={DATA}
        showSearch
        onValueChange={vi.fn()}
        locale={{ notFoundContent: ["一致なし", "未選択"] }}
      />,
    );
    expect(screen.getByText("未選択")).toBeInTheDocument();
    await user.type(screen.getAllByRole("searchbox")[0], "zzz");
    await waitFor(() => expect(screen.getByText("一致なし")).toBeInTheDocument());
  });
});
