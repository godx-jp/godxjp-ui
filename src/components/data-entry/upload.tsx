import * as React from "react";
import { Camera, ImagePlus, RotateCcw, Trash2, Upload as UploadIcon, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { formatBytes } from "../../lib/format";
import { cn } from "../../lib/utils";
import { resolveFieldA11y } from "../../lib/field-a11y";
import { controlIconClass } from "../../lib/control-styles";
import { Button } from "../general/button";
import type { UploadProp } from "../../props/components/data-entry.prop";
import { UploadCropDialog } from "./upload-crop-dialog";
import {
  createUploadItem,
  revokePreviewUrl,
  type UploadFileItem,
  type UploadVariant,
} from "./upload-types";
import { useUploadDraft } from "./use-upload-draft";

export type {
  UploadProp,
  UploadProp as UploadProps,
  UploadFileItemProp,
  UploadVariantProp,
} from "../../props/components/data-entry.prop";
export type { UploadFileItem, UploadVariant, UploadCommitAction } from "./upload-types";
export { collectUploadCommitActions, createUploadItem } from "./upload-types";
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

function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const trimmed = rule.trim();
    if (trimmed.endsWith("/*")) return file.type.startsWith(trimmed.slice(0, -1));
    return file.type === trimmed || file.name.endsWith(trimmed);
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

async function runUpload(
  file: File,
  item: UploadFileItem,
  onUpload: NonNullable<UploadProp["onUpload"]>,
  setItems: ReturnType<typeof useUploadList>[1],
) {
  const uid = item.uid;
  setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, status: "uploading" } : it)));

  try {
    const result = await onUpload(file, item);
    setItems((prev) =>
      prev.map((it) =>
        it.uid === uid
          ? {
              ...it,
              status: "done",
              mediaId: result.mediaId,
              previewUrl: result.previewUrl ?? it.previewUrl,
              file: undefined,
            }
          : it,
      ),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setItems((prev) =>
      prev.map((it) => (it.uid === uid ? { ...it, status: "error", error: message } : it)),
    );
  }
}

