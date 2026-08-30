/** Layout component prop types — @see docs/COMPONENTS.md#layout */
import type * as React from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type {
  BreadcrumbProp,
  TitleProp,
  SubtitleProp,
  StatusProp,
  ExtraProp,
  FooterProp,
  PageDensityProp,
  PageContainerVariantProp,
  CenteredShellWidthProp,
  CenteredShellAlignProp,
  CenteredShellPresetProp,
  ErrorSurfaceModeProp,
  ErrorSurfaceStatusProp,
  AuthShellPresetProp,
  BreakpointProp,
  GapProp,
  ClassNameProp,
  ChildrenProp,
  IdProp,
  DisabledProp,
  DescriptionProp,
  ActionProp,
  IconProp,
  HeadingLevelProp,
  ToneProp,
} from "../vocabulary";
import type { EmptyStateToneProp } from "./data-display.prop";

/**
 * Arrangement of the page header's title band and its `extra` slot below the 640px step.
 * `stack` (default) is the historical arrangement — `extra` drops onto its own full-width line
 * under the subtitle. `responsive-inline` keeps `extra` beside the title band at the
 * `--page-header-extra-measure` measure, letting the title/subtitle wrap into what is left.
 */
export type PageContainerHeaderLayoutProp = "stack" | "responsive-inline";

/** Whole-page semantic composition owned by PageContainer. */
export type PageContainerPresetProp = "default" | "admin-collection";

/**
 * Bounded page MEASURE — the shared inline cap applied to the page header AND body together, so
 * the header `extra` action ends on the same edge as the body surface. Orthogonal to
 * `PageContainerVariantProp` (chrome) and to `PageContainerHeaderLayoutProp`, so a quiet
 * `variant="ghost"` feed can finally have a bounded measure too (gh#245 / gh#247).
 *
 * `default` applies NO cap — the page is fluid exactly as before. `narrow` / `medium` read the
 * `--page-measure-{narrow,medium}` tokens (42rem / 48rem OUTER, i.e. 624px / 720px VISIBLE surface
 * once the package-owned page gutters are subtracted). Both are maxes, so a compact viewport stays
 * fluid at the compact gutter.
 */
export type PageContainerMeasureProp = "default" | "narrow" | "medium";

/**
 * What the page's top row IS — the question that decides its type step, not how big you want it.
 *
 * `document` (default) — the row is the page's TITLE: a record, a form, a collection, a report.
 * The `<h1>` takes `--page-title-font-size` and the existing responsive step down at 720px.
 *
 * `chrome` — the row is the surface's own furniture: a chat channel name, a mail subject line, an
 * IDE tab, a conversation header. It names the thing you are already inside rather than announcing
 * a document, so it takes the body type step (`--page-title-font-size-chrome`) and the header band
 * stops competing with the content underneath. Orthogonal to `PageContainerVariantProp`: `ghost`
 * owns the page's chrome WEIGHT (no divider, no header bottom pad), this owns what the title MEANS
 * — a chat page usually wants both, a quiet document feed wants only `ghost`.
 *
 * The `<h1>` stays an `<h1>` either way; only the type step moves, and only via a token.
 */
export type PageContainerHeaderScaleProp = "document" | "chrome";

