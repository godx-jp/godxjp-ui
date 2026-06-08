import { afterEach, describe, expect, it, vi } from "vitest";

import {
  collectUploadCommitActions,
  createUploadItem,
  revokePreviewUrl,
  type UploadFileItem,
} from "../upload-types";

const file = (name: string, type: string) => new File([new Uint8Array(4)], name, { type });

afterEach(() => vi.restoreAllMocks());

describe("createUploadItem", () => {
  it("creates a blob preview for images but not for other files", () => {
    const image = createUploadItem(file("a.png", "image/png"));
    expect(image.previewUrl).toMatch(/^blob:/);
    expect(image.status).toBe("idle");

    const doc = createUploadItem(file("a.pdf", "application/pdf"));
    expect(doc.previewUrl).toBeUndefined(); // non-image → no preview
  });

  it("lets a partial override fields like uid", () => {
    const item = createUploadItem(file("a.png", "image/png"), { uid: "fixed", status: "done" });
    expect(item.uid).toBe("fixed");
    expect(item.status).toBe("done");
  });
});

describe("revokePreviewUrl", () => {
  it("revokes a blob url and ignores everything else", () => {
    const spy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    revokePreviewUrl({ uid: "1", name: "x", size: 1, status: "idle", previewUrl: "blob:abc" });
    expect(spy).toHaveBeenCalledWith("blob:abc");

    spy.mockClear();
    revokePreviewUrl({ uid: "2", name: "y", size: 1, status: "idle", previewUrl: "https://x/y" });
    revokePreviewUrl(null);
    revokePreviewUrl(undefined);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("collectUploadCommitActions", () => {
  const item = (p: Partial<UploadFileItem>): UploadFileItem => ({
    uid: p.uid ?? "u",
    name: "n",
    size: 1,
    status: p.status ?? "done",
    ...p,
  });

  it("partitions deletes vs promotes across every item state", () => {
    const actions = collectUploadCommitActions([
      item({ uid: "a", pendingDelete: true, mediaId: "del-1" }), // soft-delete
      item({ uid: "b", pendingReplace: true, replacesMediaId: "old-1", mediaId: "new-1" }), // replace
      item({ uid: "c", mediaId: "keep-1" }), // promote
      item({ uid: "d", mediaId: "err-1", status: "error" }), // error → skip promote
      item({ uid: "e" }), // no mediaId → nothing
    ]);
    // a's media + b's replaced baseline are deleted
    expect(actions.deleteMediaIds.sort()).toEqual(["del-1", "old-1"]);
    // b's new + c are promoted; the errored one is excluded
    expect(actions.promoteMediaIds.sort()).toEqual(["keep-1", "new-1"]);
  });

  it("deduplicates ids", () => {
    const actions = collectUploadCommitActions([
      item({ uid: "a", mediaId: "m1" }),
      item({ uid: "b", mediaId: "m1" }),
    ]);
    expect(actions.promoteMediaIds).toEqual(["m1"]);
  });
});
