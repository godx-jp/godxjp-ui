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

  it("KHÔNG cảnh báo về `logo` — nó luôn được vẽ", () => {
    const { getByText } = render(
      <AppShell topbar={<div>bar</div>} logo={<div>logo</div>} sidebar={<div />}>
        <div />
      </AppShell>,
    );

    // Đảo ngược hợp đồng cũ, có chủ ý: `logo` không còn là khe bị `topbar` nuốt, nên không còn gì
    // để cảnh báo. Cảnh báo chỉ dành cho `topbarLeft`/`topbarRight` — chúng là khe của bố cục MẶC
    // ĐỊNH, và một `topbar` tự viết chính là việc thay bố cục ấy.
    expect(getByText("logo")).toBeInTheDocument();
    expect(getByText("bar")).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalled();
  });

  it("liệt kê ĐỦ hai khe bị bỏ qua, và logo KHÔNG nằm trong số đó", () => {
    const { getByText } = render(
      <AppShell
        topbar={<div>bar</div>}
        logo={<div>logo</div>}
        topbarLeft={<div />}
        topbarRight={<div />}
        sidebar={<div />}
      >
        <div />
      </AppShell>,
    );

    const message = String(warn.mock.calls[0]![0]);

    expect(message).toContain("topbarLeft");
    expect(message).toContain("topbarRight");

    // KHÔNG dùng `expect(message).not.toContain("logo")`: câu cảnh báo cố ý nhắc tên `logo` để nói
    // rằng nó KHÔNG bị bỏ qua, nên phép kiểm chuỗi ấy sẽ xanh hay đỏ tuỳ cách hành văn, không tuỳ
    // hành vi. Bằng chứng đúng là logo có mặt trong DOM.
    expect(getByText("logo")).toBeInTheDocument();
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
