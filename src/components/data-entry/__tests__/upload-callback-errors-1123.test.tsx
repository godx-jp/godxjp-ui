import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Upload } from "../upload";

/**
 * gh#1123 — a consumer callback that throws while Upload handles files is REPORTED, never
 * swallowed. godx-task#457: `onValueChange` threw (an icon import named `File` shadowed the global)
 * and the pick chain's `.catch(() => {})` made it vanish — no console line, no message, no event.
 */
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const file = (name: string) => new File(["x"], name, { type: "text/plain" });

describe("Upload — callback errors are reported (gh#1123)", () => {
  const original = globalThis.reportError;
  afterEach(() => {
    globalThis.reportError = original;
  });

  it("a throwing onValueChange reaches reportError and the user sees a message", async () => {
    const reportError = vi.fn();
    globalThis.reportError = reportError;
    const boom = new TypeError("File is not a constructor");
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Upload
        aria-label="添付"
        onValueChange={() => {
          throw boom;
        }}
      />,
    );
    await user.upload(fileInput(container), file("a.txt"));
    await waitFor(() => expect(reportError).toHaveBeenCalledWith(boom));
    expect(screen.getAllByText("Không thể thêm các tệp đã chọn.").length).toBeGreaterThan(0);
  });

  it("a throwing previewFile is reported without a user-facing message", async () => {
    const reportError = vi.fn();
    globalThis.reportError = reportError;
    const boom = new Error("preview failed");
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Upload aria-label="添付" previewFile={() => Promise.reject(boom)} />,
    );
    await user.upload(fileInput(container), file("a.txt"));
    await waitFor(() => expect(reportError).toHaveBeenCalledWith(boom));
    expect(screen.queryByText("Không thể thêm các tệp đã chọn.")).toBeNull();
  });
});
