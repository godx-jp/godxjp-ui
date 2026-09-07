import * as React from "react";
import { Search, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Input } from "../data-entry/input";
import { Label } from "../data-entry/label";
import { cn } from "../../lib/utils";
import { resolveFieldA11y } from "../../lib/field-a11y";
import { useDebouncedValue } from "../../lib/hooks";

import type { SearchInputProp } from "../../props/components/data-entry.prop";
export type SearchInputProps = SearchInputProp;

export function SearchInput({
  value: controlledValue,
  defaultValue = "",
  placeholder,
  debounce = 250,
  onValueChange,
  onSearch,
  label,
  ariaLabel,
  className,
  inputClassName,
  id,
  disabled = false,
  status,
  variant,
  ...ariaProps
}: SearchInputProps) {
  const { t } = useTranslation();
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? controlledValue : internal;
  /**
   * A JAPANESE SEARCH BOX MUST NOT QUERY ITS OWN CANDIDATES. Typing 「東京」 goes through
   * `t` → `と` → `とう` → `とうk` … before the conversion is confirmed, and each of those is a
   * DOM value change. Left alone the debounce fires a request for every intermediate reading —
   * results that mean nothing, a list that flickers, and on a remote source a burst of queries per
   * word. The committed query is therefore frozen at the value in the field when the composition
   * started, and released once `compositionend` confirms the conversion.
   */
  const [composing, setComposing] = React.useState(false);
  const settledValue = React.useRef(value);
  if (!composing) settledValue.current = value;
  const debounced = useDebouncedValue(composing ? settledValue.current : value, debounce);
  const reactId = React.useId();
  const inputId = id ?? `search-${reactId}`;
  const resolvedPlaceholder = placeholder ?? t("dataEntry.searchInput.placeholder");
  const resolvedAriaLabel = ariaLabel ?? t("common.search");
  // real <input> focus target — its aria-labelledby then wins over the intrinsic "Search" name.
  const fieldA11y = resolveFieldA11y(ariaProps, resolvedAriaLabel);

  const onSearchRef = React.useRef(onSearch);
  React.useEffect(() => {
    onSearchRef.current = onSearch;
  });
  const lastSearch = React.useRef(debounced);
  React.useEffect(() => {
    if (lastSearch.current === debounced) return;
    lastSearch.current = debounced;
    onSearchRef.current?.(debounced);
  }, [debounced]);

  const setValue = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <div className={cn("ui-search-input", className)}>
      {label !== undefined ? (
        <Label htmlFor={inputId} className="ui-search-input-label">
          {label}
        </Label>
      ) : (
        <Label htmlFor={inputId} className="sr-only">
          {resolvedAriaLabel}
        </Label>
      )}
      <div className="ui-search-input-field">
        <Search className="ui-search-input-icon" aria-hidden="true" />
        <Input
          id={inputId}
          type="text"
          role="searchbox"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onCompositionStart={() => {
            setComposing(true);
          }}
          onCompositionEnd={(e) => {
            setComposing(false);
            // The confirmed reading is the query — publish it in the same tick the composition
            // ends, so the debounce starts from the converted text and not from the last kana.
            setValue(e.currentTarget.value);
          }}
          placeholder={resolvedPlaceholder}
          status={status}
          variant={variant}
          {...fieldA11y}
          className={cn(
            "ui-search-input-control !pr-[var(--search-input-end-padding)] !pl-[var(--search-input-start-padding)]",
            inputClassName,
          )}
          disabled={disabled}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              setValue("");
            }}
            aria-label={t("common.clearSearch")}
            className="ui-search-input-clear"
          >
            <X />
          </button>
        )}
      </div>
    </div>
  );
}
