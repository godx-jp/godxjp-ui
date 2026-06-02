import * as React from "react";
import { Camera, ImagePlus, RotateCcw, Trash2, Upload as UploadIcon, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { formatBytes } from "../../lib/format";
import { cn } from "../../lib/utils";
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

  const setItems = React.useCallback(
    (next: UploadFileItem[] | ((prev: UploadFileItem[]) => UploadFileItem[])) => {
      const resolved = typeof next === "function" ? next(items) : next;
      if (controlled === undefined) setInternal(resolved);
      onValueChange?.(resolved);
    },
    [controlled, items, onValueChange],
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
  className,
  children,
}: UploadProp) {
  const { t } = useTranslation();
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
      type="file"
      className="sr-only"
      accept={accept}
      multiple={multiple && !isSingleAvatar}
      disabled={disabled}
      onChange={(e) => {
        pickFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  if (variant === "dropzone") {
    return (
      <div className={cn("ui-stack-sm", className)}>
        {hiddenInput}
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
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <UploadIcon className="text-muted-foreground mx-auto size-10" aria-hidden="true" />
          <p className="mt-3 text-sm">{t("dataEntry.upload.dropzoneHint")}</p>
          <p className="text-muted-foreground mt-1 text-xs">{t("dataEntry.upload.dropzoneMeta")}</p>
        </div>
        {items.length > 0 && (
          <UploadFileList items={items} onRemove={removable ? removeItem : undefined} />
        )}
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={cn("ui-stack-sm", className)}>
        {hiddenInput}
        <Button type="button" variant="outline" disabled={disabled} onClick={openPicker}>
          <UploadIcon className="mr-2 size-4" aria-hidden="true" />
          {children ?? t("dataEntry.upload.buttonLabel")}
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
      <div className={cn("flex flex-wrap gap-3", className)}>
        {hiddenInput}
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
            className={cn(
              "flex size-24 flex-col items-center justify-center rounded-md border border-dashed",
              "text-muted-foreground hover:border-primary hover:text-primary transition-colors",
              disabled && "pointer-events-none opacity-50",
            )}
            aria-label={t("dataEntry.upload.addImage")}
          >
            <ImagePlus className="size-6" aria-hidden="true" />
            <span className="mt-1 text-xs">{t("dataEntry.upload.addImage")}</span>
          </button>
        )}
      </div>
    );
  }

  if (variant === "picture") {
    const item = draft.state.display;
    return (
      <div className={cn("ui-stack-sm max-w-xs", className)}>
        {hiddenInput}
        {item?.previewUrl && !item.pendingDelete ? (
          <div className="relative overflow-hidden rounded-md border">
            <img src={item.previewUrl} alt="" className="max-h-48 w-full object-cover" />
            {item.status === "uploading" && (
              <div className="bg-background/70 absolute inset-0 flex items-center justify-center text-sm">
                {t("dataEntry.upload.uploading")}
              </div>
            )}
            {item.pendingReplace && (
              <div className="bg-warning text-warning-foreground absolute top-2 left-2 rounded px-2 py-0.5 text-xs">
                {t("dataEntry.upload.pendingReplace")}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            className="text-muted-foreground hover:border-primary flex h-32 w-full flex-col items-center justify-center rounded-md border border-dashed"
          >
            <ImagePlus className={controlIconClass} aria-hidden="true" />
            <span className="mt-2 text-sm">{t("dataEntry.upload.addImage")}</span>
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
          className={cn(
            "border-border bg-muted relative size-24 overflow-hidden rounded-full border-2",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            item?.pendingDelete && "opacity-40",
            disabled && "pointer-events-none opacity-50",
          )}
          aria-label={t("dataEntry.upload.avatarLabel")}
        >
          {!showPlaceholder && item?.previewUrl ? (
            <img src={item.previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-muted-foreground flex size-full items-center justify-center">
              <Camera className={controlIconClass} aria-hidden="true" />
            </span>
          )}
          {!disabled && (
            <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] text-white">
              {t("dataEntry.upload.change")}
            </span>
          )}
        </button>
        {removable && item && !item.pendingDelete && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => draft.markRemove()}
            className="bg-background hover:bg-destructive hover:text-destructive-foreground absolute -top-1 -right-1 rounded-full border p-1 shadow-sm"
            aria-label={t("dataEntry.upload.removeAvatar")}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
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
      <div className="border-destructive/40 bg-destructive/5 flex flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
        <span className="text-destructive">{t("dataEntry.upload.markedForDelete")}</span>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={undoRemove}>
          <RotateCcw className="mr-1 size-3.5" aria-hidden="true" />
          {t("dataEntry.upload.undo")}
        </Button>
      </div>
    );
  }

  if (state.canUndoReplace) {
    return (
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
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
  return (
    <div className="bg-muted relative size-24 overflow-hidden rounded-md border">
      {item.previewUrl ? (
        <img src={item.previewUrl} alt="" className="size-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
          …
        </div>
      )}
      {item.status === "uploading" && (
        <div className="bg-background/70 absolute inset-0 flex items-center justify-center text-xs">
          …
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="bg-background/90 hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 rounded-full p-0.5 shadow"
          aria-label="Remove"
        >
          <X className="size-3.5" aria-hidden="true" />
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
  return (
    <ul className="ui-stack-xs">
      {items.map((item) => (
        <li key={item.uid} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
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
            <Button type="button" size="sm" variant="ghost" onClick={() => onRemove(item.uid)}>
              <X className="size-4" aria-hidden="true" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
