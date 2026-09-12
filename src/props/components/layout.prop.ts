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
  MobileShellHeightProp,
  MobileShellWidthProp,
  OrientationProp,
  TextAlignProp,
  TextToneProp,
  BreakpointProp,
  GapProp,
  PadProp,
  PadRawProp,
  ClassNameProp,
  ChildrenProp,
  IdProp,
  DisabledProp,
  DescriptionProp,
  ActionProp,
  IconProp,
  HeadingLevelProp,
  ToneProp,
  WidthProp,
  SizeProp,
} from "../vocabulary";
import type { EmptyStateToneProp } from "./data-display.prop";

/**
 * Arrangement of the page header's title band and its `extra` slot below the 640px step.
 * `responsive-inline` keeps `extra` beside the title band at the `--page-header-extra-measure`
 * measure, letting the title/subtitle wrap into what is left.
 */
export type PageContainerHeaderLayoutProp = "stack" | "responsive-inline";

/** Whole-page semantic composition owned by PageContainer. */
export type PageContainerPresetProp = "default" | "admin-collection";

/**
 * Bounded page MEASURE — the shared inline cap applied to the page header AND body together, so
 * the header `extra` action ends on the same edge as the body surface. `default` applies NO cap —
 * the page is fluid exactly as before.
 */
export type PageContainerMeasureProp = "default" | "narrow" | "medium";

/**
 * What the page's top row IS — the question that decides its type step, not how big you want it.
 * `document` (default) — the row is the page's TITLE: a record, a form, a collection, a report.
 */
export type PageContainerHeaderScaleProp = "document" | "chrome";

/** @see PageContainer */
export type PageContainerProp = {
  toolbarPad?: PadProp;
  footerPad?: PadProp;
  title: TitleProp;
  subtitle?: SubtitleProp;
  /**
   * Status/meta band rendered beside the title inside the heading — StatusBadge, environment tag,
   * "updated …" meta text.
   */
  status?: StatusProp;
  /**
   * Pending state for the title band while the page's own record resolves. Renders the
   * title/subtitle as `ui-skeleton-block` placeholders and marks the header `aria-busy`, keeping
   * the `<h1>` in the document with an sr-only accessible name (an empty heading is an axe
   * violation) so the page's heading outline never disappears mid-load.
   */
  headerLoading?: boolean;
  extra?: ExtraProp;
  /**
   * FIXED chrome band between the page header and the scrolling body — a filter strip, a status
   * bar, a "channel workflow" rail. It is a first-class page-chrome slot precisely because the
   * only alternative was hand-laying `position: sticky` at the call site (which the design system
   * forbids) or putting the strip inside the body, where it scrolls away.
   */
  toolbar?: ReactNode;
  footer?: FooterProp;
  breadcrumb?: BreadcrumbProp;
  /**
   * Override the breadcrumb `<nav>` landmark's accessible name. Defaults to a localized
   * "Breadcrumb".
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
   */
  preset?: PageContainerPresetProp;
  /**
   * How the title band and `extra` share the header row below the 640px step. Use
   * `responsive-inline` to keep ONE compact control (a search field, a single primary action)
   * beside the title at 390px, at the token-owned `--page-header-extra-measure`.
   */
  headerLayout?: PageContainerHeaderLayoutProp;
  /**
   * Whether the page's top row is a DOCUMENT TITLE or the surface's own CHROME. Pass `chrome` when
   * the row names the thing the user is already inside rather than announcing a document: a chat
   * channel, a mail thread, an IDE tab.
   */
  headerScale?: PageContainerHeaderScaleProp;
  /**
   * Bounded page measure shared by the header and the body. `narrow` (624px surface) / `medium`
   * (720px surface) cap BOTH bands to one token-owned measure (`--page-measure-{narrow,medium}`),
   * so a header action ends flush with the body surface instead of at the page edge.
   */
  measure?: PageContainerMeasureProp;
  /** Pin footer to viewport bottom on scroll — pairs well with `variant="narrow"`. */
  stickyFooter?: boolean;
  /**
   * When the footer is sticky, control WHEN it shows. `"always"` (default) keeps it pinned the
   * whole time.
   */
  footerReveal?: "always" | "onScroll";
  /**
   * Grow the body to fill the remaining shell height. Enable for a full-height DataTable,
   * SplitPane, or a chat surface whose composer is pinned to the bottom via `footer` +
   * `stickyFooter`.
   */
  fill?: boolean;
  children?: ChildrenProp;
  className?: ClassNameProp;
};

export type FlexDirectionProp = "row" | "col";
export type FlexAlignProp = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustifyProp = "start" | "center" | "end" | "between" | "around" | "evenly";

