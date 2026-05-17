// <Upload> — generic file uploader composite. Mirrors Ant Design's
// <Upload> API (multiple, accept, maxCount, listType, fileList,
// beforeUpload, customRequest, onChange, onRemove, onPreview).
//
// Service code supplies `customRequest` to perform the actual HTTP
// transport. The composite owns the file picker, drag-and-drop,
// validation, queue state, the progress bar, abort handling, the
// remove + retry flow, and three list layouts.
//
// Sibling primitives:
//   - <ImageUpload>     adds picture thumbnails + optional crop
//   - <AvatarUploader>  pre-configured single + round crop

import { useCallback, useId, useRef, useState, type DragEvent } from "react";
import { File as FileIcon, Image as ImageIcon, RotateCw, Trash2, Upload as UploadIcon } from "lucide-react";
import { Button } from "../../primitives/Button";
import { Flex } from "../../primitives/layout";
import { cn } from "../../primitives/cn";
import type { UploadFile, UploadProps } from "./shared/types";
import { DEFAULT_UPLOAD_LABELS } from "./shared/types";
import { useUpload } from "./shared/useUpload";

const KB = 1024;
const MB = 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  if (bytes >= KB) return `${Math.round(bytes / KB)} KB`;
  return `${bytes} B`;
}

interface ListItemProps {
  file: UploadFile;
  listType: "text" | "picture" | "picture-card";
  disabled: boolean;
  labels: {
    remove: string;
    retry: string;
    preview: string;
  };
  thumbSize?: number;
  onRemove: (uid: string) => void;
  onRetry: (uid: string) => void;
  onPreview?: (file: UploadFile) => void;
}

