import { forwardRef } from "react";
import type {
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "./cn";

/**
 * Field — label + control + help vertical group, matching the canonical
 * `.field` atom from `K:comp-inputs.html:45-52`.
 *
 * Composes from sub-primitives so consumers stay structural:
 *
 *   <Field>
 *     <Field.Label required info="Hover tip…">従業員コード</Field.Label>
 *     <Input placeholder="EMP-0001" />
 *     <Field.Help>英数字 4–8 文字</Field.Help>
 *   </Field>
 *
 *   <Field>
 *     <Field.Label optional>早退理由</Field.Label>
 *     <Textarea rows={3} />
 *     <Field.RowHelp>
 *       <Field.Help>承認者のみ閲覧可</Field.Help>
 *       <Field.Count current={182} max={200} />
 *     </Field.RowHelp>
 *   </Field>
 *
 * Visual contract maps 1:1 to the dxs-kintai field hierarchy. Tone
 * variants (`error`, `warn`, `info`, `success`) re-target the help
 * line through the canonical `.help.err` / `.help.warn` / `.help.info` /
 * `.help.ok` modifiers from `shell.css`.
 */

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const FieldRoot = forwardRef<HTMLDivElement, FieldProps>(function FieldRoot(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn("field", className)} {...rest}>
      {children}
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

const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel(
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

const FieldHelp = forwardRef<HTMLDivElement, FieldHelpProps>(function FieldHelp(
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

const FieldCount = forwardRef<HTMLDivElement, FieldCountProps>(
  function FieldCount(
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

// ─── Field.RowHelp ────────────────────────────────────────────────────

const FieldRowHelp = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function FieldRowHelp({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("row-help", className)} {...rest}>
        {children}
      </div>
    );
  },
);

// ─── Public surface ───────────────────────────────────────────────────

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Help: FieldHelp,
  Count: FieldCount,
  RowHelp: FieldRowHelp,
});

export { FieldLabel, FieldHelp, FieldCount, FieldRowHelp };
