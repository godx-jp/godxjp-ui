import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadRequest } from "../upload-request";

class Request {
  static latest: Request;
  upload = {
    onprogress: null as
      null | ((event: { lengthComputable: boolean; loaded: number; total: number }) => void),
  };
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => this.onabort?.());
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;
  status = 200;
  responseText = '{"mediaId":"stored"}';
  withCredentials = false;
  constructor() {
    Request.latest = this;
  }
}
afterEach(() => vi.unstubAllGlobals());
describe("upload multipart transport", () => {
  it("resolves async destination/data, preserves headers, and reports actual progress", async () => {
    vi.stubGlobal("XMLHttpRequest", Request);
    const progress = vi.fn();
    const promise = uploadRequest(
      new File(["data"], "report.txt"),
      {
        action: async () => "/upload",
        data: async () => ({ project: "PKG" }),
        headers: { "X-CSRF-TOKEN": "test" },
        name: "attachment",
        withCredentials: true,
      },
      { signal: new AbortController().signal, onProgress: progress },
    );
    await vi.waitFor(() => expect(Request.latest.send).toHaveBeenCalled());
    const xhr = Request.latest;
    expect(xhr.open).toHaveBeenCalledWith("POST", "/upload");
    expect(xhr.setRequestHeader).toHaveBeenCalledWith("X-CSRF-TOKEN", "test");
    expect(xhr.withCredentials).toBe(true);
    const body = xhr.send.mock.calls[0][0] as FormData;
    expect(body.get("project")).toBe("PKG");
    expect((body.get("attachment") as File).name).toBe("report.txt");
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
    expect(progress).toHaveBeenCalledWith(50);
    xhr.onload?.();
    await expect(promise).resolves.toMatchObject({ mediaId: "stored" });
  });
  it("aborts active requests and rejects unsuccessful HTTP responses", async () => {
    vi.stubGlobal("XMLHttpRequest", Request);
    const controller = new AbortController();
    const promise = uploadRequest(
      new File(["x"], "a"),
      { action: "/upload" },
      { signal: controller.signal, onProgress: vi.fn() },
    );
    const rejected = expect(promise).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await rejected;
    expect(Request.latest.abort).toHaveBeenCalledOnce();
    const failure = uploadRequest(
      new File(["x"], "a"),
      { action: "/upload" },
      { signal: new AbortController().signal, onProgress: vi.fn() },
    );
    Request.latest.status = 422;
    Request.latest.onload?.();
    await expect(failure).rejects.toThrow("HTTP 422");
  });
  it("does not start a request when aborted during destination resolution", async () => {
    vi.stubGlobal("XMLHttpRequest", Request);
    const controller = new AbortController();
    let resolve!: (url: string) => void;
    const promise = uploadRequest(
      new File(["x"], "a"),
      {
        action: () =>
          new Promise((r) => {
            resolve = r;
          }),
      },
      { signal: controller.signal, onProgress: vi.fn() },
    );
    controller.abort();
    resolve("/upload");
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
