import { describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor, within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Upload, createUploadItem } from "../upload";

const img = (name = "a.png", bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type: "image/png" });
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;

describe("Upload — dropzone drag & drop + file list", () => {
  it("dragOver toggles the active border, drop adds the dropped files", async () => {
    const onValueChange = vi.fn();
    renderWithUi(<Upload variant="dropzone" accept="image/*" onValueChange={onValueChange} />);
    const zone = screen.getByRole("button");
    fireEvent.dragOver(zone);
    expect(zone.className).toContain("border-primary");
    fireEvent.dragLeave(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [img()] } });
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)![0]).toHaveLength(1);
  });

  it("Enter on the dropzone opens the file picker", () => {
    const { container } = renderWithUi(<Upload variant="dropzone" />);
    const clickSpy = vi.spyOn(fileInput(container), "click");
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(clickSpy).toHaveBeenCalled();
  });

  it("the file list renders each item and remove drops it from the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const item = createUploadItem(img("invoice.png"), { uid: "u1", status: "idle" });
    renderWithUi(
      <Upload variant="dropzone" defaultValue={[item]} removable onValueChange={onValueChange} />,
    );
    const li = screen.getByText("invoice.png").closest("li")!;
    await user.click(within(li).getByRole("button"));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
});

describe("Upload — button & picture-card variants", () => {
  it("button variant renders custom children and opens the picker", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<Upload variant="button">画像を追加</Upload>);
    expect(screen.getByText("画像を追加")).toBeInTheDocument();
    const clickSpy = vi.spyOn(fileInput(container), "click");
    await user.click(screen.getByRole("button", { name: "画像を追加" }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("picture-card shows existing cards plus an add affordance, and removes a card", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const item = createUploadItem(img(), { uid: "p1", previewUrl: "blob:preview", status: "done" });
    const { container } = renderWithUi(
      <Upload
        variant="picture-card"
        defaultValue={[item]}
        removable
        onValueChange={onValueChange}
      />,
    );
    // decorative thumbnail (alt="") → query by tag, not the img role
    const thumb = container.querySelector("img")!;
    expect(thumb).toHaveAttribute("src", "blob:preview");
    // the remove button lives inside the card (the add button is separate)
    const card = thumb.closest("div")!;
    await user.click(within(card).getByRole("button"));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
});

describe("Upload — async runUpload lifecycle", () => {
  it("invokes onUpload with the picked file + item when resolving", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue({ mediaId: "media-1234abcd" });
    const { container } = renderWithUi(
      <Upload variant="button" accept="image/*" onUpload={onUpload} />,
    );
    await user.upload(fileInput(container), img("photo.png"));
    await waitFor(() =>
      expect(onUpload).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({ name: "photo.png", status: expect.any(String) }),
      ),
    );
  });

  it("runs the catch branch when onUpload rejects", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockRejectedValue(new Error("upload boom"));
    const { container } = renderWithUi(
      <Upload variant="button" accept="image/*" onUpload={onUpload} />,
    );
    await user.upload(fileInput(container), img());
    await waitFor(() => expect(onUpload).toHaveBeenCalled());
  });
});

describe("Upload — avatar variant", () => {
  it("shows the preview then markRemove swaps to the placeholder", async () => {
    const user = userEvent.setup();
    const item = createUploadItem(img(), {
      uid: "av1",
      previewUrl: "blob:avatar",
      status: "done",
      mediaId: "m1",
    });
    const { container } = renderWithUi(<Upload variant="avatar" defaultValue={[item]} removable />);
    expect(container.querySelector("img")).not.toBeNull();
    // buttons: [avatar picker, remove] — remove is the last
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    expect(container.querySelector("img")).toBeNull(); // placeholder (pendingDelete)
  });
});
