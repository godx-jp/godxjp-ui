// MediaUpload — high-level wrapper that integrates with the
// platform's media-service. Two value shapes are supported:
//   • MediaItem (full metadata + signed URL) — render immediately
//   • UUID string — component fetches metadata via `fetchMedia(id)`
//     (or `fetchMediaBatch` for arrays) and renders once resolved.
// Upload flow always goes through media-service's 3-step
// presigned-URL contract: init → PUT bytes → promote. The result
// is a MediaItem that gets passed back via `onValueChange`.
//
// Consumers ONLY need to persist UUIDs in their domain models;
// rendering happens automatically.

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { ImagePlus, RotateCw, X } from "lucide-react";
import { Button } from "../../general/Button";
import { Flex } from "../../layout";
import { cn } from "../../cn";
import {
  fetchMedia,
  fetchMediaBatch,
  uploadFile,
  type MediaItem,
} from "./media-client";
import { AvatarUploader } from "./AvatarUploader";

// ─── Shared types ─────────────────────────────────────────────────

export type MediaUploadSize = "small" | "default" | "large";
export type MediaUploadShape = "square" | "circle" | "card";

type MediaValueSingle = string | MediaItem | null | undefined;
type MediaValueMultiple = Array<string | MediaItem>;

// ─── Resolver helpers ─────────────────────────────────────────────

/**
 * Resolve a value that may be `null | string (UUID) | MediaItem` into
 * a MediaItem. UUID branch calls `fetchMedia`; failures resolve to
 * `null` and surface via the `error` state, so the UI can render a
 * fallback "media not available" tile without throwing.
 */
