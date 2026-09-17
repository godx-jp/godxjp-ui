import { padStyle } from "../../lib/variants";
import { cn } from "../../lib/utils";
import type { TopbarProp } from "../../props/components/layout.prop";

export type { TopbarProp, TopbarProp as TopbarProps } from "../../props/components/layout.prop";

/**
 * Topbar — a PURE SLOT bar. It positions three clusters (`start` / `center` / `end`) and owns the
 * bar's flex layout; it does NOT bake any chrome.
 */
export function Topbar({
  start,
  center,
  end,
  className,
  children,
  height,
  overflow = "scroll",
  pad,
  style,
  ...props
}: TopbarProp) {
  return (
    <div
      data-height={height}
      // The overflow contract, published on the bar (gh#728). Always emitted, including for the
      // default, because "scroll" is what the shipped bar DOES and a consumer reading the DOM —
      // or a gate measuring it — must not have to know which value is the default one.
      data-overflow={overflow}
      style={{ ...style, ...padStyle(pad, undefined) }}
      data-slot="topbar"
      className={cn("ui-topbar", className)}
      {...props}
    >
      {children ?? (
        <>
          {start != null ? (
            <div data-slot="topbar-start" className="ui-topbar-start">
              {start}
            </div>
          ) : null}
          {center != null ? (
            <div data-slot="topbar-center" className="ui-topbar-center">
              {center}
            </div>
          ) : null}
          {end != null ? (
            <div data-slot="topbar-end" className="ui-topbar-end">
              {end}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
