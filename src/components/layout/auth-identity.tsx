import { Clock } from "lucide-react";

import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";
import { Heading, Logo, Text } from "../general";
import type { AuthIdentityProp } from "../../props/components/layout.prop";

export type { AuthIdentityProp } from "../../props/components/layout.prop";
export type { AuthIdentityProp as AuthIdentityProps } from "../../props/components/layout.prop";

/** Canonical hosted-identity mark, heading and optional real requesting-client context. */
export function AuthIdentity({ title, brand, requester, className }: AuthIdentityProp) {
  /*
   * ONE ARTWORK CHILD, ALWAYS — the package mark, or the product's own lockup (gh#652).
   *
   * The block hardcoded `<Logo mark="godx">`, so the first screen a user ever sees was the only
   * surface that could not carry the product lockup. `brand` is that opening, and it takes the
   * PAINTED HEADING with it: the canonical identity is the mark plus an `h1` that is itself the
   * product name (`title="GoDX ID"`), so a lockup drawing "GoDX | ID" above that heading writes
   * the name twice. The `h1` therefore stays — same element, same level, still named by `title`,
   * still the document outline every auth screen relies on — and only stops being painted.
   *
   * `.sr-only` is `position: absolute`, so the hidden heading is not a flex item and
   * `--auth-identity-gap` still measures artwork → requester exactly as it measured heading →
   * requester. Nothing in `.ui-auth-identity` moves, which matters: a consumer density test pins
   * `.ui-auth-shell-card > .ui-auth-identity`.
   *
   * The lockup is marked DECORATIVE, and `aria-hidden` is merged onto the consumer's own element
   * rather than a wrapper. Both halves are measured, not reasoned about:
   *   · `Logo mark="godx-lockup" productSuffix="ID"` puts "GoDX ID" in the accessibility tree
   *     (gh#649's sr-only logotype + the suffix text). Left exposed beside an `h1` named
   *     "GoDX ID", the block announces "GoDXIDGoDX ID" — twice — against the "GoDX ID" it has
   *     announced since it shipped. The mark was always decorative here; that contract is kept.
   *   · A wrapper `<span aria-hidden>` would be the flex item, putting the `inline-flex` lockup
   *     back on a line box whose strut descender lifts the mark a few px — the defect `Logo`'s
   *     `asChild` prop was added to remove. `Slot` borrows the consumer's element instead, so the
   *     lockup stays the direct flex child it is today.
   */
  const hasBrand = brand !== undefined;
  return (
    <div data-slot="auth-identity" className={cn("ui-auth-identity", className)}>
      {hasBrand ? <Slot aria-hidden="true">{brand}</Slot> : <Logo mark="godx" tone="success" />}
      <Heading level={1} className={hasBrand ? "sr-only" : undefined}>
        {title}
      </Heading>
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
