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
 * AuthShell named flow preset — the page MEASURE contract for a canonical hosted-identity flow
 * (card max-width plus the desktop and mobile page gutters), owned by component tokens.
 * `"default"` keeps the shell's own measure; `"login"` owns SCR-001's stable card anchor for
 * standalone and requester flows; `"device-authorization"` is the 380px device-grant measure with
 * a 5px mobile inline gutter; `"context-selection"` is the 25rem organisation/context picker
 * measure that goes edge-to-edge on mobile; `"account-recovery"` is the 432px SCR-008 measure
 * shared by the password-recovery and sign-in MFA challenge panels (15px mobile inline gutter).
 * Orthogonal to AuthShell's `variant` (which owns control density and heading size) — combine them.
 */
export type AuthShellPresetProp =
  "default" | "login" | "device-authorization" | "context-selection" | "account-recovery";

/** Shared gap between layout children; components may document subsets. */
export type GapProp = "xs" | "sm" | "md" | "lg" | "xl";

/** DataTable row density subset. */
export type TableDensityProp = Exclude<DensityProp, "default">;
