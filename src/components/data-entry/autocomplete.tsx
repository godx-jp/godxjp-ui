import * as React from "react";

import { SearchSelect } from "./search-select";
import type { AutocompleteProp } from "../../props/components/data-entry.prop";

export type {
  AutocompleteProp,
  AutocompleteProp as AutocompleteProps,
} from "../../props/components/data-entry.prop";

/**
 * Searchable combobox over a static list.
 *
 * @deprecated Prefer {@link SearchSelect} with a static `options` array — it is a strict superset
 * (optgroup grouping, sublabels, async `loadOptions`, custom `renderOption`). `Autocomplete` is
 * now a thin wrapper kept for backward compatibility.
 */
export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  className,
  id,
}: AutocompleteProp) {
  return (
    <SearchSelect
      id={id}
      value={value}
      onValueChange={(next) => onValueChange?.(next)}
      options={options}
      clearable={false}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      disabled={disabled}
      className={className}
    />
  );
}
