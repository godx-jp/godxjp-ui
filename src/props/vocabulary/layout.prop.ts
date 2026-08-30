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
 *
 * `"application"` (403 / 404): the failure happened INSIDE the authenticated app, so the surface is
 * the page BODY of the `AppShell` the route already renders. It never reconstructs nav chrome — a
 * component cannot manufacture the sidebar/topbar/user menu, which are consumer-owned; it renders
 * as `AppShell`'s children (usually inside a `PageContainer`) so the shell is PRESERVED and the
 * user is never stranded chrome-less.
 *
 * `"system"` (500 / 503): the app itself failed — session and nav data may be gone — so the surface
 * owns the whole page and renders package-owned viewport-centred geometry
 * (`CenteredShell align="center"`), with no consumer `min-h-dvh` / flex CSS at 1440 / 1024 / 390.
 */
export type ErrorSurfaceModeProp = "application" | "system";

/**
 * The HTTP status an ErrorSurface presents. Deliberately closed to the five exception pages every
 * app ships (RFC 9110 §15.5.1 / §15.5.4 / §15.5.5 / §15.6.1 / §15.6.4); it drives the default icon,
 * tone and the recommended `mode`. A number, never a string — it is the numeric status, and it is
 * rendered with tabular figures.
 *
 * `400` (gh#301) is the malformed-request page: a route reached with parameters the server refuses
 * to interpret (a bad id, a missing launch parameter, a hand-edited query string). It is an
 * `application` failure like 403/404 — the app itself is healthy, so the shell stays and the
 * viewer navigates away from it.
 */
export type ErrorSurfaceStatusProp = 400 | 403 | 404 | 500 | 503;

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
 * Orthogonal to AuthShell's `variant` (which owns control density and heading size) — combine them.
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
 * `"public-landing"` is the PUBLIC marketing / product landing contract: one content measure
 * shared by the header bar, the centred column and the footer, the section rhythm between page
 * sections, the flat (elevation-free) public-surface chrome and the hero heading tier — all owned
 * by `--centered-shell-landing-*` knobs so the landing COMPOSITION (hero, nav, sections, footer —
 * each of which fails the Framework-Component Test) needs no page-local CSS.
 */
export type CenteredShellPresetProp = "default" | "public-landing";

/**
 * Axis of a rule / track / group — the shared inline↔block vocabulary (gh#308).
 * `"horizontal"` (the default everywhere) runs along the INLINE axis, `"vertical"` along the
 * BLOCK axis, so both flip correctly under `dir="rtl"` with no per-component rule. Promoted out
 * of the inline `"horizontal" | "vertical"` unions each component file used to spell for itself,
 * so `orientation` means one thing across Separator, Steps, RadioGroup and Toolbar.
 */
export type OrientationProp = "horizontal" | "vertical";
