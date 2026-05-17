import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../../cn";

/**
 * LocaleInput — multilingual text field with a tab strip switcher.
 *
 * One field stores a value per locale. The base locale (first in the
 * `locales` list, or `defaultLocale` if provided) is the fallback —
 * when a translation is missing the base value is used at render time.
 * Translation status is surfaced per-tab via a coloured dot:
 *
 *   - `filled` → success (green)
 *   - `draft`  → warning (amber, e.g. stale relative to base)
 *   - `empty`  → destructive (red, no translation yet)
 *
 * `statusByLocale` lets callers pass the dot state explicitly. If
 * omitted, status is derived: empty string → `empty`, otherwise
 * `filled`.
 *
 * @example
 *   <LocaleInput
 *     locales={["ja", "en", "vi"]}
 *     baseLocale="ja"
 *     values={{ ja: "特選 まぐろ握り 6貫盛り合わせ", en: "Tuna nigiri assortment (6 pcs)", vi: "" }}
 *     onChange={(locale, value) => set(locale, value)}
 *     placeholder="商品名"
 *   />
 *
 * The visual contract maps to the canonical `.loc-tabs` + `.loc-panel`
 * classes from the dxs-kintai design system (no service-specific
 * locale lists baked into the source).
 */

export type LocaleStatus = "filled" | "draft" | "empty";

export interface LocaleInputProps {
  /** Ordered locale codes (BCP-47 or arbitrary string). First is base unless `baseLocale` is set. */
  locales: string[];
  /** Locale rendered initially. Defaults to the first locale. */
  defaultLocale?: string;
  /** Controlled active locale. Pair with `onLocaleChange`. */
  activeLocale?: string;
  /** Controlled active-locale change handler. */
  onLocaleChange?: (locale: string) => void;
  /** Fallback locale — labelled "(base)" in the tab. Defaults to `locales[0]`. */
  baseLocale?: string;
  /** Current values keyed by locale. */
  values: Record<string, string>;
  /** Fired when the user edits the value for the active locale. */
  onChange?: (locale: string, value: string) => void;
  /** Optional explicit status per locale dot. Derived from `values` when omitted. */
  statusByLocale?: Record<string, LocaleStatus>;
  /** Placeholder rendered in the input/textarea. */
  placeholder?: string;
  /** Render a `<textarea>` instead of `<input>`. */
  multiline?: boolean;
  /** Rows for the textarea (only when `multiline`). */
  rows?: number;
  /** Validation status applied to the visible input. */
  status?: "default" | "error" | "warning";
  /** Show a translation-progress meta string (e.g. "3 / 4 translated") in the tab strip. */
  meta?: ReactNode;
  /** Trailing tab-strip slot (e.g. an "+ Add locale" button). */
  tabsExtra?: ReactNode;
  /** Resolve a human label from a locale code; defaults to `locale.toUpperCase()`. */
  resolveLocaleLabel?: (locale: string) => ReactNode;
  /** Label shown next to the base locale tab. Defaults to "(base)". */
  baseLabel?: ReactNode;
  /** Max length for the input — surfaces a `.count` row when set. */
  maxLength?: number;
  /** Optional help text rendered under the active panel. */
  help?: ReactNode;
  /** Visual class for the help line (`info` | `warn` | `err` | `ok`). */
  helpStatus?: "info" | "warn" | "err" | "ok";
  /** Outer wrapper className. */
  className?: string;
  /** Outer wrapper style. */
  style?: CSSProperties;
  /** Input ID — useful when paired with a `<label htmlFor>`. */
  id?: string;
}

function deriveStatus(value: string | undefined): LocaleStatus {
  if (!value || value.trim() === "") return "empty";
  return "filled";
}

