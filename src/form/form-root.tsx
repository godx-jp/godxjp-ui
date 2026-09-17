import * as React from "react";
import { FormProvider, type FieldErrors, type FieldValues } from "react-hook-form";

import { Alert, AlertDescription } from "../components/feedback/alert";
import { ResponsiveGrid } from "../components/layout/responsive-grid";
import { useTranslation } from "../i18n/use-translation";
import { classifyQueryError } from "../lib/query-error";
import { cn } from "../lib/utils";
import { Form } from "../components/data-entry/form";
import { errorBagHasMessage } from "../components/data-entry/form-errors";
import { FormAdapterContext, FormOptionsContext } from "./form-context";
import type { FormRootProp } from "../props/components/form.prop";

export type { FormRootProp } from "../props/components/form.prop";

/** Dotted paths of every leaf error in react-hook-form's error tree, parent-first. */
function collectErrorNames(errors: unknown, prefix = "", out: string[] = []): string[] {
  if (!errors || typeof errors !== "object") return out;
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    // A leaf error carries `message`/`type`; anything else is a nested object or array of fields.
    if ("message" in value || "type" in value) out.push(path);
    else collectErrorNames(value, path, out);
  }
  return out;
}

/**
 * Scroll the FIRST invalid field (in DOM order, not registration order) into view. `FormField`
 * stamps `data-field` on every control it wires, so the lookup needs no extra plumbing.
 * Deferred a frame because react-hook-form focuses the first error AFTER `onInvalid` resolves, and
 * that focus would otherwise scroll on top of this one.
 */
function scrollFirstErrorIntoView(formEl: HTMLFormElement | null, errors: unknown): void {
  if (!formEl) return;
  const names = new Set(collectErrorNames(errors));
  if (names.size === 0) return;
  const control = Array.from(formEl.querySelectorAll<HTMLElement>("[data-field]")).find((el) =>
    names.has(el.dataset.field ?? ""),
  );
  if (!control) return;
  const focusTarget = control.matches("input, select, textarea, button, [tabindex]")
    ? control
    : control.querySelector<HTMLElement>("input, select, textarea, button, [tabindex]");
  focusTarget?.focus({ preventScroll: true });
  const target = control.closest<HTMLElement>('[data-slot="form-field"]') ?? control;
  if (typeof target.scrollIntoView !== "function") return;
  const reduceMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
}

function afterPaint(run: () => void): void {
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => run());
  else setTimeout(run, 0);
}

/**
 * FormRoot — the form shell. Provide EITHER `form` (built-in react-hook-form + Zod, client-side
 * validation) OR `adapter` (a framework-agnostic {@link FormStateAdapter} for a server-driven form
 * library — Inertia's `useForm` via `@godxjp/ui/inertia`, formik, TanStack Form).
 */
