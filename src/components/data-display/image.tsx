import * as React from "react";
import { mergeRefs } from "@react-aria/utils";
import { Dialog as RacDialog, Modal, ModalOverlay } from "react-aria-components";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useOverlayPortalContainer } from "../../lib/overlay-portal";
import { cn } from "../../lib/utils";
import type {
  ImagePreviewConfigProp,
  ImagePreviewGroupProp,
  ImagePreviewItemProp,
  ImageProp,
} from "../../props/components/data-display.prop";
import { useOverlayCloseFocus } from "../feedback/overlay-close-focus";

export type {
  ImageFitProp,
  ImagePreviewConfigProp,
  ImagePreviewGroupConfigProp,
  ImagePreviewGroupProp,
  ImagePreviewGroupProp as ImagePreviewGroupProps,
  ImagePreviewItemProp,
  ImageProp,
  ImageProp as ImageProps,
  ImageSizeProp,
} from "../../props/components/data-display.prop";

/*
 * Image + ImagePreviewGroup — a port of antd `Image` / `Image.PreviewGroup` (rc-image).
 *
 * Kept from antd, whole: click opens a full-viewport preview; zoom in/out (buttons, wheel,
 * double-click), rotate left/right, flip x/y, reset; drag to pan; prev/next inside a group with a
 * "3 / 7" counter; Esc closes; ←/→ page; `preview={false}` opts out; `fallback`; `placeholder`;
 * the group's `items`, controlled `preview.current` / `onChange` and `preview.visible` /
 * `onVisibleChange` with antd's argument order; `scaleStep` 0.5, `minScale` 1, `maxScale` 50.
 *
 * Deviations, all on purpose (also in the catalog entry and docs page):
 * - The thumbnail is a real `<button>` named "Preview: {alt}", so the preview opens from the
 *   keyboard. antd's is a `div` with a click handler.
 * - The preview is a modal dialog (react-aria `ModalOverlay`): focus moves in, Tab is trapped,
 *   and focus returns to the thumbnail on close. antd does not trap focus.
 * - The tool buttons are a labelled `group`, not an APG `toolbar`: ←/→ already page the images,
 *   so they cannot also move a roving focus. Tab walks the buttons.
 * - ←/→ follow the reading direction: in RTL, ← is NEXT. antd ignores `dir`.
 * - With `items`, a clicked child opens at the item whose `src` matches its own (antd opens 0).
 * - `alt` is required, as on `Thumbnail`.
 * - `width`/`height` size the frame (antd) and the picture fills it; a fixed height crops with
 *   `fit` (default `cover`, antd stretches). `size` (sm/md/lg on the Thumbnail height scale, 4:3)
 *   and `caption` (a figcaption held to the picture's width) are godx extensions.
 * - The toolbar render props (`toolbarRender`, `imageRender`, `countRender`), `movable`,
 *   `getContainer` and the `mask` classNames are not ported.
 */

type PreviewEntry = { src: string; alt: string };

type RegisteredImage = PreviewEntry & { id: string; node: () => HTMLElement | null };

type GroupContextValue = {
  register: (entry: RegisteredImage) => () => void;
  open: (id: string) => void;
};

const ImageGroupContext = React.createContext<GroupContextValue | null>(null);

/** Marks an `Image` under a `preview={false}` group, so it renders plain rather than standalone. */
const ImageGroupDisabledContext = React.createContext(false);

const BASE_SCALE_RATIO = 1;
const DEFAULT_SCALE_STEP = 0.5;
const DEFAULT_MIN_SCALE = 1;
const DEFAULT_MAX_SCALE = 50;

type Transform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
};

const INITIAL_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  flipX: false,
  flipY: false,
};

function toEntry(item: ImagePreviewItemProp): PreviewEntry {
  return typeof item === "string" ? { src: item, alt: "" } : { src: item.src, alt: item.alt ?? "" };
}

/** Controlled-or-not value with an antd-shaped `(next, prev)` callback. */
function useMergedState<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (next: T, prev: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = React.useState(initial);
  const value = controlled ?? inner;
  const set = React.useCallback(
    (next: T) => {
      if (Object.is(next, value)) return;
      if (controlled === undefined) setInner(next);
      onChange?.(next, value);
    },
    [controlled, onChange, value],
  );
  return [value, set];
}