/** @see Flex */
export type FlexProp = React.HTMLAttributes<HTMLElement> & {
  /**
   * Render element — `div` (default) or `span` when the Flex sits in a PHRASING context and a
   * `<div>` would be invalid HTML: inside a `TabsTrigger`/`PopoverTrigger`/`Button` (all of which
   * render a `<button>`, whose content model is phrasing content only), inside a `<label>`, or
   * inside a `<p>`. Same closed shape as `ListRow`'s `as` — it swaps the TAG, nothing else: the
   * `.ui-flex` rules carry `display: flex`, so the box is identical either way.
   */
  as?: "div" | "span" | "ul" | "ol" | "li";
  /** Lightweight surfaces for rows and notices; no Card elevation by default. */
  surface?: "muted" | "popover" | "warning";
  /** Negative inline inset, using the same spacing scale as pad. */
  bleed?: GapProp;
  /** Floating row actions: show on parent hover, focus-within, and touch. */
  reveal?: "hover";
  direction?: FlexDirectionProp | Partial<Record<"base" | BreakpointProp, FlexDirectionProp>>;
  grow?: boolean;
  shrink?: boolean;
  gap?: GapProp;
  /**
   * CỬA THOÁT: một khoảng cách tính bằng pixel, ngoài mọi bậc của thang.
   *
   * ## Vì sao một design system lại mở cửa thoát
   *
   * Vì bịt nó lại không làm thiết kế biến mất — nó chỉ làm cách làm ĐÚNG trở
   * thành bất hợp pháp. Một bản thiết kế thật dùng 2px, 5px, 6px, 10px; thang
   * gốc không có bậc nào như thế. Người viết mã khi ấy có ba nước, và cả ba
   * đều tệ: làm tròn xuống bậc gần nhất (lệch bố cục, và "gần nhất" giữa hai
   * số cách đều vốn đã là một phép đoán), viết literal (audit chặn), hoặc mở
   * issue ngược lên rồi CHỜ. Đó là lý do mọi dự án đều lệch design — không
   * phải người viết cẩu thả.
   *
   * ## Cái giá của nó
   *
   * Nó phát ra `data-gap-raw` lên DOM. Đó không phải trang trí: nó làm mỗi lần
   * thoát trở nên ĐẾM ĐƯỢC — grep mã nguồn hoặc quét DOM đều ra, nên một kho
   * đang trôi dần khỏi thang sẽ tự lộ ra bằng con số thay vì bằng cảm giác.
   *
   * ## Khi nào ĐỪNG dùng
   *
   * Khi giá trị bạn cần có trong thang. `gap={3}` là 12px và nó đọc theo
   * `--scaling` của người dùng; `gapRaw={12}` thì không, nó đứng yên khi người
   * ta phóng to giao diện. Thang có mười bậc — hãy tiêu hết chúng trước.
   *
   * Khi có mặt, nó THẮNG `gap`, và `gap` không phát lớp nào nữa để hai bên
   * không tranh độ đặc hiệu.
   */
  gapRaw?: number;
  /**
   * Đệm TRONG, theo thang token. Nhận một bậc cho cả bốn cạnh, hoặc một object
   * theo cạnh LOGIC (`inline`, `block`, `inlineStart`, `blockEnd`…).
   *
   * Vì sao có: chạy `ui-audit` trên consumer thật (godx-chat, 08/09/2026) ra
   * **42 trong 51 lỗi** là `no-utility-spacing`, và gần như tất cả xin cùng
   * một thứ — padding. `<Flex className="p-3">` không phải cẩu thả; đó là nước
   * đi duy nhất còn lại khi primitive không có prop đệm. Một prop thiếu đẻ ra
   * 42 lỗi (gh#408).
   */
  pad?: PadProp;
  /**
   * Đệm bằng pixel THÔ, cho giá trị ngoài thang — cùng lý do và cùng cái giá
   * với `gapRaw`: nó để lại `data-pad-raw` trên DOM nên mỗi lần thoát đều đếm
   * được. Đo trên 51 lỗi ấy: thiết kế cần 2px, 6px, 10px, 14px, 44px, không
   * bậc nào có.
   *
   * Ghi đè `pad` ở TỪNG CẠNH, không phải cả cụm.
   */
  padRaw?: PadRawProp;
  align?: FlexAlignProp;
  justify?: FlexJustifyProp;
  wrap?: boolean;
  /**
   * Drop this region below a breakpoint step (`sm` 40rem · `md` 48rem · `lg` 64rem · `xl` 80rem).
   * Omit (the default) and no attribute is emitted, so no rule can match and the Flex is
   * unchanged.
   */
  hideBelow?: BreakpointProp;
  /**
   * The inverse of `hideBelow` — drop this region FROM a breakpoint step upwards, i.e. keep it
   * only on the narrow side (a compact-only affordance). Omit for no attribute and no rule.
   */
  hideFrom?: BreakpointProp;
  /**
   * ESCAPE HATCH: the same drop, at a width in PIXELS that is off every step of the scale — the
   * `gapRaw`/`padRaw` contract applied to the breakpoint axis (gh#528).
   *
   * ## Why the token form stays the default
   *
   * An off-scale breakpoint is a LOCAL EXCEPTION, not a new tier. `sm`/`md`/`lg`/`xl` are the
   * package's canonical steps, shared with `--master-detail-collapse-below` and with every
   * `collapseBelow`, so two regions asked to fold "at the same place" actually fold together.
   * A raw width folds one region and nothing else; spend the four named steps FIRST, and reach
   * here only when the canonical design specifies a width the scale does not have (a nav that
   * becomes a hamburger at 900px).
   *
   * ## The price, and why it is the right one
   *
   * It leaves `data-hide-below-raw` on the DOM, exactly like `data-gap-raw`/`data-pad-raw`, so
   * every escape is COUNTABLE — grep the source or scan the DOM and a repo drifting off the scale
   * shows up as a number instead of a feeling. Before this prop the only move left was
   * `className="hidden min-[901px]:flex"`, which `ui-audit` blocks and which counts as nothing.
   *
   * It also prints ONE media rule per distinct width (a media query cannot read a `var()`, so an
   * off-scale width can only reach CSS as a literal).
   *
   * ## The seam
   *
   * `hideBelowRaw` hides while `width < N`, `hideFromRaw` hides while `width >= N` — the SAME pair
   * of comparisons as the token steps, so the two are exact complements and at exactly N the
   * `hideBelowRaw` region is the visible one. Do NOT reach for an inclusive `<= N` here: pairing
   * `<= N` with `>= N` leaves BOTH regions hidden at exactly N, which is the one-pixel hole a
   * consumer measured on a hand-rolled `max-[900px]:` pair (gh#528).
   *
   * When present it WINS over `hideBelow`, which then emits no attribute, so the two cannot both
   * match at one width.
   */
  hideBelowRaw?: number;
  /**
   * The inverse of `hideBelowRaw` — drop the region FROM a raw pixel width upwards. Same contract,
   * same price, same seam (`width >= N`); it wins over `hideFrom` and leaves `data-hide-from-raw`
   * on the DOM.
   */
  hideFromRaw?: number;
  /**
   * Take the space the siblings leave — the Flex becomes the row's ELASTIC column.
   *
   * ## Vì sao là một trục, không phải một tiện ích
   *
   * Một hàng thật gần như luôn có hình `cố định | co giãn | cố định`: tên bên trái, thước đo ở
   * giữa, con số bên phải. Không có trục này thì nước đi duy nhất là `className="flex-1 min-w-0"`
   * — mà `ui-audit` chặn `no-utility-spacing`, nên cách làm ĐÚNG lại là cách bất hợp pháp.
   * `PageContainer` đã có `fill` với đúng nghĩa ấy; `Flex` không có là bất đối xứng, không phải
   * quyết định (gh#405 §2).
   *
   * Nó kèm luôn `min-inline-size: 0`. Đó không phải chi tiết thừa: một flex item mặc định không
   * co nhỏ hơn nội dung, nên một `Text truncate` bên trong sẽ ĐẨY hàng rộng ra thay vì cắt bớt.
   */
  fill?: boolean;
  /**
   * Bề rộng CỐ ĐỊNH của một cột trong hàng — số là px, chuỗi là mọi CSS length (`"12rem"`, `"40%"`).
   *
   * Đi kèm `flex: none`. Một `inline-size` mà sibling vẫn bóp được thì không phải cột, nó chỉ là
   * một đề nghị — và sáu thanh xếp dọc dưới nhau sẽ bắt đầu ở sáu toạ độ x khác nhau.
   *
   * Nó để lại `data-width-raw` trên DOM, cùng lý do với `gapRaw`/`padRaw`: mỗi số đo cứng viết ở
   * call site đều ĐẾM ĐƯỢC, nên một kho đang trôi khỏi thang tự lộ ra bằng con số.
   */
  width?: WidthProp;
};

