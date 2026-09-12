/** Foundation component prop types — @see docs/COMPONENTS.md#foundation */
import type * as React from "react";
import type {
  ActivityAnnounceProp,
  ActivityVariantProp,
  AsChildProp,
  ButtonSizeProp,
  ButtonVariantProp,
  ChildrenProp,
  ClassNameProp,
  DescriptionProp,
  DisabledProp,
  FontWeightProp,
  HeadingLevelProp,
  IdProp,
  LabelProp,
  OnClickProp,
  OnOpenChangeProp,
  OpenProp,
  PendingProp,
  RevealDelayProp,
  ShapeProp,
  SizeProp,
  TextAlignProp,
  TextSizeProp,
  TextToneProp,
  TextWhitespaceProp,
} from "../vocabulary";

/** @see Text — typographic primitive; replaces hand-rolled `<span className="text-[13px] …">`. */
export type TextProp = Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
  /** Render element. Default `span`. */
  as?:
    | "span"
    | "p"
    | "div"
    | "a"
    | "label"
    | "strong"
    | "em"
    | "small"
    | "code"
    | "kbd"
    | "dt"
    | "dd"
    | "caption"
    | "abbr";
  /**
   * Render the typography onto the child element instead of emitting one — for a router link
   * (`<Text asChild link><Link href=…>…</Link></Text>`). The child owns the element and its
   * navigation; Text owns the type step, tone, weight and truncation.
   */
  asChild?: AsChildProp;
  /**
   * This text IS a link: underline on hover and on keyboard focus, at the token underline offset,
   * and the focus mark every other interactive element draws.
   *
   * It is an AFFORDANCE, not a colour — `tone` still owns the colour and simply defaults to
   * `primary` here, so a destructive link (`link tone="destructive"`) reads destructive and still
   * underlines. Use this INSTEAD of `className="text-primary hover:underline"`, and instead of
   * `Button variant="link"` whenever the link sits in running content: `.ui-button` is a control
   * box (`white-space: nowrap`, `flex-shrink: 0`, a `--control-height` tier and inline padding),
   * so in a table cell it cannot wrap and cannot share the cell's line height.
   */
  link?: boolean;
  /** Size from the type scale — never an arbitrary px. Default `sm` (base). */
  size?: TextSizeProp;
  /** Semantic colour intent. Default `default` (foreground). */
  tone?: TextToneProp;
  /** Weight (system 2-weight: 400/500). Default `regular`. */
  weight?: FontWeightProp;
  align?: TextAlignProp;
  /** Single-line ellipsis. Mutually exclusive with `clamp` — when both are set, `clamp` wins. */
  truncate?: boolean;
  /**
   * Multi-line clamp — max rendered lines (integer ≥ 1); overflow ends in an ellipsis. Token-owned
   * line-clamp styling (never write the `line-clamp-N` utility page-side).
   */
  clamp?: number;
  /**
   * Whitespace handling. Default `normal` (CSS's own: newlines and space runs collapse).
   *
   * `pre-wrap` is for text a PERSON typed — a plain-text note, an issue description, a pasted log
   * — where the line breaks and the indentation are CONTENT, not formatting. It preserves both and
   * still wraps long lines at the container edge, and it breaks an over-long unbroken token (a URL,
   * an id) rather than letting it overflow.
   *
   * Precedence is explicit and resolved in the component, not by CSS ordering: `truncate` is a
   * single-line contract and WINS (dev builds warn, and `data-whitespace` is not emitted), while
   * `clamp` composes with it — a clamped pre-wrap block shows its first N real lines.
   */
  whitespace?: TextWhitespaceProp;
  /** Tabular figures for aligned numbers. */
  tabular?: boolean;
  decoration?: "none" | "underline" | "line-through";
  /** Inline code chip; use with as="code". */
  chip?: boolean;
  /** Monospace family (codes, ids). */
  mono?: boolean;
  htmlFor?: string;
  /**
   * Anchor attributes, for `as="a"` (and for the `<a>` a router link supplies under `asChild`).
   *
   * Declared explicitly rather than by widening the base to `AnchorHTMLAttributes`, and for the
   * same reason `htmlFor` is declared explicitly for `as="label"`: the element union is the
   * contract, so each polymorphic branch names the attributes it actually accepts instead of every
   * span silently offering an `href` it will never render.
   */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>["download"];
};

