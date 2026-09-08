import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { AppSettingToggle } from "../app-setting-toggle";
import { APP_DENSITIES, APP_THEMES } from "../../../app/theme-axes";
import { cleanup, renderWithUi, screen, userEvent } from "@/test/render";

/**
 * The shipped `.ui-topbar-item` rule — read from the stylesheet, never retyped. It is the whole
 * reason `appearance="bar"` is a cell of the bar rather than a pill inside it.
 */
const shellCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/shell-layout.css"),
  "utf8",
);

const glyphOf = (button: HTMLElement) => button.querySelector("svg")?.getAttribute("class") ?? "";

describe("AppSettingToggle", () => {
  it("bấm một lần → giá trị KẾ TIẾP; bấm hết vòng → quay về đầu (theme)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // Đi trọn vòng, không chỉ một bước: mỗi bước render lại với giá trị vừa nhận, nên phép kiểm
    // này bắt được cả một `next` đứng yên lẫn một vòng không khép (không quay về phần tử đầu).
    let current: string = APP_THEMES[0];
    const { rerender } = renderWithUi(
      <AppSettingToggle kind="theme" value={current} onValueChange={onValueChange} />,
    );

    const seen: string[] = [];
    for (let step = 0; step < APP_THEMES.length; step += 1) {
      await user.click(screen.getByRole("button"));
      current = onValueChange.mock.calls[step][0];
      seen.push(current);
      rerender(<AppSettingToggle kind="theme" value={current} onValueChange={onValueChange} />);
    }

    // light → dark → system → light: đúng thứ tự APP_THEMES, và bước cuối khép vòng.
    expect(seen).toEqual([...APP_THEMES.slice(1), APP_THEMES[0]]);
  });

  it("xoay vòng đọc đúng danh sách của kind, không phải một mảng chép lại (density)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <AppSettingToggle kind="density" value={APP_DENSITIES[0]} onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("button"));
    expect(onValueChange).toHaveBeenCalledWith(APP_DENSITIES[1]);
  });

  it("icon đổi theo GIÁ TRỊ, không đứng yên ở glyph của kind", () => {
    const glyphs = APP_THEMES.map((theme) => {
      cleanup();
      renderWithUi(<AppSettingToggle kind="theme" value={theme} onValueChange={vi.fn()} />);
      return glyphOf(screen.getByRole("button"));
    });
    // lucide gắn `lucide-sun` / `lucide-moon` / `lucide-monitor` vào <svg>: ba giá trị, ba glyph.
    expect(glyphs.every(Boolean)).toBe(true);
    expect(new Set(glyphs).size).toBe(APP_THEMES.length);
  });

  it("aria-label mang CẢ tên setting lẫn giá trị hiện tại, và đổi theo giá trị", () => {
    renderWithUi(<AppSettingToggle kind="theme" value="light" onValueChange={vi.fn()} />);
    const light = screen.getByRole("button").getAttribute("aria-label") ?? "";
    // vi (locale mặc định của renderWithUi): "Giao diện: Sáng"
    expect(light).toContain("Giao diện");
    expect(light).toContain("Sáng");

    cleanup();
    renderWithUi(<AppSettingToggle kind="theme" value="dark" onValueChange={vi.fn()} />);
    const dark = screen.getByRole("button").getAttribute("aria-label") ?? "";
    expect(dark).toContain("Giao diện");
    expect(dark).toContain("Tối");
    // Một nút xoay vòng mà tên không đổi là một nút câm với người dùng screen reader.
    expect(dark).not.toBe(light);
  });

  it("ngoài <AppProvider> và không controlled: render disabled, KHÔNG throw", () => {
    // plain render → useOptionalAppContext() undefined → unbound → disabled
    const { getByRole } = render(<AppSettingToggle kind="theme" />);
    expect(getByRole("button")).toBeDisabled();
  });

  it('appearance="bar" KHÔNG phát chiều cao cố định — nó là CELL của bar, không phải viên thuốc trong bar', () => {
    renderWithUi(<AppSettingToggle kind="theme" value="light" onValueChange={vi.fn()} />);
    const button = screen.getByRole("button");
    // Hình dạng đến từ `.ui-topbar-item`, không phải từ một con số của riêng component này.
    expect(button).toHaveClass("ui-topbar-item");
    // Không một utility hình học nào được phát ra. Utilities thắng @layer components (gh#366/#371),
    // nên chỉ cần MỘT `h-*`/`size-*`/`rounded-*` ở đây là ô bị đóng băng ở 32px giữa thanh 48px —
    // đúng lỗi người dùng báo.
    expect(button.className).not.toMatch(/(?:^|\s)(?:h|min-h|max-h|size|rounded)-/);
    // …và luật mà nó dựa vào thật sự khai stretch, chứ không khai một chiều cao.
    const rule = shellCss.match(/\.ui-topbar-item \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toContain("align-self: stretch");
    expect(rule).not.toMatch(/[\s;{]height:/);
  });
});
