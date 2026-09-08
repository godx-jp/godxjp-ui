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
 * MobileShell block-size contract — WHERE the handheld shell gets its one-screen height, the one
 * question a bounded shell cannot answer for itself.
 * `"viewport"` (default) is the real app: the shell is exactly `100dvh`, the document never
 * scrolls, and the chrome bands stay on screen while the URL bar collapses. `"fill"` fills a
 * BOUNDED parent instead — a device-frame preview, or a phone view embedded in a wider page —
 * where a viewport-tall root would overflow its frame. Nothing else differs between the two.
 */
export type MobileShellHeightProp = "viewport" | "fill";

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

/**
 * Shared gap between layout children; components may document subsets.
 * `"none"` is a DELIBERATE zero, not the absence of a value: two lines that read as ONE block —
 * a name over its role, a weekday over its date, a tab bar with no seam between its triggers.
 * Without it those stacks had to carry `gap="xs"`, which is a visual change forced by a missing
 * step rather than by design.
 */
export type GapNameProp = "none" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Bậc SỐ, ánh xạ thẳng vào `--space-{n}` của thang gốc.
 *
 * Vì sao cần, dù đã có sáu tên ở trên: thang gốc có MƯỜI bậc
 * (0·4·8·12·16·20·24·32·40·48px) nhưng lớp tên chỉ với tới năm trong số đó.
 * `md` là 16px, `lg` là 24px — và `--space-5` (20px) tồn tại mà không có đường
 * nào gọi tới. Người viết mã gặp một thiết kế 20px thì không còn nước đi hợp
 * lệ nào: làm tròn thì lệch, viết literal thì `no-arbitrary-spacing` chặn.
 *
 * Bậc số KHÔNG theo trục — `gap={3}` là 12px ở cả hàng lẫn cột. Đó là chủ ý:
 * tên mang ý ĐỊNH ("cách nhau vừa phải, tuỳ trục"), số mang GIÁ TRỊ ("đúng
 * 12px"). Trộn hai nghĩa vào một thang là lý do thang cũ vừa thô vừa khó đoán.
 */
export type GapStepProp = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export type GapProp = GapNameProp | GapStepProp;

/**
 * Đệm TRONG của một primitive bố cục.
 *
 * ## Vì sao tồn tại
 *
 * Chạy `ui-audit` trên consumer thật (godx-chat, 08/09/2026): **42 trong 51
 * lỗi** là `no-utility-spacing`, và gần như toàn bộ chúng xin cùng một thứ —
 * padding. `<Flex className="p-3">` không phải người viết cẩu thả; đó là nước
 * đi duy nhất còn lại khi primitive không có prop đệm. Một prop thiếu đẻ ra 42
 * lỗi, và mỗi lỗi ấy trước nay chỉ có hai đường: để đỏ, hoặc mở issue rồi chờ.
 *
 * ## Vì sao ba tầng chứ không phải một
 *
 * Đo trên chính 51 lỗi ấy: có `p-3` (bốn cạnh), có `px-4`/`py-1` (theo trục),
 * và **16 dòng cần cạnh riêng** (`pt-2.5` khác `pb-2.5` trên cùng phần tử).
 * Một prop chỉ nhận một số sẽ không phủ nổi, và ép người ta quay lại class.
 *
 * Tên cạnh là LOGIC (`inlineStart`, `blockEnd`), không phải vật lý (`left`,
 * `top`) — cùng luật với `ms-`/`me-` mà audit đang bắt, và là thứ giữ cho giao
 * diện RTL không phải viết lại.
 */
export type PadSides<T> =
  | T
  | {
      /** Hai cạnh theo trục viết (trái+phải ở LTR). */
      inline?: T;
      /** Hai cạnh theo trục khối (trên+dưới). */
      block?: T;
      inlineStart?: T;
      inlineEnd?: T;
      blockStart?: T;
      blockEnd?: T;
    };

/** Đệm theo thang token — bậc tên hoặc bậc số, cùng thang với `gap`. */
export type PadProp = PadSides<GapProp>;

/**
 * Đệm bằng pixel THÔ, cho giá trị ngoài thang.
 *
 * Cùng lý do với `gapRaw`, và cùng cái giá: nó để lại `data-pad-raw` trên DOM
 * nên mỗi lần thoát đều đếm được. Thiết kế thật cần 2px, 6px, 10px, 14px, 44px
 * — thang không có bậc nào như thế, và bịt lại không làm chúng biến mất.
 */
export type PadRawProp = PadSides<number>;

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