/** @see Heading — h1..h4 sized from the `--heading-h*` tokens. */
export type HeadingProp = Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> & {
  /** Heading level — sets size token AND the semantic element (override the element with `as`). */
  level?: HeadingLevelProp;
  as?: "h1" | "h2" | "h3" | "h4" | "div";
  tone?: TextToneProp;
  align?: TextAlignProp;
  truncate?: boolean;
  /** Weight (system canon: 400 · 500 · 700). Default `medium` — set `bold` for an emphasised title. */
  weight?: FontWeightProp;
};

/** @see Button */
export type ButtonProp = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariantProp;
  size?: ButtonSizeProp;
  /** Corner shape — `default` (control radius) · `pill` (fully rounded) · `sharp` (square). */
  shape?: ShapeProp;
  fullWidth?: boolean;
  /**
   * Take the space the siblings leave, and let a long label ELLIPSE instead of widening the row —
   * the same axis `Flex` calls `fill`, for the same reason.
   *
   * Button ships `flex-shrink: 0`, right almost everywhere and wrong in a constrained bar: an
   * account menu holding an avatar plus a person's name keeps its full width while the cluster
   * clips it, so a keyboard user tabs to a control they cannot see (SC 2.4.7). Until this axis
   * existed the only move was `className="min-w-0 flex-1"`, which ui-audit blocks — and which this
   * package's own Topbar guidance recommended, so the docs prescribed the utility the audit forbids.
   *
   * Sets `flex: 1 1 auto` and `min-inline-size: 0`; pair it with a `<Text truncate>` label.
   */
  fill?: boolean;
  /** Allow a text button to grow vertically for multi-line labels. */
  wrap?: boolean;
  /** Logical content alignment, especially for full-width collection actions. */
  align?: TextAlignProp;
  asChild?: AsChildProp;
  onClick?: OnClickProp;
  disabled?: DisabledProp;
  /**
   * In-flight state — shows a leading spinner (replaces a leading icon if present),
   * sets `aria-busy` and blocks activation while keeping the label to avoid layout shift.
   */
  loading?: PendingProp;
  /** Optional label to swap in while `loading` (pass the `t()`-translated string). */
  loadingText?: string;
  /**
   * Optional numeric count rendered as a borderless counter pill after the label (filter tabs /
   * segmented toggles, e.g. "Chờ bay 18").
   */
  count?: number;
  /**
   * Cap for `count` (Ant Badge parity). When `count` exceeds it the pill shows `{overflowCount}+`
   * (e.g.
   */
  overflowCount?: number;
  /**
   * Whether to render the pill when `count` is 0 (Ant Badge parity). Defaults to
   * `true` (a `0` pill shows); pass `false` to hide the pill at zero.
   */
  showZero?: boolean;
};

/**
 * @see Reveal — entrance-motion primitive (staggered fade-up). Wraps content in a real element
 * that animates in on mount reading the DS motion tokens (`--duration-slow`, `--ease-emphasized`,
 * `--reveal-distance`), replacing hand-rolled `@keyframes` + `.app-reveal`/`.d1..d6` classes.
 * Honours `prefers-reduced-motion` — the animation is dropped and content stays fully visible with
 * no layout shift.
 */
export type RevealProp = React.HTMLAttributes<HTMLDivElement> & {
  /** Child content to reveal on enter. */
  children?: ChildrenProp;
  /**
   * Stagger ordinal — an INDEX into the motion ladder (`0..6`), never a raw ms. Each step adds one
   * `--reveal-stagger-step` of delay so sibling reveals cascade.
   */
  delay?: RevealDelayProp;
  /**
   * Merge the reveal behaviour onto the single child element (Radix `Slot`) instead of rendering a
   * wrapper `<div>` — use when an extra box would break a grid/flex layout. Default `false`.
   */
  asChild?: AsChildProp;
  className?: ClassNameProp;
};

