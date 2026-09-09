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
  DisabledProp,
  FontWeightProp,
  HeadingLevelProp,
  LabelProp,
  OnClickProp,
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
