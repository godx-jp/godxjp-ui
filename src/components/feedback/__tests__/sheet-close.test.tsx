import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Sheet, SheetClose, SheetContent, SheetTitle } from "../sheet";

describe("SheetClose", () => {
  it("dismisses the sheet", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent title="設定">
          <SheetTitle>設定</SheetTitle>
          <SheetClose>閉じる</SheetClose>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
