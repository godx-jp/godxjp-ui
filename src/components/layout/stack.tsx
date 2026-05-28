import { cn } from "../../lib/utils";
import { stackGapClass } from "../../lib/variants";
import type { StackProp } from "../../props/components/layout.prop";

export type { StackProp, StackProp as StackProps } from "../../props/components/layout.prop";

export function Stack({ gap = "md", className, children, ...props }: StackProp) {
  return (
    <div className={cn(stackGapClass[gap], className)} {...props}>
      {children}
    </div>
  );
}
