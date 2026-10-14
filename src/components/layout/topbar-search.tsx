import * as React from "react";
import { Search, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { SearchInput } from "../data-entry/search-input";
import { TopbarItem } from "./topbar-item";
import type { TopbarSearchProp } from "../../props/components/layout.prop";

export type {
  TopbarSearchProp,
  TopbarSearchProp as TopbarSearchProps,
} from "../../props/components/layout.prop";

/**
 * TopbarSearch — the bar's search box, folded to a named search cell below `collapseBelow` (ADR C02).
 *
 * WAI-ARIA APG disclosure: the cell is a button with `aria-expanded` / `aria-controls`; the panel it
 * shows holds the ONE `SearchInput` this component renders. Which of the two is on screen is decided
 * by CSS at the step (`data-collapse-below`), not by a media-query hook, so SSR and the first client
 * paint agree and the field keeps its value across a resize.
 */
export function TopbarSearch({ collapseBelow = "sm", className, ...props }: TopbarSearchProp) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const pressedInside = React.useRef(false);
  const panelId = React.useId();
  const name = props.ariaLabel ?? t("common.search");

  React.useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  return (
    <div
      data-slot="topbar-search"
      data-collapse-below={collapseBelow}
      data-open={open ? "true" : undefined}
      className={cn("ui-topbar-search", className)}
    >
      <TopbarItem
        ref={triggerRef}
        className="ui-topbar-search-trigger"
        aria-label={name}
        aria-expanded={open}
        aria-controls={panelId}
        icon={<Search aria-hidden="true" />}
        onClick={() => setOpen(true)}
      />
      <div
        ref={panelRef}
        id={panelId}
        className="ui-topbar-search-panel"
        onKeyDown={(event) => {
          if (open && event.key === "Escape" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            close(true);
          }
        }}
        // Safari does not focus a clicked <button>, so a tap on the field's ✕ blurs with a null
        // `relatedTarget`; a pointer press inside the panel is therefore never a reason to fold it.
        onPointerDownCapture={() => {
          pressedInside.current = true;
          setTimeout(() => {
            pressedInside.current = false;
          });
        }}
        onBlur={(event) => {
          // Focus moving to something outside the open field folds it; the focus stays where it went.
          if (
            open &&
            !pressedInside.current &&
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            close(false);
          }
        }}
      >
        <SearchInput {...props} />
        <TopbarItem
          className="ui-topbar-search-close"
          aria-label={t("layout.topbar.closeSearch")}
          icon={<X aria-hidden="true" />}
          onClick={() => close(true)}
        />
      </div>
    </div>
  );
}
