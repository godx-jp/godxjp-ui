/** Foundation component prop types — @see docs/COMPONENTS.md#foundation */
import type * as React from "react";
import type {
  AsChildProp,
  ButtonSizeProp,
  ButtonVariantProp,
  DisabledProp,
  OnClickProp,
  ShapeProp,
} from "../vocabulary";

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
