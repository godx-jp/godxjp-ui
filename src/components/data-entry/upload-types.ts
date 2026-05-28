/** Upload item — maps to media-service after `onUpload` resolves `mediaId`. */
export type UploadFileStatus = "idle" | "uploading" | "done" | "error" | "removed";

export type UploadFileItem = {
  /** Stable key for list reconciliation */
  uid: string;
  name: string;
  size: number;
  mimeType?: string;
  /** Blob URL or media-service download URL */
  previewUrl?: string;
  /** Set after issue → PUT → complete */
  mediaId?: string;
  status: UploadFileStatus;
  error?: string;
  /** Local file before / during upload */
  file?: File;
  /**
   * Draft-only: marked for soft-delete on form commit.
   * Undo clears this before save — media-service has no restore API.
   */
  pendingDelete?: boolean;
  /**
   * Draft-only: replacement staged locally; baseline kept for undo.
   */
  pendingReplace?: boolean;
  /** mediaId to soft-delete on commit when `pendingReplace` */
  replacesMediaId?: string;
};

export type UploadVariant =
  | "dropzone"
  | "button"
  | "picture-card"
  | "picture"
  | "avatar"
  | "avatar-crop";

/** Actions parent runs on form submit (media-service). */
export type UploadCommitAction = {
  /** Soft-delete on save — no restore API */
  deleteMediaIds: string[];
  /** Temp uploads already completed via `onUpload` — promote on save */
  promoteMediaIds: string[];
};

export function createUploadItem(file: File, partial?: Partial<UploadFileItem>): UploadFileItem {
  const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
  return {
    uid: partial?.uid ?? crypto.randomUUID(),
    name: file.name,
    size: file.size,
    mimeType: file.type,
    previewUrl,
    status: "idle",
    file,
    ...partial,
  };
}

export function revokePreviewUrl(item: UploadFileItem | null | undefined) {
  if (item?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
}

export function collectUploadCommitActions(items: UploadFileItem[]): UploadCommitAction {
  const deleteMediaIds: string[] = [];
  const promoteMediaIds: string[] = [];

  for (const item of items) {
    if (item.pendingDelete && item.mediaId) {
      deleteMediaIds.push(item.mediaId);
      continue;
    }
    if (item.pendingReplace && item.replacesMediaId) {
      deleteMediaIds.push(item.replacesMediaId);
    }
    if (item.mediaId && !item.pendingDelete && item.status !== "error") {
      promoteMediaIds.push(item.mediaId);
    }
  }

  return {
    deleteMediaIds: [...new Set(deleteMediaIds)],
    promoteMediaIds: [...new Set(promoteMediaIds)],
  };
}
