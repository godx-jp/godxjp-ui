import * as React from "react";
import { Search, X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { Input } from "../data-entry/input";
import { Label } from "../data-entry/label";
import { cn } from "../../lib/utils";
import { useDebouncedValue } from "../../lib/hooks";

interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  debounce?: number;
  /** Fires on EVERY keystroke (immediate) — required to keep a controlled `value` responsive. */
  onValueChange?: (q: string) => void;
  /** Fires with the DEBOUNCED term. Optional — omit it when you drive filtering off `onValueChange`. */
  onSearch?: (q: string) => void;
  label?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  disabled?: boolean;
}

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
}: SearchInputProps) {
  const { t } = useTranslation();
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? controlledValue : internal;
  const debounced = useDebouncedValue(value, debounce);
  const reactId = React.useId();
  const inputId = id ?? `search-${reactId}`;
  const resolvedPlaceholder = placeholder ?? t("dataEntry.searchInput.placeholder");
  const resolvedAriaLabel = ariaLabel ?? t("common.search");

  const onSearchRef = React.useRef(onSearch);
  React.useEffect(() => {
    onSearchRef.current = onSearch;
  });
  React.useEffect(() => {
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
          placeholder={resolvedPlaceholder}
          aria-label={resolvedAriaLabel}
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