/** @see PageContainer */
export type PageContainerProp = {
  title: TitleProp;
  subtitle?: SubtitleProp;
  /**
   * Status/meta band rendered beside the title inside the heading — StatusBadge, environment
   * tag, "updated …" meta text. Geometry is token-owned (`--page-header-status-gap`): the band
   * sits on the title line and WRAPS under it on compact viewports, so a consumer never
   * hand-lays a badge next to an `<h1>`. Part of the canonical page-header contract
   * (godxjp-ui#255): PageContainer's embedded header IS the DXS `PageHeader` — breadcrumbs
   * (`breadcrumb`), title, subtitle, status/meta (this), actions (`extra`) and responsive
   * overflow (`headerLayout` / `measure`) all live on this one renderer.
   */
  status?: StatusProp;
  /**
   * Pending state for the title band while the page's own record resolves. Renders the
   * title/subtitle as `ui-skeleton-block` placeholders and marks the header `aria-busy`, keeping
   * the `<h1>` in the document with an sr-only accessible name (an empty heading is an axe
   * violation) so the page's heading outline never disappears mid-load. Breadcrumbs and `extra`
   * are NOT skeletonised — they come from the route, not the record.
   */
  headerLoading?: boolean;
  extra?: ExtraProp;
  /**
   * FIXED chrome band between the page header and the scrolling body — a filter strip, a status
   * bar, a "channel workflow" rail. It is a first-class page-chrome slot precisely because the
   * only alternative was hand-laying `position: sticky` at the call site (which the design system
   * forbids) or putting the strip inside the body, where it scrolls away. Under `fill` the body
   * IS the scroll viewport, so this band is a plain `flex: none` sibling OUTSIDE it — content can
   * never travel underneath it the way it does under a sticky box. Shares the page gutters and
   * the `measure` cap with the header and the body, so the three bands line up on both edges; its
   * inset and bottom rule are token-owned (`--page-toolbar-pad-block` / `--page-toolbar-divider`).
   * Omit it and NOTHING is rendered — no wrapper element, no gap.
   */
  toolbar?: ReactNode;
  footer?: FooterProp;
  breadcrumb?: BreadcrumbProp;
  /**
   * Override the breadcrumb `<nav>` landmark's accessible name. Defaults to a localized
   * "Breadcrumb". Needed when more than one `PageContainer` (each with its own `breadcrumb`)
   * renders on the same page/view — two `<nav>` landmarks sharing one name/role fail axe's
   * `landmark-unique` (WCAG 2.4.1 / 1.3.1).
   */
  breadcrumbLabel?: string;
  /** Kebab/DOM-style alias of `breadcrumbLabel` (same landmark-unique override). */
  breadcrumbAriaLabel?: string;
  linkComponent?: React.ElementType;
  density?: PageDensityProp;
  variant?: PageContainerVariantProp;
  /**
   * Whole-page composition contract. `admin-collection` sets the header-to-toolbar rhythm,
   * collection search measure, control height and table density once for the entire subtree.
   * Geometry remains token-owned and service-themeable; no child needs a sizing override.
   */
  preset?: PageContainerPresetProp;
  /**
   * How the title band and `extra` share the header row below the 640px step. Defaults to
   * `stack` — the historical arrangement, where `extra` wraps onto its own full-width line under
   * the subtitle. Use `responsive-inline` to keep ONE compact control (a search field, a single
   * primary action) beside the title at 390px, at the token-owned
   * `--page-header-extra-measure`. At >=640px both arrangements are identical.
   */
  headerLayout?: PageContainerHeaderLayoutProp;
  /**
   * Whether the page's top row is a DOCUMENT TITLE or the surface's own CHROME. Defaults to
   * `document` — the historical page, byte-identical (no attribute is emitted at all). Pass
   * `chrome` when the row names the thing the user is already inside rather than announcing a
   * document: a chat channel, a mail thread, an IDE tab. The `<h1>` then takes the body type step
   * (`--page-title-font-size-chrome`) at EVERY width — including below 720px, where the
   * document-scale responsive step would otherwise pull it back UP — so the header band stops
   * eating the height the conversation needs (measured in a consumer chat page: a 61px band with a
   * 24px name, against a design that wanted ~40px at the `sm` step).
   *
   * The same answer also puts the band ON the frame's edge: the container's block-start padding
   * becomes `--page-pad-block-start-chrome` (0) instead of `--space-page-active-y`, because a
   * document title needs air above it and a channel head IS the top edge (measured on a consumer
   * chat screen as 24px that pushed the head off y=0 and came off the transcript viewport). The
   * page's bottom edge is untouched, that being `stickyFooter`'s.
   *
   * It carries two more consequences of the same fact. The SUBTITLE drops to
   * `--page-subtitle-font-size-chrome` (`--font-size-2xs`, ≈11px): a caption on chrome, not a
   * document's standfirst, and at the document step it was rendering at the very same size as the
   * chrome title, which is not a hierarchy. And the `extra` cluster CENTRES on the bar
   * (`align-self: center`) wherever the header row is a row (>=640px), because top-packing actions
   * is a document behaviour — they belong on the first line of a tall `<h1>` — and a bar has no
   * tall heading to align to. Measured on a consumer chat screen, that was 8.65px: 28px icon
   * buttons pinned at y=14 inside a 45.3px row whose title block centred at y=22.65.
   *
   * The heading stays an `<h1>` throughout, so the screen-reader outline is unchanged. Compose it
   * with `variant="ghost"` for the full quiet chrome header (ghost drops the divider and the
   * header's bottom pad); the two are separate props because chrome WEIGHT and what the title
   * MEANS are separate questions.
   */
  headerScale?: PageContainerHeaderScaleProp;
  /**
   * Bounded page measure shared by the header and the body. Defaults to `default` — no cap, the
   * historical fluid page. `narrow` (624px surface) / `medium` (720px surface) cap BOTH bands to
   * one token-owned measure (`--page-measure-{narrow,medium}`), so a header action ends flush with
   * the body surface instead of at the page edge. Orthogonal to `variant`, so `variant="ghost"`
   * quiet chrome composes with a bounded measure (gh#245 / gh#247). Unlike `variant="narrow"`,
   * which caps only the body.
   */
  measure?: PageContainerMeasureProp;
  /** Pin footer to viewport bottom on scroll — pairs well with `variant="narrow"`. */
  stickyFooter?: boolean;
  /**
   * When the footer is sticky, control WHEN it shows. `"always"` (default)
   * keeps it pinned the whole time. `"onScroll"` hides it until the header
   * (title + `extra` actions) scrolls out of view, then slides it up — the
   * standard edit/create "save bar" so the primary actions stay reachable as
   * the form scrolls, without cluttering the top. The footer stays mounted
   * (no layout reflow → no jitter); observed against the nearest scroll
   * container.
   */
  footerReveal?: "always" | "onScroll";
  /**
   * Grow the body to fill the remaining shell height. Default `false` (top-packed,
   * content-height — short pages leave no stretched void, gh#103). Enable for a
   * full-height DataTable, SplitPane, or a chat surface whose composer is pinned
   * to the bottom via `footer` + `stickyFooter`.
   */
  fill?: boolean;
  children?: ChildrenProp;
  className?: ClassNameProp;
};

export type FlexDirectionProp = "row" | "col";
export type FlexAlignProp = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustifyProp = "start" | "center" | "end" | "between" | "around" | "evenly";

/** @see Flex */
export type FlexProp = React.HTMLAttributes<HTMLDivElement> & {
  direction?: FlexDirectionProp;
  gap?: GapProp;
  align?: FlexAlignProp;
  justify?: FlexJustifyProp;
  wrap?: boolean;
  /**
   * Drop this region below a breakpoint step (`sm` 40rem · `md` 48rem · `lg` 64rem · `xl` 80rem).
   * The ONE public way to make a layout region responsive without a page-local media query — a
   * public header hides its anchor navigation below the tablet step with `hideBelow="md"` instead
   * of a consumer `@media` rule (gh#252). Omit (the default) and no attribute is emitted, so no
   * rule can match and the Flex is unchanged. The region is removed from the accessibility tree
   * too, so keep its destinations reachable elsewhere at that width (a footer nav).
   */
  hideBelow?: BreakpointProp;
  /**
   * The inverse of `hideBelow` — drop this region FROM a breakpoint step upwards, i.e. keep it
   * only on the narrow side (a compact-only affordance). Omit for no attribute and no rule.
   */
  hideFrom?: BreakpointProp;
};

export type ResponsiveGridColumnsProp = number | { sm?: number; md?: number; lg?: number };

/**
 * Named, package-owned column geometry for ResponsiveGrid — the semantic alternative to a
 * consumer hand-rolling a `columns={{ sm, md, lg }}` breakpoint map for a recognised collection
 * shape. Takes priority over `columns` when both are set (`columns` is then ignored, not merged).
 *
 * `pricing-plans` — the canonical billing/pricing-plan collection: 1 column until the `lg` step
 * (container ≥ 64rem), then 3 columns from `lg` upward. Because ResponsiveGrid has no step above
 * `lg`, this reads as exactly 3 columns at BOTH the 1024px and 1440px reference widths and 1
 * column at 390px — the 3/3/1 contract requested for the billing plan catalog
 * (dxs-platform/platform#333, tracked upstream at dxs-platform/pkg-ui#14). General-purpose beyond
 * pricing: any 3-up desktop / 1-up mobile collection (no intermediate `md` step) can reuse it.
 */
