import { cn } from "../../lib/utils";
import type {
  CountryOptionLabelProp,
  CountrySelectProp,
} from "../../props/components/data-entry.prop";
import { Inline } from "../layout/inline";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type {
  CountryOptionProp,
  CountryOptionLabelProp,
  CountrySelectProp,
  CountrySelectProp as CountrySelectProps,
} from "../../props/components/data-entry.prop";

/** Flag + name (+ optional code) — accepts a select-option or a country summary. */
export function CountryOptionLabel({
  country,
  showCode = false,
  className,
}: CountryOptionLabelProp) {
  const code = country.value ?? country.code ?? "";
  const text =
    country.nativeName != null && country.nativeName !== ""
      ? `${country.name} (${country.nativeName})`
      : country.name;

  return (
    <Inline gap="xs" className={cn("items-center", className)}>
      {country.flagSvgPath != null && country.flagSvgPath !== "" && (
        <img
          src={country.flagSvgPath}
          alt=""
          className="h-3 w-5 shrink-0 rounded-sm object-cover"
          aria-hidden="true"
        />
      )}
      <span className="truncate">
        {text}
        {showCode && code !== "" && <span className="text-muted-foreground"> · {code}</span>}
      </span>
    </Inline>
  );
}

/** Country picker on top of Select; submits the country code via a hidden form value. */
export function CountrySelect({
  id,
  name,
  options,
  defaultValue,
  required = false,
  allowEmpty = false,
  emptyLabel = "—",
  placeholder,
  invalid = false,
}: CountrySelectProp) {
  const emptyValue = "0";
  const resolvedDefault = defaultValue && defaultValue !== "" ? defaultValue : emptyValue;

  return (
    <Select
      name={name}
      defaultValue={allowEmpty ? resolvedDefault : (defaultValue ?? options[0]?.value)}
    >
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-required={required}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {allowEmpty && <SelectItem value={emptyValue}>{emptyLabel}</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value ?? ""}>
              <CountryOptionLabel country={option} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
