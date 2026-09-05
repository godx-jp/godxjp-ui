import * as React from "react";

import { cn } from "../../lib/utils";
import type { ProseProp } from "../../props/components/data-display.prop";

export type { ProseProp, ProseProp as ProseProps };

export const Prose = React.forwardRef<
  HTMLDivElement,
  ProseProp & Omit<React.ComponentPropsWithoutRef<"div">, keyof ProseProp>
>(function Prose({ size = "md", imageSize = "fit", className, children, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="prose"
      data-size={size === "md" ? undefined : size}
      data-image-size={imageSize === "fit" ? undefined : imageSize}
      className={cn("ui-prose", className)}
      {...rest}
    >
      {children}
    </div>
  );
});
