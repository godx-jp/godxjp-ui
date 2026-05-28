import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";

describe("Sheet", () => {
  it("opens side panel from trigger", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Bộ lọc</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Lọc khách CRM</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Bộ lọc" }));
    expect(screen.getByRole("dialog", { name: "Lọc khách CRM" })).toHaveAttribute(
      "data-slot",
      "sheet-content",
    );
  });

  it("renders description inside panel", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Chi tiết</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Đơn hàng #1024</SheetTitle>
            <SheetDescription>Xem thông tin vận chuyển</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Chi tiết" }));
    expect(screen.getByText("Xem thông tin vận chuyển")).toBeInTheDocument();
  });

  it("closes when pressing Escape", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Bộ lọc</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Lọc khách CRM</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Bộ lọc" }));
    expect(screen.getByRole("dialog", { name: "Lọc khách CRM" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Lọc khách CRM" })).not.toBeInTheDocument();
  });

  it("exposes footer slot and optional close button", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Footer</Button>
        </SheetTrigger>
        <SheetContent showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Panel</SheetTitle>
          </SheetHeader>
          <SheetFooter>Actions</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Footer" }));
    expect(screen.getByText("Actions")).toHaveAttribute("data-slot", "sheet-footer");
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });
});