export function FormRoot<TFieldValues extends FieldValues>({
  form,
  adapter,
  onSubmit,
  onSubmitFailed,
  onSubmitError,
  submitFailedMessage,
  onReset,
  scrollToFirstError = true,
  disabled = false,
  layout,
  labelWidth,
  controlWidth,
  labelAlign,
  collapseBelow,
  density,
  columns,
  requiredMark,
  errors,
  children,
  className,
  id,
}: FormRootProp<TFieldValues>) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const { t } = useTranslation();
  const pending = React.useRef(false);
  const [submitting, setSubmitting] = React.useState(false);
  // gh#698 — a validation rejection (400/422) is the fields' to show (antd: field errors, no form
  // banner), but ONLY once the `errors` bag holds a message (a field or `<FormErrors />` renders it;
  // the gh#690 rule). With no message in the bag the banner stays, so a failure is never silently
  // swallowed. Decided at RENDER time, because the bag reaches `errors` in a later render than the
  // one that caught the rejection:
  // - `settled` holds a validation banner back for one task so that bag can arrive first —
  //   otherwise the banner flashes (and its `role="alert"` is announced) before the fields replace it.
  // - `shownByFields` latches once the bag has shown a message for THIS failure, so an app that
  //   clears the bag while the user corrects the field (`mutation.reset()`) does not pop the banner.
  const [submitFailure, setSubmitFailure] = React.useState<{
    error: unknown;
    validation: boolean;
    settled: boolean;
    shownByFields: boolean;
  } | null>(null);
  const options = React.useMemo(() => ({ disabled, submitting }), [disabled, submitting]);
  const fieldsShowFailure = submitFailure?.validation === true && errorBagHasMessage(errors);
  React.useEffect(() => {
    if (!fieldsShowFailure) return;
    setSubmitFailure((current) =>
      current && !current.shownByFields ? { ...current, shownByFields: true } : current,
    );
  }, [fieldsShowFailure]);
  const showSubmitFailed =
    submitFailure !== null &&
    submitFailure.settled &&
    !submitFailure.shownByFields &&
    !fieldsShowFailure &&
    submitFailedMessage !== false;
  const content = (
    <>
      {showSubmitFailed && (
        <Alert tone="destructive">
          <AlertDescription>
            {submitFailedMessage ?? t("dataEntry.form.submitFailed")}
          </AlertDescription>
        </Alert>
      )}
      {columns ? <ResponsiveGrid columns={columns}>{children}</ResponsiveGrid> : children}
    </>
  );
  const submit = async (work: () => void | Promise<unknown>) => {
    if (disabled || pending.current || adapter?.isSubmitting) return;
    pending.current = true;
    setSubmitting(true);
    setSubmitFailure(null);
    try {
      await work();
    } catch (error) {
      const validation = classifyQueryError(error).category === "validation";
      setSubmitFailure({ error, validation, settled: !validation, shownByFields: false });
      if (validation) {
        setTimeout(() =>
          setSubmitFailure((current) =>
            current && current.error === error ? { ...current, settled: true } : current,
          ),
        );
      }
      onSubmitError?.(error);
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  };

  // The `Form` layout shell is opt-in: it owns spacing through `.ui-form > * + *`, which would
  // stack on top of the plain `ui-stack-md` gap a bare FormRoot has always used.
  const layoutShell =
    layout !== undefined ||
    labelWidth !== undefined ||
    controlWidth !== undefined ||
    labelAlign !== undefined ||
    collapseBelow !== undefined ||
    density !== undefined ||
    requiredMark !== undefined ||
    errors !== undefined;
  const formClassName = layoutShell ? className : cn("ui-stack-md", className);
  const withLayout = (node: React.ReactElement) =>
    layoutShell ? (
      <Form
        asChild
        layout={layout}
        labelWidth={labelWidth}
        controlWidth={controlWidth}
        labelAlign={labelAlign}
        collapseBelow={collapseBelow}
        density={density}
        requiredMark={requiredMark}
        disabled={disabled}
        errors={errors}
      >
        {node}
      </Form>
    ) : (
      node
    );

  // Adapter path (server-driven): no react-hook-form. The form library owns submission
  // (e.g. `form.post(url)` inside `onSubmit`); we prevent the native navigation and pass a values
  if (adapter) {
    return (
      <FormAdapterContext.Provider value={adapter}>
        <FormOptionsContext.Provider value={options}>
          {withLayout(
            <form
              ref={formRef}
              id={id}
              className={formClassName}
              onSubmit={(event) => {
                event.preventDefault();
                void submit(() => onSubmit((adapter.getValues?.() ?? {}) as TFieldValues));
              }}
              onReset={(event) => {
                event.preventDefault();
                if (pending.current) return;
                setSubmitFailure(null);
                adapter.reset?.();
                onReset?.();
              }}
              noValidate
            >
              {content}
            </form>,
          )}
        </FormOptionsContext.Provider>
      </FormAdapterContext.Provider>
    );
  }

  // Built-in react-hook-form path.
  if (!form) {
    throw new Error("FormRoot requires either a `form` (react-hook-form) or an `adapter` prop.");
  }
  const handleInvalid = (fieldErrors: FieldErrors<TFieldValues>) => {
    onSubmitFailed?.(fieldErrors);
    if (scrollToFirstError)
      afterPaint(() => scrollFirstErrorIntoView(formRef.current, fieldErrors));
  };
  return (
    <FormProvider {...form}>
      <FormOptionsContext.Provider value={options}>
        {withLayout(
          <form
            ref={formRef}
            id={id}
            className={formClassName}
            onSubmit={(event) => {
              event.preventDefault();
              void submit(() =>
                form.handleSubmit((values) => onSubmit(values), handleInvalid)(event),
              );
            }}
            onReset={(event) => {
              event.preventDefault();
              if (pending.current) return;
              setSubmitFailure(null);
              form.reset();
              onReset?.();
            }}
            noValidate
          >
            {content}
          </form>,
        )}
      </FormOptionsContext.Provider>
    </FormProvider>
  );
}