/**
 * @see Activity — the official AMBIENT-motion primitive (a continuous, unbounded "in progress"),
 * the LOOP counterpart to `Reveal`'s one-shot entrance. Reads the DS motion tokens
 * (`--activity-interval`, `--activity-stagger-step`, `--ease-standard`, `--activity-mark-offset`)
 * so a consumer never hand-rolls a looping `@keyframes`. Under `prefers-reduced-motion` the loop is
 * dropped and the mark renders in a static, fully-visible resting state — three solid dots, a solid
 * pulse mark, or a bar segment parked at the reading-start — with no layout shift, the same
 * guarantee `Reveal` gives.
 *
 * NOT `Skeleton` (content is loading — `aria-busy` + an unconditional live region), NOT
 * `Button loading` (this action is in flight). `Activity` means: something is happening,
 * indefinitely, elsewhere — someone typing, a sync running, a response streaming, a recording live.
 *
 * There is deliberately no `asChild`: unlike `Reveal` (which owns no DOM), `Activity` renders its
 * own mark structure, so there is no single child to merge onto.
 */
export type ActivityProp = Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> & {
  /** The mark. Default `dots` — three dots rising in sequence, the ellipsis convention. */
  variant?: ActivityVariantProp;
  /**
   * Size step, the standard ladder. Default `sm` — an ambient mark is never the loudest thing on
   * screen.
   */
  size?: SizeProp;
  /** Semantic colour intent. Default `muted` — ambient, not an alert. */
  tone?: TextToneProp;
  /**
   * Localized description of WHAT is happening ("Hưng đang nhập…", "同期中…"). Rendered as visible
   * `Text` beside the mark when `children` are absent; when `children` ARE present it becomes an
   * `sr-only` description instead, so the indicator is never animation-only.
   */
  label?: LabelProp;
  /**
   * Richer visible content in place of `label` (a name in a `<strong>`, a `Badge`, …). The mark
   * stays `aria-hidden`; pass `label` alongside for the sr-only description.
   */
  children?: ChildrenProp;
  /**
   * Announce the label to assistive technology. Default `false` — the DELIBERATE default, because
   * an ambient indicator that fires a live region on every socket event is a screen-reader flood.
   */
  announce?: ActivityAnnounceProp;
  className?: ClassNameProp;
};

/**
 * FloatButton `type` — the two fills Ant Design gives the corner mark.
 *
 * Ported verbatim from antd 6.6.3 (`FloatButtonType`), including the name `type`, which is NOT
 * this library's usual word for a fill (everything else says `variant`). Keeping antd's spelling
 * is the point: a consumer porting a screen copies the antd call and it compiles. The two values
 * map onto the two `Button` variants that already carry those fills — `default` → `outline`
 * (a white/surface pill with a hairline), `primary` → `default` (the brand fill).
 */
export type FloatButtonTypeProp = "default" | "primary";

/**
 * FloatButton `shape` — a round mark or a rounded square.
 *
 * antd's own vocabulary (`FloatButtonShape`), deliberately NOT the control `ShapeProp`
 * (`default | pill | sharp`) and NOT `AvatarShapeProp` (which is documented as an ENTITY mark).
 * `square` is the only shape antd lets carry text: `circle` + `content` is an antd dev warning,
 * and this port raises the same one.
 */
export type FloatButtonShapeProp = "circle" | "square";

/**
 * What opens a `FloatButton.Group`'s menu. antd `FloatButtonGroupTrigger`.
 *
 * Absent (the default) means the group is NOT a menu at all — it is a plain stack of buttons, all
 * of them visible, with no trigger. That is antd's `isMenuMode = trigger && …` branch, and it is
 * why `trigger` has no default value.
 */
export type FloatButtonTriggerProp = "click" | "hover";

/**
 * Which side of the trigger a `FloatButton.Group` menu opens towards. antd `placement`.
 *
 * PHYSICAL words, not logical ones, because they are antd's and a port that renamed them would
 * break the copy-paste this whole component exists to allow. The stylesheet resolves `left` /
 * `right` through `inset-inline-*`, so the RENDERED side still flips under `dir="rtl"`.
 */
export type FloatButtonPlacementProp = "top" | "left" | "right" | "bottom";

/**
 * The count/dot mark on a `FloatButton`'s corner. antd passes its whole `BadgeProps` here minus
 * `status`/`text`/`title`/`children`; this is that surface restricted to the fields that survive
 * this library's rules.
 *
 * NOT ported from antd's badge: `offset` (a raw `[x, y]` px tuple — geometry hand-written at the
 * call site, which `no-hardcoded-geometry` forbids and no token step spells) and `size`
 * (`default | small`, a second size ladder for a mark that is already the smallest thing on the
 * button).
 */
