/** Form module prop types — react-hook-form + Zod 4 only. */
import type * as React from "react";
import type {
  FieldArray,
  FieldArrayPath,
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";
import type {
  BreakpointProp,
  DensityProp,
  DisabledProp,
  ErrorBagProp,
  ErrorProp,
  FormLayoutProp,
  HelperProp,
  IdProp,
  LabelProp,
  RequiredProp,
  WidthProp,
} from "../vocabulary";

/** Schema passed to useZodForm — must be Zod 4 object schema. */
export type ZodSchemaProp<T extends z.ZodType = z.ZodType> = T;

/** Options for useZodForm (resolver injected automatically). */
export type UseZodFormOptionsProp<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver"
>;

/** Return type of useZodForm. */
export type UseZodFormReturnProp<TFieldValues extends FieldValues> = UseFormReturn<TFieldValues>;

/**
 * Framework-agnostic form-state adapter — decouples `FormRoot`/`FormFieldControl` from any single
 * form library. The DS ships the built-in react-hook-form path (`form`), and an adapter lets a
 * SERVER-driven form library plug into the same auto-binding: Inertia's `useForm`
 * (`@godxjp/ui/inertia`), formik, or TanStack Form.
 */
export interface FormStateAdapter {
  /** Current value of the field `name` (dotted paths allowed if the underlying store supports them). */
  getValue(name: string): unknown;
  /** Write `value` back to the field `name` (e.g. Inertia's `setData(name, value)`). */
  setValue(name: string, value: unknown): void;
  /** Server/validation error message for `name`, or undefined when the field is valid. */
  getError(name: string): string | undefined;
  /** True while a submit is in flight (e.g. Inertia's `processing`) — drives submit-button loading. */
  isSubmitting: boolean;
  /** Optional blur handler (e.g. touch-tracking); called with the field name. */
  onBlur?(name: string): void;
  getValues?(): unknown;
  /**
   * Restore the store's initial values (e.g. Inertia's `form.reset()`). `FormRoot` calls it for a
   * native `<Button type="reset">`, so the reset button behaves identically on both paths.
   */
  reset?(): void;
}

/** @see FormRoot */
export type FormRootProp<TFieldValues extends FieldValues> = {
  /**
   * react-hook-form return (client-side Zod validation). Provide EITHER `form` OR `adapter` — `form`
   * is the built-in client path; `adapter` plugs in a server-driven form library (Inertia/formik).
   */
  form?: UseZodFormReturnProp<TFieldValues>;
  /**
   * Framework-agnostic form-state adapter (e.g. `inertiaAdapter(form)` from `@godxjp/ui/inertia`).
   */
  adapter?: FormStateAdapter;
  /** Submit handler — runs only after validation passes (antd `onFinish`). */
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  /**
   * Validation FAILED (antd `onFinishFailed`) — receives react-hook-form's error tree. Use it to
   * announce a summary; the first invalid field is focused (and scrolled to) regardless.
   * react-hook-form path only: on the adapter path the server owns validation.
   */
  onSubmitFailed?: (errors: FieldErrors<TFieldValues>) => void;
  /**
   * `onSubmit` REJECTED (the network call failed). Without this the rejection escapes as an
   * unhandled promise rejection, which is what an async `onSubmit` does today — pass a handler to
   * render a form-level error instead.
   */
  onSubmitError?: (error: unknown) => void;
  /**
   * A native `<Button type="reset">` inside the form restores `defaultValues` (adapter path:
   * `adapter.reset()`); this runs afterwards for any extra app state (a status banner, a step).
   */
  onReset?: () => void;
  /**
   * Scroll the first invalid field into view after a failed submit (antd `scrollToFirstError`).
   * Honours `prefers-reduced-motion`. Default `true`.
   */
  scrollToFirstError?: boolean;
  /**
   * Disable EVERY field under this form (antd Form `disabled`) — read by `FormFieldControl`
   * (which hands `disabled` to its render prop) and by `useFormDisabled()` for the action buttons.
   * Values are NOT dropped from the submitted payload.
   */
  disabled?: DisabledProp;
  /**
   * Field layout for every `FormFieldControl` below (antd `layout`). Setting ANY layout prop makes
   * `FormRoot` render the `Form` layout shell, whose `--form-block-gap` spacing replaces the plain
   * `ui-stack-md` stack used by a bare `FormRoot`.
   */
  layout?: FormLayoutProp;
  /** Label column width in the `horizontal` layout (antd `labelCol`). */
  labelWidth?: WidthProp;
  /** Control column width (antd `wrapperCol`). */
  controlWidth?: WidthProp;
  /** Label text alignment in the `horizontal` layout (antd `labelAlign`). */
  labelAlign?: "start" | "end";
  /** Viewport below which a `horizontal`/`inline` layout stacks; `false` never stacks. */
  collapseBelow?: BreakpointProp | false;
  /** Control density for the fields below (antd Form `size`). */
  density?: DensityProp;
  columns?: import("./data-entry.prop").FormProp["columns"];
  /** How required/optional fields are marked in their labels (antd `requiredMark`). */
  requiredMark?: boolean | "optional";
  /**
   * Server validation error bag. Fields claim their own key and `<FormErrors />` renders the
   * unclaimed remainder — the same mechanism as `Form errors`, without a second `Form` wrapper.
   */
  errors?: ErrorBagProp;
  children: React.ReactNode;
  className?: string;
  id?: IdProp;
};

/** @see FormFieldControl */
export type FormFieldControlProp<TFieldValues extends FieldValues> = Pick<
  import("./data-entry.prop").FormFieldProp,
  "id" | "field" | "labelAddon" | "layout" | "labelWidth" | "controlWidth" | "colSpan"
> & {
  name: FieldPath<TFieldValues>;
  label: LabelProp;
  required?: RequiredProp;
  helper?: HelperProp;
  /**
   * Disable this field only. Defaults to the surrounding `FormRoot disabled`. The resolved state
   * reaches the control through the render prop's `disabled`; the field's value is still submitted
   * (antd semantics), unlike react-hook-form's own `disabled`.
   */
  disabled?: DisabledProp;
  /**
   * Re-validate this field whenever one of these fields changes (antd `dependencies`) — the
   * confirm-password / date-range case, where the schema's cross-field `.superRefine()` reports on
   * THIS field but only re-runs when the OTHER one is edited. Runs only once the form has been
   * submitted, so a dependency edit never flags a field the user has not reached yet.
   */
  dependencies?: FieldPath<TFieldValues>[];
  /**
   * Read the value out of the control's change payload (antd `getValueFromEvent`). Replaces the
   * built-in DOM-event/raw-value detection — needed by a control that reports `(value, option)`.
   */
  getValueFromEvent?: (...args: unknown[]) => unknown;
  /**
   * Transform the extracted value before it is stored (antd `normalize`) — trim, upper-case,
   * digits-only. Receives the previous value so a normaliser can reject a change.
   */
  normalize?: (value: unknown, previousValue: unknown) => unknown;
  /**
   * Message shown in the error slot INSTEAD of the resolved validation error (antd `help`) — for a
   * server error the schema cannot know about.
   */
  help?: ErrorProp;
  /**
   * Force the validation state shown by the field (antd `validateStatus`) — `"validating"` for a
   * remote check in flight, `"success"` for a confirmed-unique value. A real validation error
   * always wins; mirrors `FormField validateStatus`.
   */
  validateStatus?: "success" | "warning" | "error" | "validating";
  /** Render the status icon + localized status text for `validateStatus` (antd `hasFeedback`). */
  hasFeedback?: boolean;
  /** Replace the default feedback text next to the `hasFeedback` icon. */
  feedback?: React.ReactNode;
  /**
   * Keep the value in the form state after the field unmounts (antd `preserve`, default `true`).
   * `false` unregisters it — a conditional branch that must not submit a stale value.
   */
  preserve?: boolean;
  className?: string;
  children: (field: {
    id: string;
    name: string;
    value: unknown;
    onChange: (...args: unknown[]) => void;
    onValueChange: (...args: unknown[]) => void;
    onBlur: () => void;
    ref: React.Ref<HTMLInputElement>;
    /** Present (and `true`) only when the field is disabled, so `{...field}` never re-enables a control. */
    disabled?: DisabledProp;
  }) => React.ReactNode;
};

/**
 * @see FormFieldArray — dynamic repeating fields (antd `Form.List`) on react-hook-form's
 * `useFieldArray`. `name` is the array field; each row hands back the dotted path prefix to build
 * the child `FormFieldControl name`.
 */
export type FormFieldArrayProp<
  TFieldValues extends FieldValues,
  TName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = {
  /** Path of the array in the schema (`"contacts"`, `"invoice.lines"`). */
  name: TName;
  children: (list: {
    /** One entry per row, in order. `key` is react-hook-form's stable row id — use it as the React key. */
    fields: Array<{ key: string; name: `${TName}.${number}`; index: number }>;
    /** Append one row (or several) at the end. */
    append: (value: FieldArray<TFieldValues, TName> | FieldArray<TFieldValues, TName>[]) => void;
    /** Insert one row (or several) at the front. */
    prepend: (value: FieldArray<TFieldValues, TName> | FieldArray<TFieldValues, TName>[]) => void;
    /** Insert at `index`. */
    insert: (
      index: number,
      value: FieldArray<TFieldValues, TName> | FieldArray<TFieldValues, TName>[],
    ) => void;
    /** Remove `index` (or several); omit to clear every row. */
    remove: (index?: number | number[]) => void;
    /** Move a row, keeping its state (drag-reorder). */
    move: (from: number, to: number) => void;
    /** Exchange two rows. */
    swap: (indexA: number, indexB: number) => void;
    /** Replace every row at once. */
    replace: (values: FieldArray<TFieldValues, TName>[]) => void;
    /** Array-LEVEL validation message (a `.min(1)` on the array itself), not a row's. */
    error?: string;
    /** Resolved `FormRoot disabled` — gate the add/remove buttons on it. */
    disabled: DisabledProp;
  }) => React.ReactNode;
};

/** Mapped field error from RHF — displayed via FormField error slot. */
export type FieldErrorMessageProp = ErrorProp;
