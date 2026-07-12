/** Foundation component prop types — @see docs/COMPONENTS.md#foundation */
import type * as React from "react";
import type {
  AsChildProp,
  ButtonSizeProp,
  ButtonVariantProp,
  ChildrenProp,
  ClassNameProp,
  DisabledProp,
  FontWeightProp,
  HeadingLevelProp,
  OnClickProp,
  PendingProp,
  RevealDelayProp,
  ShapeProp,
  TextAlignProp,
  TextSizeProp,
  TextToneProp,
} from "../vocabulary";

/** @see Text — typographic primitive; replaces hand-rolled `<span className="text-[13px] …">`. */
export type TextProp = Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
  /** Render element. Default `span`. Covers inline/block text + description-list + code/caption. */
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
  /** Single-line ellipsis. */
  truncate?: boolean;
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
  /**
   * Span the full width of the container (`width:100%`) instead of sizing to content —
   * the prop form of `className="w-full"` for stacked/auth/dialog-footer actions (rule #42).
   */
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
   * Optional numeric count rendered as a borderless counter pill after the label
   * (filter tabs / segmented toggles, e.g. "Chờ bay 18"). Formatted with
   * `Intl.NumberFormat` in the active locale and styled to read on the button's
   * own variant — never nest a `Badge` inside a Button for this.
   * Ignored when `asChild` (Radix Slot requires a single child).
   */
  count?: number;
  /**
   * Cap for `count` (Ant Badge parity). When `count` exceeds it the pill shows
   * `{overflowCount}+` (e.g. `99+`). Defaults to 99.
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
   * `--reveal-stagger-step` of delay so sibling reveals cascade. Default `0` (enter immediately).
   */
  delay?: RevealDelayProp;
  /**
   * Merge the reveal behaviour onto the single child element (Radix `Slot`) instead of rendering a
   * wrapper `<div>` — use when an extra box would break a grid/flex layout. Default `false`.
   */
  asChild?: AsChildProp;
  className?: ClassNameProp;
};