export type FloatButtonBadgeProp = {
  /** The number on the mark. Omit it (or pass `dot`) for a mark that carries no figure. */
  count?: number;
  /** A bare dot — "there is something here" with no quantity. Wins over `count`. */
  dot?: boolean;
  /** Cap: a `count` above this renders as `{overflowCount}+`. Default `99`, antd's. */
  overflowCount?: number;
  /** Whether `count={0}` still paints a mark. Default `false`, antd's. */
  showZero?: boolean;
  /** The mark's OWN colour as a CSS colour — data, not a semantic tone. Default: the brand fill. */
  color?: string;
};

/**
 * @see FloatButton — Ant Design's corner action: a control pinned to the viewport, above the
 * page, for a tool that must stay reachable but is not part of this page's content.
 *
 * Ported from antd 6.6.3. `Button` is in the layout flow, so pinning one meant a consumer writing
 * `position: fixed` themselves — page-local CSS that `ui-audit` blocks with no legal replacement
 * (gh#558). The corner insets are `--float-button-offset-block-end` / `-inline-end`, so a service
 * moves the mark by retuning a token instead of writing a media query.
 *
 * Deliberately NOT ported from antd: `classNames` / `styles` (per-slot style holes — they freeze
 * internal DOM slot names into public API, which docs/WHAT-BELONGS-HERE.md rules out by name),
 * `prefixCls` / `rootClassName` (antd's CSS-in-JS plumbing; this library ships static classes) and
 * `_InternalPanelDoNotUseOrYouWillBeFired`.
 */
export type FloatButtonProp = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "content" | "color"
> & {
  /** The glyph. Defaults to a document mark when the button carries no `content`, as antd does. */
  icon?: ChildrenProp;
  /**
   * A short line UNDER the icon. antd 6 renamed this to `content`; both spellings are accepted and
   * `content` wins, exactly as antd resolves them.
   *
   * @deprecated Use `content`.
   */
  description?: DescriptionProp;
  /** A short line under the icon. Only legal with `shape="square"` — a circle has no room. */
  content?: ChildrenProp;
  /** Fill. Default `default`. */
  type?: FloatButtonTypeProp;
  /** Round mark or rounded square. Default `circle`. Inherited from an enclosing Group. */
  shape?: FloatButtonShapeProp;
  /**
   * Hover/focus label. A plain node is the tooltip's content; the object form takes the same
   * `side` / `align` / `sideOffset` the `TooltipContent` primitive takes.
   *
   * When it is a STRING and no `aria-label` is given, it also becomes the button's accessible
   * name — an icon-only control with no name is a WCAG 4.1.2 failure, and a tooltip alone never
   * reaches a touch user.
   */
  tooltip?: ChildrenProp | FloatButtonTooltipProp;
  /** Renders an `<a>` instead of a `<button>`. antd's `href`. */
  href?: string;
  /** Anchor target; only meaningful beside `href`. */
  target?: React.HTMLAttributeAnchorTarget;
  /** Count / dot mark on the corner. */
  badge?: FloatButtonBadgeProp;
  /** Non-interactive. Inherited by a Group's trigger. */
  disabled?: DisabledProp;
  /** The `<button type>` attribute, since `type` is taken by the fill. Default `button`. antd 5.21+. */
  htmlType?: "button" | "submit" | "reset";
  className?: ClassNameProp;
};

/**
 * The object form of `FloatButton tooltip` — the subset of this library's `TooltipContent` props
 * that positions a tooltip. antd passes its whole `TooltipProps` here; the placement fields are
 * the ones that survive, because everything else antd offers (`color`, `overlayStyle`,
 * `overlayClassName`) is a style hole.
 */
export type FloatButtonTooltipProp = {
  /** What the tooltip says. */
  title?: ChildrenProp;
  /** Edge of the button the tooltip attaches to. Default `left`, so it clears the viewport edge. */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment along that edge. */
  align?: "start" | "center" | "end";
  /** Gap between button and tooltip, in px. */
  sideOffset?: number;
};

