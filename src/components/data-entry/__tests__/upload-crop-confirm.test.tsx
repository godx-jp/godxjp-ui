import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { waitFor, within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Upload } from "../upload";

const img = (name = "face.png") => new File([new Uint8Array(8)], name, { type: "image/png" });
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;

// jsdom has no real canvas — stub the 2D context + toBlob so the crop can export a blob.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: () => {},
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    cb: BlobCallback,
  ) {
    cb(new Blob(["x"], { type: "image/jpeg" }));
  });
});
afterAll(() => vi.restoreAllMocks());

describe("Upload avatar-crop — confirm", () => {
  it("confirming the crop emits a .jpg cropped item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="avatar-crop" accept="image/*" onValueChange={onValueChange} />,
    );
    await user.upload(fileInput(container), img("face.png"));

    const dialog = await screen.findByRole("dialog");
    // footer order is [cancel, confirm, close-X]; confirm is the second-to-last button
    const buttons = within(dialog).getAllByRole("button");
    await user.click(buttons[buttons.length - 2]);

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled();
      const last = onValueChange.mock.calls.at(-1)![0];
      expect(last[0].name).toMatch(/\.jpg$/); // cropped → re-encoded as jpeg
    });
  });
});
