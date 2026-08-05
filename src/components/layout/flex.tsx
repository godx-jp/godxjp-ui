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
  direction = "row",
  gap = "md",
  align,
  justify,
  wrap = false,
  hideBelow,
  hideFrom,
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
      // Omitted when unset, so an unconfigured Flex matches no responsive rule at all (gh#231
      // inert-default contract) — the stylesheet has no `[data-hide-below]`-less selector.
      data-hide-below={hideBelow}
      data-hide-from={hideFrom}
      className={cn("ui-flex", flexGapClass[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}
