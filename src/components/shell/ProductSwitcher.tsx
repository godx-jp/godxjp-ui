import * as Popover from "@radix-ui/react-popover";
import { Check, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PRODUCTS, type ForgeProduct } from "../../data/products";
import { cn } from "../../primitives/cn";

// ProductSwitcher — wraps a trigger (the product chip in the topbar)
// with a Radix Popover that lists every product the user can see.
// Search filters by name/role; selecting a row fires `onSelect`.
//
// Mirrors the design prototype's product dropdown (chats: "Linear-style
// quick switcher"). Active product gets a ✓ marker. Per MUST RULE #12
// this is the ONLY product switcher in the system — every service
// reuses it.
export interface ProductSwitcherProps {
  trigger: ReactNode;
  activeId: string;
  products?: ForgeProduct[];
  onSelect: (product: ForgeProduct) => void;
  /** Controlled-open API. Omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductSwitcher({
  trigger,
  activeId,
  products = PRODUCTS,
  onSelect,
  open,
  onOpenChange,
}: ProductSwitcherProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q),
      )
    : products;

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="sw-pop"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="sw-pop-search">
            <Search size={14} className="text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("shell.searchProducts")}
              className="flex-1 bg-transparent outline-none"
            />
            <kbd className="kbd">esc</kbd>
          </div>

          <div className="sw-pop-list">
            <div className="sw-pop-section">
              <span>
                {t("nav.products")} · {filtered.length}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="sw-pop-empty">—</div>
            ) : (
              filtered.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={cn("sw-pop-item w-full text-left")}
                    data-active={isActive}
                    onClick={() => {
                      onSelect(p);
                      setQuery("");
                    }}
                  >
                    <span
                      className="sb-logo-mark"
                      style={{ background: p.color }}
                    >
                      {p.name[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {p.role}
                      </span>
                    </div>
                    <span className="sw-pop-item-meta">
                      {p.projects.length} · {p.devs}
                    </span>
                    {isActive && <Check size={12} className="text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
