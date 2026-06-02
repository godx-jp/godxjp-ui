import { cn } from "../../lib/utils";
import { flexGapClass } from "../../lib/variants";
import type { FlexProp } from "../../props/components/layout.prop";

export type {
  FlexAlignProp,
  FlexDirectionProp,
  FlexJustifyProp,
  FlexProp,
  FlexProp as FlexProps,
} from "../../props/components/layout.prop";

export function Flex({
  direction = "col",
  gap = "md",
  align,
  justify,
  wrap = false,
  className,
  children,
  ...props
}: FlexProp) {
  return (
    <div
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? "true" : undefined}
      className={cn("ui-flex", flexGapClass[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}
