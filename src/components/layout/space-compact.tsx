import type { JSX } from "react";

import { mergeAriaIds } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";

import type { SpaceCompactProp } from "../../props/components/layout.prop";

export type {
  SpaceCompactProp,
  SpaceCompactProp as SpaceCompactProps,
} from "../../props/components/layout.prop";

/**
 * SpaceCompact — antd `Space.Compact`: weld a row of controls into one visual unit.
 *
 * A plain `<div>`, matching antd's own DOM (no ARIA role by default — each child keeps its own
 * accessible name; this is a visual join, not a semantic group, exactly like antd's
 * `Space.Compact`). The corner radii and shared border seam are zeroed/collapsed in CSS — the
 * "not expressible from primitives + tokens" case `docs/roadmap/parity-audit-layout-navigation-
 * general.md` §4.1 describes: doing this at the call site would need `[&>*:not(:first-child)]`
 * utilities, which `ui-audit`'s `no-utility-layout` rule blocks.
 *
 * ## ONE label for the pair (`FormField` wrapping a `SpaceCompact`)
 *
 * `FormField` lands its label contract on its single direct child (`docs/FORMS.md`). Cloned
 * `aria-label`/`aria-labelledby` onto a role-less `<div>` would be inert (axe `aria-allowed-attr`
 * disagrees, and no AT reads a name off a generic element) — so, like `Flex` (which `FormField`
 * already lands on for a range/`年/月` pair), a NAMED `SpaceCompact` with no explicit `role`
 * becomes `role="group"` and keeps only the aria a group allows: `aria-errormessage` folds
 * into `aria-describedby`, and the widget-only `aria-required`/`aria-invalid` are dropped. Pass an
 * explicit `role` to opt out and own the attribute set yourself.
 *
 * NOT quite "exactly like `Flex`" any more: since gh#916 `Flex` skips that promotion when its `as`
 * renders an element that already has a role (`ul`, `ol`, `li`), because a name should improve
 * such a role rather than replace it. This component always renders a `<div>`, which has no role
 * to lose, so the promotion is unconditional here and the two agree on every case `Flex` still
 * promotes.
 *
 * ## `orientation="vertical"` — a written-down partial port
 *
 * Layout (column stacking, border collapse) works on both axes. Corner-zeroing currently only
 * covers the INLINE seam (`orientation="horizontal"`, the default and the only axis the shipping
 * use case needs): it reads the same `--input-radius-start`/`--input-radius-end` and
 * `--control-trigger-radius-start`/`--control-trigger-radius-end` knobs the Input and trigger
 * families already expose, and both pairs are inline-only. A BLOCK-axis pair does not exist on
 * either family yet, so a vertical stack collapses its shared border but each child keeps all
 * four of its own corners rounded. Follow-up, not a silent gap.
 */
export function SpaceCompact({
  children,
  orientation,
  vertical,
  fullWidth,
  density,
  className,
  ...props
}: SpaceCompactProp): JSX.Element {
  const resolvedOrientation = orientation ?? (vertical ? "vertical" : "horizontal");

  let domProps = props;
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

  return (
    <div
      data-slot="space-compact"
      data-orientation={resolvedOrientation}
      data-full-width={fullWidth ? "true" : undefined}
      className={cn("ui-space-compact", density && `ui-density-${density}`, className)}
      {...domProps}
    >
      {children}
    </div>
  );
}
SpaceCompact.displayName = "SpaceCompact";
