import { afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { UploadCropDialog } from "../upload-crop-dialog";

const img = () => new File([new Uint8Array(8)], "face.png", { type: "image/png" });

afterEach(() => vi.restoreAllMocks());

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

  it("confirm bails when there is no image (no file) — guard clause", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    // No file → no <img ref> mounted, so handleConfirm hits `!img` and returns early.
    renderWithUi(
      <UploadCropDialog open onOpenChange={vi.fn()} file={null} onConfirm={onConfirm} />,
    );
    const buttons = within(screen.getByRole("dialog")).getAllByRole("button");
    await user.click(buttons[buttons.length - 2]);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirm bails when the canvas yields no blob", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: () => {},
    } as unknown as CanvasRenderingContext2D);
    // toBlob resolves null → handleConfirm returns before onConfirm.
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
      this: HTMLCanvasElement,
      cb: BlobCallback,
    ) {
      cb(null);
    });
    renderWithUi(
      <UploadCropDialog open onOpenChange={vi.fn()} file={img()} onConfirm={onConfirm} />,
    );
    const buttons = within(screen.getByRole("dialog")).getAllByRole("button");
    await user.click(buttons[buttons.length - 2]);
    await waitFor(() => expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalled());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirm emits a re-encoded .jpg file when the canvas exports a blob", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: () => {},
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
      this: HTMLCanvasElement,
      cb: BlobCallback,
    ) {
      cb(new Blob(["x"], { type: "image/jpeg" }));
    });
    renderWithUi(
      <UploadCropDialog open onOpenChange={onOpenChange} file={img()} onConfirm={onConfirm} />,
    );
    const buttons = within(screen.getByRole("dialog")).getAllByRole("button");
    await user.click(buttons[buttons.length - 2]);
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm.mock.calls.at(-1)![0].name).toMatch(/\.jpg$/);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("dragging the zoom slider keyboard-adjusts the scale (preview transform updates)", async () => {
    const user = userEvent.setup();
    renderWithUi(<UploadCropDialog open onOpenChange={vi.fn()} file={img()} onConfirm={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    const slider = within(dialog).getByRole("slider");
    const preview = dialog.querySelector("img") as HTMLImageElement;
    const before = preview.style.transform;
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(preview.style.transform).not.toBe(before);
  });
});
