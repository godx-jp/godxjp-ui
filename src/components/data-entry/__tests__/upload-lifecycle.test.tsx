import { act, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Form } from "../form";
import { Upload, UPLOAD_LIST_IGNORE } from "../upload";
import type { UploadFileItem, UploadRequestContext } from "../upload-types";

const file = (name = "a.txt") => new File(["contents"], name, { type: "text/plain" });
const input = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe("Upload lifecycle", () => {
  it("renders every selected picture when configured for multiple images", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(<Upload variant="picture" maxCount={3} />);
    await user.upload(input(container), [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.png", { type: "image/png" }),
    ]);
    expect(screen.getByText("a.png")).toBeVisible();
    expect(screen.getByText("b.png")).toBeVisible();
    expect(container.querySelectorAll(".ui-upload-list-thumb")).toHaveLength(2);
  });

  it("previews image files in a dialog and restores focus after Escape", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Upload
        defaultValue={[
          { uid: "photo", name: "photo.png", size: 10, status: "done", previewUrl: "/photo.png" },
        ]}
      />,
    );
    const preview = screen.getByRole("button", { name: /preview|xem trước|プレビュー/i });
    await user.click(preview);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("photo.png");
    expect(screen.getByRole("img", { name: "photo.png" })).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(preview).toHaveFocus();
  });

  it("resets staged native form files and prevents pending validation from restoring them", async () => {
    let resolve!: (value: boolean) => void;
    const before = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((r) => {
            resolve = r;
          }),
      )
      .mockReturnValue(true);
    const change = vi.fn();
    const { container } = renderWithUi(
      <Form>
        <Upload name="files[]" beforeUpload={before} onValueChange={change} />
      </Form>,
    );
    fireEvent.change(input(container), { target: { files: [file("pending.txt")] } });
    await waitFor(() => expect(before).toHaveBeenCalledOnce());
    fireEvent.reset(container.querySelector("form")!);
    await act(async () => {
      resolve(true);
    });
    expect(change.mock.calls.at(-1)?.[0]).toEqual([]);
    expect(screen.queryByText("pending.txt")).not.toBeInTheDocument();
  });

  it("enforces the limit on repeated picks and accepts case-insensitive extensions", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const reject = vi.fn();
    const { container } = renderWithUi(
      <Upload accept=".TXT" maxCount={2} onValueChange={change} onReject={reject} />,
    );
    await user.upload(input(container), [file("A.TXT"), file("B.TXT")]);
    await user.upload(input(container), file("C.TXT"));
    expect(change.mock.calls.at(-1)?.[0]).toHaveLength(2);
    expect(reject).toHaveBeenCalledWith(expect.objectContaining({ reason: "count" }));
    expect(screen.getByRole("alert")).toBeVisible();
  });
  it("replaces the single item for button uploads", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = renderWithUi(
      <Upload variant="button" maxCount={1} onValueChange={change} />,
    );
    await user.upload(input(container), file("first.txt"));
    await user.upload(input(container), file("second.txt"));
    expect(change.mock.calls.at(-1)?.[0].map((item: UploadFileItem) => item.name)).toEqual([
      "second.txt",
    ]);
  });
  it("serializes async validation without losing files or exceeding limits", async () => {
    let finish!: (value: boolean) => void;
    const before = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue(true);
    const change = vi.fn();
    const { container } = renderWithUi(
      <Upload maxCount={2} beforeUpload={before} onValueChange={change} />,
    );
    fireEvent.change(input(container), { target: { files: [file("first.txt")] } });
    await waitFor(() => expect(before).toHaveBeenCalledTimes(1));
    fireEvent.change(input(container), {
      target: { files: [file("second.txt"), file("third.txt")] },
    });
    await act(async () => finish(true));
    await waitFor(() => expect(change.mock.calls.at(-1)?.[0]).toHaveLength(2));
  });
  it("supports ignore, manual staging, transformed uploads, and rejected validation", async () => {
    const user = userEvent.setup();
    const upload = vi.fn().mockResolvedValue({ mediaId: "id" });
    const reject = vi.fn();
    const change = vi.fn();
    const transformed = file("transformed.txt");
    const { container } = renderWithUi(
      <Upload
        onUpload={upload}
        onReject={reject}
        onValueChange={change}
        beforeUpload={(f) => {
          if (f.name === "ignore.txt") return UPLOAD_LIST_IGNORE;
          if (f.name === "manual.txt") return false;
          if (f.name === "bad.txt") throw new Error("invalid");
          return transformed;
        }}
      />,
    );
    await user.upload(input(container), [
      file("ignore.txt"),
      file("manual.txt"),
      file("bad.txt"),
      file("auto.txt"),
    ]);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(upload.mock.calls[0][0]).toBe(transformed);
    expect(change.mock.calls.at(-1)?.[0]).toHaveLength(2);
    expect(reject).toHaveBeenCalledWith(expect.objectContaining({ reason: "beforeUpload" }));
  });
  it("reports progress, cancels, restarts, and ignores the cancelled completion", async () => {
    const user = userEvent.setup();
    const requests: { context: UploadRequestContext; resolve: (v: { mediaId: string }) => void }[] =
      [];
    const upload = vi.fn(
      (_file, _item, context) =>
        new Promise<{ mediaId: string }>((resolve) => requests.push({ context, resolve })),
    );
    const change = vi.fn();
    const { container } = renderWithUi(<Upload onUpload={upload} onValueChange={change} />);
    await user.upload(input(container), file());
    await act(async () => requests[0].context.onProgress(42));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
    await user.click(screen.getByRole("button", { name: /cancel|huỷ|キャンセル/i }));
    expect(requests[0].context.signal.aborted).toBe(true);
    await user.click(screen.getByRole("button", { name: /^(upload|tải lên|アップロード)$/i }));
    await act(async () => requests[0].resolve({ mediaId: "stale" }));
    expect(change.mock.calls.at(-1)?.[0][0].status).toBe("uploading");
    await act(async () => requests[1].resolve({ mediaId: "current" }));
    expect(change.mock.calls.at(-1)?.[0][0].mediaId).toBe("current");
  });
  it("vetoes asynchronous removal and aborts only when removal is accepted", async () => {
    const user = userEvent.setup();
    let context!: UploadRequestContext;
    const remove = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const change = vi.fn();
    const { container } = renderWithUi(
      <Upload
        onRemove={remove}
        onValueChange={change}
        onUpload={(_f, _i, c) => {
          context = c;
          return new Promise(() => {});
        }}
      />,
    );
    await user.upload(input(container), file());
    await user.click(screen.getByRole("button", { name: /a.txt/ }));
    expect(context.signal.aborted).toBe(false);
    await user.click(screen.getByRole("button", { name: /a.txt/ }));
    expect(context.signal.aborted).toBe(true);
    expect(change.mock.calls.at(-1)?.[0]).toEqual([]);
  });
  it("pastes files only when enabled and preserves directory relative paths", async () => {
    const change = vi.fn();
    const f = file();
    Object.defineProperty(f, "webkitRelativePath", { value: "folder/a.txt" });
    const { container } = renderWithUi(<Upload directory pastable onValueChange={change} />);
    expect(input(container)).toHaveAttribute("webkitdirectory");
    fireEvent.paste(screen.getByRole("button"), { clipboardData: { files: [f] } });
    await waitFor(() => expect(change).toHaveBeenCalled());
    expect(change.mock.calls.at(-1)?.[0][0].relativePath).toBe("folder/a.txt");
  });
  it("readOnly blocks additions and hides mutation controls for populated uploads", () => {
    const { container } = renderWithUi(
      <Upload
        readOnly
        defaultValue={[{ uid: "1", name: "existing.txt", size: 1, status: "done" }]}
      />,
    );
    expect(input(container)).toBeDisabled();
    expect(screen.queryByRole("button", { name: /existing.txt/ })).not.toBeInTheDocument();
  });
  it("aborts on unmount and never emits a stale completion", async () => {
    const user = userEvent.setup();
    let context!: UploadRequestContext;
    let resolve!: (value: { mediaId: string }) => void;
    const change = vi.fn();
    const { container, unmount } = renderWithUi(
      <Upload
        onValueChange={change}
        onUpload={(_f, _i, c) => {
          context = c;
          return new Promise((r) => {
            resolve = r;
          });
        }}
      />,
    );
    await user.upload(input(container), file());
    unmount();
    change.mockClear();
    await act(async () => resolve({ mediaId: "late" }));
    expect(context.signal.aborted).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });
});
