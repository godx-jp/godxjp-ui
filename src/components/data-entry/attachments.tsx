"use client";

import * as React from "react";
import { FileIcon, ImagePlus, Plus, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { formatBytes } from "../../lib/format";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Progress } from "../data-display/progress";
import { createUploadItem, type UploadFileItem } from "./upload-types";
import { readDroppedFiles } from "./upload-files";

import type {
  AttachmentsItemProp,
  AttachmentsPlaceholderProp,
  AttachmentsProp,
  AttachmentsRefProp,
} from "../../props/components/data-entry.prop";

export type {
  AttachmentsProp,
  AttachmentsProp as AttachmentsProps,
  AttachmentsItemProp,
  AttachmentsPlaceholderProp,
  AttachmentsOverflowProp,
  AttachmentsRefProp,
} from "../../props/components/data-entry.prop";

const AttachmentContext = React.createContext<{ disabled?: boolean }>({ disabled: false });

function toAttachmentItem(item: UploadFileItem): AttachmentsItemProp {
  const status =
    item.status === "uploading"
      ? "uploading"
      : item.status === "done"
        ? "done"
        : item.status === "error"
          ? "error"
          : item.status === "removed"
            ? "removed"
            : undefined;
  return {
    uid: item.uid,
    name: item.name,
    size: item.size,
    status,
    percent: item.percent,
    url: item.url,
    thumbUrl: item.previewUrl,
    originFileObj: item.file,
    response: item.response,
    error: item.error,
  };
}

function resolvePlaceholder(
  placeholder: AttachmentsProp["placeholder"],
  type: "inline" | "drop",
): AttachmentsPlaceholderProp {
  if (!placeholder) return {};
  return typeof placeholder === "function" ? placeholder(type) : placeholder;
}

/**
 * Ant X splits a file name in two so the EXTENSION never truncates: the stem ellipsises, `.pdf`
 * stays. Same regex as `@ant-design/x@2.9.0` `file-card/FileCard.js` — everything before the last
 * dot, then the dot and what follows. A dotless name keeps an empty suffix.
 */
function splitFileName(name: string): [string, string] {
  const match = /^(.*)\.[^.]+$/.exec(name ?? "");
  return match ? [match[1], (name ?? "").slice(match[1].length)] : [name ?? "", ""];
}

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

type PlaceholderUploaderProps = {
  type: "inline" | "drop";
  placeholder: AttachmentsPlaceholderProp;
  onOpen: () => void;
  onFiles: (files: File[]) => void;
  className?: string;
  style?: React.CSSProperties;
  hidden?: boolean;
};

