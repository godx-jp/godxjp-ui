import * as React from "react";
import {
  Camera,
  Download,
  Eye,
  ImagePlus,
  RotateCcw,
  Trash2,
  Upload as UploadIcon,
  X,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { formatBytes } from "../../lib/format";
import { cn } from "../../lib/utils";
import { FieldNameContext, mergeAriaIds, pickFieldA11y } from "../../lib/field-a11y";
import { Button } from "../general/button";
import { Icon } from "../general/icon";
import type { UploadListTypeProp, UploadProp } from "../../props/components/data-entry.prop";
import { UploadCropDialog } from "./upload-crop-dialog";
import { UPLOAD_FILE_KIND_GLYPHS, uploadFileKind } from "./upload-file-kind";
import {
  UPLOAD_LIST_IGNORE,
  createUploadItem,
  revokePreviewUrl,
  type UploadFileItem,
  type UploadFileStatus,
  type UploadVariant,
} from "./upload-types";
import { readDroppedFiles } from "./upload-files";
import { uploadRequest } from "./upload-request";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "../feedback/dialog";
import { Progress } from "../data-display/progress";
import { useUploadDraft } from "./use-upload-draft";

export type {
  UploadProp,
  UploadProp as UploadProps,
  UploadFileItemProp,
  UploadVariantProp,
  UploadListTypeProp,
} from "../../props/components/data-entry.prop";
export type { UploadFileItem, UploadVariant, UploadCommitAction } from "./upload-types";
export { collectUploadCommitActions, createUploadItem, UPLOAD_LIST_IGNORE } from "./upload-types";
export { useUploadDraft } from "./use-upload-draft";

function defaultAcceptForVariant(variant: UploadVariant): string | undefined {
  if (
    variant === "avatar" ||
    variant === "avatar-crop" ||
    variant === "picture" ||
    variant === "picture-card"
  ) {
    return "image/*";
  }
  return undefined;
}

function defaultMaxCount(variant: UploadVariant): number | undefined {
  if (variant === "avatar" || variant === "avatar-crop" || variant === "picture") return 1;
  return undefined;
}

/**
 * The polite status of a one-file Upload: the file's own state, never a count (gh#1288). A file
 * marked for delete says nothing here — the undo banner beside the trigger already says it.
 */
const SINGLE_STATUS_KEY: Record<UploadFileStatus, string | null> = {
  idle: "dataEntry.upload.fileSelected",
  uploading: "dataEntry.upload.fileUploading",
  done: "dataEntry.upload.fileUploaded",
  error: "dataEntry.upload.fileFailed",
  removed: null,
};

function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const trimmed = rule.trim().toLowerCase();
    if (trimmed.endsWith("/*")) return file.type.toLowerCase().startsWith(trimmed.slice(0, -1));
    return (
      file.type.toLowerCase() === trimmed ||
      (trimmed.startsWith(".") && file.name.toLowerCase().endsWith(trimmed))
    );
  });
}

function useUploadList(
  controlled: UploadFileItem[] | undefined,
  defaultValue: UploadFileItem[] | undefined,
  onValueChange: UploadProp["onValueChange"],
) {
  const [internal, setInternal] = React.useState<UploadFileItem[]>(defaultValue ?? []);
  const items = controlled ?? internal;

  // The latest list, tracked in a ref so a functional update always reads current state — even when
  // several setItems calls chain synchronously within one tick (e.g. pickFiles adds an item and then
  // runUpload immediately flips it to "uploading"). Reading `items` from the callback closure would
  // operate on the pre-update array and drop the just-added item.
  const itemsRef = React.useRef(items);
  itemsRef.current = items;

  const setItems = React.useCallback(
    (next: UploadFileItem[] | ((prev: UploadFileItem[]) => UploadFileItem[])) => {
      const resolved = typeof next === "function" ? next(itemsRef.current) : next;
      itemsRef.current = resolved; // advance synchronously so chained calls see this update
      if (controlled === undefined) setInternal(resolved);
      onValueChange?.(resolved);
    },
    [controlled, onValueChange],
  );

  return [items, setItems] as const;
}