function useResolvedMediaItem(value: MediaValueSingle): {
  item: MediaItem | null;
  loading: boolean;
  error: string | null;
  requestedId: string | null;
} {
  const [item, setItem] = useState<MediaItem | null>(
    typeof value === "object" && value !== null ? value : null,
  );
  const [loading, setLoading] = useState(typeof value === "string");
  const [error, setError] = useState<string | null>(null);
  const requestedId = typeof value === "string" ? value : null;

  useEffect(() => {
    let cancelled = false;
    if (value == null) {
      setItem(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (typeof value === "object") {
      setItem(value);
      setLoading(false);
      setError(null);
      return;
    }
    // value is a UUID string — fetch it
    setLoading(true);
    setError(null);
    fetchMedia(value)
      .then((it) => {
        if (cancelled) return;
        setItem(it);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setItem(null);
        setLoading(false);
        setError(err instanceof Error ? err.message : "Media not available");
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return { item, loading, error, requestedId };
}

function useResolvedMediaList(value: MediaValueMultiple): {
  items: MediaItem[];
  loading: boolean;
  errorIds: string[];
} {
  const ids = useMemo(
    () => value.filter((v): v is string => typeof v === "string"),
    [value],
  );
  const inline = useMemo(
    () =>
      value
        .map((v, i) => (typeof v === "object" ? { v, i } : null))
        .filter((x): x is { v: MediaItem; i: number } => x !== null),
    [value],
  );

  const [items, setItems] = useState<MediaItem[]>(() => value.map((v) =>
    typeof v === "object"
      ? v
      : {
          id: v,
          filename: "loading",
          contentType: "application/octet-stream",
          url: "",
        },
  ));
  const [loading, setLoading] = useState(ids.length > 0);
  const [errorIds, setErrorIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (ids.length === 0) {
      // Only inline items — emit immediately.
      setItems(inline.map((x) => x.v));
      setLoading(false);
      setErrorIds([]);
      return;
    }
    setLoading(true);
    fetchMediaBatch(ids)
      .then((fetched) => {
        if (cancelled) return;
        // Merge inline + fetched preserving original order
        const merged: MediaItem[] = [];
        const fetchedById = new Map(fetched.map((f) => [f.id, f]));
        const inlineByIdx = new Map(inline.map((x) => [x.i, x.v]));
        const failed: string[] = [];
        value.forEach((v, idx) => {
          if (typeof v === "object") {
            merged.push(inlineByIdx.get(idx) as MediaItem);
          } else {
            const got = fetchedById.get(v);
            if (got && got.url) merged.push(got);
            else {
              failed.push(v);
              merged.push(
                got ?? {
                  id: v,
                  filename: "unknown",
                  contentType: "application/octet-stream",
                  url: "",
                },
              );
            }
          }
        });
        setItems(merged);
        setErrorIds(failed);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorIds(ids);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, inline, value]);

  return { items, loading, errorIds };
}

// ─── MediaUpload.Single ───────────────────────────────────────────

export interface MediaUploadSingleProps {
  /** Controlled — UUID OR full MediaItem; component fetches metadata if only id given. */
  value?: string | MediaItem | null;
  defaultValue?: string | MediaItem | null;
  onValueChange?: (value: MediaItem | null) => void;
  accept?: string;
  /** Max file size in bytes. */
  maxSize?: number;
  disabled?: boolean;
  /** Preview shape — square / circle / card. */
  shape?: MediaUploadShape;
  size?: MediaUploadSize;
  className?: string;
}

export function MediaUploadSingle({
  value,
  defaultValue = null,
  onValueChange,
  accept = "image/*",
  maxSize,
  disabled = false,
  shape = "square",
  size = "default",
  className,
}: MediaUploadSingleProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<MediaValueSingle>(defaultValue);
  const effective = isControlled ? value : internal;
  const { item, loading, error, requestedId } = useResolvedMediaItem(effective);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const emit = useCallback(
    (next: MediaItem | null) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (maxSize && file.size > maxSize) {
        setUploadError(
          `File must be smaller than ${(maxSize / (1024 * 1024)).toFixed(0)} MB`,
        );
        return;
      }
      setUploading(true);
      setUploadError(null);
      setProgress(0);
      try {
        const result = await uploadFile(file, setProgress);
        emit(result);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [emit, maxSize],
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (f) void handleFile(f);
    },
    [handleFile],
  );

  const [dragOver, setDragOver] = useState(false);
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const f = e.dataTransfer?.files?.[0];
      if (f) void handleFile(f);
    },
    [disabled, handleFile],
  );

  const openPicker = useCallback(() => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }, [disabled, uploading]);

  const handleRemove = useCallback(() => {
    emit(null);
    setUploadError(null);
  }, [emit]);

  const hasImage = !!item && !!item.url;

  return (
    <div
      className={cn(
        "media-upload media-upload-single",
        `media-upload-size-${size}`,
        `media-upload-shape-${shape}`,
        className,
      )}
      data-disabled={disabled}
      data-media-uuid={requestedId ?? undefined}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleSelect}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <div
        className="media-upload-frame"
        data-dragover={dragOver}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        aria-disabled={disabled}
        aria-label={hasImage ? "Replace image" : "Upload image"}
      >
        {hasImage ? (
          <img src={item.url} alt={item.filename} />
        ) : loading ? (
          <span className="media-upload-status">Loading…</span>
        ) : error ? (
          <Flex vertical align="center" gap={4} className="media-upload-status">
            <span className="media-upload-status-title">Media not available</span>
            {requestedId && (
              <span className="media-upload-status-id">{requestedId}</span>
            )}
          </Flex>
        ) : (
          <Flex vertical align="center" gap={4} className="media-upload-status">
            <ImagePlus size={20} />
            <span>Click or drag</span>
          </Flex>
        )}
        {uploading && (
          <div className="upload-progress">
            <div
              className="upload-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {hasImage && !disabled && (
        <Button
          type="button"
          size="small"
          variant="ghost"
          aria-label="Remove image"
          onClick={handleRemove}
          className="media-upload-remove"
        >
          <X size={14} />
        </Button>
      )}
      {uploadError && (
        <span role="alert" className="media-upload-error">
          {uploadError}
        </span>
      )}
    </div>
  );
}

// ─── MediaUpload.Multiple ─────────────────────────────────────────

export interface MediaUploadMultipleProps {
  value?: Array<string | MediaItem>;
  defaultValue?: Array<string | MediaItem>;
  onValueChange?: (value: MediaItem[]) => void;
  accept?: string;
  maxSize?: number;
  maxCount?: number;
  disabled?: boolean;
  size?: MediaUploadSize;
  className?: string;
}

export function MediaUploadMultiple({
  value,
  defaultValue = [],
  onValueChange,
  accept = "image/*",
  maxSize,
  maxCount,
  disabled = false,
  size = "default",
  className,
}: MediaUploadMultipleProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<MediaValueMultiple>(defaultValue);
  const effective = isControlled ? value : internal;
  const { items, loading, errorIds } = useResolvedMediaList(effective);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback(
    (next: MediaItem[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      setUploadError(null);
      const slots =
        maxCount === undefined
          ? files.length
          : Math.max(0, maxCount - items.length);
      const toUpload = Array.from(files).slice(0, slots);
      try {
        const uploaded = await Promise.all(
          toUpload.map((f) => {
            if (maxSize && f.size > maxSize) {
              throw new Error(
                `File must be smaller than ${(maxSize / (1024 * 1024)).toFixed(0)} MB`,
              );
            }
            return uploadFile(f);
          }),
        );
        emit([...items, ...uploaded]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [emit, items, maxCount, maxSize],
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      e.target.value = "";
      if (list && list.length > 0) void handleFiles(list);
    },
    [handleFiles],
  );

  const openPicker = useCallback(() => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }, [disabled, uploading]);

  const removeAt = useCallback(
    (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      emit(next);
    },
    [emit, items],
  );

  const showAddTile =
    !disabled && (maxCount === undefined || items.length < maxCount);

  return (
    <div
      className={cn(
        "media-upload media-upload-multiple",
        `media-upload-size-${size}`,
        className,
      )}
      data-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={handleSelect}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <div className="media-upload-grid">
        {items.map((it, idx) => {
          const failed = !it.url && errorIds.includes(it.id);
          return (
            <div
              key={it.id || idx}
              className="media-upload-tile"
              data-media-uuid={it.id || undefined}
              data-status={failed ? "error" : "ok"}
            >
              {it.url ? (
                <img src={it.url} alt={it.filename} />
              ) : (
                <Flex
                  vertical
                  align="center"
                  justify="center"
                  className="media-upload-status"
                >
                  <span className="media-upload-status-title">
                    {failed ? "Unavailable" : "Loading…"}
                  </span>
                  {it.id && (
                    <span className="media-upload-status-id">{it.id}</span>
                  )}
                </Flex>
              )}
              {!disabled && (
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  className="media-upload-tile-remove"
                  aria-label="Remove image"
                  onClick={() => removeAt(idx)}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          );
        })}
        {showAddTile && (
          <button
            type="button"
            className="media-upload-tile media-upload-tile-add"
            onClick={openPicker}
            disabled={uploading}
            aria-label="Add images"
          >
            <Flex vertical align="center" gap={4}>
              {uploading ? (
                <RotateCw size={18} className="media-upload-spin" />
              ) : (
                <ImagePlus size={18} />
              )}
              <span>{uploading ? "Uploading…" : "Add"}</span>
            </Flex>
          </button>
        )}
      </div>
      {loading && items.some((it) => !it.url && !errorIds.includes(it.id)) && (
        <span className="media-upload-status-line">Loading media…</span>
      )}
      {uploadError && (
        <span role="alert" className="media-upload-error">
          {uploadError}
        </span>
      )}
    </div>
  );
}

// ─── MediaUpload.Avatar ───────────────────────────────────────────

export interface MediaUploadAvatarProps {
  value?: string | MediaItem | null;
  defaultValue?: string | MediaItem | null;
  onValueChange?: (value: MediaItem | null) => void;
  /** Crop aspect ratio (default 1 = square). */
  aspect?: number;
  size?: MediaUploadSize;
  disabled?: boolean;
  className?: string;
}

const AVATAR_PX: Record<MediaUploadSize, number> = {
  small: 64,
  default: 96,
  large: 128,
};

export function MediaUploadAvatar({
  value,
  defaultValue = null,
  onValueChange,
  aspect = 1,
  size = "default",
  disabled = false,
  className,
}: MediaUploadAvatarProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<MediaValueSingle>(defaultValue);
  const effective = isControlled ? value : internal;
  const { item, loading, error, requestedId } = useResolvedMediaItem(effective);

  const emit = useCallback(
    (next: MediaItem | null) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  // Hand the blob from AvatarUploader through the media-service
  // 3-step contract. AvatarUploader doesn't know about MediaItems —
  // we adapt here.
  const handleUpload = useCallback(
    async ({
      blob,
      file,
      onProgress,
    }: {
      blob: Blob;
      file: File;
      onProgress?: (n: number) => void;
      signal: AbortSignal;
    }) => {
      // Wrap the blob in a File so the media-service init payload
      // carries a real filename + content-type.
      const wrapped = new File([blob], file.name, { type: blob.type || file.type });
      const result = await uploadFile(wrapped, onProgress);
      emit(result);
    },
    [emit],
  );

  const px = AVATAR_PX[size];
  const hasImage = !!item && !!item.url;

  return (
    <div
      className={cn(
        "media-upload media-upload-avatar",
        `media-upload-size-${size}`,
        className,
      )}
      data-disabled={disabled}
      data-media-uuid={requestedId ?? undefined}
    >
      <div
        className="media-upload-avatar-preview"
        style={{ width: px, height: px }}
      >
        {hasImage ? (
          <img src={item.url} alt={item.filename} />
        ) : loading ? (
          <span className="media-upload-status">…</span>
        ) : error ? (
          <span className="media-upload-status-title">N/A</span>
        ) : (
          <ImagePlus size={20} />
        )}
      </div>
      {!disabled && (
        <AvatarUploader onUpload={handleUpload} aspect={aspect} cropShape="round" />
      )}
    </div>
  );
}

// ─── Namespace export ─────────────────────────────────────────────

export const MediaUpload = {
  Single: MediaUploadSingle,
  Multiple: MediaUploadMultiple,
  Avatar: MediaUploadAvatar,
};

export type { MediaItem } from "./media-client";
