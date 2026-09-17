import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";

import { Badge } from "../badge";

/*
 * gh#706 — a chip whose label is a link (a saved filter) named its × just "Delete", so a row of
 * such chips had identical remove buttons. The name now quotes the label's rendered text, and
 * `removeLabel` sets it verbatim (antd `closable={{ 'aria-label' }}`).
 */
describe("Badge remove button name (gh#706)", () => {
  it("names the × from a link label's text, so two link chips are told apart", async () => {
    const user = userEvent.setup();
    const onA = vi.fn();
    const onB = vi.fn();
    renderWithUi(
      <>
        <Badge variant="outline" onRemove={onA}>
          <a href="#a">権限まわり</a>
        </Badge>
        <Badge variant="outline" onRemove={onB}>
          <a href="#b">
            <strong>今週</strong> の課題
          </a>
        </Badge>
      </>,
    );

    const first = await screen.findByRole("button", { name: /権限まわり/ });
    const second = await screen.findByRole("button", { name: /今週 の課題/ });
    expect(first).not.toBe(second);
    expect(screen.queryByRole("button", { name: /^Delete$|^削除$/ })).not.toBeInTheDocument();

    await user.click(second);
    expect(onB).toHaveBeenCalledTimes(1);
    expect(onA).not.toHaveBeenCalled();
  });

  it("uses removeLabel verbatim, over both a string and a node label", () => {
    renderWithUi(
      <>
        <Badge onRemove={() => {}} removeLabel="保存済みフィルター「権限まわり」を削除">
          <a href="#a">権限まわり</a>
        </Badge>
        <Badge onRemove={() => {}} removeLabel="Remove the overdue tag">
          期限切れ
        </Badge>
      </>,
    );
    expect(
      screen.getByRole("button", { name: "保存済みフィルター「権限まわり」を削除" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove the overdue tag" })).toBeInTheDocument();
  });

  it("keeps quoting a string label exactly as before", () => {
    renderWithUi(<Badge onRemove={() => {}}>期限: 今週</Badge>);
    expect(screen.getByRole("button", { name: /期限: 今週/ })).toBeInTheDocument();
  });
});
