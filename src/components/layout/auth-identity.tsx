import { Clock } from "lucide-react";
import { isValidElement } from "react";

import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";
import { Heading, Logo, Text } from "../general";
import type { AuthIdentityProp } from "../../props/components/layout.prop";

export type { AuthIdentityProp } from "../../props/components/layout.prop";
export type { AuthIdentityProp as AuthIdentityProps } from "../../props/components/layout.prop";

/** Canonical hosted-identity mark, heading and optional real requesting-client context. */
export function AuthIdentity({ title, brand, requester, className }: AuthIdentityProp) {
  /*
   * THE ARTWORK SLOT IS DECORATIVE, WHATEVER FILLS IT (gh#652).
   *
   * The mark this prop replaces was always out of the accessibility tree — the `h1` names this
   * block, and has since it shipped. A real LOCKUP is not a mark, though:
   * `Logo mark="godx-lockup" productSuffix="ID"` puts "GoDX ID" into the tree as real text
   * (gh#649's sr-only logotype plus the suffix text). Left exposed beside an `h1` named "GoDX ID"
   * the block announces the product TWICE — rendered rather than reasoned about, the announcement
   * measures "GoDXIDGoDX ID". So the slot keeps the contract the mark had.
   *
   * `aria-hidden` is merged ONTO the supplied element rather than onto a wrapper. A wrapper would
   * be the flex item, and an `inline-flex` lockup inside a block box is back on a LINE BOX, whose
   * strut descender lifts the mark a few px — the measured defect `Logo`'s own `asChild` prop
   * exists to remove. `Slot` borrows the consumer's element, so the artwork stays the direct flex
   * child the `<Logo>` is today.
   *
   * `Slot` is `Children.only`, so it is asked only when `brand` IS one element. Anything else —
   * a string, a fragment, an array — has nothing to merge a prop onto and takes the wrapper, which
   * is the degenerate path: the prop doc says to pass an inline `<svg>`, and artwork always is one.
   *
   * The painted `h1` STAYS. A lockup that already draws the product name therefore shows it twice
   * on screen; that half of gh#652 is a separate decision and is deliberately not taken here.
   */
  const artwork =
    brand === undefined || brand === null ? (
      <Logo mark="godx" tone="success" />
    ) : isValidElement(brand) ? (
      <Slot aria-hidden="true">{brand}</Slot>
    ) : (
      <span aria-hidden="true">{brand}</span>
    );

  return (
    <div data-slot="auth-identity" className={cn("ui-auth-identity", className)}>
      {artwork}
      <Heading level={1}>{title}</Heading>
      {requester !== undefined && requester !== null ? (
        <div data-slot="auth-requester" className="ui-auth-requester">
          <span data-slot="auth-requester-icon" className="ui-auth-requester-icon">
            <Clock aria-hidden="true" />
          </span>
          <Text as="span" size="xs" tone="muted">
            {requester}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
