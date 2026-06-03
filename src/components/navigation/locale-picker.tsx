import { Languages } from "lucide-react";
import { APP_LOCALES } from "../../app/types";
import { useOptionalAppContext } from "../../app/app-provider";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { LocalePickerProp } from "../../props/components/app.prop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../data-entry/select";

export type {
  LocalePickerProp,
  LocalePickerProp as LocalePickerProps,
} from "../../props/components/app.prop";

export function LocalePicker({
  className,
  disabled,
  id,
  value,
  onValueChange,
  options: optionsProp,
}: LocalePickerProp) {
  const ctx = useOptionalAppContext();
  const { t } = useTranslation();
  const current = value ?? ctx?.locale;
  const handleChange = onValueChange ?? ctx?.setLocale;
  const options = optionsProp ?? APP_LOCALES;

  if (current === undefined || !handleChange) {
    throw new Error("LocalePicker requires <AppProvider> or controlled value + onValueChange");
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn("w-full sm:w-40", className)}
        aria-label={t("navigation.localePicker.ariaLabel")}
      >
        <Languages className="mr-2 size-4 shrink-0 opacity-70" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const code = typeof option === "string" ? option : option.value;
          const label =
            typeof option === "string"
              ? t(`locale.${option}`)
              : (option.label ?? t(`locale.${option.value}`));

          return (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
