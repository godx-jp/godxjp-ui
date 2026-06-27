import { cn } from "../../lib/utils";
import type { TopbarProp } from "../../props/components/layout.prop";

export type { TopbarProp, TopbarProp as TopbarProps } from "../../props/components/layout.prop";

/**
 * Topbar — a PURE SLOT bar. It positions three clusters (`start` / `center` / `end`) and owns the
 * bar's flex layout; it does NOT bake any chrome. There is no built-in product switcher, search
 * box, notification bell, or language picker — the CONSUMER composes those from real primitives
 * (a brand mark `Avatar`, a `Button` search trigger, `AppSettingPicker` for locale/theme, a
 * `DropdownMenu` user menu) and drops them into a slot. Whether a control is icon-only, labelled,
 * bordered, etc. is that control's OWN configuration — never the shell's to dictate.
 *
 *   <Topbar
 *     start={<><SidebarToggle /><Avatar className="rounded-md"><AvatarFallback>C</AvatarFallback></Avatar></>}
 *     center={<Button variant="outline" onClick={openSearch}><Search />検索</Button>}
 *     end={<><AppSettingPicker kind="locale" /><UserMenu /></>}
 *   />
 *
 * Use it as `AppShell`'s `topbar` slot, or place it directly. For full custom content, pass
 * `children` instead of the three slots.
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