export type ResponsiveGridPresetProp = "pricing-plans";

export type MasterDetailRailWidthProp = "compact" | "standard";
export type MasterDetailRailProp = "master" | "detail";
/**
 * Bounded viewport preset for the master collection. `auto` (default) never bounds it — the
 * region grows with its content, exactly as before. `compact` / `standard` cap its block size
 * with the `--master-detail-master-viewport-*` tokens and scroll the collection inside the
 * region, so a long list cannot push the detail below the fold once the layout stacks.
 */
export type MasterDetailMasterViewportProp = "auto" | "compact" | "standard";

/** @see MasterDetail */
export type MasterDetailProp = {
  /** Selectable collection; always first in DOM order, so the stacked order stays list-then-detail. */
  master: ReactNode;
  /** Detail surface for the current selection. */
  children: ChildrenProp;
  /**
   * Which region is the fixed-width rail; the other one is fluid. Defaults to `detail` — the
   * canonical fluid-list + fixed-detail-rail composition. Use `master` for a leading
   * category/navigator rail beside a fluid detail surface.
   */
  rail?: MasterDetailRailProp;
  /** Rail track width: `compact` = 300px; `standard` = 320px. */
  railWidth?: MasterDetailRailWidthProp;
  /**
   * Bound the master collection to a scrollable viewport instead of letting it grow with its
   * content. `auto` (default) keeps the unbounded behaviour. `compact` (20rem) / `standard`
   * (28rem) read the `--master-detail-master-viewport-*` tokens, scroll the collection INSIDE the
   * region, and make it a keyboard-reachable scroll container. Pair with `masterLabel` so the
   * scroll region is announced.
   */
  masterViewport?: MasterDetailMasterViewportProp;
  /**
   * Stack the two regions below this breakpoint (`false` never stacks). Omit to inherit the
   * themeable `--master-detail-collapse-below` token (default 40rem / the `sm` step).
   */
  collapseBelow?: BreakpointProp | false;
  /** Accessible name for the master region. */
  masterLabel?: string;
  /** Accessible name for the detail region. */
  detailLabel?: string;
  /**
   * Id of the detail region, so the selection controls inside `master` can point at it with
   * `aria-controls` and the app can move focus to it after a selection.
   */
  detailId?: IdProp;
};

/** @see PageContainer.Inset — full-bleed inset region inside the page padding. */
export type PageInsetProp = React.HTMLAttributes<HTMLDivElement> & {
  children?: ChildrenProp;
  className?: ClassNameProp;
};

/** @see AppShell */
export type AppShellProp = {
  sidebar: ReactNode;
  children: ReactNode;
  topbar?: ReactNode;
  topbarLeft?: ReactNode;
  topbarRight?: ReactNode;
  logo?: ReactNode;
  breadcrumb?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  /**
   * Responsive navigation strategy below the canonical 900px shell breakpoint.
   *
   * - `"drawer"` (default) hides the docked sidebar and exposes the accessible mobile Sheet.
   * - `"docked"` keeps the sidebar grid track, footer/account region and active navigation in the
   *   shell at narrow widths. The sidebar width remains owned by `--app-shell-sidebar-width`.
   *
   * Use `"docked"` only when the product's approved responsive contract explicitly retains the
   * rail; it intentionally suppresses the redundant mobile drawer trigger.
   */
  responsiveNavigation?: "drawer" | "docked";
  /**
   * Which columns the topbar spans.
   *
   * - `"content"` (default) starts the topbar beside the sidebar, so the rail runs the full height
   *   of the window and the bar sits over the content only. The admin-console arrangement.
   * - `"full"` runs the topbar edge to edge across the top with the sidebar starting beneath it —
   *   the arrangement products use when the bar carries space-level chrome (global search, account,
   *   notifications) that outranks the current section rather than belonging to it.
   *
   * Not cosmetic: it changes what the bar reads as owning. `"full"` also renders the `<header>`
   * before the `<aside>` so keyboard order follows the visual order — a grid area alone would put
   * focus in the rail while the eye starts at the bar (WCAG 2.4.3).
   */
  topbarSpan?: "content" | "full";
  /**
   * Navigation shown in the mobile drawer at the DXS 900px breakpoint, where the docked sidebar is
   * hidden. AppShell OWNS the drawer: it renders a hamburger trigger in the topbar and a focus-
   * trapped Sheet (Esc + overlay close, focus returns to the trigger) — hiding the sidebar without
   * a reachable alternative is invalid (gh#165). Defaults to `sidebar`, so the same nav is
   * available on mobile with no extra wiring; pass a distinct node for a mobile-tailored menu, or
   * `null` to opt out (only when navigation lives elsewhere, e.g. a bottom bar).
   */
  mobileNav?: ReactNode;
  /** Accessible title for the mobile navigation drawer. Defaults to the localized "Menu". */
  mobileNavLabel?: string;
  /** Controlled open state of the mobile drawer. Omit for AppShell-owned (uncontrolled) state. */
  mobileNavOpen?: boolean;
  /** Change handler for the mobile drawer open state (pairs with `mobileNavOpen`). */
  onMobileNavOpenChange?: (open: boolean) => void;
};

/**
 * @see AuthShell — centred auth/login page shell (login · mfa · passkey · device · reset). A
 * top brand bar, a centred `main` that holds the auth `Card`, and an optional footer, over a
 * `min-h-dvh` surface. The shell scopes `--control-height` to the comfortable tier (44px, the WCAG
 * touch floor) and bumps the auth heading size so forms read at the right density — replacing
 * consumers' hand-rolled `.auth-shell-*` / `.ui-auth-scope` classes. Motion is delegated to
 * `Reveal` (wrap the card) so `prefers-reduced-motion` is honoured at one place.
 */
