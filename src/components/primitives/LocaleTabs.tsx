import {
  forwardRef,
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "./cn";

/**
 * LocaleTabs — bare tab strip with status dots per locale.
 *
 * Mirrors the `K:comp-inputs.html:248-284` reference (pattern ①, "Locale
 * tabs"). This primitive is the **header-only** subset: the consumer
 * wires the panel below. For the full input + panel composition see
 * the `LocaleInput` composite under `components/composites/locale-input`.
 *
 * Each tab carries a coloured dot signalling translation status:
 *   - `translated` → success (green)
 *   - `draft`      → warning (amber, stale relative to base)
 *   - `missing`    → destructive (red, no translation yet)
 *
 * The base locale (first in `locales`, or `baseLocale` if provided)
 * carries a subtle "(基準 / base)" suffix so reviewers see the fallback
 * source at a glance.
 *
 * @example
 *   <LocaleTabs
 *     locales={[
 *       { code: "ja", label: "日本語", status: "translated" },
 *       { code: "en", label: "English", status: "translated" },
 *       { code: "vi", label: "Tiếng Việt", status: "draft" },
 *       { code: "zh", label: "简体中文", status: "missing" },
 *     ]}
 *     baseLocale="ja"
 *     meta="3 / 4 翻訳済"
 *     onAdd={() => openAddLocale()}
 *   />
 */

export type LocaleTabStatus = "translated" | "draft" | "missing";

export interface LocaleTabItem {
  code: string;
  label?: ReactNode;
  status?: LocaleTabStatus;
}

export interface LocaleTabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  locales: LocaleTabItem[];
  /** Controlled active locale code. */
  value?: string;
  /** Uncontrolled initial locale code. */
  defaultValue?: string;
  onChange?: (next: string) => void;
  /** Locale labelled "(基準)" in its tab. Defaults to `locales[0].code`. */
  baseLocale?: string;
  /** Custom label for the base-locale suffix. Defaults to "(基準)". */
  baseLabel?: ReactNode;
  /** Right-side meta string (e.g. "3 / 4 翻訳済"). */
  meta?: ReactNode;
  /** Click handler for the "⊕ 追加" button — when omitted, no button renders. */
  onAdd?: () => void;
  /** Label for the add button. Defaults to "⊕ 追加". */
  addLabel?: ReactNode;
}

const DOT_CLASS: Record<LocaleTabStatus, string> = {
  translated: "",
  draft: "draft",
  missing: "empty",
};

export const LocaleTabs = forwardRef<HTMLDivElement, LocaleTabsProps>(
  function LocaleTabs(
    {
      locales,
      value: controlled,
      defaultValue,
      onChange,
      baseLocale,
      baseLabel = "(基準)",
      meta,
      onAdd,
      addLabel = "⊕ 追加",
      className,
      ...rest
    },
    ref,
  ) {
    const [internal, setInternal] = useState<string | undefined>(
      defaultValue ?? locales[0]?.code,
    );
    const active = controlled ?? internal;
    const resolvedBase = baseLocale ?? locales[0]?.code;

    const select = useCallback(
      (next: string) => {
        if (controlled === undefined) setInternal(next);
        onChange?.(next);
      },
      [controlled, onChange],
    );

    return (
      <div
        ref={ref}
        className={cn("loc-tabs", className)}
        role="tablist"
        {...rest}
      >
        {locales.map((locale) => {
          const status = locale.status ?? "translated";
          const isActive = locale.code === active;
          const isBase = locale.code === resolvedBase;
          return (
            <button
              key={locale.code}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(isActive && "on")}
              onClick={() => select(locale.code)}
            >
              <span className={cn("dot", DOT_CLASS[status])} />
              {locale.label ?? locale.code.toUpperCase()}
              {isBase && (
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--muted-foreground)",
                    marginLeft: 2,
                  }}
                >
                  {baseLabel}
                </span>
              )}
            </button>
          );
        })}
        <span className="spacer" />
        {meta !== undefined && <span className="meta">{meta}</span>}
        {onAdd !== undefined && (
          <button
            type="button"
            onClick={onAdd}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              height: 22,
              padding: "0 8px",
              fontSize: 11,
              background: "var(--background)",
            }}
          >
            {addLabel}
          </button>
        )}
      </div>
    );
  },
);
