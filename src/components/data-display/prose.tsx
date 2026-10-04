import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { ProseProp } from "../../props/components/data-display.prop";
import { ImagePreviewGroup } from "./image";

export type { ProseProp, ProseProp as ProseProps };

/** A body image `imagePreview` can open: not a link's, and not already a kit `Image`. */
const PREVIEWABLE = "img:not(a img):not(button img):not(.ui-image-img)";

/**
 * `imagePreview` marks every previewable image as the control it now is — reachable by Tab, named,
 * announced as opening a dialog — and keeps marking images a later render adds. The body's HTML is
 * not ours to wrap in a `<button>` (it is a host renderer's output), so the image itself carries
 * the button semantics, and the label says what it opens.
 */
function useMarkedImages(
  root: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  label: (alt: string) => string,
) {
  React.useLayoutEffect(() => {
    const host = root.current;
    if (!enabled || !host) return undefined;
    const mark = () => {
      for (const img of host.querySelectorAll<HTMLImageElement>(PREVIEWABLE)) {
        if (img.hasAttribute("data-prose-preview")) continue;
        img.setAttribute("data-prose-preview", "");
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-haspopup", "dialog");
        img.setAttribute("aria-label", label(img.alt));
      }
    };
    mark();
    const observer = new MutationObserver(mark);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root, enabled, label]);
}

export const Prose = React.forwardRef<
  HTMLDivElement,
  ProseProp & Omit<React.ComponentPropsWithoutRef<"div">, keyof ProseProp>
>(function Prose(
  {
    size = "md",
    imageSize = "fit",
    measure,
    imagePreview = false,
    className,
    children,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const { t } = useTranslation();
  const root = React.useRef<HTMLDivElement | null>(null);
  const [preview, setPreview] = React.useState<{
    items: { src: string; alt: string }[];
    current: number;
  } | null>(null);
  const label = React.useCallback(
    (alt: string) =>
      alt ? t("dataDisplay.image.previewLabel", { alt }) : t("dataDisplay.image.previewUnnamed"),
    [t],
  );
  useMarkedImages(root, imagePreview, label);

  const open = (target: EventTarget) => {
    if (!imagePreview || !(target instanceof HTMLImageElement)) return false;
    if (!target.hasAttribute("data-prose-preview")) return false;
    const images = [...root.current!.querySelectorAll<HTMLImageElement>("img[data-prose-preview]")];
    setPreview({
      items: images.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })),
      current: Math.max(images.indexOf(target), 0),
    });
    return true;
  };

  const body = (
    <div
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="prose"
      data-size={size === "md" ? undefined : size}
      data-image-size={imageSize === "fit" ? undefined : imageSize}
      data-measure={measure}
      className={cn("ui-prose", className)}
      onClick={(event) => {
        onClick?.(event);
        open(event.target);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if ((event.key === "Enter" || event.key === " ") && open(event.target)) {
          event.preventDefault();
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );

  if (!imagePreview) return body;
  // The group sits BESIDE the body, not around it: a kit `Image` in the body keeps its own preview
  // instead of registering into a group whose explicit list does not contain it.
  return (
    <>
      {body}
      <ImagePreviewGroup
        items={preview?.items ?? []}
        preview={{
          visible: preview !== null,
          onVisibleChange: (visible) => {
            if (!visible) setPreview(null);
          },
          current: preview?.current ?? 0,
          onChange: (current) => setPreview((p) => (p ? { ...p, current } : p)),
        }}
      />
    </>
  );
});
