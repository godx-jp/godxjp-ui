import * as React from "react";

import {
  createUploadItem,
  revokePreviewUrl,
  type UploadCommitAction,
  type UploadFileItem,
} from "./upload-types";

export type UploadDraftState = {
  /** Item rendered in UI (may reflect pending delete/replace). */
  display: UploadFileItem | null;
  /** Server baseline — restored on undo remove/replace. */
  baseline: UploadFileItem | null;
  canUndoRemove: boolean;
  canUndoReplace: boolean;
};

export type UseUploadDraftOptions = {
  value?: UploadFileItem | null;
  onChange?: (item: UploadFileItem | null) => void;
};

/**
 * Single-value draft for avatar / picture — coordinates with media-service:
 * soft-delete only on form commit; undo before save (no restore API).
 */
export function useUploadDraft({ value, onChange }: UseUploadDraftOptions) {
  const [baseline, setBaseline] = React.useState<UploadFileItem | null>(value ?? null);

  React.useEffect(() => {
    if (value && !value.pendingDelete && !value.pendingReplace && value.mediaId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- baseline mirrors the latest committed server media item for undo.
      setBaseline(value);
    }
  }, [value]);

  const markRemove = React.useCallback(() => {
    if (!value) return;
    onChange?.({ ...value, pendingDelete: true, pendingReplace: false, status: "removed" });
  }, [onChange, value]);

  const undoRemove = React.useCallback(() => {
    if (!baseline) {
      onChange?.(null);
      return;
    }
    onChange?.({ ...baseline, pendingDelete: false, pendingReplace: false, status: "done" });
  }, [baseline, onChange]);

  const stageReplace = React.useCallback(
    (file: File) => {
      revokePreviewUrl(value);
      const next = createUploadItem(file, {
        pendingReplace: Boolean(value?.mediaId),
        replacesMediaId: value?.mediaId,
        status: "idle",
      });
      onChange?.({ ...next, pendingDelete: false });
    },
    [onChange, value],
  );

  const undoReplace = React.useCallback(() => {
    revokePreviewUrl(value);
    onChange?.(baseline ? { ...baseline, pendingReplace: false, pendingDelete: false } : null);
  }, [baseline, onChange, value]);

  const getCommitActions = React.useCallback((): UploadCommitAction => {
    if (!value) return { deleteMediaIds: [], promoteMediaIds: [] };
    const deleteMediaIds: string[] = [];
    if (value.pendingDelete && value.mediaId) deleteMediaIds.push(value.mediaId);
    if (value.pendingReplace && value.replacesMediaId) deleteMediaIds.push(value.replacesMediaId);
    const promoteMediaIds =
      value.mediaId && !value.pendingDelete && value.status !== "error" ? [value.mediaId] : [];
    return {
      deleteMediaIds: [...new Set(deleteMediaIds)],
      promoteMediaIds: [...new Set(promoteMediaIds)],
    };
  }, [value]);

  const state = React.useMemo<UploadDraftState>(
    () => ({
      display: value ?? null,
      baseline,
      canUndoRemove: Boolean(value?.pendingDelete),
      canUndoReplace: Boolean(value?.pendingReplace),
    }),
    [baseline, value],
  );

  return { state, markRemove, undoRemove, stageReplace, undoReplace, getCommitActions };
}
