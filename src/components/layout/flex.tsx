import { mergeAriaIds } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { flexGapClass, padStyle } from "../../lib/variants";
import type { FlexProp } from "../../props/components/layout.prop";
import type { WidthProp } from "../../props/vocabulary";

const toCssLength = (value: WidthProp): string =>
  typeof value === "number" ? `${value}px` : value;

export type {
  FlexAlignProp,
  FlexDirectionProp,
  FlexJustifyProp,
  FlexProp,
  FlexProp as FlexProps,
} from "../../props/components/layout.prop";

export function Flex({
  as: Element = "div",
  direction = "row",
  gap = "md",
  gapRaw,
  pad,
  padRaw,
  align,
  justify,
  wrap = false,
  hideBelow,
  hideFrom,
  fill = false,
  width,
  className,
  style,
  children,
  ...props
}: FlexProp) {
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
    <Element
      data-direction={direction}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? "true" : undefined}
      // inert-default contract) — the stylesheet has no `[data-hide-below]`-less selector.
      data-hide-below={hideBelow}
      data-hide-from={hideFrom}
      data-fill={fill ? "" : undefined}
      // Cùng hợp đồng với `gapRaw`/`padRaw`: một số đo cứng ở call site phải ĐẾM ĐƯỢC trên DOM.
      data-width-raw={width === undefined ? undefined : ""}
      // `gapRaw` thắng `gap`, và `gap` thôi phát lớp — hai bên cùng đặt
      // `gap` thì lớp CSS và style nội tuyến sẽ tranh nhau, mà kết quả của
      // cuộc tranh ấy phụ thuộc thứ tự chèn stylesheet, tức không đoán được.
      data-gap-raw={gapRaw}
      className={cn("ui-flex", gapRaw === undefined ? flexGapClass[gap] : undefined, className)}
      data-pad-raw={padRaw === undefined ? undefined : ""}
      style={{
        ...style,
        ...(gapRaw === undefined ? undefined : { gap: `${gapRaw}px` }),
        ...(width === undefined ? undefined : { inlineSize: toCssLength(width) }),
        ...padStyle(pad, padRaw),
      }}
      {...domProps}
    >
      {children}
    </Element>
  );
}
