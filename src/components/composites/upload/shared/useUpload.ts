// useUpload — owns the controlled-or-uncontrolled fileList state +
// per-item AbortController + the orchestration for enqueue / remove
// / retry. Components render; this hook drives.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  UploadCustomRequest,
  UploadFile,
  UploadLabels,
  UploadProps,
} from "./types";
import { DEFAULT_UPLOAD_LABELS } from "./types";
import { validateCount, validateFile } from "./validate";

let uidCounter = 0;
function nextUid(): string {
  uidCounter += 1;
  return `upload-${Date.now().toString(36)}-${uidCounter.toString(36)}`;
}

interface UseUploadArgs
  extends Pick<
    UploadProps,
    | "multiple"
    | "accept"
    | "maxSize"
    | "maxCount"
    | "fileList"
    | "defaultFileList"
    | "beforeUpload"
    | "customRequest"
    | "onChange"
    | "onRemove"
    | "errorMapper"
  > {
  labels: UploadLabels;
  /**
   * Hook fired after a file successfully resolves through customRequest.
   * Avatar/Image variants can inspect the resulting UploadFile here.
   */
  onItemSuccess?: (file: UploadFile) => void;
}

export interface UseUploadReturn {
  files: UploadFile[];
  /** True when at least one item is uploading. */
  isUploading: boolean;
  /** Aggregate validation error from the last enqueue (cleared on next try). */
  rejectionError: string | null;
  /** Push a FileList / File[] through validation + queue. */
  enqueue: (incoming: FileList | File[]) => Promise<void>;
  /** Remove an item (cancels in-flight upload). */
  remove: (uid: string) => Promise<void>;
  /** Retry an errored item with the same originFile. */
  retry: (uid: string) => Promise<void>;
  /** Clear the rejection banner. */
  clearRejection: () => void;
}

export function useUpload(args: UseUploadArgs): UseUploadReturn {
  const {
    multiple = false,
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
    onItemSuccess,
  } = args;

  const controlled = fileList !== undefined;
  const [internal, setInternal] = useState<UploadFile[]>(
    () => defaultFileList ?? [],
  );
  const files = controlled ? (fileList as UploadFile[]) : internal;
  const filesRef = useRef(files);
  filesRef.current = files;

  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const aborters = useRef<Map<string, AbortController>>(new Map());

  // Cleanup any object URLs we created when the hook unmounts.
  useEffect(() => {
    const map = aborters.current;
    return () => {
      map.forEach((c) => c.abort());
      map.clear();
    };
  }, []);

  const commit = useCallback(
    (next: UploadFile[]) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
      filesRef.current = next;
    },
    [controlled, onChange],
  );

  const patchItem = useCallback(
    (uid: string, patch: Partial<UploadFile>) => {
      const next = filesRef.current.map((f) =>
        f.uid === uid ? { ...f, ...patch } : f,
      );
      commit(next);
    },
    [commit],
  );

  const runRequest = useCallback(
    async (item: UploadFile, originFile: File) => {
      const controller = new AbortController();
      aborters.current.set(item.uid, controller);
      patchItem(item.uid, { status: "uploading", percent: 0, error: undefined });
      try {
        const result = await (customRequest as UploadCustomRequest)({
          file: originFile,
          onProgress: (p: number) =>
            patchItem(item.uid, { percent: Math.max(0, Math.min(100, p)) }),
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        patchItem(item.uid, {
          status: "success",
          percent: 100,
          url: result?.url ?? item.url,
        });
        const after = filesRef.current.find((f) => f.uid === item.uid);
        if (after) onItemSuccess?.(after);
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = errorMapper
          ? errorMapper(err)
          : err instanceof Error
            ? err.message
            : "Upload failed";
        patchItem(item.uid, { status: "error", error: msg });
      } finally {
        aborters.current.delete(item.uid);
      }
    },
    [customRequest, errorMapper, onItemSuccess, patchItem],
  );

  const enqueue = useCallback(
    async (incoming: FileList | File[]) => {
      setRejectionError(null);
      const arr = Array.from(incoming);
      if (arr.length === 0) return;

      const restrict = multiple ? arr : arr.slice(0, 1);
      const validationCtx = { accept, maxSize, labels };

      const accepted: File[] = [];
      for (const f of restrict) {
        const v = validateFile(f, validationCtx);
        if (!v.ok) {
          setRejectionError(v.error ?? "Invalid file");
          continue;
        }
        if (beforeUpload) {
          const ok = await beforeUpload(f);
          if (!ok) continue;
        }
        accepted.push(f);
      }
      if (accepted.length === 0) return;

      const baseCount = multiple ? filesRef.current.length : 0;
      const countCheck = validateCount(
        baseCount,
        accepted.length,
        maxCount,
        labels,
      );
      if (!countCheck.ok) {
        setRejectionError(countCheck.error ?? "Too many files");
        return;
      }

      const newItems: UploadFile[] = accepted.map((file) => ({
        uid: nextUid(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        percent: 0,
        thumbUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        originFile: file,
      }));

      const base = multiple ? filesRef.current : [];
      const next = [...base, ...newItems];
      commit(next);

      for (const item of newItems) {
        if (!item.originFile) continue;
        // Fire-and-forget; runRequest patches state per-item.
        void runRequest(item, item.originFile);
      }
    },
    [accept, beforeUpload, commit, labels, maxCount, maxSize, multiple, runRequest],
  );

  const remove = useCallback(
    async (uid: string) => {
      const item = filesRef.current.find((f) => f.uid === uid);
      if (!item) return;
      if (onRemove) {
        const allowed = await onRemove(item);
        if (allowed === false) return;
      }
      aborters.current.get(uid)?.abort();
      aborters.current.delete(uid);
      if (item.thumbUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(item.thumbUrl);
      }
      const next = filesRef.current.filter((f) => f.uid !== uid);
      commit(next);
    },
    [commit, onRemove],
  );

  const retry = useCallback(
    async (uid: string) => {
      const item = filesRef.current.find((f) => f.uid === uid);
      if (!item || !item.originFile) return;
      await runRequest(item, item.originFile);
    },
    [runRequest],
  );

  const clearRejection = useCallback(() => setRejectionError(null), []);

  const isUploading = useMemo(
    () => files.some((f) => f.status === "uploading"),
    [files],
  );

  return { files, isUploading, rejectionError, enqueue, remove, retry, clearRejection };
}

export { DEFAULT_UPLOAD_LABELS };
