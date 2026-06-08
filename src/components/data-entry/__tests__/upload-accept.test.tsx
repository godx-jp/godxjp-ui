import { describe, expect, it, vi } from "vitest";
import { renderWithUi, userEvent } from "@/test/render";

import { Upload } from "../upload";

const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const file = (name: string, type: string) => new File([new Uint8Array(4)], name, { type });

describe("Upload — extension-based accept rule", () => {
  it("accepts a file whose name matches a bare extension rule", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="dropzone" accept=".pdf" onValueChange={onValueChange} />,
    );
    // type is application/octet-stream but the name ends with .pdf → file.name.endsWith(".pdf")
    await user.upload(fileInput(container), file("invoice.pdf", "application/octet-stream"));
    expect(onValueChange).toHaveBeenCalled();
  });

  it("rejects a file whose name does not match the extension rule", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="dropzone" accept=".pdf" onValueChange={onValueChange} />,
    );
    await user.upload(fileInput(container), file("note.txt", "text/plain"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
