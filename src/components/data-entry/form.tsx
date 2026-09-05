import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../../lib/utils";
import { FormErrorsProvider } from "./form-errors";
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
 * inside it.
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
    errors,
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

  // The error registry is provided only when THIS Form carries `errors`. A Form without its own
  // bag must NOT shadow a surrounding FormErrorsProvider — an edit screen split into sibling
  // Card+Form sections shares one registry, and wrapping unconditionally here would send each
  // section's FormField claims into a private empty registry instead (the sibling-Form gap).
  const withRegistry = (node: React.ReactNode) =>
    errors !== undefined ? <FormErrorsProvider errors={errors}>{node}</FormErrorsProvider> : node;

  if (asChild) {
    // The providers go OUTSIDE the Slot, not inside: Slot merges these props onto the one
    // child it is given, and that child has to be the caller's real element. Nesting a
    // provider in between would hand Slot a context provider to merge className onto, which
    // renders nothing and drops every prop silently.
    //
    // `columns` is not applied here — the grid would land outside the caller's form element
    // instead of around its fields. A consumer that wants it wraps its own fields in
    // ResponsiveGrid, which is what `columns` does anyway.
    return (
      <FormLayoutContext.Provider value={ctx}>
        {withRegistry(
          <Slot
            ref={ref}
            data-slot="form"
            data-layout={layout}
            className={cn("ui-form", density && `ui-density-${density}`, className)}
            {...props}
          >
            {children}
          </Slot>,
        )}
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
      <FormLayoutContext.Provider value={ctx}>{withRegistry(content)}</FormLayoutContext.Provider>
    </form>
  );
});