/** Container column counts; omitted steps inherit from the previous step. Base defaults to 1. */
export type ResponsiveGridColumnsProp =
  number | { base?: number; sm?: number; md?: number; lg?: number };

/**
 * Takes priority over `columns` when both are set (`columns` is then ignored, not merged).
 * `pricing-plans` — the canonical billing/pricing-plan collection: 1 column until the `lg` step
 * (container ≥ 64rem), then 3 columns from `lg` upward.
 */
export type ResponsiveGridFlowProp = "rows" | "columns";

export type ResponsiveGridPresetProp = "pricing-plans";

export type MasterDetailRailWidthProp = "narrow" | "compact" | "standard" | "wide";
export type MasterDetailRailProp = "master" | "detail";
/**
 * Bounded viewport preset for the master collection. `auto` (default) never bounds it — the region
 * grows with its content, exactly as before.
 */
export type MasterDetailMasterViewportProp = "auto" | "compact" | "standard";

/** @see MasterDetail */
export type MasterDetailProp = {
  /** Opt into one-pane navigation on mobile (below the token-owned collapse threshold); desktop retains both panes. */
  mobilePane?: "master" | "detail";
  /** Back link shown above detail only in mobile navigation mode. */
  detailBack?: ReactNode;
  /** Selectable collection; always first in DOM order, so the stacked order stays list-then-detail. */
  master: ReactNode;
  /** Detail surface for the current selection. */
  children: ChildrenProp;
  /** Use `master` for a leading category/navigator rail beside a fluid detail surface. */
  rail?: MasterDetailRailProp;
  /** Rail track width: `compact` = 300px; `standard` = 320px. */
  railWidth?: MasterDetailRailWidthProp;
  /**
   * Bound the master collection to a scrollable viewport instead of letting it grow with its
   * content. `auto` (default) keeps the unbounded behaviour.
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
  /** Omit or pass null/false for a shell without the sidebar landmark or grid track. */
  sidebar?: ReactNode;
  children: ReactNode;
  topbar?: ReactNode;
  topbarLeft?: ReactNode;
  topbarRight?: ReactNode;
  logo?: ReactNode;
  breadcrumb?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  /**
   * Responsive navigation strategy below the canonical 900px shell breakpoint. - `"drawer"`
   * (default) hides the docked sidebar and exposes the accessible mobile Sheet. - `"docked"` keeps
   * the sidebar grid track, footer/account region and active navigation in the shell at narrow
   * widths. The sidebar width remains owned by `--app-shell-sidebar-width`.
   */
  responsiveNavigation?: "drawer" | "docked";
  /**
   * Which columns the topbar spans. - `"content"` (default) starts the topbar beside the sidebar,
   * so the rail runs the full height of the window and the bar sits over the content only. The
   * admin-console arrangement. - `"full"` runs the topbar edge to edge across the top with the
   * sidebar starting beneath it — the arrangement products use when the bar carries space-level
   * chrome (global search, account, notifications) that outranks the current section rather than
   * belonging to it.
   */
  topbarSpan?: "content" | "full";
  /**
   * A SECOND navigation column, narrower than `sidebar` and placed before it — the
   * workspace/organization switcher shape (Slack, Teams, Discord). Passing a node adds the track;
   * omitting it leaves the two-column shell exactly as it was. Width is
   * `--app-shell-nav-rail-width` (3.5rem — deliberately NOT the collapsed sidebar's 4rem: at equal
   * widths the two navigation tracks fuse into one block the moment the sidebar collapses).
   *
   * THE THREE COLUMNS ARE THREE SCOPES, and the scope — not the free space — is what decides where
   * a control goes. The rail is PLATFORM scope: whatever is true across every app in the
   * organization (which organization, which app, notifications, messages, events, organization
   * settings, cross-app shortcuts). The sidebar is APP scope: this app's own sections. The topbar
   * is PAGE scope: where you are and what you can do here.
   *
   * So app navigation never goes in the rail, a platform switch never goes in the sidebar, and a
   * destination that would fit both belongs to the rail — because it survives changing apps. A
   * rail that repeats the sidebar's own entries is a second chrome band carrying the first one's
   * rank, just vertical instead of horizontal.
   *
   * Orthogonal to `topbarSpan`: the rail says how many navigation COLUMNS there are, `topbarSpan`
   * says how far the BAR reaches, and every combination of the two is a real shape, so they never
   * need to be reconciled. `sidebarCollapsed` folds the sidebar track only — the rail keeps its
   * width, which is what keeps its destinations reachable while collapsed.
   *
   * Building this by hand inside the single `sidebar` slot is the trap it replaces: `Sidebar`
   * renders `.sb-root { display: contents }`, so two of them dropped side by side dissolve into
   * one flex row and both collapse to zero unless each is separately wrapped — and sizing the one
   * available track for two columns means overriding `--app-shell-sidebar-width`, which is how a
   * shipped consumer moved its content edge by 64px between routes.
   */
  navRail?: ReactNode;
  /**
   * Accessible name for the `navRail` landmark. Defaults to the localized "Workspaces".
   *
   * The rail and the sidebar are two `complementary` landmarks on one page, so ARIA requires them
   * to be tellable apart by name; the shell always supplies both defaults rather than requiring
   * this prop, so the two columns of equal rank behave the same way.
   */
  /**
   * WHICH EDGE the rail sits on. `start` (default) and `end` are the INLINE edges — logical, so an
   * RTL document mirrors them without a `[dir]` rule; `top` and `bottom` are the block edges, where
   * the rail becomes a full-measure horizontal strip and the shell grows a ROW instead of a column.
   *
   * The scope contract does not move with it: wherever it sits, the rail is PLATFORM scope. The
   * edge is a presentation choice — a docked column reads as permanent chrome (Slack), a bottom
   * strip reads as the phone/tab-bar shape, a top strip as a platform band above the app's own bar.
   * Thickness follows the orientation: `--app-shell-nav-rail-width` as a column,
   * `--app-shell-nav-rail-height` as a strip.
   *
   * Collapsing the sidebar folds the sidebar track only, at every position.
   */
  navRailPosition?: "start" | "end" | "top" | "bottom";
  /**
   * Rail content pinned to its FAR end — the counterpart of `Sidebar`'s `footer`, and the tray end
   * of a taskbar: settings, appearance, the account glyph. It follows the orientation, so it is the
   * bottom of a column and the inline-end of a strip, and it stays put while `navRail` scrolls.
   *
   * A slot rather than "whatever you put last", because pinning it needs an auto margin on the
   * right axis — geometry that would otherwise land in consumer CSS, which this library does not
   * accept. Ignored when `navRail` is not passed: there is no rail to pin anything to.
   */
  navRailEnd?: ReactNode;
  navRailLabel?: string;
  /**
   * Navigation shown in the mobile drawer at the DXS 900px breakpoint, where the docked sidebar is
   * hidden. Defaults to `navRail` followed by `sidebar` — both docked columns are hidden at that
   * width, so a default of `sidebar` alone would silently strip every app-level destination the
   * rail carries. Pass a distinct node for a mobile-tailored menu, or `null` to opt out (only when
   * navigation lives elsewhere, e.g. a bottom bar).
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
  /**
   * Page-level controls pinned to the TOP-RIGHT of the same banner row as `brand` — a locale
   * picker, a theme toggle, a "need help?" link. These belong to the PAGE, not to the auth form,
   * which is why they sit in the bar rather than inside the card. The banner renders as soon as
   * `brand` OR `actions` is present, so an actions-only bar is a legal shape.
   */
  actions?: ActionProp;
  /** Footer slot pinned to the bottom (legal links, locale switch, support). */
  footer?: ReactNode;
  /**
   * Visual contract for the auth surface. `"canonical"` applies the shared DXS compact geometry
   * (36px controls, 22.5rem card measure, and responsive page insets) through component tokens.
   */
  variant?: "default" | "canonical";
  /**
   * Named flow MEASURE — the page geometry contract for one canonical hosted-identity flow: the
   * auth card's max-width plus the desktop and mobile page gutters, all owned by component tokens
   * (`--auth-shell-{login,registration,device,context,recovery}-*`). Selecting a preset replaces
   * every consumer-side geometry override. - `"default"` (default) — the shell's own measure;
   * nothing changes. - `"login"` — SCR-001's 360px card at x=540/332/15 and y=363/363/353 for the
   * canonical 1440x900, 1024x900 and 390x844 viewports.
   */
  preset?: AuthShellPresetProp;
  /**
   * Inline MEASURE of the shell's content slot. `"default"` keeps the single auth card (24rem, or
   * the canonical variant's 22.5rem). `"wide"` opens the slot to
   * `--auth-shell-wide-card-max-width` so a SPLIT login fits — a brand/marketing panel beside the
   * auth card, the shape that previously had no shell and reached for `CenteredShell`. The wide
   * slot centres itself with auto margins, so a tall two-column layout starts at the top instead
   * of overflowing above the scroll origin. Ignored under a `preset`: a preset already owns its
   * flow geometry.
   */
  measure?: "default" | "wide";
  /**
   * Block-axis placement of the auth column, ORTHOGONAL to `preset` the way `variant` is: a preset
   * owns the page MEASURE (card width, inline gutters, section rhythm), `align` owns where that
   * column sits vertically.
   *
   * Omit it to keep the preset's own choice — `"login"` and `"registration"` anchor so a
   * requester/identity line that wraps to two lines cannot move the card, every other preset
   * centres. Pass `"center"` for a vertically centred column (the block-start inset collapses to
   * the preset's block-end one, desktop and mobile, so the padding is symmetric) or `"anchored"`
   * for a top-anchored one. This replaces re-declaring a preset's offset tokens from consumer CSS.
   *
   * HAZARD on a tall flow: a vertically centred tall card overflows ABOVE the scroll origin on a
   * short viewport, putting its first field out of reach. That is why `"registration"` anchors by
   * default; `"center"` is legal there but is the caller's judgement.
   */
  align?: "anchored" | "center";
  /**
   * Vertical density scoped to auth-card descendants. The canonical variant defaults to
   * `"compact"`; the default variant defaults to `"comfortable"`.
   */
  density?: "comfortable" | "compact";
  className?: ClassNameProp;
};

