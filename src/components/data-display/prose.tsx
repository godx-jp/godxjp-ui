import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { ProseProp } from "../../props/components/data-display.prop";
import { ImagePreviewGroup } from "./image";

export type { ProseProp, ProseProp as ProseProps };

/** A body image `imagePreview` can open: not a link's, and not already a kit `Image`. */
const PREVIEWABLE = "img:not(a img):not(button img):not(.ui-image-img)";
const PREVIEWING = '[data-slot="prose"][data-image-preview]';

/**
 * An image belongs to the NEAREST previewing Prose (gh#1152). A Prose nested in another — an
 * embed — owns its own images: the outer one neither marks them nor pages through them.
 */
const ownedBy = (host: Element, img: Element) => img.closest(PREVIEWING) === host;

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
        if (img.hasAttribute("data-prose-preview") || !ownedBy(host, img)) continue;
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

  // An inner Prose that handled the event marks it handled; an outer one then stays out (gh#1152).
  const open = (event: React.SyntheticEvent) => {
    const target = event.target;
    if (!imagePreview || event.defaultPrevented || !(target instanceof HTMLImageElement)) {
      return false;
    }
    const host = root.current!;
    if (!target.hasAttribute("data-prose-preview") || !ownedBy(host, target)) return false;
    event.preventDefault();
    const images = [...host.querySelectorAll<HTMLImageElement>("img[data-prose-preview]")].filter(
      (img) => ownedBy(host, img),
    );
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
      data-image-preview={imagePreview ? "" : undefined}
      className={cn("ui-prose", className)}
      onClick={(event) => {
        onClick?.(event);
        open(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Enter" || event.key === " ") open(event);
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