export function Upload({
  variant = "dropzone",
  listType,
  triggerSize,
  triggerVariant = "outline",
  triggerIcon: TriggerIcon = UploadIcon,
  value,
  defaultValue,
  onValueChange,
  accept: acceptProp,
  multiple: multipleProp,
  maxCount: maxCountProp,
  maxSizeBytes,
  disabled: disabledProp,
  readOnly = false,
  directory = false,
  pastable = false,
  openFileDialogOnClick = true,
  name,
  action,
  method,
  headers,
  data,
  withCredentials,
  beforeUpload,
  onReject,
  onRemove,
  onPreview,
  onDownload,
  previewFile,
  onDrop,
  showUploadList = true,
  itemRender,
  removable = true,
  onUpload,
  id,
  className,
  children,
  ...ariaProps
}: UploadProp) {
  const { t, locale } = useTranslation();
  const disabled = disabledProp || readOnly;
  /*
   * THE VISIBLE TRIGGER IS THE FORM CONTROL; THE NATIVE INPUT IS PLUMBING (gh#1280).
   *
   * Upload is a composite widget (visible trigger + hidden file input + file list). The native
   * `<input type="file">` used to carry the FormField contract, which put a second control in the
   * accessibility tree whose VALUE the browser writes in the browser's language — 「選択されていません」
   * / "No file chosen" on a page set to Vietnamese — and that no attribute can override. So the
   * input leaves the tree (`aria-hidden`, `tabIndex={-1}`, keeps `id` so `#id` file attachment in
   * a consumer's e2e still works, and forwards focus to the trigger so a FormField label click
   * lands on it), and the trigger the user actually presses takes the contract:
   *
   *   name         = the FormField label + the trigger's own action text (`aria-labelledby` with a
   *                  self-reference), so the visible text stays in the name (WCAG 2.5.3);
   *   description  = the FormField helper + 「未選択」 / "Chưa chọn tệp" in the APP's locale while
   *                  nothing is picked (once something is, the file list below says what);
   *   invalid      = `aria-invalid` + `aria-errormessage`, unchanged.
   *
   * An `aria-label` the caller passes names the trigger, inside a FormField too (gh#1288): FormField
   * echoes its plain-text label as `aria-label`, so only a value that differs from that echo is the
   * caller's. Without one, the field label is dropped from the name when the trigger's own action
   * text already contains it — 「ファイル」 + 「ファイルをアップロード」 read 「ファイル ファイルを…」.
   */
  const fieldA11y = pickFieldA11y(ariaProps);
  const fieldLabelledBy = fieldA11y["aria-labelledby"];
  const fieldName = React.useContext(FieldNameContext);
  const triggerId = React.useId();
  const selectionId = React.useId();
  const dropzoneHintId = React.useId();
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const ownAriaLabel = fieldA11y["aria-label"];
  const callerAriaLabel =
    !fieldLabelledBy || (fieldName && ownAriaLabel !== fieldName.label) ? ownAriaLabel : undefined;
  const setTriggerRef = (element: HTMLElement | null) => {
    triggerRef.current = element;
  };
  // The listing is its own axis (gh#720), but its DEFAULT is whatever each variant already drew:
  // `variant="picture"` listed thumbnails, everything else listed names. A call site that never
  // heard of `listType` therefore renders exactly what it rendered before.
  const resolvedListType: UploadListTypeProp =
    listType ?? (variant === "picture" ? "picture" : "text");
  const accept = acceptProp ?? defaultAcceptForVariant(variant);
  const maxCount = maxCountProp ?? defaultMaxCount(variant);
  const multiple = multipleProp ?? (maxCount === 1 ? false : true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [cropFile, setCropFile] = React.useState<File | null>(null);
  const [previewItem, setPreviewItem] = React.useState<UploadFileItem | null>(null);
  const [items, setItems] = useUploadList(value, defaultValue, onValueChange);
  // A dropzone that does not open the picker is `role="group"`, where aria-invalid /
  // aria-errormessage are not allowed (ARIA 1.2): the error is folded into the description instead,
  // as FormField does for group roles.
  const triggerIsGroup = variant === "dropzone" && !openFileDialogOnClick;
  /** `action` = the trigger's own name text, when it is a plain string. */
  const triggerA11y = (action?: string) => ({
    id: triggerId,
    "aria-labelledby":
      !fieldLabelledBy ||
      callerAriaLabel !== undefined ||
      (fieldName?.label &&
        action?.toLocaleLowerCase().includes(fieldName.label.trim().toLocaleLowerCase()))
        ? undefined
        : `${fieldLabelledBy} ${triggerId}`,
    "aria-describedby": mergeAriaIds(
      fieldA11y["aria-describedby"],
      triggerIsGroup && fieldA11y["aria-invalid"] ? fieldA11y["aria-errormessage"] : undefined,
      items.length === 0 ? selectionId : undefined,
    ),
    "aria-errormessage": triggerIsGroup ? undefined : fieldA11y["aria-errormessage"],
    "aria-invalid": triggerIsGroup ? undefined : fieldA11y["aria-invalid"],
  });

  const isSingleAvatar =
    variant === "avatar" || variant === "avatar-crop" || (variant === "picture" && maxCount === 1);
  const singleItem = isSingleAvatar ? (items[0] ?? null) : null;

  const draft = useUploadDraft({
    value: singleItem,
    onChange: (next) => {
      setItems(next ? [next] : []);
    },
  });

  const cropAutomatic = React.useRef(true);
  const requests = React.useRef(new Map<string, AbortController>());
  const mounted = React.useRef(true);
  const queue = React.useRef(Promise.resolve());
  const selectionGeneration = React.useRef(0);
  const initialItems = React.useRef(value ?? defaultValue ?? []);
  const current = React.useRef({ items, disabled });
  current.current = { items, disabled };
  const ownedUrls = React.useRef(new Set<string>());
  const [rejection, setRejection] = React.useState<string>();
  React.useEffect(() => {
    mounted.current = true;
    const active = requests.current;
    const urls = ownedUrls.current;
    return () => {
      mounted.current = false;
      active.forEach((controller) => controller.abort());
      active.clear();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  React.useEffect(() => {
    for (const [uid, controller] of requests.current) {
      if (!items.some((item) => item.uid === uid && !item.pendingDelete)) {
        controller.abort();
        requests.current.delete(uid);
      }
    }
  }, [items]);

  const updateItems = (update: (previous: UploadFileItem[]) => UploadFileItem[]) => {
    if (!mounted.current) return;
    setItems((previous) => {
      const next = update(previous);
      current.current.items = next;
      return next;
    });
  };
  const startUpload = async (item: UploadFileItem) => {
    if (!item.file || (!onUpload && !action) || current.current.disabled) return;
    const controller = new AbortController();
    requests.current.get(item.uid)?.abort();
    requests.current.set(item.uid, controller);
    const isCurrent = () =>
      mounted.current &&
      !controller.signal.aborted &&
      requests.current.get(item.uid) === controller;
    updateItems((previous) =>
      previous.map((entry) =>
        entry.uid === item.uid
          ? { ...entry, status: "uploading", percent: 0, error: undefined }
          : entry,
      ),
    );
    try {
      const context = {
        signal: controller.signal,
        onProgress: (percent: number) => {
          if (!isCurrent() || !Number.isFinite(percent)) return;
          updateItems((previous) =>
            previous.map((entry) =>
              entry.uid === item.uid
                ? { ...entry, percent: Math.max(0, Math.min(100, percent)) }
                : entry,
            ),
          );
        },
      };
      const result = onUpload
        ? await onUpload(item.file, item, context)
        : await uploadRequest(
            item.file,
            { action, method, headers, data, name, withCredentials },
            context,
          );
      if (!isCurrent()) return;
      updateItems((previous) =>
        previous.map((entry) =>
          entry.uid === item.uid
            ? {
                ...entry,
                ...result,
                previewUrl: result.previewUrl ?? entry.previewUrl,
                status: "done",
                percent: 100,
                file: undefined,
              }
            : entry,
        ),
      );
    } catch (error) {
      if (!isCurrent()) return;
      updateItems((previous) =>
        previous.map((entry) =>
          entry.uid === item.uid
            ? {
                ...entry,
                status: "error",
                error: error instanceof Error ? error.message : String(error),
              }
            : entry,
        ),
      );
    } finally {
      if (requests.current.get(item.uid) === controller) requests.current.delete(item.uid);
    }
  };
  const cancelUpload = (uid: string) => {
    requests.current.get(uid)?.abort();
    requests.current.delete(uid);
    updateItems((previous) =>
      previous.map((item) =>
        item.uid === uid ? { ...item, status: "idle", percent: undefined } : item,
      ),
    );
  };
  const rejectFile = (
    file: File,
    reason: "accept" | "size" | "count" | "beforeUpload",
    error?: unknown,
  ) => {
    setRejection(
      t(
        `dataEntry.upload.reject${reason[0].toUpperCase()}${reason.slice(1)}` as Parameters<
          typeof t
        >[0],
        // `max` is the limit the size message states (gh#1280); the other reasons ignore it.
        { name: file.name, max: maxSizeBytes != null ? formatBytes(maxSizeBytes, locale) : "" },
      ),
    );
    onReject?.({ file, reason, error });
  };
  /*
   * A HOST CALLBACK THAT THROWS IS REPORTED, NEVER SWALLOWED (gh#1123). The pick chain, the preview
   * and the remove callbacks used to end in `.catch(() => {})`, so a bug in the consumer's own
   * `onValueChange` (godx-task#457: an icon named `File` shadowed the global) vanished with no
   * console line, no message and no event. `reportError` is the standard way a library hands an
   * error it cannot handle back to the page: the console AND the window `error` event, so dev
   * overlays and error trackers see it. The user gets a message in the upload area too.
   */
  const reportCallbackError = (error: unknown, visible = true) => {
    if (typeof globalThis.reportError === "function") globalThis.reportError(error);
    else
      setTimeout(() => {
        throw error;
      });
    if (visible && mounted.current) setRejection(t("dataEntry.upload.callbackFailed"));
  };
  const pickFiles = (fileList: FileList | File[] | null) => {
    if (!fileList?.length || current.current.disabled) return;
    const files = Array.from(fileList);
    const generation = selectionGeneration.current;
    queue.current = queue.current
      .then(async () => {
        setRejection(undefined);
        for (const original of multiple ? files : files.slice(0, 1)) {
          if (
            !mounted.current ||
            current.current.disabled ||
            generation !== selectionGeneration.current
          )
            return;
          if (!fileMatchesAccept(original, accept)) {
            rejectFile(original, "accept");
            continue;
          }
          if (maxSizeBytes != null && original.size > maxSizeBytes) {
            rejectFile(original, "size");
            continue;
          }
          let file = original;
          let automatic = true;
          try {
            const decision = await beforeUpload?.(file, files);
            if (decision === UPLOAD_LIST_IGNORE) continue;
            if (decision === false) automatic = false;
            if (decision instanceof Blob)
              file =
                decision instanceof File
                  ? decision
                  : new File([decision], original.name, {
                      type: decision.type,
                      lastModified: original.lastModified,
                    });
          } catch (error) {
            rejectFile(original, "beforeUpload", error);
            continue;
          }
          if (
            !mounted.current ||
            current.current.disabled ||
            generation !== selectionGeneration.current
          )
            return;
          if (maxSizeBytes != null && file.size > maxSizeBytes) {
            rejectFile(file, "size");
            continue;
          }
          if (maxCount !== 1 && maxCount != null && current.current.items.length >= maxCount) {
            rejectFile(file, "count");
            continue;
          }
          if (variant === "avatar-crop") {
            cropAutomatic.current = automatic;
            setCropFile(file);
            return;
          }
          const baseline = isSingleAvatar ? current.current.items[0] : undefined;
          const item = createUploadItem(file, {
            relativePath: original.webkitRelativePath || undefined,
            pendingReplace: Boolean(baseline?.mediaId),
            replacesMediaId: baseline?.mediaId,
          });
          if (item.previewUrl?.startsWith("blob:")) ownedUrls.current.add(item.previewUrl);
          updateItems((previous) => (maxCount === 1 ? [item] : [...previous, item]));
          if (previewFile)
            void previewFile(file)
              .then((url) => {
                updateItems((previous) =>
                  previous.map((entry) =>
                    entry.uid === item.uid ? { ...entry, previewUrl: url } : entry,
                  ),
                );
              })
              .catch((error: unknown) => reportCallbackError(error, false));
          if (automatic) void startUpload(item);
        }
      })
      .catch((error: unknown) => reportCallbackError(error));
  };

  const removeItem = async (uid: string) => {
    if (current.current.disabled) return;
    const target = current.current.items.find((item) => item.uid === uid);
    if (!target) return;
    try {
      if ((await onRemove?.(target)) === false) return;
    } catch (error) {
      // A throwing onRemove still keeps the item, as before — but the throw is reported now.
      reportCallbackError(error, false);
      return;
    }
    if (
      !mounted.current ||
      current.current.disabled ||
      !current.current.items.some((item) => item.uid === uid)
    )
      return;
    requests.current.get(uid)?.abort();
    requests.current.delete(uid);
    if (isSingleAvatar) {
      draft.markRemove();
      return;
    }
    revokePreviewUrl(target);
    updateItems((previous) => previous.filter((item) => item.uid !== uid));
  };
  React.useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || !name) return;
    const appendFiles = (event: FormDataEvent) => {
      if (disabledProp) return;
      for (const item of current.current.items) {
        if (item.file && !item.pendingDelete) event.formData.append(name, item.file, item.name);
      }
    };
    form.addEventListener("formdata", appendFiles);
    return () => form.removeEventListener("formdata", appendFiles);
  }, [name, disabledProp]);
  React.useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!mounted.current || event.defaultPrevented) return;
        selectionGeneration.current += 1;
        queue.current = Promise.resolve();
        requests.current.forEach((controller) => controller.abort());
        requests.current.clear();
        setCropFile(null);
        setRejection(undefined);
        if (value === undefined) updateItems(() => initialItems.current);
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  });
  React.useEffect(() => {
    if (name) inputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [items, name]);

  const pasteProps = {
    onPaste: (event: React.ClipboardEvent<HTMLElement>) => {
      if (!pastable || disabled || !event.clipboardData.files.length) return;
      event.preventDefault();
      pickFiles(event.clipboardData.files);
    },
  };
  const showPreview = (item: UploadFileItem) => {
    if (onPreview) onPreview(item);
    else if (item.previewUrl) setPreviewItem(item);
  };
  const list =
    showUploadList && items.length > 0 ? (
      <UploadFileList
        items={items}
        onRemove={removable && !disabled ? removeItem : undefined}
        onStart={!disabled && (onUpload || action) ? startUpload : undefined}
        onCancel={!disabled ? cancelUpload : undefined}
        onPreview={showPreview}
        hasCustomPreview={Boolean(onPreview)}
        onDownload={onDownload}
        itemRender={itemRender}
        listType={resolvedListType}
      />
    ) : null;

  const hiddenInput = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      {...(directory ? { webkitdirectory: "", directory: "" } : {})}
      className="sr-only"
      aria-hidden="true"
      tabIndex={-1}
      data-field={fieldA11y["data-field"]}
      accept={accept}
      multiple={multiple && !isSingleAvatar}
      disabled={disabled}
      onFocus={() => triggerRef.current?.focus()}
      onChange={(e) => {
        pickFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  // Announce selection / upload lifecycle changes to assistive tech.
  const uploadingCount = items.filter((it) => it.status === "uploading").length;
  const doneCount = items.filter((it) => it.status === "done").length;
  const errorCount = items.filter((it) => it.status === "error").length;
  // One file has no 「N 件中 M 件」: it is selected, uploading, uploaded or failed (gh#1288).
  const singleFile = !multiple || maxCount === 1;
  const liveRegion = (
    <>
      <Dialog
        open={previewItem != null}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{previewItem?.name ?? t("dataEntry.upload.preview")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {previewItem?.previewUrl && (
              <img
                src={previewItem.previewUrl}
                alt={previewItem.name}
                className="ui-upload-picture-img"
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
      {/* A rejection is announced ONCE, by the visible `role="alert"` paragraph — repeating it
          here printed and read it twice (gh#1280). */}
      <span aria-live="polite" className="sr-only" data-slot="upload-status">
        {singleFile && items[0]
          ? (() => {
              const key = SINGLE_STATUS_KEY[items[0].status];
              return key ? t(key, { name: items[0].name }) : "";
            })()
          : errorCount > 0
            ? t("dataEntry.upload.statusFailed", { count: errorCount })
            : uploadingCount > 0
              ? t("dataEntry.upload.statusUploading", { count: uploadingCount })
              : items.length > 0
                ? t("dataEntry.upload.statusReady", { count: items.length, done: doneCount })
                : ""}
      </span>
      {items.length === 0 ? (
        <span id={selectionId} className="sr-only" data-slot="upload-selection">
          {t("dataEntry.upload.noFileSelected")}
        </span>
      ) : null}
    </>
  );

  const openPicker = () => {
    if (!disabled && openFileDialogOnClick) inputRef.current?.click();
  };

  if (variant === "dropzone") {
    /*
     * gh#1412 — WCAG 2.5.3 Label in Name: the drop area is named by the text it SHOWS. It used to
     * carry `aria-label` 「ファイルをアップロード」, a string that appears nowhere on screen, so a
     * voice-control user saying the visible hint could not reach it. The hint paragraph is the
     * name now (after the FormField label, unless the hint already says it — gh#1288); a caller's
     * own `aria-label` still wins.
     */
    const hintText = t("dataEntry.upload.dropzoneHint");
    const named = triggerA11y(hintText);
    const dropzoneA11y =
      callerAriaLabel !== undefined
        ? { ...named, "aria-label": callerAriaLabel }
        : {
            ...named,
            "aria-labelledby": named["aria-labelledby"]
              ? `${fieldLabelledBy} ${dropzoneHintId}`
              : dropzoneHintId,
          };
    return (
      <div {...pasteProps} className={cn("ui-stack-sm", className)}>
        {hiddenInput}
        {liveRegion}
        {rejection && (
          <p role="alert" className="text-error-strong">
            {rejection}
          </p>
        )}
        <div
          ref={setTriggerRef}
          role={openFileDialogOnClick ? "button" : "group"}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          {...dropzoneA11y}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            onDrop?.(e);
            if (disabled) return;
            void readDroppedFiles(e.dataTransfer, directory)
              .then(pickFiles)
              .catch(() => {
                if (mounted.current) setRejection(t("dataEntry.upload.readFailed"));
              });
          }}
          data-drag-active={dragActive ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          className="ui-upload-dropzone"
        >
          <UploadIcon className="ui-upload-dropzone-icon" aria-hidden="true" />
          <p id={dropzoneHintId} className="ui-upload-dropzone-hint">
            {t("dataEntry.upload.dropzoneHint")}
          </p>
          <p className="ui-upload-dropzone-meta">{t("dataEntry.upload.dropzoneMeta")}</p>
        </div>
        {list}
      </div>
    );
  }

  if (variant === "button") {
    // An icon size means an icon button: the label would not fit a 32px square
    // and would push it wide, so it moves to `aria-label` and the trigger keeps
    // its shape. Anything else keeps the label visible.
    const iconOnly = typeof triggerSize === "string" && triggerSize.startsWith("icon");
    const label = children ?? t("dataEntry.upload.buttonLabel");
    // A caller-supplied name always wins. Otherwise an icon-only trigger — which renders no text at
    // all — falls back to the label as a string, and to the catalogue's action label when `children`
    // is a node (an icon, say) that guarantees no readable text. A trigger showing its own text
    // needs no `aria-label`: the text is the name.
    const triggerAriaLabel =
      callerAriaLabel ??
      (iconOnly
        ? typeof label === "string"
          ? label
          : t("dataEntry.upload.buttonLabel")
        : undefined);

    return (
      <div {...pasteProps} className={cn("ui-stack-sm", className)}>
        {hiddenInput}
        {liveRegion}
        {rejection && (
          <p role="alert" className="text-error-strong">
            {rejection}
          </p>
        )}
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          disabled={disabled}
          onClick={openPicker}
          ref={setTriggerRef}
          {...triggerA11y(
            iconOnly ? triggerAriaLabel : typeof label === "string" ? label : undefined,
          )}
          aria-label={triggerAriaLabel}
          className="ui-upload-trigger"
        >
          {/* `triggerIcon` swaps the GLYPH only: the class, the label spacing and the
              `aria-hidden` stay the library's, so a plus on a "create new" action measures the
              same as the default upload arrow and never reaches the accessible name (gh#734). */}
          <TriggerIcon
            className="ui-upload-trigger-icon"
            data-with-label={iconOnly ? undefined : ""}
            aria-hidden="true"
          />
          {iconOnly ? null : label}
        </Button>
        {list}
      </div>
    );
  }

  if (variant === "picture-card") {
    const canAdd = maxCount == null || items.length < maxCount;
    return (
      <div {...pasteProps} className={cn("ui-upload-grid", className)}>
        {hiddenInput}
        {liveRegion}
        {rejection && (
          <p role="alert" className="text-error-strong">
            {rejection}
          </p>
        )}
        {(showUploadList ? items : []).map((item) => (
          <UploadPictureCard
            key={item.uid}
            item={item}
            onStart={!disabled && (onUpload || action) ? () => void startUpload(item) : undefined}
            onCancel={!disabled ? () => cancelUpload(item.uid) : undefined}
            onPreview={onPreview || item.previewUrl ? () => showPreview(item) : undefined}
            onDownload={onDownload ? () => onDownload(item) : undefined}
            onRemove={removable && !disabled ? () => void removeItem(item.uid) : undefined}
          />
        ))}
        {canAdd && (
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            data-disabled={disabled ? "" : undefined}
            className="ui-upload-tile-add"
            ref={setTriggerRef}
            {...triggerA11y(t("dataEntry.upload.addImage"))}
            aria-label={callerAriaLabel ?? t("dataEntry.upload.addImage")}
          >
            <ImagePlus className="ui-upload-tile-add-icon" aria-hidden="true" />
            <span className="ui-upload-tile-add-label">{t("dataEntry.upload.addImage")}</span>
          </button>
        )}
      </div>
    );
  }

  if (variant === "picture" && !isSingleAvatar) {
    const label = children ?? t("dataEntry.upload.addImage");
    return (
      <div {...pasteProps} className={cn("ui-stack-sm", className)}>
        {hiddenInput}
        {liveRegion}
        {rejection && (
          <p role="alert" className="text-error-strong">
            {rejection}
          </p>
        )}
        <Button
          type="button"
          disabled={disabled}
          variant={triggerVariant}
          onClick={openPicker}
          ref={setTriggerRef}
          {...triggerA11y(typeof label === "string" ? label : undefined)}
          aria-label={callerAriaLabel}
          className="ui-upload-trigger"
        >
          {label}
        </Button>
        {list}
      </div>
    );
  }

  if (variant === "picture") {
    const item = draft.state.display;
    return (
      <div {...pasteProps} className={cn("ui-stack-sm ui-upload-picture", className)}>
        {hiddenInput}
        {liveRegion}
        {rejection && (
          <p role="alert" className="text-error-strong">
            {rejection}
          </p>
        )}
        {item?.previewUrl && !item.pendingDelete ? (
          <div className="ui-upload-picture-frame">
            <img src={item.previewUrl} alt="" className="ui-upload-picture-img" />
            {item.status === "uploading" && (
              <div className="ui-upload-overlay ui-upload-picture-overlay">
                {t("dataEntry.upload.uploading")}
              </div>
            )}
            {item.pendingReplace && (
              <div className="ui-upload-picture-badge">{t("dataEntry.upload.pendingReplace")}</div>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            ref={setTriggerRef}
            {...triggerA11y(t("dataEntry.upload.addImage"))}
            aria-label={callerAriaLabel}
            className="ui-upload-picture-empty"
          >
            <ImagePlus className="ui-upload-picture-empty-icon" aria-hidden="true" />
            <span className="ui-upload-picture-empty-label">{t("dataEntry.upload.addImage")}</span>
          </button>
        )}
        <UploadDraftActions draft={draft} disabled={disabled} onPick={openPicker} />
      </div>
    );
  }

  // avatar + avatar-crop
  const item = draft.state.display;
  const showPlaceholder = !item?.previewUrl || item.pendingDelete;

  return (
    <div {...pasteProps} className={cn("ui-stack-sm items-start", className)}>
      {hiddenInput}
      {liveRegion}
      <UploadCropDialog
        open={variant === "avatar-crop" && cropFile != null}
        onOpenChange={(open) => !open && setCropFile(null)}
        file={cropFile}
        onConfirm={(cropped) => {
          if (!mounted.current || current.current.disabled) return;
          if (maxSizeBytes != null && cropped.size > maxSizeBytes) {
            rejectFile(cropped, "size");
            setCropFile(null);
            return;
          }
          const baseline = items[0];
          const item = createUploadItem(cropped, {
            pendingReplace: Boolean(baseline?.mediaId),
            replacesMediaId: baseline?.mediaId,
          });
          setItems([item]);
          setCropFile(null);
          if (item.previewUrl?.startsWith("blob:")) ownedUrls.current.add(item.previewUrl);
          if (cropAutomatic.current) void startUpload(item);
        }}
      />
      <div className="relative inline-block">
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          data-pending-delete={item?.pendingDelete ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          className="ui-upload-avatar ui-focus-ring"
          ref={setTriggerRef}
          {...triggerA11y(t("dataEntry.upload.avatarLabel"))}
          aria-label={callerAriaLabel ?? t("dataEntry.upload.avatarLabel")}
        >
          {!showPlaceholder && item?.previewUrl ? (
            <img src={item.previewUrl} alt="" className="ui-upload-avatar-image" />
          ) : (
            <span className="ui-upload-avatar-placeholder">
              <Camera className="ui-upload-avatar-icon" aria-hidden="true" />
            </span>
          )}
          {!disabled && (
            <span className="ui-upload-avatar-change">{t("dataEntry.upload.change")}</span>
          )}
        </button>
        {removable && item && !item.pendingDelete && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => void removeItem(item.uid)}
            className="ui-upload-avatar-remove"
            aria-label={t("dataEntry.upload.removeAvatar")}
          >
            <Trash2 className="ui-upload-remove-icon" aria-hidden="true" />
          </button>
        )}
      </div>
      <UploadDraftActions draft={draft} disabled={disabled} onPick={openPicker} />
    </div>
  );
}

function UploadDraftActions({
  draft,
  disabled,
  onPick,
}: {
  draft: ReturnType<typeof useUploadDraft>;
  disabled?: boolean;
  onPick: () => void;
}) {
  const { t } = useTranslation();
  const { state, undoRemove, undoReplace } = draft;

  if (state.canUndoRemove) {
    return (
      <div className="ui-upload-draft-undo">
        <span className="text-error-strong">{t("dataEntry.upload.markedForDelete")}</span>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={undoRemove}>
          <RotateCcw className="ui-upload-draft-icon" aria-hidden="true" />
          {t("dataEntry.upload.undo")}
        </Button>
      </div>
    );
  }

  if (state.canUndoReplace) {
    return (
      <div className="ui-upload-draft-hint">
        <span>{t("dataEntry.upload.pendingReplaceHint")}</span>
        <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={undoReplace}>
          {t("dataEntry.upload.undo")}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onPick}>
          {t("dataEntry.upload.change")}
        </Button>
      </div>
    );
  }

  return null;
}

function UploadPictureCard({
  item,
  onRemove,
  onStart,
  onCancel,
  onPreview,
  onDownload,
}: {
  item: UploadFileItem;
  onRemove?: () => void;
  onStart?: () => void;
  onCancel?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="ui-upload-picture-item ui-stack-xs">
      <div className="ui-upload-tile">
        {item.previewUrl ? (
          <img src={item.previewUrl} alt="" className="ui-upload-avatar-image" />
        ) : (
          <div className="ui-upload-tile-placeholder">
            <ImagePlus aria-hidden="true" />
          </div>
        )}
        {item.status === "uploading" && (
          <div className="ui-upload-overlay">
            <Progress value={item.percent ?? 0} aria-label={t("dataEntry.upload.uploading")} />
          </div>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ui-upload-tile-remove"
            aria-label={t("dataEntry.upload.removeImage")}
          >
            <X className="ui-upload-remove-icon" aria-hidden="true" />
          </button>
        )}
      </div>
      {item.status === "error" && (
        <span role="alert" className="text-error-strong">
          {item.error}
        </span>
      )}
      <div className="ui-inline-xs">
        {onCancel && item.status === "uploading" && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onCancel}
            aria-label={t("dataEntry.upload.cancel")}
          >
            <X aria-hidden="true" />
          </Button>
        )}
        {onStart && item.file && (item.status === "idle" || item.status === "error") && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onStart}
            aria-label={t(
              item.status === "error" ? "dataEntry.upload.retry" : "dataEntry.upload.start",
            )}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        )}
        {onPreview && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onPreview}
            aria-label={t("dataEntry.upload.preview")}
          >
            <Eye aria-hidden="true" />
          </Button>
        )}
        {onDownload && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onDownload}
            aria-label={t("dataEntry.upload.download")}
          >
            <Download aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

