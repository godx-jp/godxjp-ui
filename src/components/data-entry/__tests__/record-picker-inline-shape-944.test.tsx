import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecordPicker } from "../record-picker";

/**
 * gh#944 — HÌNH DẠNG THỨ BA: hai lối vào cùng lúc.
 *
 * 「tại sao không cho nút tìm kiếm ở bên cạnh cho phép tìm kiếm mở modal ra tìm trong danh sách??」
 *
 * Số liệu làm nó cần thiết: dự án khách của consumer có vài trăm tới vài NGHÌN 課題, nên
 * `count > threshold` gần như LUÔN đúng — tức nhánh "chỉ Dialog" là nhánh người dùng gặp
 * thường xuyên nhất, và ở đó họ mất hẳn khả năng gõ một mã mình đã thuộc.
 */
const ISSUES = Array.from({ length: 500 }, (_, i) => ({
  value: `PKG-${i + 1}`,
  label: `PKG-${i + 1}`,
  sublabel: `件名 ${i + 1}`,
}));

const load = () =>
  vi.fn<
    (p: { query: string; filters: Record<string, string>; cursor?: string }) => Promise<{
      options: typeof ISSUES;
    }>
  >(async ({ query }) => ({
    options: ISSUES.filter((o) => (o.label + o.sublabel).includes(query)).slice(0, 20),
  }));

describe("gh#944 — shape=\"inline\" mở CẢ HAI lối vào", () => {
  it("có ô gõ được VÀ nút mở Dialog, cùng lúc — không phải cái này HOẶC cái kia", () => {
    render(<RecordPicker shape="inline" count={500} loadOptions={load()} placeholder="mã 課題" />);
    expect(screen.getByPlaceholderText("mã 課題")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search|検索|tìm kiếm/i })).toBeInTheDocument();
  });

  it("gợi ý ngay trong ô DÙ vượt ngưỡng — đây là điều threshold đang chặn", async () => {
    const loadOptions = load();
    const user = userEvent.setup();
    // count=500 >> threshold=10: ở shape "auto" đây sẽ là Dialog-only, không gõ được.
    render(<RecordPicker shape="inline" count={500} loadOptions={loadOptions} placeholder="mã" />);

    await user.type(screen.getByPlaceholderText("mã"), "PKG-12");
    await waitFor(() => expect(loadOptions).toHaveBeenCalled());
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0));
  });

  it("chọn từ gợi ý ra đúng giá trị, và nhãn hiện ĐẦY ĐỦ (mã + 件名)", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RecordPicker
        shape="inline"
        count={500}
        loadOptions={load()}
        onValueChange={onValueChange}
        placeholder="mã"
      />,
    );
    await user.type(screen.getByPlaceholderText("mã"), "PKG-12");
    const row = await screen.findByRole("option", { name: /PKG-12\b/ });
    await user.click(row);

    expect(onValueChange).toHaveBeenCalledWith("PKG-12");
    // Yêu cầu (4): sau khi chọn phải thấy cả mã lẫn 件名, không chỉ mã.
    await waitFor(() => expect(screen.getByText(/PKG-12.*件名 12/)).toBeInTheDocument());
  });

  it("chữ đang gõ DỞ mang sang Dialog làm từ khoá ban đầu — yêu cầu (3)", async () => {
    const user = userEvent.setup();
    render(<RecordPicker shape="inline" count={500} loadOptions={load()} placeholder="mã" />);

    await user.type(screen.getByPlaceholderText("mã"), "PKG-34");
    await user.click(screen.getByRole("button", { name: /search|検索|tìm kiếm/i }));

    const dialogSearch = await waitFor(() => {
      const el = document.querySelector('[role="dialog"] input[type="search"]');
      expect(el).not.toBeNull();
      return el as HTMLInputElement;
    });
    // Không có dòng này thì người dùng gõ xong, bấm 検索, rồi phải gõ LẠI từ đầu.
    expect(dialogSearch.value).toBe("PKG-34");
  });

  it("nút 検索 hiện kể cả khi ô RỖNG — nó là lối vào cho người chưa biết mình tìm gì", () => {
    render(<RecordPicker shape="inline" count={500} loadOptions={load()} placeholder="mã" />);
    expect(screen.getByRole("button", { name: /search|検索|tìm kiếm/i })).toBeEnabled();
  });

  it("giữ id và data-field của FormField — 422 phải bám được ở CẢ BA hình dạng", () => {
    render(
      <RecordPicker
        shape="inline"
        count={500}
        loadOptions={load()}
        id="req-field"
        data-field="requirement_key"
        placeholder="mã"
      />,
    );
    expect(document.querySelector('[data-field="requirement_key"]')).not.toBeNull();
    expect(document.querySelector("#req-field")).not.toBeNull();
  });

  it("shape mặc định KHÔNG đổi — auto vẫn là một trong hai, không phải cả hai", () => {
    // Ca âm tính: nếu thiếu nó, một bản "luôn inline" cũng sẽ xanh và mọi consumer cũ đổi hành vi.
    render(<RecordPicker count={500} loadOptions={load()} placeholder="mã" />);
    expect(screen.queryByPlaceholderText("mã")).toBeNull();
    expect(document.querySelector(".ui-record-picker-trigger")).not.toBeNull();
  });
});
