import * as React from "react";

import type { BannerProp } from "../../props/components/feedback.prop";
import { AlertActions, AlertBase, AlertContent, AlertDescription, AlertTitle } from "./alert";

export type { BannerProp, BannerProp as BannerProps } from "../../props/components/feedback.prop";

/**
 * Banner — the full-bleed page/shell attention strip (subscription past-due, active support
 * session, maintenance notice). Compose text and CTAs with `Banner.Title` / `Banner.Description` /
 * `Banner.Content` / `Banner.Actions` — below the 640px step the actions drop onto their own
 * full-width wrapping line, so a 390px viewport wraps instead of clipping.
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