function PlaceholderUploader({
  type,
  placeholder,
  onOpen,
  onFiles,
  className,
  style,
  hidden,
}: PlaceholderUploaderProps) {
  const { t } = useTranslation();
  const { disabled } = React.useContext(AttachmentContext);
  const [dragActive, setDragActive] = React.useState(false);

  if (hidden) return null;

  const title = placeholder.title ?? t("dataEntry.attachments.placeholderTitle");
  const description = placeholder.description ?? t("dataEntry.attachments.placeholderDescription");
  const icon = placeholder.icon ?? <ImagePlus aria-hidden="true" />;

  return (
    <div
      className={cn("ui-attachments-placeholder", className)}
      style={style}
      data-drag-active={dragActive ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      aria-hidden={disabled ? true : undefined}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragActive(false);
      }}
      onDrop={async (event) => {
        event.preventDefault();
        // The root is a drop target too (the list area accepts files once the placeholder is
        // gone). Without this the drop would be handled here AND again on the way up, adding
        // every file twice.
        event.stopPropagation();
        setDragActive(false);
        if (disabled) return;
        const files = await readDroppedFiles(event.dataTransfer, false);
        if (files.length) onFiles(files);
      }}
      onClick={() => {
        if (!disabled) onOpen();
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={String(title)}
    >
      <span className="ui-attachments-placeholder-icon">{icon}</span>
      {title ? <span className="ui-attachments-placeholder-title">{title}</span> : null}
      {description ? (
        <span className="ui-attachments-placeholder-description">{description}</span>
      ) : null}
      <span className="sr-only">{t("dataEntry.attachments.dropLabel", { type })}</span>
    </div>
  );
}

function AttachmentCard({
  item,
  description,
  onRemove,
  classNames,
}: {
  item: AttachmentsItemProp;
  description?: React.ReactNode;
  onRemove?: () => void;
  classNames?: AttachmentsProp["classNames"];
}) {
  const { t } = useTranslation();
  const { disabled } = React.useContext(AttachmentContext);
  const preview = item.thumbUrl ?? item.url;
  const [namePrefix, nameSuffix] = splitFileName(item.name);
  const desc =
    description ??
    item.description ??
    (item.status === "uploading"
      ? `${item.percent ?? 0}%`
      : item.status === "error"
        ? typeof item.response === "string"
          ? item.response
          : t("dataEntry.attachments.error")
        : item.size
          ? formatBytes(item.size)
          : "");

  return (
    <li
      className={cn("ui-attachments-card", classNames?.card, classNames?.file)}
      data-status={item.status}
    >
      {preview ? (
        <img src={preview} alt="" className="ui-attachments-card-preview" aria-hidden="true" />
      ) : (
        <span className="ui-attachments-card-placeholder" aria-hidden="true">
          <FileIcon />
        </span>
      )}
      {/* THE NAME IS THE CARD (gh#855). Before this the card drew a glyph and a byte count and
          never the file name — the only place `item.name` appeared was the remove button's
          accessible name, so a sighted user reading a tray of attachments could not tell which
          file was which. Ant X's overview card is glyph · name · description, and so is this. */}
      <span className="ui-attachments-card-content">
        <span className="ui-attachments-card-name" title={item.name}>
          <span className="ui-attachments-card-name-prefix">{namePrefix}</span>
          <span className="ui-attachments-card-name-suffix">{nameSuffix}</span>
        </span>
        {desc ? (
          <span
            className="ui-attachments-card-meta"
            title={typeof desc === "string" ? desc : undefined}
          >
            {desc}
          </span>
        ) : null}
      </span>
      {item.status === "uploading" && item.percent != null ? (
        <span className="ui-attachments-card-progress">
          <Progress
            size="sm"
            value={item.percent}
            aria-label={t("dataEntry.attachments.uploading")}
          />
        </span>
      ) : null}
      {!disabled && onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ui-attachments-card-remove"
          aria-label={t("dataEntry.attachments.remove", { name: item.name })}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </li>
  );
}

export const Attachments = React.forwardRef<AttachmentsRefProp, AttachmentsProp>(
  (
    {
      className,
      rootClassName,
      classNames = {},
      styles = {},
      items: controlledItems,
      onChange,
      onRemove,
      overflow,
      placeholder,
      getDropContainer,
      disabled = false,
      maxCount,
      accept,
      multiple,
      children,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [internalItems, setInternalItems] = React.useState<AttachmentsItemProp[]>([]);
    const [dropActive, setDropActive] = React.useState(false);
    const items = controlledItems ?? internalItems;
    const setItems = React.useCallback(
      (next: AttachmentsItemProp[], file: AttachmentsItemProp) => {
        if (controlledItems === undefined) setInternalItems(next);
        onChange?.({ file, fileList: next });
      },
      [controlledItems, onChange],
    );

    const openPicker = React.useCallback(() => {
      inputRef.current?.click();
    }, []);

    const dispatchFiles = React.useCallback(
      (files: File[]) => {
        const accepted = files.filter((file) => fileMatchesAccept(file, accept));
        if (!accepted.length) return;
        const room = maxCount == null ? accepted.length : Math.max(0, maxCount - items.length);
        const picked = accepted.slice(0, room);
        const next = [
          ...items,
          ...picked.map((file) => {
            const uploadItem = createUploadItem(file);
            return toAttachmentItem(uploadItem);
          }),
        ];
        const last = next[next.length - 1];
        if (last) setItems(next, last);
      },
      [accept, items, maxCount, setItems],
    );

    React.useImperativeHandle(ref, () => ({
      nativeElement: containerRef.current,
      fileNativeElement: inputRef.current,
      upload: (file: File) => dispatchFiles([file]),
      select: (options) => {
        const input = inputRef.current;
        if (!input) return;
        input.multiple = options?.multiple ?? false;
        input.accept = options?.accept ?? accept ?? "";
        input.click();
      },
    }));

    const handleRemove = async (item: AttachmentsItemProp) => {
      const ret = await Promise.resolve(typeof onRemove === "function" ? onRemove(item) : onRemove);
      if (ret === false) return;
      const next = items.filter((entry) => entry.uid !== item.uid);
      setItems(next, { ...item, status: "removed" });
    };

    const showExtension =
      !disabled && (maxCount == null || maxCount > items.length) && items.length > 0;
    const inlinePlaceholder = resolvePlaceholder(placeholder, "inline");
    const dropPlaceholder = resolvePlaceholder(placeholder, "drop");
    const hasFiles = items.length > 0;

    const fileInput = (
      <input
        ref={inputRef}
        type="file"
        // NEVER PAINTED, ALWAYS REACHABLE (gh#855). This was a bare, visible `<input type="file">`
        // — nine of them on the docs page, 265x24 each, drawing the platform's own
        // "ファイル選択 / 選択されていません" chrome straight through the design. `Upload` in this
        // group solved it first and this reuses its mechanism verbatim: `sr-only`, which clips the
        // control to 1px WITHOUT `display: none`, so it keeps its tab stop and its `aria-label`.
        // It supersedes gh#643's `min-block-size: var(--touch-target-min)` floor — WCAG 2.2
        // SC 2.5.8 sizes POINTER targets, and this one is no longer a pointer target; the visible
        // target is the placeholder / `+` tile, both of which are on the tier.
        className={cn("ui-attachments-input", "sr-only")}
        accept={accept}
        multiple={multiple ?? (maxCount == null || maxCount > 1)}
        disabled={disabled}
        aria-label={t("dataEntry.attachments.inputLabel")}
        onChange={(event) => {
          const files = event.target.files ? Array.from(event.target.files) : [];
          event.target.value = "";
          dispatchFiles(files);
        }}
      />
    );

    if (children) {
      return (
        <AttachmentContext.Provider value={{ disabled }}>
          {fileInput}
          <div
            ref={containerRef}
            className={cn("ui-attachments", rootClassName, classNames.root)}
            style={styles.root}
          >
            {children}
          </div>
          <PlaceholderUploader
            type="drop"
            placeholder={dropPlaceholder}
            onOpen={openPicker}
            onFiles={dispatchFiles}
            className={classNames.placeholder}
            style={styles.placeholder}
          />
        </AttachmentContext.Provider>
      );
    }

    // Ant X's drop area is `position: absolute; inset: 0` over the control, and `position: fixed`
    // when `getDropContainer` hands it the body. The layer used to be gated on
    // `getDropContainer?.() ?? containerRef.current` — a ref that is null on the render that
    // decides, so with no `getDropContainer` prop the layer NEVER rendered at all (measured: 0
    // elements on the docs page) and `--attachments-drop-overlay-background` had nothing to paint.
    const dropScope = getDropContainer?.() ? "viewport" : "control";

    return (
      <AttachmentContext.Provider value={{ disabled }}>
        <div
          ref={containerRef}
          className={cn("ui-attachments", className, rootClassName, classNames.root)}
          style={styles.root}
          dir="auto"
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) setDropActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropActive(false);
          }}
          onDrop={async (event) => {
            event.preventDefault();
            setDropActive(false);
            if (disabled) return;
            const files = await readDroppedFiles(event.dataTransfer, false);
            if (files.length) dispatchFiles(files);
          }}
        >
          {fileInput}
          {hasFiles ? (
            <ul
              className={cn("ui-attachments-list", classNames.list)}
              style={styles.list}
              data-overflow={overflow ?? "wrap"}
            >
              {items.map((item) => (
                <AttachmentCard
                  key={item.uid}
                  item={item}
                  onRemove={() => handleRemove(item)}
                  classNames={classNames}
                />
              ))}
              {showExtension ? (
                <li>
                  <button
                    type="button"
                    className={cn("ui-attachments-upload-btn", classNames.upload)}
                    style={styles.upload}
                    disabled={disabled}
                    aria-label={t("dataEntry.attachments.add")}
                    onClick={openPicker}
                  >
                    <Plus aria-hidden="true" />
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
          <PlaceholderUploader
            type="inline"
            placeholder={inlinePlaceholder}
            onOpen={openPicker}
            onFiles={dispatchFiles}
            className={classNames.placeholder}
            style={hasFiles ? { display: "none" } : styles.placeholder}
            hidden={hasFiles}
          />
          {/* Decorative and inert: `pointer-events: none` so it never intercepts the drop the
              root above is listening for, which is also why it cannot double-dispatch. */}
          <div
            className="ui-attachments-drop-layer"
            data-scope={dropScope}
            data-active={dropActive ? "true" : undefined}
            aria-hidden="true"
          />
        </div>
      </AttachmentContext.Provider>
    );
  },
);

Attachments.displayName = "Attachments";
