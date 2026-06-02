import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderHook, act } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Upload } from "../upload";
import { collectUploadCommitActions, type UploadFileItem } from "../upload-types";
import { useUploadDraft } from "../use-upload-draft";

describe("collectUploadCommitActions", () => {
  it("collects delete + promote for avatar replace", () => {
    const items: UploadFileItem[] = [
      {
        uid: "1",
        name: "new.jpg",
        size: 100,
        mediaId: "temp-new",
        status: "done",
        pendingReplace: true,
        replacesMediaId: "old-perm",
      },
    ];
    expect(collectUploadCommitActions(items)).toEqual({
      deleteMediaIds: ["old-perm"],
      promoteMediaIds: ["temp-new"],
    });
  });

  it("collects delete only for pending delete", () => {
    const items: UploadFileItem[] = [
      {
        uid: "1",
        name: "avatar.jpg",
        size: 100,
        mediaId: "perm-1",
        status: "removed",
        pendingDelete: true,
      },
    ];
    expect(collectUploadCommitActions(items)).toEqual({
      deleteMediaIds: ["perm-1"],
      promoteMediaIds: [],
    });
  });
});

describe("useUploadDraft", () => {
  const baseline: UploadFileItem = {
    uid: "b",
    name: "avatar.jpg",
    size: 1,
    mediaId: "media-old",
    previewUrl: "https://cdn/avatar.jpg",
    status: "done",
  };

  it("marks remove and undo restores baseline", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useUploadDraft({ value, onChange }), {
      initialProps: { value: baseline },
    });

    act(() => result.current.markRemove());
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pendingDelete: true, mediaId: "media-old" }),
    );

    rerender({ value: { ...baseline, pendingDelete: true, status: "removed" } });
    act(() => result.current.undoRemove());
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pendingDelete: false, mediaId: "media-old" }),
    );
  });

  it("getCommitActions returns promote + delete on replace", () => {
    const replaced: UploadFileItem = {
      uid: "n",
      name: "new.jpg",
      size: 2,
      mediaId: "media-new",
      status: "done",
      pendingReplace: true,
      replacesMediaId: "media-old",
    };
    const { result } = renderHook(() => useUploadDraft({ value: replaced }));
    expect(result.current.getCommitActions()).toEqual({
      deleteMediaIds: ["media-old"],
      promoteMediaIds: ["media-new"],
    });
  });
});

describe("Upload", () => {
  it("renders dropzone variant", () => {
    renderWithUi(<Upload variant="dropzone" />);
    expect(screen.getByRole("button", { name: /tải file lên/i })).toBeInTheDocument();
  });

  it("shows undo banner after avatar remove", async () => {
    const user = userEvent.setup();

    function AvatarDemo() {
      const [items, setItems] = React.useState<UploadFileItem[]>([
        {
          uid: "1",
          name: "avatar.jpg",
          size: 100,
          mediaId: "m1",
          previewUrl: "https://example.com/a.jpg",
          status: "done",
        },
      ]);
      return <Upload variant="avatar" value={items} onValueChange={setItems} removable />;
    }

    renderWithUi(<AvatarDemo />);
    await user.click(screen.getByRole("button", { name: /xóa ảnh/i }));
    expect(screen.getByText(/ảnh sẽ bị xóa khi bạn lưu/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hoàn tác/i })).toBeInTheDocument();
  });

  it("renders avatar placeholder when empty", () => {
    renderWithUi(<Upload variant="avatar" value={[]} onValueChange={() => undefined} />);
    expect(screen.getByRole("button", { name: /ảnh đại diện/i })).toBeInTheDocument();
  });
});
