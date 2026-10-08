import * as React from "react";

import { useTranslation } from "../i18n/use-translation";
import { cn } from "../lib/utils";
import type { PageCoverProp } from "../props/components/layout.prop";

export type {
  PageCoverProp,
  PageCoverProp as PageCoverProps,
} from "../props/components/layout.prop";

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

/**
 * PageCover (gh#1160) — a page's cover image: Notion's banner across the top, or note.com's
 * eyecatch in the reading column (`variant="eyecatch"`, ~1.91:1, rounded). Put it in
 * `PageContainer cover`, which places it and lets the page `icon` overlap its bottom edge.
 *
 * The focal point is `positionY` (0 top – 100 bottom), applied as `object-position: 50% y%`.
 * While `repositioning`, the image IS the control: a vertical WAI-ARIA slider that follows a drag
 * (pixels map to percent through the image's real overflow, so the picture tracks the pointer)
 * and the slider keys (arrows ±1, PageUp / PageDown ±10, Home / End); Enter or Escape ends it.
 */
export const PageCover = React.forwardRef<HTMLDivElement, PageCoverProp>(function PageCover(
  {
    src,
    alt,
    positionY = 50,
    onPositionChange,
    repositioning = false,
    onRepositioningChange,
    variant = "banner",
    height = "md",
    actions,
    id,
    className,
  },
  ref,
) {
  const { t } = useTranslation();
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const drag = React.useRef<{ pointer: number; startY: number; startValue: number } | null>(null);
  const y = clamp(positionY);

  // How many pixels the image overflows the frame vertically under `object-fit: cover` — the
  // distance a full 0 → 100 sweep moves it.
  const overflow = () => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image || !image.naturalWidth) return 0;
    const rendered = (frame.clientWidth / image.naturalWidth) * image.naturalHeight;
    return Math.max(0, rendered - frame.clientHeight);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!repositioning) return;
    const step = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1,
      PageUp: 10,
      PageDown: -10,
    }[event.key];
    let next: number | null = null;
    if (step !== undefined) next = clamp(y + step);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;
    else if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      onRepositioningChange?.(false);
      return;
    }
    if (next === null) return;
    event.preventDefault();
    if (next !== y) onPositionChange?.(next);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!repositioning || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, startY: event.clientY, startValue: y };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    const travel = overflow();
    if (travel <= 0) return;
    // Dragging the picture DOWN reveals more of its top, which is a SMALLER y.
    const next = clamp(active.startValue - ((event.clientY - active.startY) / travel) * 100);
    if (next !== y) onPositionChange?.(next);
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer === event.pointerId) drag.current = null;
  };

  const slider = repositioning
    ? {
        role: "slider",
        tabIndex: 0,
        "aria-orientation": "vertical" as const,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": y,
        "aria-valuetext": t("layout.pageCover.valueText", { value: y }),
        "aria-label": t("layout.pageCover.position"),
      }
    : {};

  return (
    <div
      ref={ref}
      id={id}
      data-slot="page-cover"
      data-variant={variant}
      data-height={variant === "banner" ? height : undefined}
      data-repositioning={repositioning ? "" : undefined}
      className={cn("ui-page-cover", className)}
    >
      <div
        ref={frameRef}
        className="ui-page-cover-frame ui-focus-ring"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        {...slider}
      >
        <img
          ref={imageRef}
          className="ui-page-cover-image"
          src={src}
          alt={alt}
          draggable={false}
          style={{ objectPosition: `50% ${y}%` }}
        />
        {repositioning ? (
          <span className="ui-page-cover-hint" aria-hidden="true">
            {t("layout.pageCover.hint")}
          </span>
        ) : null}
      </div>
      {actions != null ? <div className="ui-page-cover-actions">{actions}</div> : null}
    </div>
  );
});
PageCover.displayName = "PageCover";
