import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUploadDraft } from "../use-upload-draft";
import { createUploadItem, type UploadFileItem } from "../upload-types";

const file = (name = "a.png") => new File([new Uint8Array(4)], name, { type: "image/png" });

const committed = (over?: Partial<UploadFileItem>): UploadFileItem => ({
  uid: "m",
  name: "a.png",
  size: 4,
  status: "done",
  mediaId: "m1",
  ...over,
});

describe("useUploadDraft", () => {
  it("markRemove is a no-op when there is no value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useUploadDraft({ value: null, onChange }));
    act(() => result.current.markRemove());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("markRemove soft-deletes the current value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useUploadDraft({ value: committed(), onChange }));
    act(() => result.current.markRemove());
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pendingDelete: true, status: "removed" }),
    );
  });

  it("undoRemove restores the captured baseline", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useUploadDraft({ value: committed({ pendingDelete: true, status: "removed" }), onChange }),
    );
    act(() => result.current.undoRemove());
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pendingDelete: false, status: "done", mediaId: "m1" }),
    );
  });

  it("undoRemove emits null when there is no baseline", () => {
    const onChange = vi.fn();
    // Seed from null (no baseline), then move to a pendingDelete item: the effect's
    // guard (mediaId present AND not pending) never fires, so baseline stays null.
    const { result, rerender } = renderHook(({ value }) => useUploadDraft({ value, onChange }), {
      initialProps: { value: null as UploadFileItem | null },
    });
    rerender({ value: { uid: "x", name: "x", size: 1, status: "removed", pendingDelete: true } });
    act(() => result.current.undoRemove());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("stageReplace marks pendingReplace and records the prior mediaId when replacing committed media", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useUploadDraft({ value: committed(), onChange }));
    act(() => result.current.stageReplace(file("new.png")));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pendingReplace: true, replacesMediaId: "m1", pendingDelete: false }),
    );
  });

  it("stageReplace does not flag pendingReplace when there was no prior media", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useUploadDraft({ value: null, onChange }));
    act(() => result.current.stageReplace(file("first.png")));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pendingReplace: false, replacesMediaId: undefined }),
    );
  });

  it("undoReplace restores the baseline clearing pending flags", () => {
    const onChange = vi.fn();
    const staged = createUploadItem(file("new.png"), {
      pendingReplace: true,
      replacesMediaId: "m1",
    });
    // Start from a committed value so a baseline is captured, then rerender with the staged replace.
    const { result, rerender } = renderHook(({ value }) => useUploadDraft({ value, onChange }), {
      initialProps: { value: committed() as UploadFileItem | null },
    });
    rerender({ value: staged });
    act(() => result.current.undoReplace());
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pendingReplace: false, pendingDelete: false, mediaId: "m1" }),
    );
  });

  it("undoReplace emits null when there is no baseline", () => {
    const onChange = vi.fn();
    const staged = createUploadItem(file("new.png"), { pendingReplace: false });
    // Seed from null so no baseline is captured, then stage a fresh (no-mediaId) item.
    const { result, rerender } = renderHook(({ value }) => useUploadDraft({ value, onChange }), {
      initialProps: { value: null as UploadFileItem | null },
    });
    rerender({ value: staged });
    act(() => result.current.undoReplace());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("getCommitActions returns empty action when there is no value", () => {
    const { result } = renderHook(() => useUploadDraft({ value: null }));
    expect(result.current.getCommitActions()).toEqual({ deleteMediaIds: [], promoteMediaIds: [] });
  });

  it("getCommitActions schedules a delete for a soft-deleted item", () => {
    const { result } = renderHook(() =>
      useUploadDraft({ value: committed({ pendingDelete: true }) }),
    );
    expect(result.current.getCommitActions()).toEqual({
      deleteMediaIds: ["m1"],
      promoteMediaIds: [],
    });
  });

  it("getCommitActions deletes the replaced media and promotes the new one", () => {
    const { result } = renderHook(() =>
      useUploadDraft({
        value: committed({ mediaId: "m2", pendingReplace: true, replacesMediaId: "m1" }),
      }),
    );
    expect(result.current.getCommitActions()).toEqual({
      deleteMediaIds: ["m1"],
      promoteMediaIds: ["m2"],
    });
  });

  it("getCommitActions does not promote an errored item", () => {
    const { result } = renderHook(() =>
      useUploadDraft({ value: committed({ status: "error" }) }),
    );
    expect(result.current.getCommitActions().promoteMediaIds).toEqual([]);
  });

  it("exposes canUndo flags derived from the value", () => {
    const { result, rerender } = renderHook(({ value }) => useUploadDraft({ value }), {
      initialProps: { value: committed() as UploadFileItem | null },
    });
    expect(result.current.state.canUndoRemove).toBe(false);
    expect(result.current.state.canUndoReplace).toBe(false);

    rerender({ value: committed({ pendingDelete: true }) });
    expect(result.current.state.canUndoRemove).toBe(true);

    rerender({ value: committed({ pendingReplace: true }) });
    expect(result.current.state.canUndoReplace).toBe(true);
  });
});
