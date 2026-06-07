import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import {
  Sheet,
  SheetBody,
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

  // Regression for gh#101: a hand-rolled overflow-y-auto body clips the 3px focus ring.
  // SheetBody is the ring-safe scroll slot — full-bleed inset + scroll-padding so rings never clip.
  it("SheetBody is a ring-safe scrollable slot (inset + overflow)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panel</SheetTitle>
          </SheetHeader>
          <SheetBody>Body content</SheetBody>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const body = screen.getByText("Body content");
    expect(body).toHaveAttribute("data-slot", "sheet-body");
    // overflow-y-auto = scrolls; full-bleed horizontal inset (token-driven) keeps the ring clear.
    expect(body.className).toContain("overflow-y-auto");
    expect(body.className).toContain("-mx-[var(--sheet-pad-x)]");
    expect(body.className).toContain("px-[var(--sheet-pad-x)]");
  });

  // Ant-style header: title/subtitle/extra/tone props (children still supported). `title` must map
  // to the Radix Title so the dialog keeps an accessible name.
  it("SheetHeader title/subtitle/extra render and title is the dialog accessible name", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader
            tone="info"
            title="詳細検索"
            subtitle="条件を組み合わせます"
            extra={<span>3 条件</span>}
          />
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    // accessible name comes from the title prop (mapped to SheetTitle)
    expect(screen.getByRole("dialog", { name: "詳細検索" })).toBeInTheDocument();
    expect(screen.getByText("条件を組み合わせます")).toBeInTheDocument();
    expect(screen.getByText("3 条件")).toBeInTheDocument();
    const header = document.querySelector('[data-slot="sheet-header"]') as HTMLElement;
    expect(header).toHaveAttribute("data-tone", "info");
  });

  it("SheetContent width sets a viewport-capped panel width", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Open</Button>
        </SheetTrigger>
        <SheetContent width={420}>
          <SheetHeader title="P" />
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const content = screen.getByRole("dialog");
    expect(content.style.getPropertyValue("--sheet-width")).toBe("420px");
    expect(content.className).toContain("w-[min(var(--sheet-width),100%)]");
  });

  // Regression for gh#101 (#3): footer owns symmetric vertical padding (py-4) and cancels the
  // content's p-6 bottom (-mb-6) instead of inheriting an asymmetric 16-top / 24-bottom rhythm.
  it("SheetFooter owns symmetric tokenized vertical padding", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button type="button">Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panel</SheetTitle>
          </SheetHeader>
          <SheetFooter>Actions</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const footer = screen.getByText("Actions");
    // Symmetric vertical padding + cancels the content's bottom inset, both token-driven.
    expect(footer.className).toContain("py-[var(--sheet-pad-y)]");
    expect(footer.className).toContain("-mb-[var(--sheet-pad-y)]");
    expect(footer.className).not.toContain("pt-4"); // no longer the asymmetric top-only padding
  });
});
