import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecordPicker } from "../record-picker";

/**
 * gh#1044 — the issue file picker (server-side search) could not say what IT found nothing of, nor
 * name its paging button. antd `notFoundContent` for the first, `loadMoreLabel` for the second.
 */
const MANY = Array.from({ length: 40 }, (_, i) => ({ value: `f${i}`, label: `File ${i}` }));
const FEW = MANY.slice(0, 4);

describe("RecordPicker · notFoundContent (gh#1044)", () => {
  it("shows it in the dialog when the search finds nothing", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async () => ({ options: [] }));
    render(
      <RecordPicker
        count={900}
        loadOptions={loadOptions}
        placeholder="pick"
        notFoundContent="該当するファイルはありません"
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    expect(await screen.findByText("該当するファイルはありません")).toBeInTheDocument();
  });

  it("reaches the dropdown shape too", async () => {
    const user = userEvent.setup();
    render(<RecordPicker options={FEW} placeholder="pick" notFoundContent="該当なし" />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("zzz");
    expect(await screen.findByText("該当なし")).toBeInTheDocument();
  });
});

describe("RecordPicker · loadMoreLabel (gh#1044)", () => {
  it("names the dialog's load-more button", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async ({ cursor }: { cursor?: string }) =>
      cursor ? { options: MANY.slice(20) } : { options: MANY.slice(0, 20), nextCursor: "p2" },
    );
    render(
      <RecordPicker
        count={900}
        loadOptions={loadOptions}
        placeholder="pick"
        loadMoreLabel="さらに表示"
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    await waitFor(() => expect(screen.getAllByRole("option").length).toBe(20));
    await user.click(screen.getByRole("button", { name: "さらに表示" }));
    await waitFor(() => expect(screen.getAllByRole("option").length).toBe(40));
  });
});

describe("RecordPicker · error retry is a Retry, not a load-more (gh#1044 follow-up)", () => {
  it("names the dialog's retry button with common.retry, untouched by loadMoreLabel", async () => {
    const user = userEvent.setup();
    const loadOptions = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue({ options: MANY.slice(0, 3) });
    render(
      <RecordPicker
        count={900}
        loadOptions={loadOptions}
        placeholder="pick"
        loadMoreLabel="さらに表示"
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    const retry = await screen.findByRole("button", { name: /^(retry|再試行|thử lại)$/i });
    expect(screen.queryByRole("button", { name: "さらに表示" })).toBeNull();
    expect(screen.queryByRole("button", { name: /load more|さらに読み込む/i })).toBeNull();
    await user.click(retry);
    await waitFor(() => expect(screen.getAllByRole("option").length).toBe(3));
  });
});
