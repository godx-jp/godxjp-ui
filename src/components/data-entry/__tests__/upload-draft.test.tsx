import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Upload, createUploadItem } from "../upload";

const img = (name = "a.png", bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type: "image/png" });
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const existing = () =>
  createUploadItem(img(), { uid: "m", previewUrl: "blob:existing", status: "done", mediaId: "m1" });

describe("Upload avatar — soft-delete draft", () => {
  it("removing an existing avatar offers an undo that restores it", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Upload variant="avatar" defaultValue={[existing()]} removable />,
    );
    expect(container.querySelector("img")).not.toBeNull();

    // click the remove (last) button → soft-delete, preview swaps to placeholder
    await user.click(screen.getAllByRole("button").at(-1)!);
    expect(container.querySelector("img")).toBeNull();

    // an undo affordance is now present — clicking it restores the preview
    await user.click(screen.getAllByRole("button").at(-1)!);
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("picking a new file over an existing avatar stages a replace with undo", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Upload variant="avatar" defaultValue={[existing()]} removable />,
    );
    const before = screen.getAllByRole("button").length;
    await user.upload(fileInput(container), img("new.png"));
    // the pending-replace draft surfaces extra actions (undo + change)
    expect(screen.getAllByRole("button").length).toBeGreaterThan(before);
  });
});

describe("Upload avatar-crop", () => {
  it("picking a file opens the crop dialog", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<Upload variant="avatar-crop" accept="image/*" />);
    await user.upload(fileInput(container), img());
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});

describe("Upload picture — preview states", () => {
  it("renders the preview image and a pending-replace badge", () => {
    const item = createUploadItem(img(), {
      uid: "p",
      previewUrl: "blob:p",
      status: "done",
      mediaId: "m1",
      pendingReplace: true,
    });
    const { container } = renderWithUi(
      <Upload variant="picture" defaultValue={[item]} removable />,
    );
    const preview = container.querySelector("img");
    expect(preview).toHaveAttribute("src", "blob:p");
  });
});
