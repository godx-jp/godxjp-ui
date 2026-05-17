import {
  forwardRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

/**
 * Input — text input with affix slots that match the canonical
 * dxs-kintai `.input-wrap` shell.
 *
 *   <Input prefix={<SearchIcon />} suffix={<EyeIcon />} />
 *   <Input addonBefore="https://" addonAfter=".com" />
 *   <Input size="large" status="error" />
 *
 * When `prefix` / `suffix` is provided the input is wrapped in a
 * `.input-wrap` shell that owns the focus ring while the icon sits
 * inside the field. When `addonBefore` / `addonAfter` is provided the
 * input + addons form a connected group; the addons render inside the
 * same `.input-wrap` as canonical `.affix.pre` / `.affix.suf`.
 */

export type InputSize = "small" | "default" | "large";
/**
 * Form-field validation state per cardinal rule 23 §B vocabulary
 * (`"default" | "success" | "warning" | "error"`). Drives the border
 * + ring + helper-text color via the semantic chain.
 */
export type InputStatus = "default" | "success" | "warning" | "error";

export interface InputProps
  extends Omit<ComponentProps<"input">, "prefix" | "size"> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  size?: InputSize;
  status?: InputStatus;
  /** Padding for the inner input — usually auto-derived from prefix/suffix. */
  inputStyle?: CSSProperties;
}

const SIZE_CLASS: Record<InputSize, string> = {
  small: "input-size-small",
  default: "",
  large: "input-size-large",
};

const STATUS_CLASS: Record<InputStatus, string> = {
  default: "",
  success: "input-status-success",
  warning: "input-status-warning",
  error: "input-status-error",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    size = "default",
    status = "default",
    className,
    inputStyle,
    type = "text",
    readOnly,
    ...rest
  },
  ref,
) {
  const sizeClass = SIZE_CLASS[size];
  const statusClass = STATUS_CLASS[status];

  // Bare input — no decoration.
  if (!prefix && !suffix && !addonBefore && !addonAfter) {
    return (
      <input
        ref={ref}
        type={type}
        readOnly={readOnly}
        className={cn(
          "input",
          sizeClass,
          statusClass,
          readOnly && "input-readonly",
          className,
        )}
        style={inputStyle}
        {...rest}
      />
    );
  }

  // Affix + addon shell — single canonical `.input-wrap` with
  // `.affix.pre` / `.affix.suf` per dxs-kintai design system.
  return (
    <div
      className={cn(
        "input-wrap",
        sizeClass,
        statusClass,
        readOnly && "input-readonly",
        className,
      )}
    >
      {addonBefore !== undefined && (
        <span className="affix pre">{addonBefore}</span>
      )}
      {prefix !== undefined && <span className="affix pre">{prefix}</span>}
      <input
        ref={ref}
        type={type}
        readOnly={readOnly}
        style={inputStyle}
        {...rest}
      />
      {suffix !== undefined && <span className="affix suf">{suffix}</span>}
      {addonAfter !== undefined && (
        <span className="affix suf">{addonAfter}</span>
      )}
    </div>
  );
});

/**
 * Textarea — `rows`, `autoSize`, `showCount`, `maxLength`, `resize`,
 * `status`, `size`. Visual contract maps to `.input` from the canonical
 * dxs-kintai design system.
 *
 *   <Textarea rows={5} resize="vertical" />
 *   <Textarea autoSize={{ minRows: 3, maxRows: 8 }} showCount maxLength={500} />
 */

export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: InputSize;
  status?: InputStatus;
  /** "none" by default — matches the canonical chrome. */
  resize?: TextareaResize;
  /** Auto-grow on content. `true` = grow indefinitely. */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Show character count in the bottom-right. */
  showCount?: boolean;
}

const RESIZE_STYLE: Record<TextareaResize, CSSProperties["resize"]> = {
  none: "none",
  vertical: "vertical",
  horizontal: "horizontal",
  both: "both",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      size = "default",
      status = "default",
      resize = "none",
      autoSize,
      showCount,
      maxLength,
      className,
      style,
      value,
      defaultValue,
      readOnly,
      ...rest
    },
    ref,
  ) {
    const rows = typeof autoSize === "object" ? autoSize.minRows : rest.rows;
    const maxRows = typeof autoSize === "object" ? autoSize.maxRows : undefined;

    const mergedStyle: CSSProperties = {
      resize: RESIZE_STYLE[resize],
      ...style,
    };
    if (maxRows) {
      mergedStyle.maxHeight = `${maxRows * 1.5}em`;
      mergedStyle.overflowY = "auto";
    }

    const textareaEl = (
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={cn(
          "input",
          SIZE_CLASS[size],
          STATUS_CLASS[status],
          readOnly && "input-readonly",
          !showCount && className,
        )}
        style={mergedStyle}
        {...rest}
      />
    );

    if (!showCount) return textareaEl;

    const current =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : 0;
    const over = typeof maxLength === "number" && current > maxLength;
    const near =
      typeof maxLength === "number" && !over && current >= Math.floor(maxLength * 0.9);

    return (
      <div className={cn("textarea-with-count", className)}>
        {textareaEl}
        <span className={cn("count", near && "warn", over && "over")}>
          {maxLength ? `${current} / ${maxLength}` : current}
        </span>
      </div>
    );
  },
);
