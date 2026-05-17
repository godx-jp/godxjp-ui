import {
  forwardRef,
  useState,
  type ComponentProps,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "./cn";

/**
 * Typography — Title / Paragraph / Text / Link primitive family.
 *
 *   <Typography.Title size={2}>Heading</Typography.Title>
 *   <Typography.Paragraph>Lorem ipsum…</Typography.Paragraph>
 *   <Typography.Text color="secondary" strong>label</Typography.Text>
 *   <Typography.Text code>code</Typography.Text>
 *   <Typography.Text copyable>kb@famgia.com</Typography.Text>
 *   <Typography.Text truncate>truncate me</Typography.Text>
 *   <Typography.Paragraph truncate={{ rows: 3 }}>multi-line clamp</Typography.Paragraph>
 *   <Typography.Link href="/x">jump</Typography.Link>
 *
 * Vocabulary (per CLAUDE.md §23.B):
 *   - `size` (1..5) — dimensional scale for Title; maps to the canon
 *     heading mapping declared in `theme.css`. Same name as the
 *     framework-wide `size` vocabulary entry (Button, Input, Avatar,
 *     Tag, Badge, IconButton).
 *   - `color` — semantic role; identical enum to Tag/Badge/Alert.
 *   - `copyable` / `disabled` — adjective-boolean state, same pattern
 *     as Tag's `closable` / Input's `disabled`.
 *   - `truncate` — `true | { rows: N }`; framework-owned name (NOT
 *     Ant's `ellipsis`).
 *   - `strong` / `italic` / `underline` / `del` / `mark` / `code` /
 *     `keyboard` — HTML5 semantic inline elements; conveniences, not
 *     Ant-specific.
 *
 * Cardinal rules honoured:
 *   §14 — purely structural primitive (no Radix peer needed)
 *   §21 — every axis (theme/accent/density/font-size) flows via tokens
 *   §22 — every literal mapped to an existing token; no new tokens;
 *         heading scale follows the canon mapping declared in
 *         `theme.css` (h1=4xl, h2=2xl, h3=xl, h4=lg, h5=md).
 *   §23 — vocabulary first; no Ant-named props leak in.
 *   §25 — primitive is the canon; all visuals live in `.typography*`
 *         classes in `shell.css`. No inline `style={{...}}`.
 */

// ─── Shared types ────────────────────────────────────────────────

export type TypographyColor =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "attention"
  | "info"
  | "destructive";

/** Single-line truncate (`true`) or multi-line clamp (`{ rows: N }`). */
export type TypographyTruncate = boolean | { rows?: number };

export interface TypographyCommonProps {
  color?: TypographyColor;
  disabled?: boolean;
  /** Bold weight via `--font-weight-bold`. */
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  /** Line-through. */
  del?: boolean;
  /** Highlight pill — wa-iro 山吹 (warning) tint. */
  mark?: boolean;
  /** Render as inline `<code>` chip. */
  code?: boolean;
  /** Render as inline `<kbd>` chip. */
  keyboard?: boolean;
  /** Truncate to one or more rows with ellipsis. */
  truncate?: TypographyTruncate;
  /** Show a copy icon-button after the text. */
  copyable?: boolean | { text?: string; onCopy?: () => void };
}

const COLOR_CLASS: Record<TypographyColor, string> = {
  default: "",
  secondary: "typography-color-secondary",
  success: "typography-color-success",
  warning: "typography-color-warning",
  attention: "typography-color-attention",
  info: "typography-color-info",
  destructive: "typography-color-destructive",
};

function commonClasses(p: TypographyCommonProps): string {
  return cn(
    p.color && p.color !== "default" && COLOR_CLASS[p.color],
    p.disabled && "typography-disabled",
    p.strong && "typography-strong",
    p.italic && "typography-italic",
    p.underline && "typography-underline",
    p.del && "typography-delete",
    p.mark && "typography-mark",
    p.code && "typography-code",
    p.keyboard && "typography-keyboard",
    p.truncate === true && "typography-ellipsis",
    typeof p.truncate === "object" &&
      p.truncate !== null &&
      ((p.truncate.rows ?? 1) > 1
        ? "typography-ellipsis-multi"
        : "typography-ellipsis"),
  );
}

function truncateStyle(
  t: TypographyTruncate | undefined,
): React.CSSProperties | undefined {
  if (!t || typeof t !== "object") return undefined;
  const rows = t.rows ?? 1;
  if (rows <= 1) return undefined;
  return { WebkitLineClamp: rows } as React.CSSProperties;
}

// ─── Copyable affordance ────────────────────────────────────────

function useCopyable(
  copyable: TypographyCommonProps["copyable"],
  rawText: ReactNode,
) {
  const [copied, setCopied] = useState(false);
  if (!copyable) return null;
  const onCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const text =
      typeof copyable === "object" && copyable.text
        ? copyable.text
        : typeof rawText === "string"
          ? rawText
          : "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (typeof copyable === "object" && copyable.onCopy) copyable.onCopy();
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard rejected — fail silently */
    }
  };
  return (
    <button
      type="button"
      className={cn("typography-action", copied && "copied")}
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy"}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {copied ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
    </button>
  );
}

