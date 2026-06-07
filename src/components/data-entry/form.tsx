import * as React from "react";

import { cn } from "../../lib/utils";
import { ResponsiveGrid } from "../layout/responsive-grid";
import type { FormProp } from "../../props/components/data-entry.prop";
import type { BreakpointProp, FormLayoutProp, WidthProp } from "../../props/vocabulary";

export type { FormProp, FormProp as FormProps } from "../../props/components/data-entry.prop";

/** Resolved layout settings shared from a Form down to its FormFields (override per field). */
export interface FormLayoutContextValue {
  layout: FormLayoutProp;
  labelWidth?: WidthProp;
  controlWidth?: WidthProp;
  labelAlign: "start" | "end";
  collapseBelow: BreakpointProp | false;
}

const FormLayoutContext = React.createContext<FormLayoutContextValue | null>(null);

/** Read the nearest Form's layout context (null when a FormField is used standalone). */
export function useFormLayout(): FormLayoutContextValue | null {
  return React.useContext(FormLayoutContext);
}

/**
 * Form — Ant-style layout container. Renders a `<form>` and provides layout (vertical/horizontal),
 * label/control width, label alignment, and a responsive collapse breakpoint to every FormField
 * inside it. A FormField may override any of these per-field. Optionally lays fields out in a
 * responsive multi-column grid via `columns` (reuses ResponsiveGrid — mobile-first, 1 col on small).
 */
export const Form = React.forwardRef<HTMLFormElement, FormProp>(function Form(
  {
    layout = "vertical",
    labelWidth,
    controlWidth,
    labelAlign = "end",
    collapseBelow = "md",
    columns,
    density,
    className,
    children,
    ...props
  },
  ref,
) {
  const ctx = React.useMemo<FormLayoutContextValue>(
    () => ({ layout, labelWidth, controlWidth, labelAlign, collapseBelow }),
    [layout, labelWidth, controlWidth, labelAlign, collapseBelow],
  );
  const content =
    columns != null ? <ResponsiveGrid columns={columns}>{children}</ResponsiveGrid> : children;
  return (
    <form
      ref={ref}
      data-slot="form"
      data-layout={layout}
      className={cn("ui-form", density && `ui-density-${density}`, className)}
      {...props}
    >
      <FormLayoutContext.Provider value={ctx}>{content}</FormLayoutContext.Provider>
    </form>
  );
});
