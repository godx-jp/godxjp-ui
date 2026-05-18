import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type {
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import {
  useController,
  type ControllerFieldState,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "../cn";
import { Checkbox } from "./Checkbox";
import { InputNumber } from "./InputNumber";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  help?: ReactNode;
  description?: ReactNode;
  count?: { current: number; max?: number; warnAt?: number };
  required?: boolean;
  optional?: boolean;
  optionalLabel?: ReactNode;
  tone?: FieldHelpTone;
  /** When set, Field binds its child to react-hook-form via `useController` and
   * clones the child with the correct value / onChange / onBlur adapter. */
  name?: FieldPath<FieldValues>;
  children: ReactNode;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  props,
  ref,
) {
  if (props.name) {
    return <ControlledField ref={ref} {...props} name={props.name} />;
  }
  return <StructuralField ref={ref} {...props} />;
});

const StructuralField = forwardRef<HTMLDivElement, FieldProps>(
  function StructuralField(
    {
      className,
      label,
      help,
      description,
      count,
      required,
      optional,
      optionalLabel,
      tone,
      children,
      name: _name,
      ...rest
    },
    ref,
  ) {
    const helpContent = help ?? description;
    return (
      <div ref={ref} className={cn("field", className)} {...rest}>
        {label !== undefined && (
          <LabelControl
            required={required}
            optional={optional}
            optionalLabel={optionalLabel}
          >
            {label}
          </LabelControl>
        )}
        {children}
        {(helpContent !== undefined || count !== undefined) && (
          <div className={count !== undefined ? "row-help" : undefined}>
            {helpContent !== undefined && (
              <HelpText tone={tone}>{helpContent}</HelpText>
            )}
            {count !== undefined && <CountText {...count} />}
          </div>
        )}
      </div>
    );
  },
);

const ControlledField = forwardRef<
  HTMLDivElement,
  FieldProps & { name: FieldPath<FieldValues> }
>(function ControlledField(
  { name, description, tone, children, ...rest },
  ref,
) {
  const { field, fieldState } = useController({ name });
  const error = extractErrorMessage(fieldState);
  const invalid = fieldState.invalid;
  const child = Children.only(children);
  const wired = isValidElement(child)
    ? adaptChild(child as ReactElement, field, invalid)
    : child;
  const resolvedTone: FieldHelpTone | undefined = error
    ? "error"
    : (tone ?? (description !== undefined ? "default" : undefined));
  return (
    <StructuralField
      ref={ref}
      tone={resolvedTone}
      help={error ?? rest.help ?? description}
      {...rest}
    >
      {wired}
    </StructuralField>
  );
});

type ControllerField = ReturnType<typeof useController>["field"];

function adaptChild(
  child: ReactElement,
  field: ControllerField,
  invalid: boolean,
): ReactElement {
  if (child.type === Checkbox) {
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      checked: Boolean(field.value),
      onCheckedChange: (next: boolean | "indeterminate") =>
        field.onChange(next === true),
      onBlur: field.onBlur,
      "aria-invalid": invalid || undefined,
    });
  }
  if (child.type === InputNumber) {
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      value: typeof field.value === "number" ? field.value : undefined,
      onValueChange: (next: number | null) => field.onChange(next),
      onBlur: field.onBlur,
      status: invalid ? "error" : undefined,
    });
  }
  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    value: field.value ?? "",
    onChange: (event: unknown) => {
      if (event && typeof event === "object" && "target" in event) {
        const target = (event as { target: { value: unknown } }).target;
        field.onChange(target.value);
      } else {
        field.onChange(event);
      }
    },
    onBlur: field.onBlur,
    ref: field.ref,
    status: invalid ? "error" : undefined,
    "aria-invalid": invalid || undefined,
  });
}

function extractErrorMessage(state: ControllerFieldState): string | undefined {
  const err = state.error;
  if (!err) return undefined;
  if (typeof err.message === "string" && err.message) return err.message;
  if (err.type) return `Invalid (${err.type})`;
  return "Invalid value";
}

// ─── Field.Label ──────────────────────────────────────────────────────

export interface FieldLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Append a red asterisk (`<span class="req">*</span>`). */
  required?: boolean;
  /** Append a "(optional)" marker (`<span class="opt">(任意)</span>`). */
  optional?: boolean;
  /** Optional label for the optional badge — defaults to "(任意)". */
  optionalLabel?: ReactNode;
  /** Inline help icon — typically a tooltip handle. Provide a `<span>` or `<button>`. */
  info?: ReactNode;
  /** Trailing slot at the right edge (e.g. an inline "Forgot password?" link). */
  extra?: ReactNode;
}

const LabelControl = forwardRef<HTMLLabelElement, FieldLabelProps>(
  function LabelControl(
    {
      className,
      children,
      required,
      optional,
      optionalLabel = "(任意)",
      info,
      extra,
      ...rest
    },
    ref,
  ) {
    return (
      <label ref={ref} className={cn(className)} {...rest}>
        <span>{children}</span>
        {required && <span className="req">*</span>}
        {optional && <span className="opt">{optionalLabel}</span>}
        {info !== undefined && <span className="info">{info}</span>}
        {extra !== undefined && (
          <>
            <span className="spacer" />
            {extra}
          </>
        )}
      </label>
    );
  },
);

// ─── Field.Help ───────────────────────────────────────────────────────

export type FieldHelpTone = "default" | "info" | "warn" | "error" | "success";

export interface FieldHelpProps extends HTMLAttributes<HTMLDivElement> {
  tone?: FieldHelpTone;
  /** Sets tone to `error` — shortcut. */
  error?: boolean;
  /** Sets tone to `warn` — shortcut. */
  warning?: boolean;
  /** Sets tone to `info` — shortcut. */
  info?: boolean;
  /** Sets tone to `success` — shortcut. */
  success?: boolean;
  /** Leading icon slot. */
  icon?: ReactNode;
}

const TONE_CLASS: Record<FieldHelpTone, string> = {
  default: "",
  info: "info",
  warn: "warn",
  error: "err",
  success: "ok",
};

const HelpText = forwardRef<HTMLDivElement, FieldHelpProps>(function HelpText(
  {
    className,
    tone,
    error,
    warning,
    info,
    success,
    icon,
    children,
    ...rest
  },
  ref,
) {
  const resolved: FieldHelpTone =
    tone ??
    (error ? "error" : warning ? "warn" : info ? "info" : success ? "success" : "default");
  return (
    <div
      ref={ref}
      className={cn("help", TONE_CLASS[resolved], className)}
      {...rest}
    >
      {icon}
      {children}
    </div>
  );
});

// ─── Field.Count ──────────────────────────────────────────────────────

export interface FieldCountProps extends HTMLAttributes<HTMLDivElement> {
  current: number;
  max?: number;
  /** Threshold (0–1) above which the count flips to "warn" tone. Default `0.9`. */
  warnAt?: number;
}

const CountText = forwardRef<HTMLDivElement, FieldCountProps>(
  function CountText(
    { className, current, max, warnAt = 0.9, ...rest },
    ref,
  ) {
    const over = typeof max === "number" && current > max;
    const near =
      typeof max === "number" &&
      !over &&
      current >= Math.floor(max * warnAt);
    return (
      <div
        ref={ref}
        className={cn(
          "count",
          near && "warn",
          over && "over",
          className,
        )}
        {...rest}
      >
        {typeof max === "number" ? `${current} / ${max}` : current}
      </div>
    );
  },
);
