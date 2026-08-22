import { Slot } from "@radix-ui/react-slot";
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
 *
 * `asChild` renders the caller's own element instead of a `<form>`, keeping only the layout
 * context. Routing libraries own the form element — Inertia's `<Form action method>` and
 * TanStack Form both render their own — so without this every such consumer has to choose
 * between the router's submission handling and the design system's field layout, and ends up
 * hand-rolling label columns per field. Two `<form>` elements cannot nest, so wrapping is not
 * an option: `<Form asChild layout="horizontal" labelWidth={174}><InertiaForm …/></Form>`.
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
    asChild = false,
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

  if (asChild) {
    // The provider goes OUTSIDE the Slot, not inside: Slot merges these props onto the one
    // child it is given, and that child has to be the caller's real element. Nesting the
    // provider in between would hand Slot a context provider to merge className onto, which
    // renders nothing and drops every prop silently.
    //
    // `columns` is not applied here — the grid would land outside the caller's form element
    // instead of around its fields. A consumer that wants it wraps its own fields in
    // ResponsiveGrid, which is what `columns` does anyway.
    return (
      <FormLayoutContext.Provider value={ctx}>
        <Slot
          ref={ref}
          data-slot="form"
          data-layout={layout}
          className={cn("ui-form", density && `ui-density-${density}`, className)}
          {...props}
        >
          {children}
        </Slot>
      </FormLayoutContext.Provider>
    );
  }

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