/**
 * @see MobileShell — the HANDHELD app shell: a status band, an app bar, ONE scroll region, a
 * sticky action bar and a bottom tab bar, in that fixed order.
 *
 * It is the fourth root shell, and it exists because the other three cannot express a phone app:
 * `AppShell` REQUIRES a sidebar (its bar is a grid area beside the nav rail), `AuthShell` is the
 * UNAUTHENTICATED root and centres a ~24rem card, and `CenteredShell` is a scrolling DOCUMENT —
 * its `main` scrolls the page, which is exactly what a handheld app must not do. Composing one out
 * of `Card` + `ui-card-inset*` (what docs/showcase/case6 once did) reproduces the look
 * and none of the two behaviours that matter on a real device:
 *
 *  1. The shell is the only scroll container. The root is exactly one screen tall, so the DOCUMENT
 *     never scrolls and the tab bar never slides away under a collapsing URL bar.
 *  2. Every band pads itself out of `env(safe-area-inset-*)`, so the notch never covers the app
 *     bar and the home indicator never covers the primary verb.
 *
 * Layout-only, like the other shells: it paints chrome and owns geometry, and delegates motion to
 * `Reveal`. Never nest it inside another shell — it is a ROOT.
 */
export type MobileShellProp = {
  /**
   * The scrolling screen body — the ONLY scroll container in the shell, and the only elastic band.
   * Everything else is fixed chrome, so a long list scrolls under a stationary app bar and tab bar.
   */
  children: ReactNode;
  /**
   * App bar (banner) pinned to the top: the screen title plus its inline actions. When there is no
   * `statusBar` this band absorbs the top safe-area inset itself. Omit → no banner.
   *
   * On a screen with a MODE (multi-select, search, edit) swap the whole node rather than stacking a
   * second strip under it — replacing the bar's contents is the platform pattern on both iOS and
   * Android, and it keeps one bar to read instead of two.
   */
  header?: ReactNode;
  /**
   * The band that sits IN the OS status-bar strip above the app bar — the carrier/clock row of a
   * `display-mode: standalone` PWA, or the simulated one in a device-frame preview. It absorbs the
   * top safe-area inset when present. Omit it in an ordinary browser tab, where the OS already owns
   * that strip: the header then takes the inset.
   */
  statusBar?: ReactNode;
  /**
   * The sticky action bar pinned above the tab bar — the screen's primary verb (Scan, Save, Hand
   * over) and at most one secondary. It sits OUTSIDE the scroll region, so it is always reachable
   * without `position: sticky` and without a scroll-padding hack, and it takes the home-indicator
   * inset whenever no tab bar follows it.
   */
  actions?: ActionProp;
  /**
   * Bottom tab bar (navigation) — the app's top-level destinations. Its children TILE: equal width,
   * no seam, no page gutter, so the consumer never hand-rolls a grid with a column count. Always
   * the last band, so it owns the home-indicator inset.
   */
  tabBar?: ReactNode;
  /**
   * Where the shell's one-screen height comes from. `"viewport"` (default) is the real app —
   * exactly `100dvh`, document never scrolls. `"fill"` fills a BOUNDED parent instead (a
   * device-frame preview, a phone view embedded in a wider page).
   */
  height?: MobileShellHeightProp;
  /**
   * How wide the shell is allowed to get. `"fill"` (default) takes the whole inline size it is
   * given — a real handheld, where that IS the phone. `"phone"` caps it at
   * `--mobile-shell-max-inline-size` and centres the column, for the case `height="fill"` already
   * names on the other axis: a handheld screen rendered on a viewport wider than a handheld.
   *
   * Measured at a 1280px viewport before this axis existed: `max-inline-size: none`, shell 1232px
   * wide, a four-destination tab bar spread across the whole screen. `height` had two named values
   * for exactly these two contexts and `width` had none — the asymmetry was the bug.
   */
  width?: MobileShellWidthProp;
  className?: ClassNameProp;
};