export type AuthShellProp = {
  /** Centred content — typically a single auth `<Card>` with the form. */
  children: ReactNode;
  /** Brand bar slot pinned to the top (e.g. a `<Logo>` / product mark). */
  brand?: ReactNode;
  /** Footer slot pinned to the bottom (legal links, locale switch, support). */
  footer?: ReactNode;
  /**
   * Visual contract for the auth surface. `"canonical"` applies the shared DXS compact geometry
   * (36px controls, 22.5rem card measure, and responsive page insets) through component tokens.
   * Default `"default"` preserves the existing comfortable shell.
   */
  variant?: "default" | "canonical";
  /**
   * Named flow MEASURE — the page geometry contract for one canonical hosted-identity flow: the
   * auth card's max-width plus the desktop and mobile page gutters, all owned by component tokens
   * (`--auth-shell-{login,registration,device,context,recovery}-*`). Selecting a preset replaces
   * every consumer-side geometry override.
   *
   * - `"default"` (default) — the shell's own measure; nothing changes.
   * - `"login"` — SCR-001's 360px card at x=540/332/15 and y=363/363/353 for the canonical
   *   1440x900, 1024x900 and 390x844 viewports. The identity occupies a package-owned anchor slot,
   *   so standalone, one-line requester and wrapped two-line requester states keep the same card
   *   position without truncating or inventing requester data. Pass AuthIdentity, Card and
   *   AuthFooter as direct children (an anchor may wrap AuthIdentity).
   * - `"registration"` — the 360px sign-up measure with a 15px inline gutter at 390px (the same
   *   page rhythm as `"login"`, so sign-in → sign-up never jumps on a phone). START-aligned like
   *   login, because a registration card is the tallest surface in the hosted-identity set
   *   (name · email · password · confirm · strength · consent · submit · providers) and a
   *   vertically centred tall card overflows ABOVE the scroll origin on a short viewport, putting
   *   its first field out of reach — start-aligned, a long form simply scrolls. It is also the
   *   only preset with a footer-clearance knob of its own, so the legal/consent footer never sits
   *   flush against the submit button. Carries the full password form and the pending-email
   *   confirmation state with no consumer geometry CSS.
   * - `"device-authorization"` — 380px card measure with a 5px inline page gutter at a 390px
   *   viewport (canonical device-grant artboard).
   * - `"context-selection"` — 25rem card measure on desktop/tablet, edge-to-edge on mobile, and a
   *   tokenized rhythm between the intro, the card and the trailing "remember" row.
   * - `"account-recovery"` — 27rem/432px panel measure with a 15px inline page gutter at 390px
   *   (panel x=15, width=360). One measure for BOTH canonical SCR-008 panels: password recovery
   *   (request · sent · new-password · expired) and the sign-in MFA challenge (OTP · recovery-code
   *   · passkey-failure), whose title and description sit INSIDE the bordered surface.
   *
   * Orthogonal to `variant`: presets are applied AFTER it, so `variant="canonical"` keeps owning
   * control density and heading size while the preset re-measures/anchors the page.
   */
  preset?: AuthShellPresetProp;
  /**
   * Vertical density scoped to auth-card descendants. The canonical variant defaults to
   * `"compact"`; the default variant defaults to `"comfortable"`.
   */
  density?: "comfortable" | "compact";
  className?: ClassNameProp;
};

/** @see AuthDivider */
export type AuthDividerProp = {
  /** Short localized conjunction rendered between the two separator rules (for example, "or"). */
  label: string;
  className?: ClassNameProp;
};

/**
 * @see AuthFooter — the canonical hosted-identity legal line (host · Terms · Privacy · locale).
 * AuthFooter owns ONLY the geometry: the mono type ramp, the wrap behaviour and the `·`
 * separators between the slots that are actually present (tokens `--auth-footer-*`). Every slot
 * is consumer-owned content — real localized links and a real locale control — so the library
 * never invents navigation. Drop it into `AuthShell`'s `footer` slot (which supplies the
 * `contentinfo` landmark); it renders a plain `div`, so it can also sit inside an existing footer.
 */