/**
 * @see FloatButton.Group — a stack of corner actions, optionally behind one trigger.
 *
 * Two modes, and `trigger` is the switch, exactly as in antd: WITHOUT it the group is a plain
 * stack (every button visible, no trigger rendered); WITH it the children collapse behind a
 * trigger that opens them on click or on hover.
 */
export type FloatButtonGroupProp = Omit<FloatButtonProp, "content" | "description" | "href"> & {
  /** The buttons. `FloatButton` children inherit the group's `shape`. */
  children?: ChildrenProp;
  /** Menu mode: what opens the stack. Omit for a plain always-open stack. */
  trigger?: FloatButtonTriggerProp;
  /** Controlled open state. antd warns when it is passed without `trigger`; so does this. */
  open?: OpenProp;
  /** Fires when the menu opens or closes. */
  onOpenChange?: OnOpenChangeProp;
  /** Glyph on the trigger while the menu is OPEN. Default: a close mark. */
  closeIcon?: ChildrenProp;
  /** Which way the menu opens. Default `top`. */
  placement?: FloatButtonPlacementProp;
};

/**
 * @see FloatButton.BackTop — the corner action that returns a scroll container to the top once
 * the reader is `visibilityHeight` px down it.
 *
 * `target` is antd's, and it is what makes this work in a shell that owns its own scroll: pass
 * `() => element` and BackTop watches that element instead of the document — which is the answer
 * to the objection that a document-bound BackTop competes with `MobileShell`'s single scroll
 * region.
 */
export type FloatButtonBackTopProp = Omit<FloatButtonProp, "href" | "target"> & {
  /** Scroll distance, in px, before the button appears. Default `400` (antd's). */
  visibilityHeight?: number;
  /** The scroll container to watch and to scroll. Default: the owning document. */
  target?: () => HTMLElement | Window | Document | null;
  /** Scroll-to-top animation length in ms. Default `450` (antd's); `prefers-reduced-motion` → 0. */
  duration?: number;
  /** Paint how far down the container the reader is, as a ring. Default `false`. antd 6.6+. */
  showProgress?: boolean;
  /** Fires after the scroll is started. */
  onClick?: React.MouseEventHandler<HTMLElement>;
};

/**
 * Ant Design X `Actions variant`. Governs the strip's chrome, not the buttons' intent:
 * `borderless` (the default) is a bare row of ghost buttons, `filled` gives the strip a tinted
 * ground, `outlined` a hairline boundary.
 * @see Actions
 */
export type ActionsVariantProp = "borderless" | "filled" | "outlined";

/**
 * Ant Design X `ACTIONS_ITEM_STATUS` — the four states one action can be in while it runs.
 * @see ActionsItem
 */
export type ActionsStatusProp = "default" | "running" | "loading" | "error";

/**
 * Ant Design X `ActionsFeedback` value. `default` is "no opinion recorded", not "absent".
 * @see ActionsFeedback
 */
export type ActionsFeedbackValueProp = "like" | "dislike" | "default";

/** @see Actions — one action in the strip. Ant Design X `ItemType`. */
export type ActionsItemsProp = {
  /** Identity handed back to `onClick`. Ant Design X `key`. */
  key: string;
  /**
   * What the action is called. It is the button's ACCESSIBLE NAME and its tooltip, not just the
   * tooltip — Ant X puts it in a `Tooltip` only, so its icon-only `<div onClick>` reaches a screen
   * reader as nothing at all. A plain string, because `aria-label` cannot carry a node.
   */
  label?: string;
  /** The glyph. Ant Design X `icon`. */
  icon?: React.ReactNode;
  /** Per-item handler. When present it WINS over the strip's `onClick`. Ant Design X `onItemClick`. */
  onItemClick?: (item: ActionsItemsProp) => void;
  /** Paint the action as irreversible. Ant Design X `danger`. */
  danger?: boolean;
  /** Nest the action into a menu behind one trigger. Ant Design X `subItems`. */
  subItems?: readonly Omit<ActionsItemsProp, "subItems" | "actionRender">[];
  /** Replace the rendered action entirely. Ant Design X `actionRender`. */
  actionRender?: ((item: ActionsItemsProp) => React.ReactNode) | React.ReactNode;
};

