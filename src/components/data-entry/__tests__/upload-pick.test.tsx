import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithUi } from "@/test/render";

import { Upload } from "../upload";

const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const img = (name: string, bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type: "image/png" });

describe("Upload — file picking rules", () => {
  it("adds a valid file → onValueChange with one item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="dropzone" accept="image/*" onValueChange={onValueChange} />,
    );
    await user.upload(fileInput(container), img("a.png"));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)![0]).toHaveLength(1);
  });

  it("rejects a file whose type does not match `accept`", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="dropzone" accept="image/png" onValueChange={onValueChange} />,
    );
    await user.upload(fileInput(container), new File(["x"], "note.txt", { type: "text/plain" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("rejects a file larger than maxSizeBytes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="dropzone" accept="image/*" maxSizeBytes={5} onValueChange={onValueChange} />,
    );
    await user.upload(fileInput(container), img("big.png", 50));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("respects maxCount when multiple files are dropped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="picture" accept="image/*" maxCount={2} onValueChange={onValueChange} />,
    );
    await user.upload(fileInput(container), [img("a.png"), img("b.png"), img("c.png")]);
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)![0].length).toBeLessThanOrEqual(2);
  });

  it("a disabled upload ignores files", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="dropzone" accept="image/*" disabled onValueChange={onValueChange} />,
    );
    const input = fileInput(container);
    expect(input).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
