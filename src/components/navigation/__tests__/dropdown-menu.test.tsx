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
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("invokes menu item onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Xuất CSV</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    const item = screen.getByRole("menuitem", { name: "Xuất CSV" });
    expect(item).toHaveAttribute("data-slot", "dropdown-menu-item");
    await user.click(item);
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders label and separator", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sửa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByText("Hành động")).toHaveAttribute("data-slot", "dropdown-menu-label");
    expect(screen.getByRole("menuitem", { name: "Sửa" })).toBeInTheDocument();
  });

  it("closes after selecting an item", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Xóa" }));
    expect(screen.queryByRole("menuitem", { name: "Xóa" })).not.toBeInTheDocument();
  });

  it("renders checkbox, radio, and shortcut slots", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Advanced</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Notify</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="air">
            <DropdownMenuRadioItem value="air">Air</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuItem>
            Export
            <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Advanced" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Notify" })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-checkbox-item",
    );
    expect(screen.getByRole("menuitemradio", { name: "Air" })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-radio-item",
    );
    expect(screen.getByText("Ctrl+E")).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
  });
});
