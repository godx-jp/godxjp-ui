import * as React from "react";

import { cn } from "../../lib/utils";
import type { ThumbnailProp } from "../../props/components/data-display.prop";

export type {
  ThumbnailProp,
  ThumbnailProp as ThumbnailProps,
  ThumbnailSizeProp,
} from "../../props/components/data-display.prop";

/**
 * Thumbnail — a framed picture at a FIXED HEIGHT and its OWN intrinsic width.
 *
 * That combination is the whole component. A wrapping row of screenshots holds portrait and
 * landscape shots together; equal heights make the row read as one strip, and letting each
 * width follow its own ratio is what keeps every shot uncropped.
 *
 * ## Why not the four components it is mistaken for
 *
 * - **`AspectRatio`** constrains a RATIO and spans `width: 100%`. Two different intrinsic ratios
 *   in one row can only be forced into one number by letterboxing or cropping them, which is the
 *   opposite of the requirement. It also draws no frame.
 * - **`Avatar`** is an identity mark (with initials fallback), not a picture.
 * - **`Card`** puts padding between its edge and the picture. The frame here is ON the image.
 * - **`CardCover`** is the full-bleed media slot INSIDE a Card, not a standalone thumbnail.
 *
 * ## The frame is on the `<img>` itself
 *
 * No wrapper element. A wrapper would have to be told the image's width to hug it, which is
 * exactly the number nobody has until the picture loads; a border on the replaced element is
 * flush by construction at every ratio.
 *
 * ## Reserve the width before the picture arrives
 *
 * With an intrinsic width there is nothing to lay out until the bytes land, so a row of these
 * reflows as they load. Pass the file's real pixel `width` and `height` attributes — the browser
 * derives the ratio from them, and with the block size already fixed the frame takes its final
 * width on the first paint (`<Thumbnail width={1280} height={800} … />`).
 */
export const Thumbnail = React.forwardRef<HTMLImageElement, ThumbnailProp>(
  ({ size = "md", className, alt, ...props }, ref) => (
    <img
      ref={ref}
      data-slot="thumbnail"
      data-size={size}
      alt={alt}
      className={cn("ui-thumbnail", className)}
      {...props}
    />
  ),
);
Thumbnail.displayName = "Thumbnail";