/**
 * @see Separator — the tokenized rule, optionally INTERRUPTED by a localized label.
 *
 * With no `label` the DOM, the `data-slot="separator"` and the `.ui-separator` class are exactly
 * what they have always been: an inert Radix rule, `decorative` by default, nothing announced.
 * With a `label` the root becomes the three-cell grid `rule · label · rule` and, because
 * "new messages" is CONTENT rather than decoration, a real `role="separator"` carrying the label
 * as its accessible name. Every constant — rule weight, label gap, label inset, label
 * type ramp, rule and label colour per tone — is a `--separator-*` component token (rules #44/#45),
 * so a service retunes a day divider or an unread watermark from its theme and never forks CSS.
 */
export type SeparatorProp = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  labelSize?: "2xs" | "xs" | "sm" | "md";
  space?: GapProp;
  hideBelow?: BreakpointProp;
  hideFrom?: BreakpointProp;
  /** Rule axis. Default `"horizontal"`. */
  orientation?: OrientationProp;
  /**
   * Localized text that INTERRUPTS the rule — a day divider, a "new messages" watermark, an auth
   * conjunction. The rule splits into two halves around it and the grid keeps the label optically
   * placed regardless of translation length.
   */
  label?: string;
  /** Where the label sits on the rule. Default `"center"` (the classic conjunction). */
  labelAlign?: TextAlignProp;
  /**
   * Never colour-only: the tone re-points both halves, so the distinction survives forced-colors.
   * Default `"default"`.
   */
  tone?: TextToneProp;
  /**
   * `true` (the default for an UNLABELLED rule) keeps Radix's decorative behaviour —
   * `role="none"`, nothing announced. A `label` flips the default to `false`, so the rule becomes
   * a real `role="separator"` named by the label.
   */
  decorative?: boolean;
  className?: ClassNameProp;
};

/** @see AuthDivider — the auth-scoped preset over `Separator label`. */
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
/**
 * @see AccountChip — signed-in user for a PageContainer `extra` slot, a Topbar or a footer row:
 * avatar, name and one ghost action at the control tier height.
 */
export type AccountChipProp = {
  name: string;
  email?: string;
  avatarSrc?: string;
  avatarFallback?: ReactNode;
  /** Accessible name of the action button (a sign-out label). */
  actionLabel?: ReactNode;
  onAction?: () => void;
  disabled?: DisabledProp;
  className?: ClassNameProp;
};

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
   * (padding-inline · border · backdrop), so you never hand-roll a bar.
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
   * top-aligned flowing/scrolling page shape.
   */
  align?: CenteredShellAlignProp;
  /**
   * Whole-page shell contract. `"default"` (the default) emits no attribute and keeps the shell's
   * exact box.
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
   * `h1` sits above it) and `1` in `system` mode (the surface IS the page).
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
 * `neutral` (default) — a plain count: unread items, pending rows, queued jobs.
 */
export type SidebarBadgeToneProp = Extract<ToneProp, "neutral" | "destructive">;

/** @see Sidebar */
export type SidebarItemProp = {
  id: string;
  label: string;
  /**
   * Leading 16px glyph — REQUIRED: the collapsed rail is icon-only and the expanded rail aligns
   * every label to the icon column. Its colour is themeable separately from the label via
   * `--sidebar-nav-icon-foreground` (see {@link SidebarProp}).
   */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * Count/status affix rendered in the row's `.sb-badge` pill. Pass the CONTENT ONLY — a number, a
   * string, `"9+"`.
   */
  badge?: ReactNode;
  /**
   * Emphasis of `badge`. Pass `destructive` when the count is addressed to the user rather than
   * merely unread: an @mention, a direct message, a failure waiting on them.
   */
  badgeTone?: SidebarBadgeToneProp;
  /**
   * TRAILING 16px glyph — the disclosure mark of a row that opens something (the `⌃⌄` of a
   * workspace switcher, a `→` on a row that leaves the app). Pinned to the same box as `icon`,
   * and hidden on the collapsed rail exactly like `badge`.
   *
   * It is NOT `badge`, and the difference is the pill: `badge` wraps whatever it is given in
   * `.sb-badge` — a 9999px-radius `hsl(var(--secondary))` capsule sized for a COUNT — so a
   * chevron passed there renders as a grey lozenge with a 24px SVG inside it (measured 36×24 with
   * a 24×24 glyph, beside a 16×16 leading icon in the same 32px row). A glyph draws no surface,
   * so it gets its own slot rather than a size tier on the count pill.
   *
   * Takes the COMPONENT, like `icon` — not an element. That is what lets the rail pin the size;
   * a `ReactNode` hole is how `badge` ended up carrying an unsized 24px SVG.
   */
  trailingIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  /**
   * Destination of the row. It is the SOLE interactive element (no nested `<button>`), so
   * right-click / open-in-new-tab / middle-click all work.
   */
  href?: string;
  /** Nested rows — renders a collapsible submenu group (the parent reads active when any child is). */
  children?: SidebarItemProp[];
};

