import {
  forwardRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

/**
 * Input — text input with Ant-Design-shaped slot props.
 *
 *   <Input prefix={<SearchOutlined />} suffix={<EyeOutlined />} />
 *   <Input addonBefore="https://" addonAfter=".com" />
 *   <Input size="large" status="error" />
 *
 * When `prefix` / `suffix` is provided the input is wrapped in a
 * shell `.input-shell` div that keeps the focus ring while the
 * icon sits inside the field. When `addonBefore` / `addonAfter` is
 * provided the input + addons form a connected group.
 */

export type InputSize = "small" | "default" | "large";
export type InputStatus = "default" | "error" | "warning";

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
  error: "input-status-error",
  warning: "input-status-warning",
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
        className={cn("input", sizeClass, statusClass, className)}
        style={inputStyle}
        {...rest}
      />
    );
  }

  // With prefix/suffix: wrap in a shell that owns the focus ring.
  const shell = (
    <div
      className={cn(
        "input-shell",
        sizeClass,
        statusClass,
        (addonBefore || addonAfter) && "input-shell-grouped",
        className,
      )}
    >
      {prefix !== undefined && <span className="input-affix">{prefix}</span>}
      <input
        ref={ref}
        type={type}
        className="input-inner"
        style={inputStyle}
        {...rest}
      />
      {suffix !== undefined && <span className="input-affix">{suffix}</span>}
    </div>
  );

  if (!addonBefore && !addonAfter) return shell;

  return (
    <div className="input-group">
      {addonBefore !== undefined && (
        <span className="input-addon">{addonBefore}</span>
      )}
      {shell}
      {addonAfter !== undefined && (
        <span className="input-addon">{addonAfter}</span>
      )}
    </div>
  );
});

/**
 * Textarea — Ant-Design-shaped: `rows`, `autoSize`, `showCount`,
 * `maxLength`, `resize`, `status`, `size`.
 *
 *   <Textarea rows={5} resize="vertical" />
 *   <Textarea autoSize={{ minRows: 3, maxRows: 8 }} showCount maxLength={500} />
 */

export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: InputSize;
  status?: InputStatus;
  /** "none" by default — no resize handle, matches Ant Design. */
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
        className={cn(
          "input",
          SIZE_CLASS[size],
          STATUS_CLASS[status],
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

    return (
      <div className={cn("textarea-with-count", className)}>
        {textareaEl}
        <span className="textarea-count">
          {maxLength ? `${current}/${maxLength}` : current}
        </span>
      </div>
    );
  },
);
