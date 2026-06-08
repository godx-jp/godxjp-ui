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
  ShapeProp,
  TextAlignProp,
  TextSizeProp,
  TextToneProp,
} from "../vocabulary";

/** @see Text — typographic primitive; replaces hand-rolled `<span className="text-[13px] …">`. */
export type TextProp = Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
  /** Render element (span | p | div | label | strong | em | small). Default `span`. */
  as?: "span" | "p" | "div" | "label" | "strong" | "em" | "small";
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
};