/**
 * @see Actions — the strip of actions under an assistant message (Ant Design X `Actions`): copy,
 * retry, like, and whatever else the turn offers.
 *
 * Ant X renders each action as a `<div onClick>` with the label in a `Tooltip`
 * (`es/actions/Item.js`), so the strip is unreachable by keyboard and nameless to a screen reader.
 * Here every action is a real `Button` carrying its `label` as the accessible name, and the strip
 * is the WAI-ARIA APG **Toolbar**: one tab stop, arrows between the actions.
 */
export type ActionsProp = {
  /** The actions, in order. Ant Design X `items`. */
  items: readonly ActionsItemsProp[];
  /**
   * Fires for any action without its own `onItemClick`. `keyPath` is the path from the clicked
   * action up to the strip, exactly as in Ant X (a sub-item gives `[subKey, parentKey]`).
   * Ant Design X `onClick`.
   */
  onClick?: (info: {
    item: ActionsItemsProp;
    key: string;
    keyPath: string[];
    domEvent: React.MouseEvent<HTMLElement>;
  }) => void;
  /** Ant Design X `variant`. Default `borderless`. */
  variant?: ActionsVariantProp;
  /** Ant Design X `fadeIn` — the strip fades in on mount. Honours `prefers-reduced-motion`. */
  fadeIn?: boolean;
  /** Ant Design X `fadeInLeft` — the same fade, arriving along the inline axis. */
  fadeInLeft?: boolean;
  /**
   * Accessible name of the toolbar — a plain STRING (it lands on `aria-label`). Ant X has no
   * equivalent because its strip has no role to name; a localized default applies when omitted.
   */
  label?: string;
  id?: IdProp;
  className?: ClassNameProp;
};

/**
 * @see ActionsItem — one status-aware action, usable on its own (Ant Design X `Actions.Item`).
 *
 * `status` swaps the glyph: `loading` and `error` bring their own, `running` uses `runningIcon`,
 * and everything else uses `defaultIcon` — Ant X's exact table, from `es/actions/ActionsItem.js`.
 */
export type ActionsItemProp = {
  /** Ant Design X `status`. Default `default`. */
  status?: ActionsStatusProp;
  /** The resting glyph. Ant Design X `defaultIcon`. */
  defaultIcon: React.ReactNode;
  /** The glyph while `status="running"`. Ant Design X `runningIcon`. */
  runningIcon?: React.ReactNode;
  /** Accessible name AND tooltip. Ant Design X `label` (tooltip only there). */
  label?: string;
  onClick?: OnClickProp;
  disabled?: DisabledProp;
  id?: IdProp;
  className?: ClassNameProp;
};

/**
 * @see ActionsCopy — copy this message to the clipboard (Ant Design X `Actions.Copy`).
 *
 * Ant X delegates to antd's `Typography copyable`, which swaps the glyph to a tick for 3s. That
 * feedback is reproduced, and the state change is ANNOUNCED as well as painted — a tick that only
 * appears is invisible to a screen reader (WCAG 1.4.1 / 4.1.3).
 */
export type ActionsCopyProp = {
  /** What lands on the clipboard. Ant Design X `text`. */
  text?: string;
  /** The resting glyph. Ant Design X `icon`. */
  icon?: React.ReactNode;
  /** Accessible name AND tooltip. Localized default otherwise. */
  label?: string;
  /** Fires after a successful write, so the caller can log or toast. */
  onCopy?: (text: string) => void;
  id?: IdProp;
  className?: ClassNameProp;
};

/**
 * @see ActionsFeedback — the like / dislike pair (Ant Design X `Actions.Feedback`).
 *
 * Controlled through Ant X's own field names, `value` and `onChange`, because that is the API the
 * issue asks to port. Clicking the recorded opinion again clears it back to `default`, as in Ant X.
 */
export type ActionsFeedbackProp = {
  /** Ant Design X `value`. Default `default`. */
  value?: ActionsFeedbackValueProp;
  /** Ant Design X `onChange`. */
  onChange?: (value: ActionsFeedbackValueProp) => void;
  /** Accessible name of the pair's group. Localized default otherwise. */
  label?: string;
  /** Accessible names of the two buttons. Localized defaults otherwise. */
  likeLabel?: string;
  dislikeLabel?: string;
  id?: IdProp;
  className?: ClassNameProp;
};
