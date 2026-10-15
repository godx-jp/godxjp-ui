import * as React from "react";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { getRegisteredLocales } from "../../i18n/locale-tags";
import { mergeAriaIds, useReportFieldError } from "../../lib/field-a11y";
import { displayNames } from "../../lib/intl-cache";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../navigation/tabs";
import { Input } from "./input";
import { Textarea } from "./textarea";
import type {
  TranslatableInputProp,
  TranslatableTextareaProp,
  TranslatableValue,
} from "../../props/components/data-entry.prop";

export type {
  TranslatableValue,
  TranslatableInputProp,
  TranslatableInputProp as TranslatableInputProps,
  TranslatableTextareaProp,
  TranslatableTextareaProp as TranslatableTextareaProps,
} from "../../props/components/data-entry.prop";

const NO_VALUE: TranslatableValue = {};

/** "ja" named in the reader's language ("Japanese", 「日本語」), or the tag itself when Intl cannot. */
function localeName(code: string, uiLocale: string): string {
  try {
    return displayNames(uiLocale, { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** `id` → a fragment safe inside another id, whatever the tag spells (`zh-Hant-TW`). */
const idPart = (code: string) => code.replace(/[^A-Za-z0-9_-]/g, "_");

type FieldProps = (TranslatableInputProp | TranslatableTextareaProp) & {
  kind: "input" | "textarea";
};

/**
 * The shared engine of {@link TranslatableInput} and {@link TranslatableTextarea}.
 *
 * WHY THE SWITCHER IS `Tabs`, NOT `Segmented`. The WAI-ARIA APG radio group is for CHOOSING A VALUE
 * — a segmented control's choice is form state and is submitted with the form. The locale here is
 * not form state: every locale's text is submitted together, and the switcher only decides which
 * of them the one editing region shows. That is the APG tabs pattern — a tablist whose selected
 * tab controls one tabpanel — so a screen reader announces "English, tab, 2 of 3" and the region
 * that follows, instead of offering a "language" question the form never asks.
 *
 * ONE CONTROL, NOT ONE PER LOCALE. The panel holds a single `Input`/`Textarea` whose value, `lang`
 * and placeholder follow the active tab (`Tabs.controls` points the tab at it, gh#1021). Swapping
 * elements per tab would hand the forwarded `ref`, the FormField `id` and an IME composition to a
 * new node on every switch.
 */
function TranslatableField({
  kind,
  value: valueProp,
  defaultValue,
  onValueChange,
  locales: localesProp,
  defaultLocale,
  fallbackLocale: fallbackLocaleProp,
  errors,
  size,
  placeholder,
  className,
  forwardedRef,
  ...rest
}: FieldProps & { forwardedRef: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement> }) {
  const { t, locale: uiLocale, fallbackLocale: appFallbackLocale } = useTranslation();

  const locales = React.useMemo<readonly string[]>(() => {
    const list = localesProp ?? getRegisteredLocales();
    return list.length > 0 ? list : [uiLocale];
  }, [localesProp, uiLocale]);

  const pick = (candidates: Array<string | undefined>) =>
    candidates.find((code): code is string => code !== undefined && locales.includes(code)) ??
    locales[0]!;
  const fallbackLocale = pick([fallbackLocaleProp, appFallbackLocale]);

  const [activeState, setActiveState] = React.useState(() =>
    pick([defaultLocale, uiLocale, fallbackLocale]),
  );
  // A `locales` list that no longer holds the selected tab falls back rather than selecting nothing.
  const active = locales.includes(activeState)
    ? activeState
    : pick([defaultLocale, fallbackLocale]);

  const [innerValue, setInnerValue] = React.useState<TranslatableValue>(defaultValue ?? NO_VALUE);
  const current = valueProp ?? innerValue;
  const currentRef = React.useRef(current);
  currentRef.current = current;

  const handleText = (text: string) => {
    // Read through the ref, so two events in one tick (the ✕'s synthetic input, an IME commit)
    // each build on the other rather than on the render both started from.
    const next = { ...currentRef.current, [active]: text };
    currentRef.current = next;
    if (valueProp === undefined) setInnerValue(next);
    onValueChange?.(next);
  };

  const activeText = current[active] ?? "";
  const fallbackText =
    active !== fallbackLocale && activeText === "" ? current[fallbackLocale] : undefined;

  const activeError = errors?.[active];
  const hasActiveError =
    activeError !== undefined &&
    activeError !== null &&
    activeError !== false &&
    activeError !== "";
  const insideFormField = useReportFieldError(hasActiveError ? activeError : undefined);

  const baseId = React.useId();
  const tabId = (code: string) => `${baseId}-tab-${idPart(code)}`;
  const panelId = `${baseId}-panel`;
  const switcherNameId = `${baseId}-languages`;
  const localeNameId = `${baseId}-locale`;
  const ownErrorId = `${baseId}-error`;

  const labelledBy = rest["aria-labelledby"];
  const ariaLabel = rest["aria-label"];
  const showOwnError = hasActiveError && !insideFormField;

  const controlProps = {
    ...rest,
    ref: forwardedRef,
    lang: active,
    value: activeText,
    onValueChange: handleText,
    placeholder: fallbackText ? fallbackText : placeholder,
    // The control is named by the field AND the locale it holds: "商品名 English".
    "aria-labelledby": labelledBy ? `${labelledBy} ${localeNameId}` : undefined,
    "aria-invalid": hasActiveError ? true : rest["aria-invalid"],
    "aria-errormessage": mergeAriaIds(
      rest["aria-errormessage"],
      showOwnError ? ownErrorId : undefined,
    ),
    status: hasActiveError ? ("error" as const) : rest.status,
  };

  return (
    <div
      data-slot="translatable-field"
      data-size={size}
      className={cn("ui-translatable-field", className)}
    >
      <Tabs
        value={active}
        onValueChange={setActiveState}
        size={size === "lg" ? "md" : "sm"}
        controls={panelId}
        className="ui-translatable-field-tabs"
        {...(labelledBy
          ? { "aria-labelledby": `${labelledBy} ${switcherNameId}` }
          : {
              "aria-label": [ariaLabel, t("dataEntry.translatable.languages")]
                .filter(Boolean)
                .join(" "),
            })}
      >
        <TabsList>
          {locales.map((code) => {
            const error = errors?.[code];
            const invalid =
              error !== undefined && error !== null && error !== false && error !== "";
            return (
              <TabsTrigger
                key={code}
                id={tabId(code)}
                value={code}
                data-locale={code}
                data-invalid={invalid ? "true" : undefined}
                data-filled={current[code] ? "true" : undefined}
              >
                <span>{localeName(code, uiLocale)}</span>
                {invalid ? (
                  <>
                    <CircleAlert className="ui-translatable-field-error-mark" aria-hidden="true" />
                    <span className="sr-only">{`, ${t("dataEntry.translatable.hasError")}`}</span>
                  </>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      <span id={switcherNameId} hidden>
        {t("dataEntry.translatable.languages")}
      </span>
      <span id={localeNameId} hidden>
        {localeName(active, uiLocale)}
      </span>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(active)}
        className="ui-translatable-field-panel"
      >
        {kind === "input" ? (
          <Input
            {...(controlProps as unknown as React.ComponentProps<typeof Input>)}
            size={size as TranslatableInputProp["size"]}
          />
        ) : (
          <Textarea
            {...(controlProps as unknown as React.ComponentProps<typeof Textarea>)}
            size={size as TranslatableTextareaProp["size"]}
          />
        )}
      </div>
      {showOwnError ? (
        <p id={ownErrorId} role="alert" className="ui-form-field-note text-error-strong text-xs">
          {activeError}
        </p>
      ) : null}
    </div>
  );
}

/**
 * TranslatableInput — ONE text field that holds a value per locale (`{ ja, en, vi }`), switched by
 * locale tabs above it (gh#1336). The locale list, the first tab and the fallback come from
 * `AppProvider` and are overridable per field; an empty locale shows the fallback locale's text as
 * its placeholder; a locale with an error is marked on its tab. Every other `Input` prop applies to
 * the single control, and `ref` is that control's `<input>`.
 */
export const TranslatableInput = React.forwardRef<HTMLInputElement, TranslatableInputProp>(
  (props, ref) => (
    <TranslatableField
      {...props}
      kind="input"
      forwardedRef={ref as React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
    />
  ),
);
TranslatableInput.displayName = "TranslatableInput";

/** TranslatableTextarea — {@link TranslatableInput} over a `Textarea`; `ref` is the `<textarea>`. */
export const TranslatableTextarea = React.forwardRef<HTMLTextAreaElement, TranslatableTextareaProp>(
  (props, ref) => (
    <TranslatableField
      {...props}
      kind="textarea"
      forwardedRef={ref as React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
    />
  ),
);
TranslatableTextarea.displayName = "TranslatableTextarea";
