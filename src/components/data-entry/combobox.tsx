import * as React from "react";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./command";
import { Button } from "../general/button";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";

type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
};

export const Combobox = ({
  options,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyText = "No result",
  disabled = false,
  name,
  id,
  className,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder ?? "Select";

  const resolvedSearch = search.trim().toLowerCase();
  const filtered = resolvedSearch
    ? options.filter((option) => {
        const haystack = `${option.label} ${option.value}`.toLowerCase();
        return haystack.includes(resolvedSearch);
      })
    : options;

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          data-slot="combobox-trigger"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={className}
        >
          <span className={value ? undefined : "text-muted-foreground"}>
            {value ? selectedLabel : (placeholder ?? "Select")}
          </span>
          <span className="ui-combobox-caret" aria-hidden="true" />
        </Button>
      </PopoverTrigger>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <PopoverContent
        className="ui-combobox-content"
        align="start"
        sideOffset={4}
        collisionPadding={12}
      >
        <Command shouldFilter={false} className="ui-combobox-command">
          <CommandInput
            className="ui-combobox-search"
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder ?? "Search..."}
          />
          <CommandList className="ui-combobox-list">
            {filtered.length === 0 ? (
              <CommandEmpty>
                <span className="ui-combobox-empty">{emptyText}</span>
              </CommandEmpty>
            ) : (
              filtered.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  className="ui-combobox-item"
                  data-selected={value === option.value || undefined}
                  onSelect={() => {
                    setValue(option.value);
                  }}
                >
                  {option.label}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export type { ComboboxProps, ComboboxOption };
