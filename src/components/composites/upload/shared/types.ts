// Upload primitive types — shared across <Upload>, <ImageUpload>,
// and <AvatarUploader>. Surface follows Ant Design's <Upload>
// (uid + name + status + percent + originFile) so a consumer
// switching from antd has a one-to-one mental model.

import type { ReactNode } from "react";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "success"
  | "error"
  | "removed";

export type UploadListType = "text" | "picture" | "picture-card";

export interface UploadFile {
  /** Stable client-side identifier (used as React key). */
  uid: string;
  /** File name shown in the list. */
  name: string;
  /** Size in bytes. */
  size: number;
  /** MIME type. */
  type: string;
  /** Lifecycle phase. */
  status: UploadStatus;
  /** 0..100. */
  percent: number;
  /** Human-readable error from the upload transport. */
  error?: string;
  /** Final URL (or pre-existing URL for controlled mode). */
  url?: string;
  /** Local object URL used for thumbnails before upload completes. */
  thumbUrl?: string;
  /** The original `File` — only present until the upload resolves. */
  originFile?: File;
}

export interface UploadRequestParams {
  file: File;
  /** Push 0..100 progress to the list item. */
  onProgress: (percent: number) => void;
  /** Aborts when the user removes the item mid-upload. */
  signal: AbortSignal;
}

/**
 * Service supplies the transport. Resolve with `{ url }` to stamp
 * the final URL on the list item; resolve with `void` to keep the
 * client-side thumbUrl. Throw to surface an error.
 */
export type UploadCustomRequest = (
  params: UploadRequestParams,
) => Promise<{ url?: string } | void>;

export interface UploadLabels {
  /** Default trigger CTA. */
  dropHint: string;
  /** Second-line hint under the dashed trigger. */
  dropSubHint: string;
  /** Picture-card "+ Upload". */
  pictureCardHint: string;
  /** Per-item remove button aria-label. */
  remove: string;
  /** Per-item retry button aria-label. */
  retry: string;
  /** Per-item preview button aria-label. */
  preview: string;
  /** Error: file type rejected. */
  rejectedType: string;
  /** Error: file too large (supports `{{mb}}` interpolation). */
  rejectedTooLarge: string;
  /** Error: too many files (supports `{{count}}` interpolation). */
  rejectedTooMany: string;
}

export const DEFAULT_UPLOAD_LABELS: UploadLabels = {
  dropHint: "Click or drag file to upload",
  dropSubHint: "Single or multiple files supported",
  pictureCardHint: "Upload",
  remove: "Remove",
  retry: "Retry",
  preview: "Preview",
  rejectedType: "File type not allowed",
  rejectedTooLarge: "File must be smaller than {{mb}} MB",
  rejectedTooMany: "At most {{count}} file(s) allowed",
};

export interface UploadProps {
  /** Allow selecting multiple files at once. */
  multiple?: boolean;
  /** MIME pattern passed to `<input accept=>`, e.g. `image/*`, `.pdf,.docx`. */
  accept?: string;
  /** Max bytes per file. Files larger are rejected before upload. */
  maxSize?: number;
  /** Max items in the list (ignored when `multiple=false`). */
  maxCount?: number;
  /** Hide the trigger + disable all actions. */
  disabled?: boolean;
  /** Visual variant of the file list. */
  listType?: UploadListType;
  /** Controlled mode — when supplied the composite never owns state. */
  fileList?: UploadFile[];
  /** Uncontrolled initial state. */
  defaultFileList?: UploadFile[];
  /** Synchronous or async gate run before queueing. Return false → skip. */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** Service-supplied transport. */
  customRequest: UploadCustomRequest;
  /** Fires whenever the list mutates (controlled + uncontrolled). */
  onChange?: (files: UploadFile[]) => void;
  /** Fires before remove. Return false / reject to keep the item. */
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>;
  /** Fires when the user taps the preview button. */
  onPreview?: (file: UploadFile) => void;
  /** Override label strings. */
  labels?: Partial<UploadLabels>;
  /** Map a thrown error to user copy. */
  errorMapper?: (err: unknown) => string;
  /** Replace the default dashed trigger area. */
  trigger?: ReactNode;
  /** Alias for `trigger` (composability with shadcn-style). */
  children?: ReactNode;
  /** Extra className on the outer wrapper. */
  className?: string;
}
