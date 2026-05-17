import { useMemo, type ReactNode } from "react";
import QR from "qrcode";
import { cn } from "../cn";

/**
 * QRCode — render a QR code as inline SVG.
 *
 * Uses the `qrcode` library to compute the matrix (no canvas / no
 * `dangerouslySetInnerHTML`); each dark cell becomes one `<rect>`.
 * Foreground colour defaults to `currentColor` so the QR theme
 * follows the surrounding text colour (cardinal rule 21 — theme
 * axis flows naturally).
 *
 * @example
 *   <QRCode value="https://godx.jp" />
 *   <QRCode value="https://example" size={240} icon={<Logo />} />
 */

export interface QRCodeProps {
  /** Text / URL to encode. */
  value: string;
  /** Output size in pixels. Default 160. */
  size?: number;
  /** Error correction level. Default "M". */
  errorLevel?: "L" | "M" | "Q" | "H";
  /** Foreground colour (defaults to `currentColor` — themeable). */
  color?: string;
  /** Background colour (defaults to `transparent`). */
  bgColor?: string;
  /** Optional icon overlay (logo in the centre). */
  icon?: ReactNode;
  /** Icon size in px. Default = 22% of `size`. */
  iconSize?: number;
  className?: string;
}

export function QRCode({
  value,
  size = 160,
  errorLevel = "M",
  color = "currentColor",
  bgColor = "transparent",
  icon,
  iconSize,
  className,
}: QRCodeProps) {
  const matrix = useMemo(() => {
    try {
      const qr = QR.create(value, { errorCorrectionLevel: errorLevel });
      return qr.modules;
    } catch {
      return null;
    }
  }, [value, errorLevel]);

  if (!matrix) {
    return (
      <span
        className={cn("qrcode", className)}
        style={{ width: size, height: size }}
        aria-label="QR code unavailable"
      />
    );
  }

  const { size: modules, data } = matrix;
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      if (data[y * modules + x]) {
        cells.push({ x, y });
      }
    }
  }

  const overlayPx = iconSize ?? Math.round(size * 0.22);

  return (
    <span
      className={cn("qrcode", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${modules} ${modules}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
        role="img"
        aria-label={value}
      >
        {bgColor !== "transparent" ? (
          <rect width={modules} height={modules} fill={bgColor} />
        ) : null}
        {cells.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x}
            y={cell.y}
            width={1}
            height={1}
            fill={color}
          />
        ))}
      </svg>
      {icon !== undefined ? (
        <span
          className="qrcode-icon"
          style={{ width: overlayPx, height: overlayPx }}
        >
          {icon}
        </span>
      ) : null}
    </span>
  );
}
