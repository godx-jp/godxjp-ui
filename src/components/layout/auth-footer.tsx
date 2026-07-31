import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import type { AuthFooterProp } from "../../props/components/layout.prop";

export type { AuthFooterProp } from "../../props/components/layout.prop";
export type { AuthFooterProp as AuthFooterProps } from "../../props/components/layout.prop";

/** Slot order is the canonical reading order of the legal line; the key is the SLOT, never the index. */
const SLOTS = ["product", "terms", "privacy", "locale"] as const;

/** Canonical mono legal line shared by hosted identity screens. */
export function AuthFooter({ product, terms, privacy, locale, className }: AuthFooterProp) {
  const bySlot: Record<(typeof SLOTS)[number], ReactNode> = { product, terms, privacy, locale };
  const items = SLOTS.filter(
    (slot) => bySlot[slot] !== null && bySlot[slot] !== undefined && bySlot[slot] !== false,
  );

  return (
    <div data-slot="auth-legal-footer" className={cn("ui-auth-legal-footer", className)}>
      {items.map((slot, index) => (
        <span
          key={slot}
          data-slot={`auth-legal-footer-${slot}`}
          className="ui-auth-legal-footer-item"
        >
          {index > 0 ? (
            <span aria-hidden="true" className="ui-auth-legal-footer-separator">
              ·
            </span>
          ) : null}
          {bySlot[slot]}
        </span>
      ))}
    </div>
  );
}