export type AuthFooterProp = {
  /** Product / host identity — the operator of the auth surface (e.g. "GoDX ID"). */
  product: ReactNode;
  /** Terms-of-service link or localized text. */
  terms: ReactNode;
  /** Privacy-policy link or localized text. */
  privacy: ReactNode;
  /** Optional consumer-owned locale control (e.g. `<AppSettingPicker kind="locale" compact />`). */
  locale?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see AuthIdentity — the canonical hosted-identity heading block: the brand-green GoDX mark
 * (`Logo mark="godx"`, independent of `--primary`), the `h1` auth heading, and an optional
 * requesting-client line for delegated flows (device grant, OAuth consent). Centred, token-spaced
 * (`--auth-identity-gap` / `--auth-requester-*`) — a consumer never re-centres or re-spaces it.
 */
export type AuthIdentityProp = {
  /** Primary auth heading, rendered as the page `h1`. */
  title: ReactNode;
  /**
   * Optional real requesting-client context ("Attendance is requesting sign in"). Pass it ONLY
   * when the client identity is authoritative — never a placeholder.
   */
  requester?: ReactNode;
  className?: ClassNameProp;
};

/**
 * @see AuthAccountSummary — compact signed-in identity row for hosted authentication surfaces.
 * It owns avatar fallback, bidi-safe email truncation and the keyboard action geometry; the
 * consumer owns the authoritative email, localized action label and navigation handler.
 */
export type AuthAccountSummaryProp = {
  email: string;
  avatarSrc?: string;
  avatarFallback?: ReactNode;
  actionLabel: ReactNode;
  onAction: () => void;
  disabled?: DisabledProp;
  className?: ClassNameProp;
};

/**
 * @see CenteredShell — authenticated, no-sidebar, centred-column page shell (hosted-ID "My Page",
 * account / self-service, standalone settings). A padded top bar with real actions (banner) reusing
 * AppShell's `.app-topbar` chrome WITHOUT a sidebar, a scrollable `main` holding a centred column of
 * configurable medium width (`width` = sm|md|lg, all wider than AuthShell's 24rem card) top-aligned
 * so sections flow + scroll, and an optional footer (contentinfo). Fills the gap between AppShell
 * (needs a sidebar) and AuthShell (unauthenticated, narrow vertically-centred card) — so a hosted
 * account page needs ZERO custom CSS and never hand-rolls a bar (the `.ui-topbar` zero-inset
 * footgun). Layout-only; delegate motion to `Reveal`.
 */
export type CenteredShellProp = {
  /** Centred column content — page sections (identity hero, org picker, service grid, team list). */
  children: ReactNode;
  /**
   * Top bar slot (banner) — a `<Topbar>` with brand + real actions (an `AppSettingPicker`, a user
   * menu, sign-out). CenteredShell wraps it in the SAME padded chrome as AppShell's topbar
   * (padding-inline · border · backdrop), so you never hand-roll a bar. Omit → no banner.
   */
  topbar?: ReactNode;
  /** Footer slot (contentinfo) pinned to the bottom (legal links, locale switch, support). Omit → none. */
  footer?: ReactNode;
  /**
   * Max-width of the centred content column: `sm` ~32rem, `md` (default) ~46rem, `lg` ~64rem — all
   * wider than AuthShell's 24rem auth card. A service retunes each tier via `--centered-shell-width-*`.
   */
  width?: CenteredShellWidthProp;
  /**
   * Block alignment of the centred column inside the `100dvh` shell. `"start"` (default) keeps the
   * top-aligned flowing/scrolling page shape. `"center"` centres the column in the viewport — the
   * SYSTEM-level standalone surface (a 500/503 error page, a maintenance notice) whose full-page
   * geometry must stay package-owned instead of a consumer re-implementing `min-h-dvh` + flex
   * centring. Overflowing content still scrolls from the top (auto block offsets collapse to 0), so
   * a long localized message is never clipped.
   */
  align?: CenteredShellAlignProp;
  /**
   * Whole-page shell contract. `"default"` (the default) emits no attribute and keeps the shell's
   * exact box. `"public-landing"` owns the PUBLIC landing geometry — one content measure shared by
   * the header bar, the centred column and the footer, the section rhythm, the flat public-surface
   * card chrome and the hero `h1` tier — from `--centered-shell-landing-*` tokens, so a landing
   * composition (header · hero · sections · legal footer) needs no page-local CSS and no descendant
   * selector against shell internals (gh#252).
   */
  preset?: CenteredShellPresetProp;
  className?: ClassNameProp;
};

/**
 * @see ErrorSurface — the optional maintenance / planned-outage timing slot (503, occasionally a
 * planned 500).
 *
 * `start` / `end` are **ISO-8601 instants** and `timeZone` an **IANA** zone id: the surface formats
 * them with `Intl.DateTimeFormat(locale, …).formatRange()` (CLDR), so ja / en / vi each read
 * natively. NEVER pass a pre-formatted string like `"18:00 - 20:00 JST"` — it cannot localize, and
 * the machine-readable value is what lands in `<time dateTime>`.
 *
 * `progress` is server-sent on purpose: deriving "how far through the window are we" from the
 * client clock makes SSR and hydration disagree, and an exception page must be readable before
 * hydration.
 */
export type ErrorSurfaceMaintenanceProp = {
  /** Window start as an ISO-8601 instant (`2026-08-02T18:00:00Z`). Also the `<time dateTime>` value. */
  start: string;
  /** Window end as an ISO-8601 instant. Omit for an open-ended outage — a single instant is shown. */
  end?: string;
  /**
   * IANA time zone id (`Asia/Tokyo`) the window is presented in. Omit to use the runtime zone —
   * pass it explicitly whenever the page is server-rendered, or SSR and client output diverge.
   */
  timeZone?: string;
  /**
   * Completion of the maintenance window as a **percentage 0–100**, rendered as a labelled
   * `Progress` meter. Server-sent (see above); omit for an outage with no published progress.
   */
  progress?: number;
};

/**
 * @see ErrorSurface — the package-owned semantic exception surface for 400 / 403 / 404 / 500 / 503.
 *
 * The `mode` is the SHELL CONTRACT, not a skin:
 * - `mode="application"` (400/403/404) renders the surface as the **body** you put inside the
 *   `AppShell` the route already provides (normally within a `PageContainer`). It deliberately does
 *   NOT reconstruct navigation chrome: the sidebar, topbar and user menu are consumer-owned data,
 *   so the surface preserves the shell it is placed in instead of manufacturing a fake one.
 * - `mode="system"` (500/503) owns the whole page: it renders `CenteredShell align="center"`, so
 *   the viewport-centred geometry at 1440 / 1024 / 390 stays package-owned and a consumer never
 *   writes `min-h-dvh`, a flex-centring class or a media query.
 *
 * `action` is **exactly one** recovery action, enforced structurally by a single slot (a second
 * element is dropped with a development error). Support contact belongs in `description`, not in a
 * second CTA.
 *
 * All product COPY stays consumer-owned (`title` / `description` / `action` come from the app's own
 * `t()`); the surface owns only its own metadata labels, which it localizes itself.
 */
export type ErrorSurfaceProp = {
  /** Where the surface lives — `application` = AppShell body (400/403/404), `system` = own page (500/503). */
  mode: ErrorSurfaceModeProp;
  /** HTTP status presented. Drives the default `icon`, `tone` and the rendered status code. */
  status: ErrorSurfaceStatusProp;
  /** Headline. Consumer-owned copy from the app's `t()` — the library ships no product text. */
  title: TitleProp;
  /** Supporting sentence under the title. Put support-contact guidance here, never in a 2nd CTA. */
  description?: DescriptionProp;
  /**
   * The ONE recovery action (a `Button`, or a `Button asChild` wrapping a router `Link`). A single
   * slot IS the enforcement: pass more than one element and only the first renders, with a
   * development-time error.
   */
  action: ActionProp;
  /**
   * Override the status-derived icon (400 TriangleAlert · 403 ShieldAlert · 404 SearchX ·
   * 500 ServerCrash · 503 Wrench).
   */
  icon?: IconProp;
  /** Override the status-derived tone (400/403/503 `warning` · 404 `muted` · 500 `destructive`). */
  tone?: EmptyStateToneProp;
  /**
   * Semantic heading level of `title`. Defaults to `2` in `application` mode (a `PageContainer`
   * `h1` sits above it) and `1` in `system` mode (the surface IS the page). Choose it to keep the
   * outline valid, never for size.
   */
  titleLevel?: HeadingLevelProp;
  /**
   * Support correlation id for the failure, rendered as a monospace/tabular metadata row so it can
   * be read out or copied accurately. Pass the bare id — the localized label is the surface's.
   */
  requestId?: string;
  /**
   * The permission / role the viewer is missing (403). Pass the bare permission name
   * (`reports.view`) — the surface renders the localized "Required permission" label around it.
   */
  permission?: ReactNode;
  /**
   * The organization / tenant the failed request was scoped to. Disambiguates a 403 caused by
   * being in the wrong workspace from one caused by a missing role.
   */
  organization?: ReactNode;
  /** Optional planned-outage timing + progress (503). ISO-8601 + IANA, formatted with `Intl`. */
  maintenance?: ErrorSurfaceMaintenanceProp;
  /**
   * `system` mode only — brand slot above the status code (a `Logo`). Ignored in `application`
   * mode, where the shell already shows the product brand.
   */
  brand?: ReactNode;
  /** `system` mode only — the page footer (contentinfo): copyright, status page, locale switch. */
  footer?: FooterProp;
  /**
   * `system` mode only — measure of the centred column (`CenteredShell` width tier). Default `sm`.
   */
  width?: CenteredShellWidthProp;
  id?: IdProp;
  className?: ClassNameProp;
};

/** @see Sidebar */
export type SidebarProductProp = {
  name: string;
  role?: string;
  color?: string;
};

/**
 * What a nav row's count MEANS — a subset of the shared `ToneProp` vocabulary, not a palette.
 *
 * `neutral` (default) — a plain count: unread items, pending rows, queued jobs. The pill keeps the
 * quiet `--sidebar-badge-background` / `-foreground` pair it always had.
 *
 * `destructive` — the count is ADDRESSED TO THE USER and the rail should pull the eye: an
 * @mention, a direct message, a failing job awaiting them. Reads the
 * `--sidebar-badge-destructive-*` pair.
 *
 * Deliberately TWO values, not the whole `ToneProp` union: a navigation rail answers one question
 * about a count — "does this need me personally?" — and a five-colour rail is decoration, not
 * information. Colour ONLY: the pill's geometry is shared, so a mention row and an unread row stay
 * aligned in the same column.
 */
export type SidebarBadgeToneProp = Extract<ToneProp, "neutral" | "destructive">;

/** @see Sidebar */
export type SidebarItemProp = {
  id: string;
  label: string;
  /**
   * Leading 16px glyph — REQUIRED: the collapsed rail is icon-only and the expanded rail aligns
   * every label to the icon column. Untyped/API-driven data that omits it no longer crashes the
   * shell (the row renders an empty `.sb-icon` slot, keeping the 32px row / 10px gap), but the rail
   * reads as a hole. Its colour is themeable separately from the label via
   * `--sidebar-nav-icon-foreground` (see {@link SidebarProp}).
   */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * Count/status affix rendered in the row's `.sb-badge` pill. Pass the CONTENT ONLY — a number, a
   * string, `"9+"`. Never a `<Badge>`: the row already IS a badge, so nesting one produces two
   * stacked pills (measured: a 37.11×19.14 `.sb-badge` wrapping a 25.11×19.14 `<Badge>` with its
   * own border). To change what the count MEANS, use {@link SidebarItemProp.badgeTone}.
   */
  badge?: ReactNode;
  /**
   * Emphasis of `badge`. Defaults to `neutral` — the historical pill, byte-identical (no attribute
   * is emitted at all). Pass `destructive` when the count is addressed to the user rather than
   * merely unread: an @mention, a direct message, a failure waiting on them. It moves two colour
   * tokens and nothing else, so mention rows and unread rows still line up.
   *
   * Ignored when `badge` is absent, and on the collapsed rail (which hides `.sb-badge` entirely).
   */
  badgeTone?: SidebarBadgeToneProp;
  disabled?: boolean;
  /**
   * Destination of the row. It is the SOLE interactive element (no nested `<button>`), so
   * right-click / open-in-new-tab / middle-click all work. Omit for SPA rows that only report
   * selection via `onSelect(id)`.
   *
   * With `Sidebar.linkComponent` this same `href` is what the framework router `<Link>` receives —
   * the LIBRARY still composes the row (icon · label · badge · active · collapsed), so a router
   * link never has to reconstruct row markup (gh#213).
   */
  href?: string;
  /** Nested rows — renders a collapsible submenu group (the parent reads active when any child is). */
  children?: SidebarItemProp[];
};

/** @see Sidebar */
export type SidebarItemData = SidebarItemProp;

/**
 * Props the Sidebar hands to `Sidebar.linkComponent` for one nav row (gh#213).
 *
 * Every field is ANCHOR-SAFE — a router `<Link>` may spread the whole object onto its `<a>` without
 * emitting an unknown-DOM-attribute warning. `children` is the LIBRARY-COMPOSED row content (the
 * `.sb-icon` slot, the `.sb-label`, the `.sb-badge`); render it as-is and never rebuild it, which is
 * what makes icons/badges survive a consumer link (the reported production regression).
 */
export type SidebarLinkProp = {
  /** `SidebarItemProp.href`. Absent for a disabled row — render an inert `<a>` with no navigation. */
  href?: string;
  /** Library-composed row content: icon slot + label + badge (icon only on the collapsed rail). */
  children: ReactNode;
  /** Canonical row class (`sb-nav-item`, plus `sb-nav-item--sub` for a submenu child). */
  className: string;
  /** Present only on the active row — drives `--sidebar-item-active-*`. */
  "data-active"?: "true";
  /** WAI-ARIA current-page semantics for the active row. */
  "aria-current"?: "page";
  /** Set when the item (or its row) is disabled; the row must not navigate. */
  "aria-disabled"?: true;
  /** Accessible name for the icon-only collapsed rail, where the visible label is hidden. */
  "aria-label"?: string;
  /** `"menuitem"` inside the collapsed rail's portaled flyout menu; absent for ordinary rows. */
  role?: "menuitem";
  /** Reports selection to `Sidebar.onSelect` after the router link runs its own handler. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

/**
 * A framework router link component driven by {@link SidebarLinkProp} — Inertia's `<Link href>`,
 * a React Router / TanStack link wrapped by `createSidebarLink(Link, "to")`, or any component that
 * renders a single `<a>`. It must forward its `ref` to that anchor so the collapsed rail's Tooltip
 * can anchor to it.
 */
export type SidebarLinkComponentProp = ComponentType<SidebarLinkProp>;

/**
 * Row state supplied to the DEPRECATED `Sidebar.renderItem`.
 *
 * @deprecated Prefer `Sidebar.linkComponent` (or `SidebarItem asChild`), where the library composes
 * the row and the consumer supplies only the element. `renderItem` leaves row CONTENT to the
 * consumer, which is how a `<Link>{item.label}</Link>` silently dropped every icon and badge
 * (gh#213). Spreading `rowProps` — including its `children` — now yields the canonical row.
 */
export type SidebarRenderItemProp = {
  className: string;
  "data-active"?: "true";
  "aria-current"?: "page";
  "aria-disabled"?: true;
  /**
   * Library-composed row content (icon slot · label · badge). Spread `rowProps` onto your element,
   * or render `rowProps.children` explicitly, to keep the canonical row while adding an affix.
   */
  children?: ReactNode;
};

/** @see Sidebar */
export type SidebarSectionProp = {
  label?: string;
  items: SidebarItemProp[];
};

/** One selectable organization in the public {@link OrgSwitcher} contract. */
export type OrgSwitcherOrganization = {
  id: string;
  name: string;
  /** Secondary organization context, for example the member's role or tenant identifier. */
  meta?: ReactNode;
  /** Optional owned mark/avatar. When omitted, OrgSwitcher renders the first name character. */
  avatar?: ReactNode;
  /**
   * Status/plan affordance rendered end-aligned in the expanded trigger and in the menu row
   * (e.g. `<Badge tone="warning">Trial</Badge>`). Hidden in the collapsed rail, which only has room
   * for the mark. Pair a non-textual badge with {@link OrgSwitcherOrganization.badgeLabel}.
   */
  badge?: ReactNode;
  /**
   * Localized screen-reader text for `badge`. Required whenever the badge carries meaning the
   * accessible name would otherwise lose (WCAG 1.1.1 / 1.4.1): the trigger's `aria-label` owns its
   * accessible name, so the badge is announced through `aria-describedby` instead. When omitted, a
   * textual badge is still announced inside the menu row but NOT on the trigger.
   */
  badgeLabel?: string;
  disabled?: boolean;
};

/** Localized copy owned by the consuming product, never hard-coded by the component. */
export type OrgSwitcherLabels = {
  trigger: (organizationName: string) => string;
  title: string;
  search: string;
  empty: string;
  loading: string;
  retry?: string;
};

/** @see OrgSwitcher */
export type OrgSwitcherProp = {
  organizations: readonly OrgSwitcherOrganization[];
  value?: string;
  onValueChange?: (value: string) => void;
  collapsed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Error content replaces the list while preserving the trigger and retry affordance. */
  error?: ReactNode;
  onRetry?: () => void;
  labels: OrgSwitcherLabels;
  /**
   * `"auto"` (default) uses the desktop popover above `--sheet-responsive-breakpoint-width` and a
   * focus-trapped bottom Sheet at/below it — the SAME token that drives `SheetContent
   * responsive="auto"`, resolved through the shared `useSheetResponsiveMode()` hook, so a service
   * moves the drawer line once for every overlay instead of per component.
   * Explicit modes are useful for deterministic embedded surfaces and component tests.
   */
  responsive?: "auto" | "popover" | "sheet";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: ClassNameProp;
};

/** @see Sidebar */
export type SidebarProp = {
  /** Accessible navigation landmark name; make it unique when multiple sidebars share a document. */
  ariaLabel?: string;
  activeId: string;
  onSelect?: (id: string) => void;
  sections?: SidebarSectionProp[];
  product?: SidebarProductProp;
  onProductClick?: () => void;
  brand?: ReactNode;
  collapsed?: boolean;
  children?: ChildrenProp;
  /**
   * THE framework-router contract (gh#213). Supply only the LINK ELEMENT TYPE; the Sidebar still
   * composes the row — icon slot, label, badge, `data-active`/`aria-current`, the icon-only
   * collapsed rail and its tooltip name — and passes it as {@link SidebarLinkProp} `children`.
   * Used for every row that carries an `href`: top-level leaves, submenu children, collapsed-rail
   * leaves and collapsed flyout entries. A group TRIGGER stays a `<button>` (it owns
   * `aria-expanded` disclosure semantics per WAI-ARIA APG); its children take the link.
   *
   * Rows without an `href` keep the `<button>` + `onSelect(id)` shape — a router link with no
   * destination is not a link.
   *
   * @example
   * ```tsx
   * // Inertia — its <Link href> already matches SidebarLinkProp.
   * import { Link } from "@inertiajs/react";
   * <Sidebar linkComponent={inertiaSidebarLink(Link)} sections={sections} activeId={activeId} />
   *
   * // React Router / TanStack — remap `href` to `to`.
   * import { Link } from "react-router-dom";
   * <Sidebar linkComponent={createSidebarLink(Link, "to")} sections={sections} activeId={activeId} />
   * ```
   */
  linkComponent?: SidebarLinkComponentProp;
  /**
   * @deprecated Use {@link SidebarProp.linkComponent} (or `SidebarItem asChild`) instead — there the
   * LIBRARY composes the row and you supply only the element, so icons/labels/badges cannot be lost.
   *
   * Legacy escape hatch: return a SINGLE interactive element and the Sidebar merges the row styling
   * + active state onto it via Slot. Because row CONTENT stayed consumer-authored, a
   * `<Link>{item.label}</Link>` silently dropped every icon and badge (the gh#213 production
   * regression). `rowProps` now also carries the composed `children`, so spreading it restores the
   * canonical row.
   */
  renderItem?: (item: SidebarItemData, rowProps: SidebarRenderItemProp) => ReactNode;
  footer?: ReactNode;
  /**
   * Override the nav landmark's accessible name. Defaults to a localized "Main navigation".
   * Needed when more than one Sidebar renders on the same page/view (e.g. a docked sidebar +
   * its mobile-drawer twin, both mounted at once) — two `<nav>` landmarks sharing one name/role
   * fail axe's `landmark-unique` (WCAG 2.4.1 / 1.3.1).
   */
  "aria-label"?: string;
};

/**
 * @see Topbar — a PURE SLOT bar (no baked chrome). The library only positions three clusters; the
 * CONSUMER decides what goes in each (a brand mark `Avatar`, sidebar toggle, nav, a search trigger, settings
 * pickers like `AppSettingPicker`, a notification button, a user menu). The shell never forces a
 * product switcher, a search box, or a language picker — those are the consumer's components,
 * configured via THEIR own props and dropped into a slot.
 */
export type TopbarProp = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Inline-start cluster — typically the sidebar toggle + a brand mark (`Avatar`) + primary nav. */
  start?: ReactNode;
  /** Center cluster — optional (e.g. a search trigger or a page/entity switcher). */
  center?: ReactNode;
  /** Inline-end cluster — settings pickers, notifications, the user menu. */
  end?: ReactNode;
  /** Escape hatch — render fully custom bar content instead of the three slots. */
  children?: ReactNode;
};

/**
 * @see LegalDocumentShell — one entry of the table of contents + the matching document section.
 * `id` is the REAL anchor target (`href="#{id}"`, `<section id>`), so it must be unique on the page
 * and URL-safe: it is what a deep link, a hash jump and `aria-current` all key off.
 */
export type LegalDocumentSectionProp = {
  /** URL-safe anchor id — the `<section id>` AND the contents `href="#…"` target. */
  id: string;
  /** Section heading text — rendered as an `<h2>` AND reused as the contents-list label. */
  title: string;
  /** Section body. Consumer-owned legal copy: paragraphs, lists, tables, nested `<h3>`s. */
  content: ReactNode;
};

/**
 * @see LegalDocumentShell — the long-form legal/policy document surface (terms of service, privacy
 * policy, DPA, cookie policy, SLA, EULA) with a table of contents.
 *
 * It owns the parts an app must NOT re-implement: the readable measure + top-aligned document
 * geometry, the sticky contents rail (single-column compact block below 56rem), scroll-spy
 * active-section tracking, hash deep-linking with a token-driven scroll offset, focus handoff to
 * the target `<section>`, and `prefers-reduced-motion`-aware smooth scrolling. All legal TEXT stays
 * owned by the consumer — the shell only receives it through `sections` and the slots.
 *
 * Semantics: `<article>` labelled by the document title · a NAMED `<nav>` for the contents · REAL
 * `<a href="#…">` anchors carrying `aria-current="location"` · one `<section>` per entry, labelled
 * by its `<h2>`.
 */
export type LegalDocumentShellProp = {
  /** Document title — the `<h1>` that names the `<article>` (e.g. "Terms of Service"). */
  title: TitleProp;
  /**
   * Document version identifier (e.g. `"2.4"`). Rendered as a localized "Version {version}" line —
   * pass the bare identifier, never a pre-localized sentence.
   */
  version?: string;
  /**
   * Effective date as an **ISO 8601** calendar date (`yyyy-MM-dd`) or a full ISO instant. Formatted
   * for display with `Intl.DateTimeFormat` in the active locale and emitted inside a
   * `<time dateTime={effectiveDate}>`, so the machine-readable value is always the ISO input.
   * NEVER pass a pre-formatted string.
   */
  effectiveDate?: string;
  /** Short plain-language summary rendered under the metadata, above the contents. */
  summary?: ReactNode;
  /**
   * Accessible name + visible caption of the contents `<nav>` (e.g. "Contents"). Defaults to a
   * localized "Contents"; override it when two documents render in the same view, so the two `nav`
   * landmarks stay distinguishable (axe `landmark-unique`, WCAG 2.4.1).
   */
  contentsLabel?: string;
  /** The document's sections, in reading order. Drives BOTH the contents list and the body. */
  sections: LegalDocumentSectionProp[];
  /**
   * Controlled active section id (the entry marked `aria-current="location"`). Pair it with
   * `onActiveSectionChange`; omit both for the uncontrolled form.
   */
  activeSection?: string;
  /** Uncontrolled initial active section id. Defaults to the first section. */
  defaultActiveSection?: string;
  /**
   * Fires whenever the active section changes — on a contents-anchor activation, on an initial
   * hash deep link, and continuously from the scroll spy as the reader moves through the document.
   */
  onActiveSectionChange?: (sectionId: string) => void;
  /**
   * Slot above the contents list in the rail — a document switcher across the legal set
   * (Terms · Privacy · Cookies). Rendered as a plain wrapper, so the consumer owns its semantics.
   */
  documentNavigation?: ReactNode;
  /** Slot below the last section — the accept/download/print/contact actions. */
  footerAction?: ReactNode;
  id?: IdProp;
  className?: ClassNameProp;
};

// ─── ServiceRolePanel (gh#257 / DXS platform#311) ────────────────────────────────────────────────

/** @see ServiceRolePanel — one role in the master rail. Domain data is consumer-supplied. */
export type ServiceRoleItemProp = {
  /** Stable role id (the selection value). */
  id: string;
  /** Human role name (also used in accessible labels, so a plain string). */
  name: string;
  /** Secondary line under the role name. */
  description?: string;
  /** Member count caption, pluralized via CLDR. */
  memberCount?: number;
  /** A locked (system) role shows a lock badge and never offers deletion. */
  locked?: boolean;
};

/** @see ServiceRolePanel */
export type ServiceRolePanelProp = {
  /** The roles in the master collection, in render order. */
  roles: readonly ServiceRoleItemProp[];
  /** Controlled selected role id. */
  value?: string;
  /** Uncontrolled initial selected role id. Defaults to the first role. */
  defaultValue?: string;
  /** Selection change handler. */
  onValueChange?: (roleId: string) => void;
  /**
   * Detail surface for the current selection. A render function receives the selected role
   * (or `undefined` when nothing is selected); a plain node is rendered as-is.
   */
  children?: ReactNode | ((role: ServiceRoleItemProp | undefined) => ReactNode);
  /**
   * Confirmed-deletion handler. Its PRESENCE adds a delete affordance per non-locked role behind
   * the built-in destructive `AlertDialog`; the handler fires only AFTER the user confirms.
   */
  onDeleteRole?: (roleId: string) => void;
  /** Hide every mutating affordance (locked view). */
  readOnly?: boolean;
  /** Show the loading skeleton instead of the panel. Precedence: loading → denied → error → empty. */
  loading?: boolean;
  /** Custom empty content when `roles` is empty; defaults to a localized EmptyState. */
  empty?: ReactNode;
  /** Failure state: `true` = built-in localized message, any other node replaces it. */
  error?: ReactNode;
  /** Permission-denied state — refused, not failed. Takes precedence over `error`. */
  denied?: ReactNode;
  /** Retry handler for the built-in `error` state; omit to hide the retry action. */
  onRetry?: () => void;
  /** Accessible names for the two regions (localized defaults otherwise). */
  masterLabel?: string;
  detailLabel?: string;
  /** Forwarded MasterDetail geometry. */
  railWidth?: MasterDetailRailWidthProp;
  masterViewport?: MasterDetailMasterViewportProp;
  collapseBelow?: BreakpointProp | false;
  id?: IdProp;
  className?: ClassNameProp;
};
