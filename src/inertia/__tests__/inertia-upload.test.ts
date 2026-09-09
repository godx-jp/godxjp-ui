import { describe, expect, it, vi } from "vitest";
import { inertiaUpload, type InertiaUploadCallbacks } from "../index";
const file = new File(["x"], "a.txt");
const item = { uid: "1", name: file.name, size: 1, status: "idle" as const, file };
describe("Inertia upload bridge", () => {
  it("forwards progress, resolves redirects and rejects validation errors", async () => {
    let callbacks!: InertiaUploadCallbacks;
    const progress = vi.fn();
    const upload = inertiaUpload((_file, c) => {
      callbacks = c;
    }, "Failed");
    const promise = upload(file, item, {
      signal: new AbortController().signal,
      onProgress: progress,
    });
    callbacks.onProgress({ percentage: 40 });
    expect(progress).toHaveBeenCalledWith(40);
    callbacks.onSuccess();
    callbacks.onFinish();
    await expect(promise).resolves.toEqual({});
    const failed = upload(file, item, {
      signal: new AbortController().signal,
      onProgress: progress,
    });
    callbacks.onError({ file: "Too large" });
    await expect(failed).rejects.toThrow("Too large");
  });
  it("cancels visits and suppresses late completion", async () => {
    let callbacks!: InertiaUploadCallbacks;
    const controller = new AbortController();
    const cancel = vi.fn();
    const upload = inertiaUpload((_file, c) => {
      callbacks = c;
    }, "Failed");
    const promise = upload(file, item, { signal: controller.signal, onProgress: vi.fn() });
    const rejection = expect(promise).rejects.toMatchObject({ name: "AbortError" });
    callbacks.onCancelToken({ cancel });
    controller.abort();
    callbacks.onSuccess();
    await rejection;
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("settles failures even when the transport finishes without a success callback", async () => {
    let callbacks!: InertiaUploadCallbacks;
    const upload = inertiaUpload((_file, c) => {
      callbacks = c;
    }, "Failed");
    const promise = upload(file, item, {
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });
    callbacks.onFinish();
    await expect(promise).rejects.toThrow("Failed");
  });
});
