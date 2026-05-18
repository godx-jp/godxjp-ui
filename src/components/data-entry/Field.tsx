import { forwardRef } from "react";
import type {
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "../cn";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  help?: ReactNode;
  description?: ReactNode;
  count?: { current: number; max?: number; warnAt?: number };
  required?: boolean;
  optional?: boolean;
  optionalLabel?: ReactNode;
  tone?: FieldHelpTone;
  children: ReactNode;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
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
});

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