function UploadFileList({
  items,
  onRemove,
  onStart,
  onCancel,
  onPreview,
  hasCustomPreview,
  onDownload,
  itemRender,
  listType,
}: {
  items: UploadFileItem[];
  listType: UploadListTypeProp;
  onRemove?: (uid: string) => void;
  onStart?: (item: UploadFileItem) => void;
  onCancel?: (uid: string) => void;
  onPreview?: UploadProp["onPreview"];
  hasCustomPreview?: boolean;
  onDownload?: UploadProp["onDownload"];
  itemRender?: UploadProp["itemRender"];
}) {
  const { t } = useTranslation();
  return (
    <ul className="ui-stack-xs">
      {items.map((item) => {
        // A picture list gives EVERY row the same leading box — the thumbnail when there is one,
        // and otherwise the mark for the file's kind. The glyph is decoration next to the file
        // name that follows it, so it carries no accessible name of its own (WCAG 2.2 SC 1.1.1);
        // the kind is exposed as `data-file-kind` for theming instead of as announced text.
        const kind = uploadFileKind(item);
        const node = (
          <div className="ui-upload-row">
            {listType === "picture" &&
              (item.previewUrl ? (
                <img src={item.previewUrl} alt="" className="ui-upload-list-thumb" />
              ) : (
                <span className="ui-upload-list-glyph" data-file-kind={kind}>
                  <Icon as={UPLOAD_FILE_KIND_GLYPHS[kind]} size="lg" />
                </span>
              ))}
            <div className="ui-upload-row-main">
              <div className="truncate font-medium">{item.name}</div>
              <div className="text-muted-foreground text-xs">
                {formatBytes(item.size)}
                {item.status === "error" && item.error && (
                  <span role="alert" className="text-error-strong">
                    {" "}
                    · {item.error}
                  </span>
                )}
              </div>
              {item.status === "uploading" && (
                <Progress value={item.percent ?? 0} aria-label={t("dataEntry.upload.uploading")} />
              )}
            </div>
            {/* The actions travel TOGETHER. Each is a labelled Button that cannot shrink below its
             * own text, so as loose siblings they were pushed out of a narrow row one by one with
             * nothing to scroll them back (gh#733). As one group they drop under the name instead,
             * and the group is `:empty`-collapsed so a row without actions keeps its old box. */}
            <div className="ui-upload-row-actions">
              {onPreview && (hasCustomPreview || item.previewUrl) && (
                <Button type="button" size="sm" variant="ghost" onClick={() => onPreview(item)}>
                  {t("dataEntry.upload.preview")}
                </Button>
              )}
              {onDownload && (
                <Button type="button" size="sm" variant="ghost" onClick={() => onDownload(item)}>
                  {t("dataEntry.upload.download")}
                </Button>
              )}
              {onStart && item.file && item.status !== "uploading" && item.status !== "done" && (
                <Button type="button" size="sm" variant="ghost" onClick={() => onStart(item)}>
                  {t(item.status === "error" ? "dataEntry.upload.retry" : "dataEntry.upload.start")}
                </Button>
              )}
              {onCancel && item.status === "uploading" && (
                <Button type="button" size="sm" variant="ghost" onClick={() => onCancel(item.uid)}>
                  {t("dataEntry.upload.cancel")}
                </Button>
              )}
              {onRemove && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={t("dataEntry.upload.removeFile", { name: item.name })}
                  onClick={() => onRemove(item.uid)}
                >
                  <X className="ui-upload-row-icon" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        );
        return (
          <li key={item.uid}>
            {itemRender
              ? itemRender(node, item, items, {
                  remove: () => onRemove?.(item.uid),
                  preview: () => onPreview?.(item),
                  download: () => onDownload?.(item),
                  upload: () => onStart?.(item),
                  cancel: () => onCancel?.(item.uid),
                })
              : node}
          </li>
        );
      })}
    </ul>
  );
}
