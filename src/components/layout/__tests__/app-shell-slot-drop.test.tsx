import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "../app-shell";

/*
 * `topbar` NUỐT ba khe `logo` / `topbarLeft` / `topbarRight`, và trước đây nó
 * nuốt IM LẶNG.
 *
 * Đã gặp thật ở godx-chat: consumer truyền cả `logo` lẫn `topbar` suốt nhiều
 * tháng, logo không bao giờ hiện, và không ai phát hiện — không lỗi, không
 * cảnh báo, dải trên vẫn có nội dung khác nên trông vẫn "đúng". Nó chỉ lộ ra
 * khi có người đo DOM và hỏi "logo đâu".
 *
 * Bộ test này canh CẢNH BÁO, không canh cách vẽ: cách vẽ là hành vi cố ý (một
 * `topbar` tự dựng thì phải toàn quyền), thứ thiếu là lời nói ra.
 */
describe("AppShell — `topbar` nuốt các khe khác", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => warn.mockClear());

  it("nói ra khi `logo` bị bỏ qua", () => {
    render(
      <AppShell topbar={<div>bar</div>} logo={<div>logo</div>} sidebar={<div />}>
        <div />
      </AppShell>,
    );

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]![0]).toContain("logo");
  });

  it("liệt kê ĐỦ ba khe khi cả ba bị bỏ qua", () => {
    render(
      <AppShell
        topbar={<div>bar</div>}
        logo={<div />}
        topbarLeft={<div />}
        topbarRight={<div />}
        sidebar={<div />}
      >
        <div />
      </AppShell>,
    );

    const message = String(warn.mock.calls[0]![0]);

    expect(message).toContain("logo");
    expect(message).toContain("topbarLeft");
    expect(message).toContain("topbarRight");
  });

  it("im lặng khi KHÔNG có `topbar` — lúc ấy ba khe kia được dùng thật", () => {
    render(
      <AppShell logo={<div>logo</div>} sidebar={<div />}>
        <div />
      </AppShell>,
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it("im lặng khi chỉ có `topbar` — không có gì bị bỏ qua", () => {
    render(
      <AppShell topbar={<div>bar</div>} sidebar={<div />}>
        <div />
      </AppShell>,
    );

    expect(warn).not.toHaveBeenCalled();
  });
});
