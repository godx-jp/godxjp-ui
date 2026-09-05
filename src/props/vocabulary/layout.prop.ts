/**
 * Layout & spacing prop types.
 * @see docs/PROPS-VOCABULARY.md#layout--density
 */

/** Page-level density — affects padding, control heights across PageContainer subtree. */
export type PageDensityProp = "compact" | "default" | "comfortable";

/** Shared page/subtree density vocabulary. */
export type DensityProp = "compact" | "default" | "comfortable";

/** Page shell layout — orthogonal to PageDensityProp. */
export type PageContainerVariantProp = "default" | "narrow" | "flush" | "ghost";

/** CenteredShell content-column max-width tier — sm ~32rem, md ~46rem, lg ~64rem. */
export type CenteredShellWidthProp = "sm" | "md" | "lg";

/**
 * CenteredShell content-column BLOCK alignment inside the viewport-height shell.
 * `"start"` (default) keeps the top-aligned flowing/scrolling page shape; `"center"` centres the
 * column in the viewport for a SYSTEM-level standalone surface (a 500/503 error page, a
 * maintenance notice) — the geometry stays package-owned, so no consumer `min-h-dvh` / flex CSS.
 */
export type CenteredShellAlignProp = "start" | "center";

/**
 * ErrorSurface shell contract — WHERE the exception surface lives, not how it looks.
 * `"application"` (403 / 404): the failure happened INSIDE the authenticated app, so the surface
 * is the page BODY of the `AppShell` the route already renders.
 */
export type ErrorSurfaceModeProp = "application" | "system";

/**
 * The HTTP status an ErrorSurface presents. Deliberately closed to the five exception pages every
 * app ships (RFC 9110 §15.5.1 / §15.5.4 / §15.5.5 / §15.6.1 / §15.6.4); it drives the default
 * icon, tone and the recommended `mode`.
 */
/** Five curated statuses carry their own glyph and tone; any other HTTP status renders with a class-based fallback (4xx warning, 5xx destructive). */
export type ErrorSurfaceStatusProp = 400 | 403 | 404 | 500 | 503 | (number & {});

/**
 * AuthShell named flow preset — the page MEASURE contract for a canonical hosted-identity flow
 * (card max-width plus the desktop and mobile page gutters), owned by component tokens.
 * `"default"` keeps the shell's own measure; `"login"` owns SCR-001's stable card anchor for
 * standalone and requester flows; `"device-authorization"` is the 380px device-grant measure with
 * a 5px mobile inline gutter; `"context-selection"` is the 25rem organisation/context picker
 * measure that goes edge-to-edge on mobile; `"account-recovery"` is the 432px SCR-008 measure
 * shared by the password-recovery and sign-in MFA challenge panels (15px mobile inline gutter);
 * `"registration"` is the 360px sign-up measure — start-aligned like `"login"`, because a
 * registration card is the tallest surface in the set and a centred tall card overflows above the
 * scroll origin, and the only preset with a footer-clearance knob of its own.
 */
export type AuthShellPresetProp =
  | "default"
  | "login"
  | "registration"
  | "device-authorization"
  | "context-selection"
  | "account-recovery";

/** Shared gap between layout children; components may document subsets. */
export type GapProp = "xs" | "sm" | "md" | "lg" | "xl";

/** DataTable row density subset. */
export type TableDensityProp = Exclude<DensityProp, "default">;

/**
 * CenteredShell named page preset — the token-owned SHELL geometry of a whole page shape.
 * `"default"` keeps the shell's own box (and emits no attribute at all, so it can match no rule).
 */
export type CenteredShellPresetProp = "default" | "public-landing";

/**
 * `"horizontal"` (the default everywhere) runs along the INLINE axis, `"vertical"` along the BLOCK
 * axis, so both flip correctly under `dir="rtl"` with no per-component rule.
 */
export type OrientationProp = "horizontal" | "vertical";