function UploadListItem({
  file,
  listType,
  disabled,
  labels,
  thumbSize = 96,
  onRemove,
  onRetry,
  onPreview,
}: ListItemProps) {
  const isImage = file.type.startsWith("image/") || !!file.thumbUrl;

  if (listType === "picture-card") {
    return (
      <div
        className="upload-picture-card"
        data-status={file.status}
        style={{ width: thumbSize, height: thumbSize }}
      >
        {file.thumbUrl || file.url ? (
          <img src={file.thumbUrl ?? file.url} alt={file.name} />
        ) : (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <FileIcon size={20} />
          </Flex>
        )}
        {file.status === "uploading" && (
          <div className="upload-progress">
            <div
              className="upload-progress-fill"
              style={{ width: `${file.percent}%` }}
            />
          </div>
        )}
        <div className="upload-picture-card-actions">
          {onPreview && file.status === "success" && (
            <Button
              type="button"
              size="small"
              variant="ghost"
              aria-label={labels.preview}
              onClick={() => onPreview(file)}
            >
              <ImageIcon size={14} />
            </Button>
          )}
          {file.status === "error" && (
            <Button
              type="button"
              size="small"
              variant="ghost"
              aria-label={labels.retry}
              onClick={() => onRetry(file.uid)}
              disabled={disabled}
            >
              <RotateCw size={14} />
            </Button>
          )}
          <Button
            type="button"
            size="small"
            variant="ghost"
            aria-label={labels.remove}
            onClick={() => onRemove(file.uid)}
            disabled={disabled}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="upload-list-item"
      data-status={file.status}
      style={{ position: "relative" }}
    >
      {listType === "picture" && isImage && (file.thumbUrl || file.url) ? (
        <img
          src={file.thumbUrl ?? file.url}
          alt={file.name}
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            objectFit: "cover",
            flex: "0 0 auto",
          }}
        />
      ) : (
        <FileIcon size={18} style={{ flex: "0 0 auto" }} />
      )}
      <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={file.name}
        >
          {file.name}
        </span>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color:
              file.status === "error"
                ? "var(--destructive)"
                : "var(--muted-foreground)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {file.status === "error"
            ? (file.error ?? "Upload failed")
            : file.status === "uploading"
              ? `${file.percent}%`
              : formatSize(file.size)}
        </span>
      </Flex>
      {file.status === "success" && onPreview && (
        <Button
          type="button"
          size="small"
          variant="ghost"
          aria-label={labels.preview}
          onClick={() => onPreview(file)}
          disabled={disabled}
        >
          <ImageIcon size={14} />
        </Button>
      )}
      {file.status === "error" && (
        <Button
          type="button"
          size="small"
          variant="ghost"
          aria-label={labels.retry}
          onClick={() => onRetry(file.uid)}
          disabled={disabled}
        >
          <RotateCw size={14} />
        </Button>
      )}
      <Button
        type="button"
        size="small"
        variant="ghost"
        aria-label={labels.remove}
        onClick={() => onRemove(file.uid)}
        disabled={disabled}
      >
        <Trash2 size={14} />
      </Button>
      {file.status === "uploading" && (
        <div className="upload-progress">
          <div
            className="upload-progress-fill"
            style={{ width: `${file.percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function Upload({
  multiple = false,
  accept,
  maxSize,
  maxCount,
  disabled = false,
  listType = "text",
  fileList,
  defaultFileList,
  beforeUpload,
  customRequest,
  onChange,
  onRemove,
  onPreview,
  labels: labelOverrides,
  errorMapper,
  trigger,
  children,
  className,
}: UploadProps) {
  const labels = { ...DEFAULT_UPLOAD_LABELS, ...(labelOverrides ?? {}) };
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    files,
    rejectionError,
    enqueue,
    remove,
    retry,
  } = useUpload({
    multiple,
    accept,
    maxSize,
    maxCount,
    fileList,
    defaultFileList,
    beforeUpload,
    customRequest,
    onChange,
    onRemove,
    errorMapper,
    labels,
  });

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list || list.length === 0) return;
      void enqueue(list);
      e.target.value = "";
    },
    [enqueue],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer?.files;
      if (dropped && dropped.length > 0) void enqueue(dropped);
    },
    [disabled, enqueue],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    },
    [],
  );

  const triggerNode = trigger ?? children;
  const showPictureCardTrigger =
    listType === "picture-card" &&
    (multiple || files.length === 0) &&
    (maxCount === undefined || files.length < maxCount);

  const listClass = cn(
    listType === "picture-card" ? "upload-list-picture-card" : "upload-list",
  );

  return (
    <div className={cn("upload-root", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleSelect}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {listType !== "picture-card" && (
        triggerNode ? (
          <span
            onClick={openPicker}
            style={{ display: "inline-flex", cursor: disabled ? "not-allowed" : "pointer" }}
          >
            {triggerNode}
          </span>
        ) : (
          <div
            className="upload-trigger"
            data-dragover={dragOver}
            data-disabled={disabled}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={openPicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPicker();
              }
            }}
            aria-disabled={disabled}
          >
            <Flex vertical align="center" gap="small">
              <UploadIcon size={20} />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}>
                {labels.dropHint}
              </span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                {labels.dropSubHint}
              </span>
            </Flex>
          </div>
        )
      )}

      {(files.length > 0 || listType === "picture-card") && (
        <div className={listClass}>
          {files.map((f) => (
            <UploadListItem
              key={f.uid}
              file={f}
              listType={listType}
              disabled={disabled}
              labels={{ remove: labels.remove, retry: labels.retry, preview: labels.preview }}
              onRemove={remove}
              onRetry={retry}
              onPreview={onPreview}
            />
          ))}
          {showPictureCardTrigger && (
            <div
              className="upload-picture-card upload-picture-card-trigger"
              role="button"
              tabIndex={disabled ? -1 : 0}
              data-dragover={dragOver}
              data-disabled={disabled}
              onClick={openPicker}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPicker();
                }
              }}
              aria-disabled={disabled}
              aria-label={labels.pictureCardHint}
            >
              <Flex vertical align="center" justify="center" gap={4} style={{ height: "100%" }}>
                <UploadIcon size={18} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
                  {labels.pictureCardHint}
                </span>
              </Flex>
            </div>
          )}
        </div>
      )}

      {rejectionError && (
        <div
          role="alert"
          style={{
            marginTop: "var(--spacing-2)",
            fontSize: "var(--text-sm)",
            color: "var(--destructive)",
          }}
        >
          {rejectionError}
        </div>
      )}
    </div>
  );
}