// ─── Title ───────────────────────────────────────────────────────

export type TitleSize = 1 | 2 | 3 | 4 | 5;

export interface TitleProps
  extends Omit<ComponentProps<"h1">, "color">,
    TypographyCommonProps {
  /** Heading scale — renders `<h{size}>` and binds the canon
   * font-size token. `1` = `--text-4xl` (h1 cap), `2` = `--text-2xl`
   * (h2), `3` = `--text-xl` (page title), `4` = `--text-lg`
   * (subheading), `5` = `--text-md` (content body). */
  size?: TitleSize;
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(
  {
    size = 1,
    color,
    disabled,
    strong,
    italic,
    underline,
    del,
    mark,
    code,
    keyboard,
    truncate,
    copyable,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const Tag = `h${size}` as ElementType;
  const action = useCopyable(copyable, children);
  return (
    <Tag
      ref={ref}
      className={cn(
        "typography typography-title",
        `typography-title-${size}`,
        commonClasses({
          color,
          disabled,
          strong,
          italic,
          underline,
          del,
          mark,
          code,
          keyboard,
          truncate,
        }),
        className,
      )}
      style={{ ...truncateStyle(truncate), ...style }}
      {...rest}
    >
      {children}
      {action}
    </Tag>
  );
});

// ─── Paragraph ───────────────────────────────────────────────────

export interface ParagraphProps
  extends Omit<ComponentProps<"p">, "color">,
    TypographyCommonProps {}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  function Paragraph(
    {
      color,
      disabled,
      strong,
      italic,
      underline,
      del,
      mark,
      code,
      keyboard,
      truncate,
      copyable,
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) {
    const action = useCopyable(copyable, children);
    return (
      <p
        ref={ref}
        className={cn(
          "typography typography-paragraph",
          commonClasses({
            color,
            disabled,
            strong,
            italic,
            underline,
            del,
            mark,
            code,
            keyboard,
            truncate,
          }),
          className,
        )}
        style={{ ...truncateStyle(truncate), ...style }}
        {...rest}
      >
        {children}
        {action}
      </p>
    );
  },
);

// ─── Text ────────────────────────────────────────────────────────

export interface TextProps
  extends Omit<ComponentProps<"span">, "color">,
    TypographyCommonProps {}

export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(
  {
    color,
    disabled,
    strong,
    italic,
    underline,
    del,
    mark,
    code,
    keyboard,
    truncate,
    copyable,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const action = useCopyable(copyable, children);
  return (
    <span
      ref={ref}
      className={cn(
        "typography typography-text",
        commonClasses({
          color,
          disabled,
          strong,
          italic,
          underline,
          del,
          mark,
          code,
          keyboard,
          truncate,
        }),
        className,
      )}
      style={{ ...truncateStyle(truncate), ...style }}
      {...rest}
    >
      {children}
      {action}
    </span>
  );
});

// ─── Link ────────────────────────────────────────────────────────

export interface LinkProps
  extends Omit<ComponentProps<"a">, "color">,
    Omit<TypographyCommonProps, "color"> {
  /** Override link colour (default `--primary`). Use
   * `color="destructive"` etc. when the link's semantic role is
   * non-default. */
  color?: TypographyColor;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    color,
    disabled,
    strong,
    italic,
    underline,
    del,
    mark,
    code,
    keyboard,
    truncate,
    copyable,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const action = useCopyable(copyable, children);
  return (
    <a
      ref={ref}
      className={cn(
        "typography typography-link",
        commonClasses({
          color,
          disabled,
          strong,
          italic,
          underline,
          del,
          mark,
          code,
          keyboard,
          truncate,
        }),
        className,
      )}
      style={{ ...truncateStyle(truncate), ...style }}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
      {action}
    </a>
  );
});

// ─── Namespaced export ───────────────────────────────────────────

export const Typography = {
  Title,
  Paragraph,
  Text,
  Link,
};
