/** Foundation component prop types — @see docs/COMPONENTS.md#foundation */
import type * as React from "react";
import type {
  AsChildProp,
  ButtonSizeProp,
  ButtonVariantProp,
  DisabledProp,
  FontWeightProp,
  HeadingLevelProp,
  OnClickProp,
  PendingProp,
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
};

/** @see Button */
export type ButtonProp = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariantProp;
  size?: ButtonSizeProp;
  /** Corner shape — `default` (control radius) · `pill` (fully rounded) · `sharp` (square). */
  shape?: ShapeProp;
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
   * own variant — never nest a `Badge` inside a Button for this. `0` renders.
   * Ignored when `asChild` (Radix Slot requires a single child).
   */
  count?: number;
};
