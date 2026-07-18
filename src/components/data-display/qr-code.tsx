import * as React from "react";
import { QRCodeSVG } from "qrcode.react";

import type { QrCodeProp } from "../../props/components/data-display.prop";
import { cn } from "../../lib/utils";

export type QrCodeProps = QrCodeProp &
  Omit<
    React.ComponentPropsWithoutRef<"svg">,
    keyof QrCodeProp | "children" | "role" | "style" | "type"
  >;

const QR_INTRINSIC_SIZE = 256;

/**
 * Renders a QR code entirely in-process. The encoded value is never sent to a network service,
 * written to an element attribute, or included in accessible text.
 */
export const QrCode = React.forwardRef<SVGSVGElement, QrCodeProps>(
  ({ value, label, size = "md", className, ...props }, ref) => {
    return (
      <QRCodeSVG
        ref={ref}
        {...props}
        value={value}
        title={label}
        size={QR_INTRINSIC_SIZE}
        level="M"
        boostLevel
        marginSize={4}
        bgColor="hsl(var(--qr-code-background))"
        fgColor="hsl(var(--qr-code-foreground))"
        role="img"
        aria-label={label}
        focusable="false"
        data-slot="qr-code"
        data-size={size}
        className={cn("ui-qr-code", className)}
      />
    );
  },
);

QrCode.displayName = "QrCode";
