import * as React from "react";
import { Info, Lightbulb, MessageSquareWarning, OctagonAlert, TriangleAlert } from "lucide-react";

import type { CalloutKindProp, IconProp, ToneProp } from "../../props/vocabulary";
import type { CalloutProp } from "../../props/components/feedback.prop";
import { AlertActions, AlertBase, AlertContent, AlertDescription, AlertTitle } from "./alert";

export type {
  CalloutProp,
  CalloutProp as CalloutProps,
} from "../../props/components/feedback.prop";

/**
 * The five admonitions GitHub documents (`> [!NOTE]` … `[!CAUTION]`), which Obsidian's lower-case
 * spelling maps onto one-for-one. Each resolves a `tone` and a glyph, and each is still overridable
 * per instance — `kind` is a preset, not a second colour axis.
 *
 * `important` takes the NEUTRAL tone on purpose: GitHub paints it purple, this system has no purple
 * role, and borrowing `info` would make it indistinguishable from `note`. Its glyph carries the
 * difference instead, which is also what keeps the set readable without colour (WCAG 1.4.1).
 */
const KINDS: Record<CalloutKindProp, { tone: ToneProp; icon: IconProp }> = {
  note: { tone: "info", icon: Info },
  tip: { tone: "success", icon: Lightbulb },
  important: { tone: "neutral", icon: MessageSquareWarning },
  warning: { tone: "warning", icon: TriangleAlert },
  caution: { tone: "destructive", icon: OctagonAlert },
};

/**
 * Callout — the aside that sits INSIDE a document body: a docs admonition, a CMS "note" block, a
 * GitHub/Obsidian `> [!NOTE]`. Compose copy with `Callout.Title` / `Callout.Description`.
 *
 * WHY THIS IS NOT `Alert` (gh#765). `Alert` is a live region by design — its tone picks
 * `role="alert"` or `role="status"`, so a wiki page with three of them announces all three on
 * load. That is right for an UPDATE to the page and wrong for part of the page. Consumers were
 * reaching for `Alert` and then passing `role="note"` to switch the announcement back off, which
 * worked only because `{...props}` happens to be spread after `role` — an ordering the package
 * never promised, and one refactor away from silently restoring the live region.
 *
 * So the non-live presentation is a NAMED value of the structural axis, exactly as `Banner` is:
 * one primitive, one tone system, one set of slots, three presentations. `role="note"` now comes
 * from what the component IS, not from what the consumer remembered to pass.
 */
const CalloutBase = React.forwardRef<HTMLDivElement, CalloutProp>(
  ({ kind = "note", tone, icon, ...props }, ref) => {
    const preset = KINDS[kind];
    return (
      // `variant` sits AFTER the spread, as on Banner: the type already excludes it, and the
      // runtime half of the same guarantee means a spread of leftover Alert props can never
      // silently turn this aside back into a live region.
      <AlertBase
        ref={ref}
        tone={tone ?? preset.tone}
        icon={icon ?? preset.icon}
        {...props}
        variant="callout"
      />
    );
  },
);
CalloutBase.displayName = "Callout";

export const Callout = Object.assign(CalloutBase, {
  Title: AlertTitle,
  Content: AlertContent,
  Description: AlertDescription,
  Actions: AlertActions,
});