/** Registered pictures in the order a reader meets them, however deep each one sits. */
function inDocumentOrder(entries: Iterable<RegisteredImage>): RegisteredImage[] {
  return [...entries].sort((a, b) => {
    const na = a.node();
    const nb = b.node();
    if (!na || !nb) return 0;
    return na.compareDocumentPosition(nb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}

function isRtl(element: Element | null): boolean {
  return element?.closest("[dir]")?.getAttribute("dir")?.toLowerCase() === "rtl";
}

type PreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly PreviewEntry[];
  current: number;
  onCurrentChange: (index: number) => void;
  fallback?: string;
  scaleStep?: number;
  minScale?: number;
  maxScale?: number;
};

/** The full-viewport preview. Internal: reached through `Image` and `ImagePreviewGroup`. */
function ImagePreviewDialog({
  open,
  onOpenChange,
  items,
  current,
  onCurrentChange,
  fallback,
  scaleStep = DEFAULT_SCALE_STEP,
  minScale = DEFAULT_MIN_SCALE,
  maxScale = DEFAULT_MAX_SCALE,
}: PreviewDialogProps) {
  const { t } = useTranslation();
  const portalContainer = useOverlayPortalContainer();
  useOverlayCloseFocus(open);

  /*
   * Focus goes in NOW, not when react-aria gets to it. Its `useDialog` focuses through
   * `focusSafely`, which waits for every running CSS transition to end — and the thumbnail veil is
   * mid-transition the moment its button is pressed. Meanwhile the thumbnail turns inert under the
   * modal and focus drops to <body>, so the first ←/→ or Esc from the keyboard went nowhere.
   * Child effects run first, so react-aria's own effect then finds focus inside and stands down.
   */
  const sectionRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const section = sectionRef.current;
    if (open && section && !section.contains(document.activeElement)) {
      section.focus({ preventScroll: true });
    }
  }, [open]);

  const total = items.length;
  const index = total === 0 ? 0 : Math.min(Math.max(current, 0), total - 1);
  const entry = items[index];

  const [transform, setTransform] = React.useState<Transform>(INITIAL_TRANSFORM);
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  // A new picture (or a fresh open) starts un-zoomed, un-rotated — antd resets on switch.
  React.useEffect(() => {
    setTransform(INITIAL_TRANSFORM);
    setFailedSrc(null);
  }, [index, open]);

  const zoomBy = (ratio: number) =>
    setTransform((prev) => {
      const scale = Math.min(Math.max(prev.scale * ratio, minScale), maxScale);
      // Back at (or under) 1 there is nothing to pan: antd snaps the picture home.
      return scale <= 1 ? { ...prev, scale, x: 0, y: 0 } : { ...prev, scale };
    });
  const zoomIn = () => zoomBy(BASE_SCALE_RATIO + scaleStep);
  const zoomOut = () => zoomBy(BASE_SCALE_RATIO / (BASE_SCALE_RATIO + scaleStep));

  const hasPrev = index > 0;
  const hasNext = index < total - 1;
  const goPrev = () => hasPrev && onCurrentChange(index - 1);
  const goNext = () => hasNext && onCurrentChange(index + 1);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (total < 2) return;
    event.preventDefault();
    const forward = (event.key === "ArrowRight") !== isRtl(event.currentTarget);
    if (forward) goNext();
    else goPrev();
  };

  const onWheel = (event: React.WheelEvent) => {
    if (event.deltaY === 0) return;
    if (event.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const onDoubleClick = () => {
    if (transform.scale !== 1) setTransform((prev) => ({ ...prev, x: 0, y: 0, scale: 1 }));
    else zoomIn();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStart.current = { px: event.clientX, py: event.clientY, x: transform.x, y: transform.y };
    setDragging(true);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    const start = dragStart.current;
    if (!start) return;
    setTransform((prev) => ({
      ...prev,
      x: start.x + event.clientX - start.px,
      y: start.y + event.clientY - start.py,
    }));
  };
  const onPointerUp = () => {
    if (!dragStart.current) return;
    dragStart.current = null;
    setDragging(false);
    setTransform((prev) => (prev.scale <= 1 ? { ...prev, x: 0, y: 0 } : prev));
  };

  const src = entry && failedSrc === entry.src && fallback ? fallback : entry?.src;
  const { x, y, scale, rotate, flipX, flipY } = transform;
  const imageTransform = `translate3d(${x}px, ${y}px, 0) scale3d(${flipX ? -scale : scale}, ${
    flipY ? -scale : scale
  }, 1) rotate(${rotate}deg)`;

  const tools: {
    key: string;
    label: string;
    icon: React.ReactNode;
    run: () => void;
    off?: boolean;
  }[] = [
    {
      key: "flipY",
      label: t("dataDisplay.image.flipY"),
      icon: <FlipVertical2 />,
      run: () => setTransform((p) => ({ ...p, flipY: !p.flipY })),
    },
    {
      key: "flipX",
      label: t("dataDisplay.image.flipX"),
      icon: <FlipHorizontal2 />,
      run: () => setTransform((p) => ({ ...p, flipX: !p.flipX })),
    },
    {
      key: "rotateLeft",
      label: t("dataDisplay.image.rotateLeft"),
      icon: <RotateCcw />,
      run: () => setTransform((p) => ({ ...p, rotate: p.rotate - 90 })),
    },
    {
      key: "rotateRight",
      label: t("dataDisplay.image.rotateRight"),
      icon: <RotateCw />,
      run: () => setTransform((p) => ({ ...p, rotate: p.rotate + 90 })),
    },
    {
      key: "zoomOut",
      label: t("dataDisplay.image.zoomOut"),
      icon: <ZoomOut />,
      run: zoomOut,
      off: scale <= minScale,
    },
    {
      key: "zoomIn",
      label: t("dataDisplay.image.zoomIn"),
      icon: <ZoomIn />,
      run: zoomIn,
      off: scale >= maxScale,
    },
    {
      key: "reset",
      label: t("dataDisplay.image.reset"),
      icon: <Undo2 />,
      run: () => setTransform(INITIAL_TRANSFORM),
    },
  ];

  return (
    <ModalOverlay
      UNSTABLE_portalContainer={portalContainer}
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable={false}
      data-slot="image-preview-overlay"
      className="ui-image-preview-overlay"
    >
      <Modal className="contents">
        <RacDialog
          aria-label={t("dataDisplay.image.dialog")}
          data-slot="image-preview"
          className="ui-image-preview"
          render={(racProps) => {
            const {
              "data-rac": _rac,
              ref: racRef,
              ...rest
            } = racProps as React.ComponentPropsWithRef<"section"> & {
              "data-rac"?: string;
            };
            return <section {...rest} ref={mergeRefs(racRef, sectionRef)} onKeyDown={onKeyDown} />;
          }}
        >
          <div
            className="ui-image-preview-stage"
            data-dragging={dragging ? "" : undefined}
            onWheel={onWheel}
            // A click on the empty stage closes, as in antd; a click on the picture does not.
            onClick={(event) => {
              if (event.target === event.currentTarget) onOpenChange(false);
            }}
          >
            {src ? (
              <img
                key={index}
                data-slot="image-preview-img"
                className="ui-image-preview-img"
                src={src}
                alt={entry?.alt ?? ""}
                draggable={false}
                style={{ transform: imageTransform }}
                onError={() => entry && setFailedSrc(entry.src)}
                onDoubleClick={onDoubleClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              />
            ) : null}
          </div>

          <button
            type="button"
            data-slot="image-preview-close"
            className="ui-image-preview-close ui-image-preview-button ui-focus-ring"
            aria-label={t("dataDisplay.image.close")}
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" />
          </button>

          {total > 1 ? (
            <>
              <button
                type="button"
                data-slot="image-preview-previous"
                className="ui-image-preview-switch ui-image-preview-button ui-focus-ring"
                data-direction="previous"
                aria-label={t("dataDisplay.image.previous")}
                disabled={!hasPrev}
                onClick={goPrev}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                data-slot="image-preview-next"
                className="ui-image-preview-switch ui-image-preview-button ui-focus-ring"
                data-direction="next"
                aria-label={t("dataDisplay.image.next")}
                disabled={!hasNext}
                onClick={goNext}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className="ui-image-preview-footer">
            {total > 1 ? (
              <>
                <span
                  data-slot="image-preview-counter"
                  className="ui-image-preview-counter"
                  aria-hidden="true"
                >
                  {t("dataDisplay.image.counter", { current: index + 1, total })}
                </span>
                <span className="sr-only" aria-live="polite">
                  {t("dataDisplay.image.position", { current: index + 1, total })}
                </span>
              </>
            ) : null}
            <div
              role="group"
              aria-label={t("dataDisplay.image.toolbar")}
              data-slot="image-preview-toolbar"
              className="ui-image-preview-toolbar"
            >
              {tools.map((tool) => (
                <button
                  key={tool.key}
                  type="button"
                  data-action={tool.key}
                  className="ui-image-preview-button ui-focus-ring"
                  aria-label={tool.label}
                  title={tool.label}
                  disabled={tool.off}
                  onClick={tool.run}
                >
                  <span className="ui-image-preview-icon" aria-hidden="true">
                    {tool.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </RacDialog>
      </Modal>
    </ModalOverlay>
  );
}

/**
 * ImagePreviewGroup — pages one preview across many pictures (antd `Image.PreviewGroup`).
 *
 * Every `Image` under it — at any depth, e.g. inside a Markdown renderer's `img` override —
 * registers itself; the gallery is those pictures in DOCUMENT order. `items` replaces that list.
 */
export function ImagePreviewGroup({
  items,
  fallback,
  preview = true,
  children,
}: ImagePreviewGroupProp) {
  const config = typeof preview === "object" ? preview : {};
  const enabled = preview !== false;

  const registry = React.useRef(new Map<string, RegisteredImage>());
  const [version, setVersion] = React.useState(0);

  const [visible, setVisible] = useMergedState(config.visible, false, config.onVisibleChange);
  const [current, setCurrent] = useMergedState(config.current, 0, config.onChange);

  const registered = React.useMemo(() => {
    void version;
    return inDocumentOrder(registry.current.values());
  }, [version]);

  const list = React.useMemo<PreviewEntry[]>(
    () => (items ? items.map(toEntry) : registered),
    [items, registered],
  );

  // Refs of the latest state, so `open` stays one stable function for every registered Image.
  const latest = React.useRef({ items, setCurrent, setVisible });
  latest.current = { items, setCurrent, setVisible };

  const context = React.useMemo<GroupContextValue>(
    () => ({
      register: (entry) => {
        registry.current.set(entry.id, entry);
        setVersion((v) => v + 1);
        return () => {
          registry.current.delete(entry.id);
          setVersion((v) => v + 1);
        };
      },
      open: (id) => {
        const { items: explicit, setCurrent: select, setVisible: show } = latest.current;
        const entry = registry.current.get(id);
        const index = explicit
          ? explicit.map(toEntry).findIndex((item) => item.src === entry?.src)
          : inDocumentOrder(registry.current.values()).findIndex((item) => item.id === id);
        select(Math.max(index, 0));
        show(true);
      },
    }),
    [],
  );

  return (
    <ImageGroupDisabledContext.Provider value={!enabled}>
      <ImageGroupContext.Provider value={enabled ? context : null}>
        {children}
        {enabled ? (
          <ImagePreviewDialog
            open={visible && list.length > 0}
            onOpenChange={setVisible}
            items={list}
            current={current}
            onCurrentChange={setCurrent}
            fallback={fallback}
            scaleStep={config.scaleStep}
            minScale={config.minScale}
            maxScale={config.maxScale}
          />
        ) : null}
      </ImageGroupContext.Provider>
    </ImageGroupDisabledContext.Provider>
  );
}

type ImageStatus = "loading" | "loaded" | "error";

/**
 * Image — a picture that opens large (antd `Image`). Inside an `ImagePreviewGroup` it pages with
 * the group's other pictures; on its own it previews just itself.
 */
const ImageRoot = React.forwardRef<HTMLImageElement, ImageProp>(function Image(
  {
    src,
    alt,
    fallback,
    placeholder,
    preview = true,
    width,
    height,
    size,
    fit,
    caption,
    className,
    onLoad,
    onError,
    ...imgProps
  },
  ref,
) {
  const { t } = useTranslation();
  const group = React.useContext(ImageGroupContext);
  const groupDisabled = React.useContext(ImageGroupDisabledContext);
  const id = React.useId();
  const wrapperRef = React.useRef<HTMLElement | null>(null);

  // Keyed by `src`, so a new picture starts "loading" without an effect that would also undo the
  // "loaded" a cached picture reports from the ref callback on the first commit.
  const [load, setLoad] = React.useState<{ src: string; status: ImageStatus }>({
    src,
    status: "loading",
  });
  const status: ImageStatus = load.src === src ? load.status : "loading";
  // "error" is final for this `src` (gh#1082): the `load` that follows is the FALLBACK's, and
  // taking it as "loaded" put the broken `src` back — an endless error/load request loop.
  const setStatus = React.useCallback(
    (next: ImageStatus) =>
      setLoad((prev) =>
        prev.src === src && prev.status === "error" ? prev : { src, status: next },
      ),
    [src],
  );

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const setImgRef = React.useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      // A cached picture has already loaded before React attaches `onLoad`.
      if (node?.complete && node.naturalWidth > 0) setStatus("loaded");
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, setStatus],
  );

  const config: ImagePreviewConfigProp = typeof preview === "object" ? preview : {};
  const isError = status === "error";
  const canPreview = preview !== false && !groupDisabled && !isError;
  const previewSrc = config.src ?? src;
  const inGroup = group != null && canPreview;

  React.useLayoutEffect(() => {
    if (!inGroup || !group) return undefined;
    return group.register({ id, src: previewSrc, alt, node: () => wrapperRef.current });
  }, [inGroup, group, id, previewSrc, alt]);

  const [visible, setVisible] = useMergedState(config.visible, false, config.onVisibleChange);

  const shownSrc = isError && fallback ? fallback : src;
  const showPlaceholder = placeholder != null && placeholder !== false && status === "loading";

  const sized = size != null || width != null || height != null;
  const frameFit = fit ?? (size != null || height != null ? "cover" : undefined);
  const frame = sized
    ? {
        "data-sized": "",
        "data-size": size,
        style: {
          ...(width != null ? { "--image-inline-size": cssLength(width) } : null),
          ...(height != null ? { "--image-block-size": cssLength(height) } : null),
        } as React.CSSProperties,
      }
    : null;

  const picture = (
    <>
      <img
        {...imgProps}
        width={width}
        height={height}
        ref={setImgRef}
        data-slot="image-img"
        data-fit={frameFit}
        className="ui-image-img"
        src={shownSrc}
        alt={alt}
        onLoad={(event) => {
          setStatus("loaded");
          onLoad?.(event);
        }}
        onError={(event) => {
          setStatus("error");
          onError?.(event);
        }}
      />
      {showPlaceholder ? (
        <span data-slot="image-placeholder" className="ui-image-placeholder" aria-hidden="true">
          {placeholder === true ? null : placeholder}
        </span>
      ) : null}
    </>
  );

  const withCaption = (image: React.ReactNode) =>
    caption == null ? (
      image
    ) : (
      <figure data-slot="image-tile" className="ui-image-tile" {...frame}>
        {image}
        <figcaption data-slot="image-caption" className="ui-image-caption">
          {caption}
        </figcaption>
      </figure>
    );

  if (!canPreview) {
    return withCaption(
      <span
        ref={wrapperRef}
        data-slot="image"
        data-status={status}
        {...frame}
        className={cn("ui-image", className)}
      >
        {picture}
      </span>,
    );
  }

  return withCaption(
    <>
      <button
        ref={(node) => {
          wrapperRef.current = node;
        }}
        type="button"
        data-slot="image"
        data-status={status}
        data-preview=""
        {...frame}
        className={cn("ui-image ui-focus-ring", className)}
        aria-label={
          alt ? t("dataDisplay.image.previewLabel", { alt }) : t("dataDisplay.image.previewUnnamed")
        }
        aria-haspopup="dialog"
        onClick={() => (inGroup && group ? group.open(id) : setVisible(true))}
      >
        {picture}
        <span data-slot="image-mask" className="ui-image-mask" aria-hidden="true">
          {config.mask ?? (
            <>
              <Eye className="ui-image-mask-icon" />
              {t("dataDisplay.image.preview")}
            </>
          )}
        </span>
      </button>
      {inGroup ? null : (
        <ImagePreviewDialog
          open={visible}
          onOpenChange={setVisible}
          items={[{ src: previewSrc, alt }]}
          current={0}
          onCurrentChange={() => undefined}
          fallback={fallback}
          scaleStep={config.scaleStep}
          minScale={config.minScale}
          maxScale={config.maxScale}
        />
      )}
    </>,
  );
});
ImageRoot.displayName = "Image";

/** antd's `width`/`height`: a number is px, a string is any CSS length. */
function cssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

/** `ImagePreviewGroup` is also reachable as `Image.PreviewGroup`, the antd spelling. */
export const Image = Object.assign(ImageRoot, { PreviewGroup: ImagePreviewGroup });