export function Upload({
  variant = "dropzone",
  triggerSize,
  triggerVariant = "outline",
  value,
  defaultValue,
  onValueChange,
  accept: acceptProp,
  multiple: multipleProp,
  maxCount: maxCountProp,
  maxSizeBytes,
  disabled,
  removable = true,
  onUpload,
  id,
  className,
  children,
  ...ariaProps
}: UploadProp) {
  const { t } = useTranslation();
  // Upload is a composite widget (visible trigger + hidden file input + file list). The native
  // <input type="file"> is the true form control, so the FormField label/helper/error contract is
  // forwarded onto it; the visible dropzone/button keeps its own action label. Per-variant visible
  // triggers are named by their own action label — see the docs for the ownership map.
  const inputA11y = resolveFieldA11y(ariaProps, t("dataEntry.upload.inputLabel"));
  const accept = acceptProp ?? defaultAcceptForVariant(variant);
  const maxCount = maxCountProp ?? defaultMaxCount(variant);
  const multiple = multipleProp ?? (maxCount === 1 ? false : true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [cropFile, setCropFile] = React.useState<File | null>(null);
  const [items, setItems] = useUploadList(value, defaultValue, onValueChange);

  const isSingleAvatar =
    variant === "avatar" || variant === "avatar-crop" || (variant === "picture" && maxCount === 1);
  const singleItem = isSingleAvatar ? (items[0] ?? null) : null;

  const draft = useUploadDraft({
    value: singleItem,
    onChange: (next) => {
      setItems(next ? [next] : []);
    },
  });

  const pickFiles = (fileList: FileList | null) => {
    if (!fileList?.length || disabled) return;

    const slotsLeft = maxCount != null ? Math.max(0, maxCount - items.length) : fileList.length;
    const candidates = Array.from(fileList).slice(0, multiple ? slotsLeft || fileList.length : 1);

    for (const file of candidates) {
      if (!fileMatchesAccept(file, accept)) continue;
      if (maxSizeBytes != null && file.size > maxSizeBytes) continue;

      if (variant === "avatar-crop") {
        setCropFile(file);
        return;
      }

      if (isSingleAvatar) {
        const baseline = items[0];
        const item = createUploadItem(file, {
          pendingReplace: Boolean(baseline?.mediaId),
          replacesMediaId: baseline?.mediaId,
        });
        setItems([item]);
        if (onUpload) void runUpload(file, item, onUpload, setItems);
        return;
      }

      const item = createUploadItem(file);
      setItems((prev) => [...prev, item]);
      if (onUpload) void runUpload(file, item, onUpload, setItems);
    }
  };

  const removeItem = (uid: string) => {
    if (isSingleAvatar) {
      draft.markRemove();
      return;
    }
    setItems((prev) => {
      const target = prev.find((it) => it.uid === uid);
      revokePreviewUrl(target);
      return prev.filter((it) => it.uid !== uid);
    });
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      className="sr-only"
      accept={accept}
      multiple={multiple && !isSingleAvatar}
      disabled={disabled}
      {...inputA11y}
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
  const liveRegion = (
    <span aria-live="polite" className="sr-only" data-slot="upload-status">
      {errorCount > 0
        ? t("dataEntry.upload.statusFailed", { count: errorCount })
        : uploadingCount > 0
          ? t("dataEntry.upload.statusUploading", { count: uploadingCount })
          : items.length > 0
            ? t("dataEntry.upload.statusReady", { count: items.length, done: doneCount })
            : ""}
    </span>
  );

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  if (variant === "dropzone") {
    return (
      <div className={cn("ui-stack-sm", className)}>
        {hiddenInput}
        {liveRegion}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label={t("dataEntry.upload.dropzoneLabel")}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            pickFiles(e.dataTransfer.files);
          }}
          data-drag-active={dragActive ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
          className="ui-upload-dropzone"
        >
          <UploadIcon className="ui-upload-dropzone-icon" aria-hidden="true" />
          <p className="ui-upload-dropzone-hint">{t("dataEntry.upload.dropzoneHint")}</p>
          <p className="ui-upload-dropzone-meta">{t("dataEntry.upload.dropzoneMeta")}</p>
        </div>
        {items.length > 0 && (
          <UploadFileList items={items} onRemove={removable ? removeItem : undefined} />
        )}
      </div>
    );
  }

  if (variant === "button") {
    // An icon size means an icon button: the label would not fit a 32px square
    // and would push it wide, so it moves to `aria-label` and the trigger keeps
    // its shape. Anything else keeps the label visible.
    const iconOnly = typeof triggerSize === "string" && triggerSize.startsWith("icon");
    const label = children ?? t("dataEntry.upload.buttonLabel");

    return (
      <div className={cn("ui-stack-sm", className)}>
        {hiddenInput}
        {liveRegion}
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          disabled={disabled}
          onClick={openPicker}
          aria-label={iconOnly ? (typeof label === "string" ? label : undefined) : undefined}
        >
          <UploadIcon
            className="ui-upload-trigger-icon"
            data-with-label={iconOnly ? undefined : ""}
            aria-hidden="true"
          />
          {iconOnly ? null : label}
        </Button>
        {items.length > 0 && (
          <UploadFileList items={items} onRemove={removable ? removeItem : undefined} />
        )}
      </div>
    );
  }

  if (variant === "picture-card") {
    const canAdd = maxCount == null || items.length < maxCount;
    return (
      <div className={cn("ui-upload-grid", className)}>
        {hiddenInput}
        {liveRegion}
        {items.map((item) => (
          <UploadPictureCard
            key={item.uid}
            item={item}
            onRemove={removable ? () => removeItem(item.uid) : undefined}
          />
        ))}
        {canAdd && (
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            data-disabled={disabled ? "" : undefined}
            className="ui-upload-tile-add"
            aria-label={t("dataEntry.upload.addImage")}
          >
            <ImagePlus className="ui-upload-tile-add-icon" aria-hidden="true" />
            <span className="ui-upload-tile-add-label">{t("dataEntry.upload.addImage")}</span>
          </button>
        )}
      </div>
    );
  }

  if (variant === "picture") {
    const item = draft.state.display;
    return (
      <div className={cn("ui-stack-sm ui-upload-picture", className)}>
        {hiddenInput}
        {liveRegion}
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
            className="ui-upload-picture-empty"
          >
            <ImagePlus className={controlIconClass} aria-hidden="true" />
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
    <div className={cn("ui-stack-sm items-start", className)}>
      {hiddenInput}
      {liveRegion}
      <UploadCropDialog
        open={variant === "avatar-crop" && cropFile != null}
        onOpenChange={(open) => !open && setCropFile(null)}
        file={cropFile}
        onConfirm={(cropped) => {
          const baseline = items[0];
          const item = createUploadItem(cropped, {
            pendingReplace: Boolean(baseline?.mediaId),
            replacesMediaId: baseline?.mediaId,
          });
          setItems([item]);
          setCropFile(null);
          if (onUpload) void runUpload(cropped, item, onUpload, setItems);
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
          aria-label={t("dataEntry.upload.avatarLabel")}
        >
          {!showPlaceholder && item?.previewUrl ? (
            <img src={item.previewUrl} alt="" className="ui-upload-avatar-image" />
          ) : (
            <span className="ui-upload-avatar-placeholder">
              <Camera className={controlIconClass} aria-hidden="true" />
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
            onClick={() => draft.markRemove()}
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
        <span className="text-destructive">{t("dataEntry.upload.markedForDelete")}</span>
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

function UploadPictureCard({ item, onRemove }: { item: UploadFileItem; onRemove?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="ui-upload-tile">
      {item.previewUrl ? (
        <img src={item.previewUrl} alt="" className="ui-upload-avatar-image" />
      ) : (
        <div className="ui-upload-tile-placeholder">…</div>
      )}
      {item.status === "uploading" && <div className="ui-upload-overlay">…</div>}
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
  );
}

function UploadFileList({
  items,
  onRemove,
}: {
  items: UploadFileItem[];
  onRemove?: (uid: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <ul className="ui-stack-xs">
      {items.map((item) => (
        <li key={item.uid} className="ui-upload-row">
          <div className="ui-upload-row-main">
            <div className="truncate font-medium">{item.name}</div>
            <div className="text-muted-foreground text-xs">
              {formatBytes(item.size)}
              {item.status === "uploading" && " · …"}
              {item.status === "error" && item.error && (
                <span className="text-destructive"> · {item.error}</span>
              )}
              {item.mediaId && (
                <span className="text-muted-foreground"> · {item.mediaId.slice(0, 8)}…</span>
              )}
            </div>
          </div>
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
        </li>
      ))}
    </ul>
  );
}
