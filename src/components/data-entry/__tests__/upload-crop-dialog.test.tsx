import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { UploadCropDialog } from "../upload-crop-dialog";

const img = () => new File([new Uint8Array(8)], "face.png", { type: "image/png" });

describe("UploadCropDialog", () => {
  it("shows a preview image when a file is supplied", () => {
    renderWithUi(<UploadCropDialog open onOpenChange={vi.fn()} file={img()} onConfirm={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("slider")).toBeInTheDocument(); // zoom control
    expect(dialog.querySelector("img")).not.toBeNull();
  });

  it("renders no preview when there is no file", () => {
    renderWithUi(<UploadCropDialog open onOpenChange={vi.fn()} file={null} onConfirm={vi.fn()} />);
    expect(screen.getByRole("dialog").querySelector("img")).toBeNull();
  });

  it("cancel closes the dialog without confirming", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    renderWithUi(
      <UploadCropDialog open onOpenChange={onOpenChange} file={img()} onConfirm={onConfirm} />,
    );
    const buttons = within(screen.getByRole("dialog")).getAllByRole("button");
    await user.click(buttons[0]); // cancel (ghost) is the first footer button
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirm is a no-op when the canvas 2D context is unavailable (jsdom)", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    // jsdom getContext() returns null → handleConfirm bails before onConfirm
    renderWithUi(
      <UploadCropDialog open onOpenChange={vi.fn()} file={img()} onConfirm={onConfirm} />,
    );
    const buttons = within(screen.getByRole("dialog")).getAllByRole("button");
    await user.click(buttons[buttons.length - 2]); // confirm
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
