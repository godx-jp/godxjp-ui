import { cn } from "../../lib/utils";
import type { TopbarProp } from "../../props/components/layout.prop";

export type { TopbarProp, TopbarProp as TopbarProps } from "../../props/components/layout.prop";

/**
 * Topbar — a PURE SLOT bar. It positions three clusters (`start` / `center` / `end`) and owns the
 * bar's flex layout; it does NOT bake any chrome.
 */
export function Topbar({ start, center, end, className, children, ...props }: TopbarProp) {
  return (
    <div data-slot="topbar" className={cn("ui-topbar", className)} {...props}>
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
