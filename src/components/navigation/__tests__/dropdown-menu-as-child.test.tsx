import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * `asChild` là API công khai, và nó không phải chuyện gõ kiểu: consumer nhét một `<Link>` của
 * Inertia vào một mục menu bằng nó. Phép đo ở đây vì thế khẳng định chính THẺ CON là mục menu —
 * `role="menuitem"` nằm trên thẻ đó, không phải trên một phần tử bọc ngoài — vì chỉ khi ấy cú nhấn,
 * tiêu điểm bàn phím và `href` mới đi cùng một chỗ.
 *
 * Đã mất một lượt trong đợt chuyển Radix → React Aria và chỉ bị bắt khi cài thử tarball vào
 * consumer thật (godx-chat, ba chỗ trong `app-layout.tsx`).
 */
async function openMenu(user: ReturnType<typeof userEvent.setup>, name = "Tài khoản") {
  await user.click(screen.getByRole("button", { name }));
}

describe("DropdownMenu asChild", () => {
  it("makes the child anchor itself the menu item", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Tài khoản</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href="/settings" data-test="settings-link">
              Cài đặt
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);

    const item = screen.getByRole("menuitem", { name: "Cài đặt" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "/settings");
    expect(item).toHaveAttribute("data-test", "settings-link");
    // Các móc của thư viện đi lên chính thẻ mượn, không có phần tử bọc nào chen vào giữa.
    expect(item).toHaveAttribute("data-slot", "dropdown-menu-item");
    expect(item).toHaveClass("ui-dropdown-menu-item");
    expect(screen.queryByText("Cài đặt", { selector: "div" })).not.toBeInTheDocument();
  });

  it("keeps the child's own onClick while still firing onSelect", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSelect = vi.fn();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Tài khoản</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild onSelect={onSelect}>
            <button type="button" onClick={onClick} data-test="logout-button">
              Đăng xuất
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);

    const item = screen.getByRole("menuitem", { name: "Đăng xuất" });
    expect(item.tagName).toBe("BUTTON");
    expect(item).toHaveAttribute("data-test", "logout-button");

    await user.click(item);
    expect(onClick).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
  });

  it("borrows the child's tag on label, checkbox, radio, and sub-trigger too", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Tài khoản</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel asChild>
            <h3>Nhóm</h3>
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem asChild checked>
            <a href="/notify">Báo tin</a>
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="air">
            <DropdownMenuRadioItem asChild value="air">
              <a href="/air">Đường bay</a>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger asChild>
              <a href="/more">Thêm</a>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Lồng</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);

    const label = screen.getByText("Nhóm");
    expect(label.tagName).toBe("H3");
    expect(label).toHaveAttribute("data-slot", "dropdown-menu-label");

    const checkbox = screen.getByRole("menuitemcheckbox", { name: "Báo tin" });
    expect(checkbox.tagName).toBe("A");
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    const radio = screen.getByRole("menuitemradio", { name: "Đường bay" });
    expect(radio.tagName).toBe("A");
    expect(radio).toHaveAttribute("href", "/air");

    const subTrigger = screen.getByRole("menuitem", { name: "Thêm" });
    expect(subTrigger.tagName).toBe("A");
    expect(subTrigger).toHaveAttribute("data-slot", "dropdown-menu-sub-trigger");
  });

  it("still renders its own element when asChild is absent", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Tài khoản</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Sửa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: "Sửa" }).tagName).toBe("DIV");
  });
});
