import type { CSSProperties } from "react";
import { mergeAriaIds } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { flexGapClass, padStyle, padStepToken } from "../../lib/variants";
import type { FlexProp } from "../../props/components/layout.prop";
import type { WidthProp } from "../../props/vocabulary";

const toCssLength = (value: WidthProp): string =>
  typeof value === "number" ? `${value}px` : value;

/**
 * A raw breakpoint only counts once it is a finite number: the value is interpolated into CSS
 * TEXT, so a JS caller (no compiler) handing over a string would otherwise write whatever it
 * likes into the rule. Anything else is treated as absent — the same inert default as an omitted
 * step.
 */
const rawBreakpoint = (value: number | undefined): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/**
 * The one media rule behind ONE raw-breakpoint escape (gh#528).
 *
 * A media query cannot read a custom property, so an off-scale width can only reach CSS as a
 * literal — and the only literal a component can put there at render time is one it prints
 * itself. Keyed by the VALUE, so every Flex asking to fold at 900px shares a single rule (React
 * dedupes by `href`) and the selector can never match a Flex asking for another width.
 *
 * Deliberately UNLAYERED: `.ui-flex { display: flex }` lives in `@layer components`, and an
 * unlayered declaration beats every layered one whatever the specificity — so the escape cannot
 * lose the cascade to the base rule, whichever order the stylesheets happen to land in.
 *
 * The comparisons mirror the token steps exactly (`width <` / `width >=`), which is what makes
 * the pair exact complements at the seam.
 */
const rawBreakpointRule = (axis: "below" | "from", px: number): string =>
  `@media (width ${axis === "below" ? "<" : ">="} ${px}px){.ui-flex[data-hide-${axis}-raw="${px}"]{display:none}}`;

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
  grow,
  shrink,
  surface,
  bleed,
  reveal,
  gap = "md",
  gapRaw,
  pad,
  padRaw,
  align,
  justify,
  wrap = false,
  hideBelow,
  hideFrom,
  hideBelowRaw,
  hideFromRaw,
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
  const belowRaw = rawBreakpoint(hideBelowRaw);
  const fromRaw = rawBreakpoint(hideFromRaw);
  const responsive = typeof direction === "object";
  const axes = responsive ? direction : { base: direction };
  const cssDirection = (axis: string | undefined) => (axis === "col" ? "column" : axis);
  const directionVars = responsive
    ? Object.fromEntries(
        Object.entries(axes).map(([step, axis]) => [
          `--flex-direction-${step}`,
          cssDirection(axis),
        ]),
      )
    : {};
  return (
    <Element
      data-direction={responsive ? "responsive" : direction}
      data-grow={grow ? "" : undefined}
      data-shrink={shrink === false ? "false" : undefined}
      data-surface={surface}
      data-reveal={reveal}
      data-list={Element === "ul" ? "disc" : Element === "ol" ? "decimal" : undefined}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? "true" : undefined}
      // inert-default contract) — the stylesheet has no `[data-hide-below]`-less selector.
      // A raw width WINS over its step, and the step then emits nothing: two rules matching the
      // same element at two different widths is a fold nobody can predict from the call site.
      data-hide-below={belowRaw === undefined ? hideBelow : undefined}
      data-hide-from={fromRaw === undefined ? hideFrom : undefined}
      // Same contract as `data-gap-raw`/`data-pad-raw`: the escape carries its measurement, so
      // every one of them is countable on the DOM. Here it is also the selector the printed rule
      // keys on.
      data-hide-below-raw={belowRaw}
      data-hide-from-raw={fromRaw}
      data-fill={fill ? "" : undefined}
      // Cùng hợp đồng với `gapRaw`/`padRaw`: một số đo cứng ở call site phải ĐẾM ĐƯỢC trên DOM.
      data-width-raw={width === undefined ? undefined : ""}
      // `gapRaw` thắng `gap`, và `gap` thôi phát lớp — hai bên cùng đặt
      // `gap` thì lớp CSS và style nội tuyến sẽ tranh nhau, mà kết quả của
      // cuộc tranh ấy phụ thuộc thứ tự chèn stylesheet, tức không đoán được.
      data-gap-raw={gapRaw}
      className={cn("ui-flex", gapRaw === undefined ? flexGapClass[gap] : undefined, className)}
      data-pad-raw={padRaw === undefined ? undefined : ""}
      style={
        {
          ...style,
          ...directionVars,
          ...(bleed === undefined
            ? undefined
            : { marginInline: `calc(-1 * ${padStepToken(bleed)})` }),
          ...(gapRaw === undefined ? undefined : { gap: `${gapRaw}px` }),
          ...(width === undefined ? undefined : { inlineSize: toCssLength(width) }),
          ...padStyle(pad, padRaw),
        } as CSSProperties
      }
      {...domProps}
    >
      {belowRaw === undefined ? null : (
        <style href={`ui-flex-hide-below-raw-${belowRaw}`} precedence="ui-flex-raw-breakpoint">
          {rawBreakpointRule("below", belowRaw)}
        </style>
      )}
      {fromRaw === undefined ? null : (
        <style href={`ui-flex-hide-from-raw-${fromRaw}`} precedence="ui-flex-raw-breakpoint">
          {rawBreakpointRule("from", fromRaw)}
        </style>
      )}
      {children}
    </Element>
  );
}
