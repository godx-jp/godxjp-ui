import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import type { AutocompleteProp } from "../../props/components/data-entry.prop";

export type {
  AutocompleteProp,
  AutocompleteProp as AutocompleteProps,
} from "../../props/components/data-entry.prop";

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled,
  className,
  id,
  searchPlaceholder,
}: AutocompleteProp) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);
  const resolvedPlaceholder = placeholder ?? t("dataEntry.autocomplete.placeholder");
  const resolvedEmpty = emptyMessage ?? t("dataEntry.autocomplete.empty");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? resolvedPlaceholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? resolvedPlaceholder} />
          <CommandList>
            <CommandEmpty>{resolvedEmpty}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={[option.value, option.label]}
                  onSelect={() => {
                    onValueChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
