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
} from "../vocabulary";

/** @see Text — typographic primitive; replaces hand-rolled `<span className="text-[13px] …">`. */
export type TextProp = Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
  /** Render element. Default `span`. */
  as?:
    | "span"
    | "p"
    | "div"
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
  /** Tabular figures for aligned numbers. */
  tabular?: boolean;
  /** Monospace family (codes, ids). */
  mono?: boolean;
  htmlFor?: string;
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
