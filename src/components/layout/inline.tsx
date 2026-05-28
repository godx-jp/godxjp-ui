import { cn } from "../../lib/utils";
import { inlineGapClass } from "../../lib/variants";
import type { InlineProp } from "../../props/components/layout.prop";

export type { InlineProp, InlineProp as InlineProps } from "../../props/components/layout.prop";

export function Inline({ gap = "sm", className, children, ...props }: InlineProp) {
  return (
    <div className={cn(inlineGapClass[gap], className)} {...props}>
      {children}
    </div>
  );
}
