import * as React from "react";
import { cn } from "../../lib/utils";

/** Accessible text without a visible layout box. */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function VisuallyHidden({ className, ...props }, ref) {
  return <span {...props} ref={ref} className={cn("sr-only", className)} />;
});
