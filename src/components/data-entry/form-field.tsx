import * as React from "react";

import { Label } from "../data-entry/label";
import { cn } from "../../lib/utils";
import { FieldIdentityContext, FieldNameContext, mergeAriaIds } from "../../lib/field-a11y";
import { useOptionalAppContext } from "../../app/app-provider";
import { useFormLayout } from "./form";
import { firstBagMessage, useClaimErrorKey, useFormErrorsRegistry } from "./form-errors";
import type { FormFieldProp } from "../../props/components/data-entry.prop";
import type { WidthProp } from "../../props/vocabulary";

export type {
  FormFieldProp,
  FormFieldProp as FormFieldProps,
} from "../../props/components/data-entry.prop";

const toCssLength = (v: WidthProp): string => (typeof v === "number" ? `${v}px` : v);

/** Label-click focus target — a real control, never a wrapper div. */
const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])';

export function FormField({
  id,
  name,
  field,
  label,
  required,
  helper,
  error: errorProp,
  labelAddon,
  layout: layoutProp,
  labelWidth: labelWidthProp,
  controlWidth: controlWidthProp,
  colSpan,
  className,
  children,
  staticText,
}: FormFieldProp) {
  // Form context provides defaults; per-field props override (Form → FormField priority).
  const form = useFormLayout();
  const layout = layoutProp ?? form?.layout ?? "vertical";
  const labelWidth = labelWidthProp ?? form?.labelWidth;
  const controlWidth = controlWidthProp ?? form?.controlWidth;
  const labelAlign = form?.labelAlign ?? "end";
  const collapseBelow = form?.collapseBelow ?? "md";

  // Error-bag binding (FormErrors) — a `name` claims its key in the Form's error registry
  // (so `<FormErrors />` never repeats a message a field already displays) and, when no explicit
  // `error` prop is given, resolves the field's message from the bag (first message of an array,
  // mirroring Laravel's `$errors->first()`).
  const errorsRegistry = useFormErrorsRegistry();
  useClaimErrorKey(name);
  const error =
    errorProp ??
    (name && errorsRegistry ? firstBagMessage(errorsRegistry.errors[name]) : undefined);

  // `id` is optional: when omitted the field auto-generates one and injects it
  // into the child, so every control under FormField always carries an id
  // (Chrome's "form field element should have an id or name" stays silent).
  const autoId = React.useId();
  const resolvedId = id ?? autoId;
  const labelId = `${resolvedId}-label`;
  const helperId = helper ? `${resolvedId}-helper` : undefined;
  const errorId = error ? `${resolvedId}-error` : undefined;

  // gh#337 — the field's stable MACHINE key, injected onto the control below.
  //
  // `id` is the last fallback and not the first because an id is a DOM-uniqueness token: two
  // fields for the same column on one screen (a search panel and a dialog) must differ, and a
  // read-only row's id is often a wrapper artefact (`…_field`). `name` — the error-bag key —
  // is already the server's own name for the field wherever it is set, so it outranks the id.
  // Never `autoId`: a generated `«r3»` is not a key anything can be automated against, and
  // emitting one would put noise into every DOM that never asked for it.
  const fieldKey = field ?? name ?? id;
  // `name` changes what a native form submit sends, so it is opt-in per APP, not per field
  // (@see AppProviderProp.emitFieldNames). `data-field` is inert and always emitted.
  // Optional context: FormField must keep working with no AppProvider above it.
  const emitFieldNames = useOptionalAppContext()?.emitFieldNames ?? false;

  // `staticText` (gh#294) is a read-only VALUE, not a control — none of the id/aria-* wiring
  // below applies (there is nothing to label), so it takes an entirely separate render path.
  const isStatic = staticText !== undefined;

  if (
    !isStatic &&
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production" &&
    !React.isValidElement(children)
  ) {
    // FormField wires aria-* onto a single control; multiple/no/text children can't receive them.
    console.warn(
      "FormField expects a single React element child to receive aria-describedby/aria-errormessage; " +
        "the helper text and error message will not be associated with the control. Pass plain text " +
        "via `staticText` instead of `children` for a read-only value row.",
    );
  }

  // gh#303 — the label, republished for NESTED controls. cloneElement (below) only reaches the
  // single direct child; when that child is a layout wrapper (range from/to pair, 年/月 combo)
  // every control inside it would be nameless. Controls read this context as a last-resort
  // accessible name via useFieldNameFallback — a control that already has a name keeps it.
  const fieldNameContext = React.useMemo(
    () => ({ labelId, label: typeof label === "string" ? label : undefined }),
    [labelId, label],
  );

  // gh#337 — the same republishing, for the machine key. `cloneElement` below reaches the direct
  // child; a control NESTED under a layout wrapper reads this instead and names itself from its own
  // id (see FieldIdentityContext). `null` when this field has no key of its own: a field that
  // cannot name itself must not make its children guess.
  const fieldIdentityContext = React.useMemo(
    () => (fieldKey === undefined ? null : { emitName: emitFieldNames }),
    [fieldKey, emitFieldNames],
  );

  const childProps = React.isValidElement(children)
    ? (children.props as Record<string, unknown>)
    : undefined;
  const mergeIds = mergeAriaIds;
  const childWithA11y = isStatic ? (
    // Byte-for-byte the same value typography as `Descriptions.Item`'s `dd` (gh#294), so a
    // read-only FormField row and a Descriptions value are indistinguishable when mixed. That
    // used to be two copies of the literal `text-sm` kept in sync by this comment; both call sites
    // now read the SAME token pair (#319), so a service retunes both from one place and they
    // cannot drift. --descriptions-value-line-height is the mandatory companion: `text-sm` also
    // set Tailwind's `--text-sm--line-height`, which the theme never remaps (the gh#260 bug).
    <span className="text-[length:var(--descriptions-value-font-size)] leading-[var(--descriptions-value-line-height)] break-all">
      {staticText}
    </span>
  ) : React.isValidElement(children) ? (
    React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      // The label is associated via aria-labelledby (not <label for>): composite
      // controls (Radio.Group, checkbox lists, range pairs) have no labelable root,
      // and a dangling `for` triggers Chrome's "Incorrect use of <label>" issue.
      id: (childProps?.id as string | undefined) ?? resolvedId,
      // gh#337 — the machine key. Read the child's own value first in BOTH cases: cloneElement
      // overwrites every key present in the config bag, `undefined` included, so a bare
      // `"data-field": fieldKey` would erase a value the control set for itself.
      "data-field": (childProps?.["data-field"] as string | undefined) ?? fieldKey,
      ...(emitFieldNames
        ? { name: (childProps?.name as string | undefined) ?? fieldKey }
        : undefined),
      "aria-labelledby": (childProps?.["aria-labelledby"] as string | undefined) ?? labelId,
      // Redundant `aria-label` fallback (belt-and-suspenders): the accessible name is the
      // SAME string as the visible label, just reachable even if an aria-labelledby lookup
      // ever comes back empty (id-ref timing, AT quirks). Only when `label` is plain text and
      // the child hasn't already set its own aria-label.
      "aria-label":
        (childProps?.["aria-label"] as string | undefined) ??
        (typeof label === "string" ? label : undefined),
      // Helper and error can coexist: helper stays on aria-describedby, the error on
      // aria-errormessage (surfaced when aria-invalid is true).
      "aria-describedby": mergeIds(
        childProps?.["aria-describedby"] as string | undefined,
        helperId,
      ),
      "aria-errormessage": mergeIds(
        childProps?.["aria-errormessage"] as string | undefined,
        errorId,
      ),
      "aria-required": required
        ? true
        : (childProps?.["aria-required"] as React.AriaAttributes["aria-required"]),
      "aria-invalid": error
        ? true
        : (childProps?.["aria-invalid"] as React.AriaAttributes["aria-invalid"]),
    })
  ) : (
    children
  );

  const style: React.CSSProperties = {};
  if (labelWidth != null)
    (style as Record<string, string>)["--form-label-width"] = toCssLength(labelWidth);
  if (controlWidth != null)
    (style as Record<string, string>)["--form-control-width"] = toCssLength(controlWidth);
  // colSpan travels as a custom property, NOT as `grid-column` directly, so the STYLESHEET can
  // decide where the span is safe to honour. Setting `grid-column: span 2` unconditionally does not
  // degrade to one column on a narrow grid — it fabricates an implicit second track, which then
  // auto-sizes to its content and starves the real `minmax(0, 1fr)` track to 0px. See
  // form-layout.css for the rule and the reachability failure that came out of it.
  if (colSpan != null) (style as Record<string, string>)["--form-field-col-span"] = String(colSpan);

  return (
    <div
      data-slot="form-field"
      data-layout={layout}
      data-collapse-below={String(collapseBelow)}
      data-label-align={labelAlign}
      style={Object.keys(style).length ? style : undefined}
      className={cn("ui-form-field", className)}
    >
      <div data-slot="form-field-label" className="ui-form-field-label">
        {/* asChild renders a <span>: the control is named via aria-labelledby, and a
            real <label> whose `for` can dangle (composite children) is a Chrome a11y
            issue. Click-to-focus is preserved by hand. */}
        {/* The size goes through Label's own className, not the wrapper: `.ui-label` sets
            font-size on the element itself (--control-label-font-size), so an inherited
            font-size never reaches the text. This arbitrary utility still wins — Tailwind v4
            layers utilities after components (#319).
            `ui-inline-xs` is passed for its flex-wrap, NOT its gap: `.ui-label` is imported after
            `.ui-inline-xs` at equal specificity in the same layer, so the label gap stays
            --control-label-space-gap (8px). That is unchanged from before — the old `gap-2`
            utility won the same way — so this field's 4px intent has never been honoured; a
            service that wants it tightens --control-label-space-gap rather than relying on it. */}
        <Label
          asChild
          id={labelId}
          className="ui-inline-xs text-[length:var(--form-label-font-size)]"
        >
          <span
            onClick={() => {
              const el = document.getElementById(resolvedId);
              if (!(el instanceof HTMLElement)) return;
              // Composite children put the field id on a plain wrapper —
              // focus the first real control inside it instead.
              const focusable = el.matches(FOCUSABLE_SELECTOR)
                ? el
                : el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
              (focusable ?? el).focus();
            }}
          >
            <span>{label}</span>
            {required && (
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            )}
          </span>
        </Label>
        {labelAddon}
      </div>
      <div data-slot="form-field-control" className="ui-form-field-control">
        {isStatic ? (
          childWithA11y
        ) : (
          <FieldNameContext.Provider value={fieldNameContext}>
            <FieldIdentityContext.Provider value={fieldIdentityContext}>
              {childWithA11y}
            </FieldIdentityContext.Provider>
          </FieldNameContext.Provider>
        )}
        {helper ? (
          <p id={helperId} className="text-muted-foreground text-xs">
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