/**
 * A vertical route navigation that lives INSIDE a page, not in the shell (gh#374).
 *
 * Reuses `SidebarItemProp` and `SidebarLinkComponentProp` verbatim rather than minting a parallel
 * vocabulary: the row is the same row, so a service that learnt the rail's item shape does not
 * learn a second one, and a fix to the row reaches both.
 */
export type NavListProp = Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> & {
  /** Rows, in reading order. `icon` is required by `SidebarItemProp` — the label aligns to it. */
  items: SidebarItemProp[];
  /** `SidebarItemProp.id` of the current route; that row gets `aria-current="page"`. */
  activeId?: string;
  /** Accessible name for the `<nav>` landmark. Required: a page may hold more than one. */
  label: string;
  /** Router link component — same contract as `Sidebar.linkComponent`. */
  linkComponent?: SidebarLinkComponentProp;
  /** Reports the activated row's id, for consumers driving navigation themselves. */
  onSelect?: (id: string) => void;
};

/** @see Sidebar */
export type SidebarItemData = SidebarItemProp;

/**
 * Every field is ANCHOR-SAFE — a router `<Link>` may spread the whole object onto its `<a>`
 * without emitting an unknown-DOM-attribute warning.
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
  /**
   * Reports selection to `Sidebar.onSelect` after the router link runs its own handler.
   *
   * Typed on `Element`, NOT `HTMLElement`. Handler parameters are contravariant, so a link
   * component that accepts the wider `MouseEvent<Element>` — Inertia's `<Link>`, react-router's,
   * TanStack's — cannot receive a prop narrowed to `HTMLElement`, and the anchor-safe contract
   * this type promises would only hold behind a cast at every call site.
   */
  onClick?: React.MouseEventHandler<Element>;
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
 *. Spreading `rowProps` — including its `children` — now yields the canonical row.
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
   * Status/plan affordance rendered end-aligned in the expanded trigger and in the menu row (e.g.
   * `<Badge tone="warning">Trial</Badge>`).
   */
  badge?: ReactNode;
  /**
   * Localized screen-reader text for `badge`. Required whenever the badge carries meaning the
   * accessible name would otherwise lose (WCAG 1.1.1 / 1.4.1): the trigger's `aria-label` owns its
   * accessible name, so the badge is announced through `aria-describedby` instead.
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
   * WHICH SURFACE the panel opens on.
   *
   * - `"auto"` (default) — popover above `--sheet-responsive-breakpoint-width`, focus-trapped
   *   bottom Sheet at or below it.
   * - `"dialog"` — a centred modal above that breakpoint, the same bottom Sheet below it. Reach for
   *   this once the panel carries more than a name per row — a role, a plan, a member count, a
   *   "create organization" action. A popover is anchored to its trigger, clipped by the viewport
   *   and sized by `--org-switcher-menu-width`; a dialog has a real title, a scrolling body and a
   *   footer, and takes the reader's full attention, which is the right trade when switching
   *   organization re-scopes everything on screen.
   * - `"popover"` / `"sheet"` — pinned to one surface at every width. Useful for a deterministic
   *   embedded surface or a component test, rarely in a product.
   *
   * `auto` and `dialog` are the two RESPONSIVE pairs and differ only in their desktop half; the
   * mobile half is the same Sheet, because a centred modal on a phone is a Sheet with worse
   * ergonomics. All four resolve the breakpoint through the shared `useSheetResponsiveMode()`
   * hook, so a service moves the line once for every overlay.
   */
  responsive?: "auto" | "popover" | "sheet" | "dialog";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: ClassNameProp;
};

/**
 * One app tile in the public {@link AppLauncher} contract.
 *
 * A tile is a REAL LINK, always. There is no `onClick`-only entry and no `disabled` entry: an app
 * the viewer may not open is an app the consumer does not pass. A launcher that renders inert tiles
 * is a launcher that teaches its users to stop trusting the grid.
 */
export type AppLauncherApp = {
  /** Stable app identifier — the React key, and the `data-app` hook an end-to-end test holds. */
  id: string;
  /** Visible app name. It is also the tile's accessible name — the mark is presentational. */
  name: string;
  /** The destination. Required, because the tile IS an `<a href>` (WCAG 2.2 / APG: link, not button). */
  href: string;
  /**
   * Owned mark — a Lucide icon, a `<Logo>`, an `<img>`, an `<Avatar>`. Rendered `aria-hidden`;
   * when omitted the launcher falls back to the first character of `name`, exactly as
   * `OrgSwitcher` does for an organization with no avatar.
   */
  icon?: ReactNode;
  /** The app the viewer is currently inside. That tile carries `aria-current="page"`. */
  current?: boolean;
  /**
   * The destination leaves this SPA. Such a tile renders a plain `<a target="_blank" rel="noreferrer
   * noopener">` and DELIBERATELY bypasses `linkComponent`: a client-side router link to another
   * origin is a router asked to route somewhere it does not own, which is how a launcher entry
   * turns into a blank screen. Pair it with `labels.externalHint` (WCAG 3.2.5).
   */
  external?: boolean;
};

/** A labelled section of the launcher grid — the "more from …" band of the Google-style panel. */
export type AppLauncherGroup = {
  /** Section heading. Rendered as a real heading and used to name the section's own grid. */
  label: string;
  apps: readonly AppLauncherApp[];
};

/** Localized copy owned by the consuming product, never hard-coded by the component. */
export type AppLauncherLabels = {
  /**
   * Accessible name of the nine-dot trigger ("Apps" / "アプリ"). A plain string, NOT a function of
   * the current app the way `OrgSwitcherLabels.trigger` is a function of the organization: the
   * launcher's trigger shows no current value, so naming one in the trigger would announce a
   * destination the button does not go to.
   */
  trigger: string;
  /** Panel name — the popover's accessible name and the bottom Sheet's header title. */
  title: string;
  empty: string;
  loading: string;
  retry?: string;
  /** Screen-reader suffix for an `external` tile, e.g. "(opens in a new tab)" (WCAG 3.2.5). */
  externalHint?: string;
};

/**
 * @see AppLauncher — the PLATFORM-scope app switcher that lives in the topbar.
 *
 * Related, and repeatedly confused with it:
 *
 * - `ServiceLauncherCard` (data-display) is also a launcher tile, but a PAGE-SIZED one: status,
 *   hostname, plan, an action button, a reason it is locked. It belongs on a service-catalogue
 *   page, where choosing is a considered act. `AppLauncher`'s tile is bar-sized — mark plus name,
 *   the whole tile a link — because switching app is a reflex, not a decision. Neither is built
 *   out of the other; a grid of `ServiceLauncherCard`s inside a popover is the wrong component.
 * - `AppShellProp.navRail` expresses the SAME platform scope as a docked column. These are the two
 *   ways to say it, and a product picks ONE: the launcher suits a platform with MANY apps where
 *   switching is occasional (the Google Workspace shape), the rail suits a single product where
 *   switching workspace is a constant action worth permanent screen width (the Slack shape).
 *   Shipping both puts one scope in two places and makes neither authoritative.
 */