export const LocaleInput = forwardRef<HTMLDivElement, LocaleInputProps>(
  function LocaleInput(
    {
      locales,
      defaultLocale,
      activeLocale: controlledLocale,
      onLocaleChange,
      baseLocale,
      values,
      onChange,
      statusByLocale,
      placeholder,
      multiline = false,
      rows = 3,
      status = "default",
      meta,
      tabsExtra,
      resolveLocaleLabel,
      baseLabel = "(base)",
      maxLength,
      help,
      helpStatus,
      className,
      style,
      id,
    },
    ref,
  ) {
    const resolvedBase = baseLocale ?? locales[0];
    const [internalLocale, setInternalLocale] = useState<string>(
      defaultLocale ?? resolvedBase ?? "",
    );
    const active = controlledLocale ?? internalLocale;

    const selectLocale = useCallback(
      (next: string) => {
        if (onLocaleChange) onLocaleChange(next);
        if (controlledLocale === undefined) setInternalLocale(next);
      },
      [controlledLocale, onLocaleChange],
    );

    const value = values[active] ?? "";
    const labelFor = useCallback(
      (locale: string): ReactNode =>
        resolveLocaleLabel ? resolveLocaleLabel(locale) : locale.toUpperCase(),
      [resolveLocaleLabel],
    );

    const statusMap = useMemo(() => {
      if (statusByLocale) return statusByLocale;
      const derived: Record<string, LocaleStatus> = {};
      for (const loc of locales) derived[loc] = deriveStatus(values[loc]);
      return derived;
    }, [locales, statusByLocale, values]);

    const inputStatusClass =
      status === "error"
        ? "input-status-error"
        : status === "warning"
          ? "input-status-warning"
          : "";

    const current = typeof value === "string" ? value.length : 0;
    const over = typeof maxLength === "number" && current > maxLength;
    const near =
      typeof maxLength === "number" && !over && current >= Math.floor(maxLength * 0.9);

    return (
      <div ref={ref} className={cn("loc-input", className)} style={style}>
        <div className="loc-tabs" role="tablist">
          {locales.map((locale) => {
            const dotStatus = statusMap[locale] ?? "empty";
            const isActive = locale === active;
            const isBase = locale === resolvedBase;
            return (
              <button
                key={locale}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(isActive && "on")}
                onClick={() => selectLocale(locale)}
              >
                <span
                  className={cn(
                    "dot",
                    dotStatus === "empty" && "empty",
                    dotStatus === "draft" && "draft",
                  )}
                />
                {labelFor(locale)}
                {isBase ? (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--muted-foreground)",
                      marginLeft: 2,
                    }}
                  >
                    {baseLabel}
                  </span>
                ) : null}
              </button>
            );
          })}
          <span className="spacer" />
          {meta !== undefined && <span className="meta">{meta}</span>}
          {tabsExtra !== undefined && tabsExtra}
        </div>

        <div className="loc-panel">
          {multiline ? (
            <textarea
              id={id}
              className={cn("input", inputStatusClass)}
              rows={rows}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(active, e.target.value)}
              style={{
                resize: "vertical",
                height: "auto",
                padding: "6px 10px",
              }}
              maxLength={maxLength}
            />
          ) : (
            <input
              id={id}
              className={cn("input", inputStatusClass)}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(active, e.target.value)}
              maxLength={maxLength}
            />
          )}

          {(help !== undefined || maxLength !== undefined) && (
            <div className="row-help">
              {help !== undefined ? (
                <div className={cn("help", helpStatus)}>{help}</div>
              ) : (
                <span />
              )}
              {maxLength !== undefined && (
                <div className={cn("count", near && "warn", over && "over")}>
                  {current} / {maxLength}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

/**
 * LocaleRowInput — per-row locale form (canonical pattern ②).
 *
 * Renders every locale stacked vertically, each row showing the locale
 * code + a translation-status dot on the left and the input on the
 * right. Useful when reviewers want to see every translation at once.
 */

export interface LocaleRowInputProps
  extends Omit<LocaleInputProps, "activeLocale" | "onLocaleChange" | "defaultLocale" | "tabsExtra" | "meta"> {
  /** Per-locale row className. */
  rowClassName?: string;
}

export const LocaleRowInput = forwardRef<HTMLDivElement, LocaleRowInputProps>(
  function LocaleRowInput(
    {
      locales,
      values,
      onChange,
      statusByLocale,
      placeholder,
      multiline = false,
      rows = 2,
      status = "default",
      resolveLocaleLabel,
      baseLocale,
      className,
      style,
      rowClassName,
      maxLength,
      help,
      helpStatus,
    },
    ref,
  ) {
    const labelFor = useCallback(
      (locale: string): ReactNode =>
        resolveLocaleLabel ? resolveLocaleLabel(locale) : locale.toUpperCase(),
      [resolveLocaleLabel],
    );

    const statusMap = useMemo(() => {
      if (statusByLocale) return statusByLocale;
      const derived: Record<string, LocaleStatus> = {};
      for (const loc of locales) derived[loc] = deriveStatus(values[loc]);
      return derived;
    }, [locales, statusByLocale, values]);

    const inputStatusClass =
      status === "error"
        ? "input-status-error"
        : status === "warning"
          ? "input-status-warning"
          : "";

    return (
      <div
        ref={ref}
        className={cn("loc-rows", className)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-2)",
          ...style,
        }}
      >
        {locales.map((locale) => {
          const dotStatus = statusMap[locale] ?? "empty";
          const isBase = baseLocale ? locale === baseLocale : false;
          return (
            <div key={locale} className={cn("loc-row", rowClassName)}>
              <span className="flag">
                <span className="code">{labelFor(locale)}</span>
                <span
                  className={cn(
                    "dot",
                    dotStatus === "empty" && "empty",
                    dotStatus === "draft" && "draft",
                  )}
                />
                {isBase && (
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                    base
                  </span>
                )}
              </span>
              {multiline ? (
                <textarea
                  className={cn("input", inputStatusClass)}
                  rows={rows}
                  placeholder={placeholder}
                  value={values[locale] ?? ""}
                  onChange={(e) => onChange?.(locale, e.target.value)}
                  style={{ resize: "vertical", height: "auto", padding: "6px 10px" }}
                  maxLength={maxLength}
                />
              ) : (
                <input
                  className={cn("input", inputStatusClass)}
                  placeholder={placeholder}
                  value={values[locale] ?? ""}
                  onChange={(e) => onChange?.(locale, e.target.value)}
                  maxLength={maxLength}
                />
              )}
            </div>
          );
        })}
        {help !== undefined && (
          <div className={cn("help", helpStatus)}>{help}</div>
        )}
      </div>
    );
  },
);
