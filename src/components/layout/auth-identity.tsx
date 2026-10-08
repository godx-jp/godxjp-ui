import { Clock } from "lucide-react";
import { isValidElement } from "react";

import { useAppPreset } from "../../app/preset";
import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";
// The typography module directly, not the `../general` barrel: the barrel also re-exports `Logo`,
// and with it the GoDX artwork this block must not pull into a neutral bundle (gh#1220).
import { Heading, Text } from "../general/typography";
import type { AuthIdentityProp } from "../../props/components/layout.prop";

export type { AuthIdentityProp } from "../../props/components/layout.prop";
export type { AuthIdentityProp as AuthIdentityProps } from "../../props/components/layout.prop";

/** Canonical hosted-identity mark, heading and optional real requesting-client context. */
export function AuthIdentity({ title, brand, requester, className }: AuthIdentityProp) {
  /*
   * NO ARTWORK BY DEFAULT (v32, gh#1220). An omitted `brand` takes the active preset's mark
   * (`<AppProvider preset>` — the GoDX preset supplies the GoDX mark) and otherwise renders
   * nothing: a neutral package draws no product's logo. `null` is an explicit "no mark", preset
   * or not.
   */
  const presetMark = useAppPreset()?.brandMark;
  const mark = brand === undefined ? presetMark : brand;
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
    mark === undefined || mark === null || mark === false ? null : isValidElement(mark) ? (
      <Slot aria-hidden="true">{mark}</Slot>
    ) : (
      <span aria-hidden="true">{mark}</span>
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
