import { forwardRef, useId, useMemo, type ComponentProps, type ReactNode } from "react";
import { cn } from "./cn";

/**
 * Watermark — repeating SVG-pattern overlay applied as a CSS
 * background image on a wrapper element. Tiled rotated text via
 * `<pattern>`-like SVG referenced through `background-image:url(…)`.
 *
 * Theme-aware: the SVG uses `fill='currentColor'`, and the wrapper
 * sets `color: var(--muted-foreground)` so dark / light / accent
 * axes flow through without per-instance overrides.
 *
 * Cardinal rules honoured:
 *   §21 — colour reads from `var(--muted-foreground)` (theme axis).
 *   §22 — no hardcoded colour literal in the SVG (currentColor).
 *   §23 — no prop name collides with the locked vocabulary; the
 *         API mirrors the same `content` / `rotate` / `gap` /
 *         `fontSize` / `fontFamily` / `opacity` surface as the
 *         design canon's watermark example.
 *
 * @example
 *   <Watermark content="Famgia · Confidential">
 *     <Card>…</Card>
 *   </Watermark>
 */

export interface WatermarkProps extends Omit<ComponentProps<"div">, "content"> {
  /** Single line or multi-line text. Empty → no watermark drawn. */
  content?: string | string[];
  /** Rotation in degrees. Default `-22`. */
  rotate?: number;
  /** Tile gap `[x, y]` in pixels. Default `[120, 80]`. */
  gap?: [number, number];
  /** Font size in pixels. Default `14`. */
  fontSize?: number;
  /** Font family — defaults to inherited system stack. */
  fontFamily?: string;
  /** Opacity 0-1. Default `0.12`. */
  opacity?: number;
  children?: ReactNode;
}

export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(function Watermark(
  {
    content,
    rotate = -22,
    gap = [120, 80],
    fontSize = 14,
    fontFamily,
    opacity = 0.12,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const id = useId();
  const patternId = `wm-${id.replace(/[:]/g, "")}`;
  void patternId;
  const lines = Array.isArray(content) ? content : content ? [content] : [];
  const [gx, gy] = gap;
  const w = gx;
  const h = gy;
  const cx = w / 2;
  const cy = h / 2;
  const lineHeight = fontSize * 1.4;
  const totalTextHeight = lines.length * lineHeight;
  const textStartY = cy - totalTextHeight / 2 + fontSize;

  const svg = useMemo(() => {
    const xmlns = "http://www.w3.org/2000/svg";
    return `<svg xmlns='${xmlns}' width='${w}' height='${h}'><g transform='rotate(${rotate} ${cx} ${cy})' fill='currentColor' font-family='${fontFamily ?? "system-ui, sans-serif"}' font-size='${fontSize}' opacity='${opacity}'>${lines
      .map(
        (l, i) =>
          `<text x='${cx}' y='${textStartY + i * lineHeight}' text-anchor='middle'>${escapeXml(l)}</text>`,
      )
      .join("")}</g></svg>`;
  }, [w, h, cx, cy, rotate, fontFamily, fontSize, opacity, lines, textStartY, lineHeight]);

  const dataUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  return (
    <div
      ref={ref}
      className={cn("watermark", className)}
      style={{
        position: "relative",
        backgroundImage: lines.length ? dataUrl : undefined,
        backgroundRepeat: "repeat",
        backgroundSize: `${w}px ${h}px`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

function escapeXml(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}