export type AppLauncherProp = {
  /** Ungrouped apps, rendered first, with no heading above them. */
  apps: readonly AppLauncherApp[];
  /** Labelled sections rendered after `apps`, in order. */
  groups?: readonly AppLauncherGroup[];
  labels: AppLauncherLabels;
  /**
   * Grid column count. Omit it and the panel keeps the stylesheet's own `--app-launcher-columns`
   * (3, the Google-launcher shape, declared on `.ui-app-launcher-panel`): the default is where a
   * theme can reach it, and this prop is the per-instance override written inline on top.
   *
   * `responsive="fullscreen"` steps that DEFAULT up with the surface — 3 · 4 · 5 · 6 on the house
   * container ladder — because a fixed three columns on a full viewport is three columns of tiles
   * and a screen of nothing. Passing `columns` still wins everywhere: an inline custom property
   * beats every stylesheet rule, so a stated count is a stated count on both surfaces.
   */
  columns?: number;
  /**
   * THE framework-router contract, reusing `SidebarLinkComponentProp` VERBATIM — the same type
   * `Sidebar` and `NavList` take, so a service that already wrote `inertiaSidebarLink(Link)` or
   * `createSidebarLink(Link, "to")` for its rail hands the same value here. The launcher still
   * composes the tile (mark, name, `aria-current`, the external hint); the consumer supplies only
   * the element type. `external` apps bypass it — see {@link AppLauncherApp.external}.
   */
  linkComponent?: SidebarLinkComponentProp;
  loading?: boolean;
  /** Error content replaces the grid while preserving the trigger and the retry affordance. */
  error?: ReactNode;
  onRetry?: () => void;
  /**
   * `"auto"` (default) uses the desktop popover above `--sheet-responsive-breakpoint-width` and a
   * focus-trapped bottom Sheet at/below it — the SAME token that drives `SheetContent
   * responsive="auto"`, resolved through the shared `useSheetResponsiveMode()` hook, so a service
   * moves the drawer line once for every overlay instead of per component.
   *
   * `"fullscreen"` is the LAUNCHPAD: one full-viewport surface, the page behind it blurred, the
   * grid floating on that ground at tile size — the macOS Launchpad / Windows Start shape. It is
   * pinned at every width, because a start surface that becomes a popover on a wide screen is two
   * different products.
   *
   * WHEN IT IS RIGHT, AND WHEN IT IS NOT. This prop used to say a modal was always wrong here:
   * "a launcher grid is a jump table, and a modal that takes over the screen to offer nine links
   * is heavier than the errand." That reasoning is sound for a launcher in ONE application's
   * topbar, where the grid is a shortcut away from the work on screen and the work should stay
   * visible. It does not hold for a PLATFORM start bar — a strip that is present in every service,
   * whose launcher is the primary way to move between products rather than a shortcut. There the
   * grid IS the errand, the page behind it is the thing being left, and the interruption is the
   * point. Keep `"auto"` for a topbar launcher; reach for `"fullscreen"` for a dock.
   */
  responsive?: "auto" | "popover" | "sheet" | "fullscreen";
  /**
   * The BOX the trigger takes — the same split `AppSettingToggle` draws, and for the same reason.
   * `bar` (default) is a `TopbarItem`: a cell as tall as the bar, whose hover is the bar's own
   * surface. `icon` is a square ghost `Button`, for chrome that is NOT a bar — a nav rail, a card
   * header, a toolbar. A `TopbarItem` outside a bar has nothing to bleed to: it stretches to a
   * container that never set a band height, and its squared corners and full-bleed hover read as a
   * broken cell. The panel, the grid and the responsive contract are identical either way.
   */
  appearance?: "bar" | "icon";
  /**
   * Which side of the trigger the panel opens on, and how it aligns to it. Both default from
   * `appearance` — a bar drops the grid below and aligns to the bar's end; anything else opens to
   * the inline-end aligned to the trigger's start.
   *
   * State them when the chrome can be RE-DOCKED. `appearance` says the trigger is not in a bar; it
   * cannot say which way is out, and a rail pinned to the top edge still opens downward. Measured
   * without this: a launcher in a top strip opened sideways and left the panel 440px from the
   * trigger it belonged to.
   */
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
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
  /**
   * Header slot ABOVE the navigation, replacing `product`.
   *
   * Pass a FUNCTION to follow the EFFECTIVE collapsed state. A plain node cannot: `AppShell` hands
   * the same Sidebar to the drawer and the drawer un-collapses the rows (see `NavSurface`), so a
   * node built from the consumer's own `collapsed` boolean renders a glyph-only lockup inside a
   * full-width drawer. The escape hatch consumers reach for is a SECOND hand-built `Sidebar` in
   * `AppShell.mobileNav` — and that override is precisely what switches off `railInDrawer`, so the
   * `navRail` silently stops reaching mobile. The function is called with the surface-effective
   * value, which removes the reason to build the second node at all.
   *
   * SCOPE: this is the APP's brand lockup. A PLATFORM switch (which organization, which app) does
   * not belong here — see AppShell's `navRail` for where it goes and why.
   */
  brand?: ReactNode | ((collapsed: boolean) => ReactNode);
  collapsed?: boolean;
  children?: ChildrenProp;
  /**
   * THE framework-router contract. Supply only the LINK ELEMENT TYPE; the Sidebar still
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
   * `<Link>{item.label}</Link>` silently dropped every icon and badge (the production
   * regression). `rowProps` now also carries the composed `children`, so spreading it restores the
   * canonical row.
   */
  renderItem?: (item: SidebarItemData, rowProps: SidebarRenderItemProp) => ReactNode;
  /**
   * Footer slot pinned BELOW the scroll area — identity, status, a mode switch.
   *
   * Takes a FUNCTION for the same reason `brand` does, and it is the same reason twice because
   * both slots live INSIDE the collapsible rail: a plain node is built outside this component and
   * cannot see the EFFECTIVE collapsed state, so the consumer has no correct move. Reading their
   * own `collapsed` boolean renders a glyph-only footer inside the full-width drawer (`AppShell`
   * hands the same Sidebar to both surfaces and the drawer un-collapses); building a second
   * Sidebar for `AppShell.mobileNav` is the override that switches `railInDrawer` off; doing
   * neither leaves the expanded footer to reflow inside a 64px rail (measured: a two-line identity
   * block went 255×66 docked → 63×111 collapsed, wrapping the name across three lines).
   *
   * The function is called with the surface-effective value. A plain `ReactNode` still works
   * unchanged.
   */
  footer?: ReactNode | ((collapsed: boolean) => ReactNode);
  /** Override the nav landmark's accessible name. Defaults to a localized "Main navigation". */
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
  height?: "bar" | "auto";
  pad?: PadProp;
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
 * @see TopbarItem — ONE interactive cell of a {@link TopbarProp} slot: the account button, a
 * settings trigger, a notifications bell.
 *
 * It exists because the alternative is a `Button`, and a Button in a bar is a control that landed
 * in the bar rather than a part of it — a pill of its own height floating in a taller strip, with
 * its own hover surface and its own focus ring drawn around that pill. Fluent, SLDS, Atlassian and
 * and enterprise pro-layouts all draw a top-bar trigger the other way: the cell is as tall as the bar, its
 * hover is the bar's own surface, and the focus mark is hosted INSIDE the cell because a
 * full-bleed cell has nothing outside itself to ring.
 */
export type TopbarItemProp = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /**
   * Render the bar-cell shape ONTO the child instead of emitting a `<button>` — for a router link,
   * or for a menu/popover trigger that needs to own the element itself.
   */
  /** Hide below a shared responsive breakpoint, without changing cell height. */
  hideBelow?: BreakpointProp;
  /**
   * Unread count OVERLAID on the cell's glyph — the notification-bell affordance the cell's own use
   * cases name (gh#398). Pass the CONTENT ONLY, exactly like `SidebarItemProp.badge`: a number, a
   * string, `"99+"`. Position, size and colour come from `--topbar-item-badge-*`, so the count does
   * NOT widen the cell (an inline chip pushes the end cluster's shrink budget around every time the
   * count crosses a digit boundary) and a theme can retune the overlay once.
   *
   * The count is not an accessible name: give the cell an `aria-label` that says what the number
   * means (`aria-label={t("topbar.notifications.unread", { count })}`).
   */
  badge?: ReactNode;
  /**
   * Emphasis of `badge`. Vocabulary shared VERBATIM with `SidebarItemProp.badgeTone` so one count
   * pill reads the same in the rail and in the bar: `destructive` when the count is addressed to
   * the user rather than merely unread.
   */
  badgeTone?: SidebarBadgeToneProp;
  asChild?: boolean;
  children?: ReactNode;
  className?: ClassNameProp;
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
  /** Document version identifier (e.g. `"2.4"`). */
  version?: string;
  /**
   * Effective date as an **ISO 8601** calendar date (`yyyy-MM-dd`) or a full ISO instant.
   * Formatted for display with `Intl.DateTimeFormat` in the active locale and emitted inside a
   * `<time dateTime={effectiveDate}>`, so the machine-readable value is always the ISO input.
   */
  effectiveDate?: string;
  /** Short plain-language summary rendered under the metadata, above the contents. */
  summary?: ReactNode;
  /** Accessible name + visible caption of the contents `<nav>` (e.g. "Contents"). */
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

/**
 * Which axis a `DraggablePanel` moves on. react-draggable's `axis`, ported verbatim including
 * `"none"` (mounted, but pinned where it started).
 */
export type DragAxisProp = "both" | "x" | "y" | "none";

/**
 * How far a `DraggablePanel` may travel. react-draggable's `bounds`, trimmed to the two forms that
 * survive this library's rules: `"viewport"` keeps the whole panel on screen, `"none"` lets it go
 * anywhere. react-draggable also accepts `'parent'`, a CSS selector and a `{left, top, right,
 * bottom}` object — the selector is a back door into internal DOM (the layer
 * docs/DESIGN-AUTHORITY.md refuses alongside antd's `components` / `prefixCls`), and the object is
 * spelled in PHYSICAL directions, which cannot mirror for an RTL locale.
 */
export type DragBoundsProp = "viewport" | "none";

/** Resting corner of a `DraggablePanel`, in logical directions so it mirrors under RTL. */
export type DraggablePanelPlacementProp = "top-start" | "top-end" | "bottom-start" | "bottom-end";

/**
 * Offset from the resting corner, in CSS pixels, on the PHYSICAL axes — the same frame the pointer
 * reports in, so no RTL sign flip exists to get wrong. react-draggable's `{x, y}`.
 */
export type DraggablePanelPositionProp = { x: number; y: number };

/**
 * @see DraggablePanel — a floating surface the person using it can MOVE, so a docked assistant
 * stops covering the thing they are asking about.
 *
 * The movement props take react-draggable's names, because react-draggable is what antd's own
 * "Draggable Modal" demo prescribes and antd has no component of its own for this. The library is
 * NOT a dependency here: the drag is the repo's existing window-level pointer pattern.
 */
export type DraggablePanelProp = Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "children" | "onDrag"
> & {
  /** Panel name. A string also becomes the region's accessible name. */
  title: TitleProp;
  children?: ChildrenProp;
  /** Trailing slot in the title bar, before the close control. */
  extra?: ExtraProp;
  /** Resting corner before any movement. Default `bottom-end`. */
  placement?: DraggablePanelPlacementProp;
  /** Panel width, from the token scale. Default `md`. */
  width?: Extract<SizeProp, "sm" | "md" | "lg">;
  /** react-draggable `axis`. Default `both`. */
  axis?: DragAxisProp;
  /** react-draggable `bounds`. Default `viewport`. */
  bounds?: DragBoundsProp;
  /** react-draggable `position` — controlled offset. Pair with `onPositionChange`. */
  position?: DraggablePanelPositionProp;
  /** react-draggable `defaultPosition` — starting offset when uncontrolled. */
  defaultPosition?: DraggablePanelPositionProp;
  /**
   * Fires with the clamped offset after every pointer frame and every keyboard nudge. The panel
   * REPORTS its position and never stores it: where it is remembered, and per what scope, is the
   * consumer's decision.
   */
  onPositionChange?: (position: DraggablePanelPositionProp) => void;
  /** Presence renders the close control in the title bar (antd Modal's `onCancel`). */
  onClose?: () => void;
  /** react-draggable `disabled` — the panel stays, the handle stops moving it. */
  disabled?: DisabledProp;
  className?: ClassNameProp;
};
