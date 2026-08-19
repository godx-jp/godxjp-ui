import * as React from "react";

import type { BannerProp } from "../../props/components/feedback.prop";
import { AlertActions, AlertBase, AlertContent, AlertDescription, AlertTitle } from "./alert";

export type { BannerProp, BannerProp as BannerProps } from "../../props/components/feedback.prop";

/**
 * Banner — the full-bleed page/shell attention strip (subscription past-due, active
 * support session, maintenance notice). The canonical DXS `Banner` contract
 * (godxjp-ui#255 / dxs-platform#311).
 *
 * It IS the Alert primitive with the structural axis fixed to `variant="banner"`, so the
 * whole feedback contract comes from one implementation: `tone` drives colour, the default
 * leading icon and live-region politeness (`destructive`/`warning` announce assertively via
 * `role="alert"`, every other tone politely via `role="status"`); `icon`/`icon={false}`
 * overrides or hides the glyph; `onDismiss` renders the built-in localized dismiss button,
 * which sits LAST in DOM/focus order (content → actions → dismiss). Compose text and CTAs
 * with `Banner.Title` / `Banner.Description` / `Banner.Content` / `Banner.Actions` — below
 * the 640px step the actions drop onto their own full-width wrapping line, so a 390px
 * viewport wraps instead of clipping.
 *
 * Geometry is owned by the `--banner-*` component tokens (square corners, hairline
 * block-end rule, strip inset) — a consumer never writes CSS to place one. Persistent,
 * page-scoped, at most one per surface; transient feedback stays with `toast()`.
 */
const BannerBase = React.forwardRef<HTMLDivElement, BannerProp>((props, ref) => (
  // `variant` sits AFTER the spread: the type already excludes it, and the runtime half of the
  // same guarantee means a spread of leftover Alert props can never silently downgrade the strip.
  <AlertBase ref={ref} {...props} variant="banner" />
));
BannerBase.displayName = "Banner";

export const Banner = Object.assign(BannerBase, {
  Title: AlertTitle,
  Content: AlertContent,
  Description: AlertDescription,
  Actions: AlertActions,
});
