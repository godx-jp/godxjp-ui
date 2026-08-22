import { mergeAriaIds } from "../../lib/field-a11y";
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
  // gh#303 — a bare <div> (no role) must not carry naming attributes (axe: aria-allowed-attr).
  // FormField legitimately lands its contract here when a Flex wraps a composite field (range
  // from/to pair, 年/月 combo), so a NAMED Flex defaults to role="group" — the WAI-ARIA container
  // for exactly that — and keeps only the aria the group role allows: aria-errormessage folds
  // into aria-describedby, and the widget-only aria-required/aria-invalid are dropped (same
  // policy as pickGroupFieldA11y). An explicit `role` prop opts out of ALL of this — the caller
  // then owns the attribute set (e.g. DataTable.BulkActions' role="region").
  let domProps: FlexProp = props;
  if (
    props.role === undefined &&
    (props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined)
  ) {
    const {
      "aria-required": _ariaRequired,
      "aria-invalid": _ariaInvalid,
      "aria-errormessage": ariaErrorMessage,
      ...allowed
    } = props;
    domProps = {
      ...allowed,
      role: "group",
      "aria-describedby": mergeAriaIds(props["aria-describedby"], ariaErrorMessage),
    };
  }
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
      {...domProps}
    >
      {children}
    </div>
  );
}
