import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Attachments } from "../attachments";
import type { AttachmentsItemProp, AttachmentsRefProp } from "../attachments";

describe("Attachments", () => {
  it("shows the placeholder when the list is empty", () => {
    renderWithUi(<Attachments items={[]} />);
    expect(screen.getByRole("button", { name: "Tải tệp lên" })).toBeInTheDocument();
  });

  it("renders one card per item and removes on request", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const items: AttachmentsItemProp[] = [
      { uid: "1", name: "invoice.pdf", size: 1024, status: "done" },
    ];
    renderWithUi(<Attachments items={items} onChange={onChange} onRemove={() => true} />);

    expect(screen.getByRole("button", { name: "Xóa invoice.pdf" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Xóa invoice.pdf" }));

    expect(onChange).toHaveBeenCalledWith({
      file: { uid: "1", name: "invoice.pdf", size: 1024, status: "removed" },
      fileList: [],
    });
  });

  it("exposes select on the ref", () => {
    const ref = React.createRef<AttachmentsRefProp>();
    renderWithUi(<Attachments ref={ref} items={[]} accept="image/*" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    ref.current?.select({ accept: ".png" });
    expect(clickSpy).toHaveBeenCalled();
    expect(input.accept).toBe(".png");
  });
});
