import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecordPicker } from "../record-picker";

/**
 * gh#942 — năm chỗ hụt mà một CONSUMER THẬT tìm ra, không phải một demo.
 *
 * `godx-task` dựng màn 承認フロー trên build `main` của RecordPicker và đo được từng cái. Mỗi
 * `it()` dưới đây là một trong năm, viết theo đúng thứ consumer làm — vì đó là thứ chứng minh
 * được, còn "component có prop đó" thì không.
 */
const MANY = Array.from({ length: 40 }, (_, i) => ({ value: `u${i}`, label: `Person ${i}` }));
const FEW = MANY.slice(0, 4);

describe("gh#942 (1) — loadOptions phải chạy cả khi dưới ngưỡng", () => {
  it("dropdown lấy dữ liệu từ server khi count nhỏ, thay vì hiện rỗng", async () => {
    const loadOptions = vi.fn<
      (p: { query: string; filters: Record<string, string>; cursor?: string }) => Promise<{
        options: typeof FEW;
      }>
    >(async () => ({ options: FEW }));

    // `count` nhỏ ⇒ nhánh Select. Consumer KHÔNG truyền `options` — dữ liệu ở server.
    const user = userEvent.setup();
    render(<RecordPicker count={4} loadOptions={loadOptions} placeholder="pick" />);

    // Select nạp LƯỜI: nó chỉ hỏi server khi panel mở, nên phải mở mới đo được. Bản nháp của
    // test này assert ngay sau render và đỏ — đó là hành vi đúng của Select, không phải lỗi.
    await user.click(screen.getByRole("combobox"));

    // Trước fix: nhánh Select chỉ đọc `options`, nên nó không gọi gì và dropdown rỗng; consumer
    // phải tự nhét trang đầu vào `options` để vòng qua.
    await waitFor(() => expect(loadOptions).toHaveBeenCalled());
  });
});

describe("gh#942 (2) — nhánh dropdown giữ prop nhận dạng của FormField", () => {
  it("id và data-field tới được trigger, không bị thay bằng id tự sinh", () => {
    render(
      <RecordPicker
        options={FEW}
        id="approver-field"
        data-field="approver_id"
        placeholder="pick"
      />,
    );
    // `data-field` là thứ lỗi 422 của server bám vào; mất nó là consumer không chỉ được lỗi về ô.
    const trigger = document.querySelector('[data-field="approver_id"]');
    expect(trigger).not.toBeNull();
    expect(document.querySelector("#approver-field")).not.toBeNull();
  });

  it("nhánh Dialog cũng giữ, nên hai nhánh không lệch nhau", () => {
    render(
      <RecordPicker options={MANY} id="big-field" data-field="approver_id" placeholder="pick" />,
    );
    expect(document.querySelector('[data-field="approver_id"]')).not.toBeNull();
  });
});

describe("gh#942 (3) — Dialog phân trang qua nextCursor", () => {
  it("nối thêm trang sau, không thay danh sách, và dừng khi server hết trang", async () => {
    const loadOptions = vi.fn<
      (p: { query: string; filters: Record<string, string>; cursor?: string }) => Promise<{
        options: typeof MANY;
        nextCursor?: string;
      }>
    >(async ({ cursor }) =>
      cursor
        ? { options: MANY.slice(20, 25) }
        : { options: MANY.slice(0, 20), nextCursor: "p2" },
    );

    const user = userEvent.setup();
    render(<RecordPicker count={900} loadOptions={loadOptions} placeholder="pick" />);
    await user.click(screen.getByRole("button", { name: /pick/i }));
    await waitFor(() => expect(screen.getAllByRole("option").length).toBe(20));

    await user.click(screen.getByRole("button", { name: /load more|さらに|tải thêm/i }));

    // NỐI, không thay: 20 + 5. Một picker "phân trang" bằng cách thay danh sách thì người dùng
    // mất mọi thứ họ vừa cuộn qua.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBe(25));
    // Trang cuối không có nextCursor ⇒ nút biến mất, không mời bấm vào hư không.
    expect(screen.queryByRole("button", { name: /load more|さらに|tải thêm/i })).toBeNull();
  });
});

describe("gh#942 (4) — nhãn đã chọn không mất khi đổi từ khoá", () => {
  it("chip giữ tên sau khi truy vấn mới không còn trả về hàng đó", async () => {
    const loadOptions = vi.fn<
      (p: { query: string; filters: Record<string, string>; cursor?: string }) => Promise<{
        options: Array<{ value: string; label: string }>;
      }>
    >(async ({ query }) =>
      query ? { options: [{ value: "zzz", label: "Someone Else" }] } : { options: MANY.slice(0, 5) },
    );

    const user = userEvent.setup();
    render(
      <RecordPicker mode="multiple" count={900} loadOptions={loadOptions} placeholder="pick" />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    await user.click(await screen.findByRole("option", { name: "Person 1" }));
    await user.click(screen.getByRole("button", { name: /confirm|決定|xác nhận/i }));

    // Mở lại và gõ một truy vấn KHÔNG trả về Person 1 nữa.
    await user.click(screen.getByRole("button", { name: /Person 1/ }));
    const search = document.querySelector('[role="dialog"] input[type="search"]') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setter.call(search, "zzz");
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await waitFor(() => expect(screen.getByRole("option", { name: "Someone Else" })).toBeInTheDocument());

    // Trước fix: nhãn dựng lại từ TRANG HIỆN TẠI, nên chip rơi về "u1".
    expect(screen.getAllByText("Person 1").length).toBeGreaterThan(0);
  });
});

describe("gh#942 (5) — single mode xoá được mà không cần emptyOption", () => {
  it("hiện nút xoá khi đã có giá trị, và xoá trả về null", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RecordPicker
        options={MANY}
        value="u3"
        selectedOptions={[{ value: "u3", label: "Person 3" }]}
        onValueChange={onValueChange}
        placeholder="pick"
      />,
    );

    const clear = screen.getByRole("button", { name: /clear|選択を解除|bỏ chọn/i });
    await user.click(clear);

    // `emptyOption` là một giá trị record GIỮ (「担当者なし」); nút này là "chưa trả lời". Hai
    // thứ khác nhau, nên null chứ không phải chuỗi rỗng của emptyOption.
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("không hiện nút xoá khi chưa chọn gì", () => {
    render(<RecordPicker options={MANY} placeholder="pick" />);
    expect(screen.queryByRole("button", { name: /clear|選択を解除|bỏ chọn/i })).toBeNull();
  });
});
