import {
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../cn";

/**
 * Image — `<img>` element with optional click-to-preview lightbox.
 *
 * Default opens a fullscreen overlay on click; Esc + outside-click +
 * the corner × button all close it. Loading / error states render
 * via the `placeholder` / `fallback` slots (skeleton-styled by
 * default through the canonical `.image-wrap` class chain in
 * `src/styles/shell/35-badge-tag-misc.css`).
 *
 * @example
 *   <Image src="/photo.jpg" alt="Sunset" fit="cover" preview />
 */

export interface ImageProps extends Omit<ComponentProps<"img">, "loading"> {
  src: string;
  alt: string;
  /** Click → fullscreen preview overlay. Default true. */
  preview?: boolean;
  /** Loading placeholder (default: skeleton block). */
  placeholder?: ReactNode;
  /** Fallback when src fails to load. */
  fallback?: ReactNode;
  /** Eager / lazy loading. Default "lazy". */
  loadStrategy?: "eager" | "lazy";
  /** Object-fit. Default "cover". */
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  className?: string;
  style?: CSSProperties;
}

export function Image({
  src,
  alt,
  preview = true,
  placeholder,
  fallback,
  loadStrategy = "lazy",
  fit = "cover",
  className,
  style,
  onClick,
  onLoad,
  onError,
  ...rest
}: ImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [open, setOpen] = useState(false);

  const handleLoad: ComponentProps<"img">["onLoad"] = (event) => {
    setStatus("loaded");
    onLoad?.(event);
  };
  const handleError: ComponentProps<"img">["onError"] = (event) => {
    setStatus("error");
    onError?.(event);
  };

  const handleClick: ComponentProps<"img">["onClick"] = (event) => {
    onClick?.(event);
    if (preview && status === "loaded") {
      setOpen(true);
    }
  };

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const showFallback = status === "error" && fallback !== undefined;
  const showPlaceholder = status === "loading" && placeholder !== undefined;

  return (
    <>
      <span
        className={cn("image-wrap", className)}
        data-preview={preview ? "true" : "false"}
        data-status={status}
        style={style}
      >
        {showPlaceholder ? <span className="image-placeholder">{placeholder}</span> : null}
        {showFallback ? (
          <span className="image-fallback">{fallback}</span>
        ) : (
          <img
            src={src}
            alt={alt}
            loading={loadStrategy}
            style={{ objectFit: fit }}
            onLoad={handleLoad}
            onError={handleError}
            onClick={handleClick}
            {...rest}
          />
        )}
      </span>
      {open ? (
        <div
          className="image-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={close}
        >
          <img
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            className="image-preview-close"
            aria-label="Close preview"
            onClick={close}
          >
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
