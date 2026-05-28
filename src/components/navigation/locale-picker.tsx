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

export function LocalePicker({ className, disabled, id, value, onChange }: LocalePickerProp) {
  const ctx = useOptionalAppContext();
  const { t } = useTranslation();
  const current = value ?? ctx?.locale;
  const handleChange = onChange ?? ctx?.setLocale;

  if (current === undefined || !handleChange) {
    throw new Error("LocalePicker requires <AppProvider> or controlled value + onChange");
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
        {APP_LOCALES.map((code) => (
          <SelectItem key={code} value={code}>
            {t(`locale.${code}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
