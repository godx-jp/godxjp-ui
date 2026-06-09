import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { controlTriggerClass } from "../../lib/control-styles";
import { SearchSelect } from "./search-select";
import type {
  SearchSelectOptionProp,
  SelectDataProp,
} from "../../props/components/data-entry.prop";

export type SelectProp = SelectDataProp | React.ComponentProps<typeof SelectPrimitive.Root>;

function isDataSelect(props: SelectProp): props is SelectDataProp {
  return "options" in props || "loadOptions" in props;
}

/**
 * Select — one component for every single-select. Use the compound API for full control
 * (`<Select><SelectTrigger/><SelectContent><SelectItem/></SelectContent></Select>`), OR the
 * data-driven (Ant-style) API by passing `options` / `loadOptions`: `showSearch` toggles a
 * searchable combobox (powered by SearchSelect) vs a plain no-search listbox; supports async,
 * optgroup grouping, and `renderOption`.
 */
export function Select(props: SelectProp) {
  if (isDataSelect(props)) {
    return <DataSelect {...props} />;
  }
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

export function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "md";
  }
>(({ className, children, size = "md", ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    data-size={size}
    className={cn(
      controlTriggerClass,
      "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground w-full gap-2 whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="size-4" aria-hidden="true" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="size-4" aria-hidden="true" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      data-slot="select-content"
      className={cn(
        "bg-popover text-popover-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md",
        position === "popper" && "translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        data-slot="select-viewport"
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn("px-2 py-1.5 text-sm font-medium", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:font-medium [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// ── Data-driven (Ant-style) Select ─────────────────────────────────────────
// Rendered when `<Select>` receives `options` / `loadOptions`. With search (or async) it
// delegates to the SearchSelect combobox; without, it builds a plain Radix listbox from the
// options (best keyboard support) with optgroup-style grouping + optional custom rendering.

function groupDataOptions(options: SearchSelectOptionProp[]) {
  const order: string[] = [];
  const buckets = new Map<string, SearchSelectOptionProp[]>();
  for (const option of options) {
    const key = option.group ?? "";
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(option);
  }
  return order.map((key) => ({ heading: key || undefined, items: buckets.get(key) ?? [] }));
}

function DataSelect({
  options = [],
  loadOptions,
  showSearch,
  value,
  defaultValue,
  onValueChange,
  renderOption,
  selectedLabel,
  selectedIcon,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadingMessage,
  clearLabel,
  clearable,
  disabled,
  name,
  id,
  className,
  "data-testid": dataTestId,
}: SelectDataProp) {
  const searchable = showSearch ?? Boolean(loadOptions);

  if (searchable) {
    return (
      <SearchSelect
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        options={options}
        loadOptions={loadOptions}
        renderOption={renderOption}
        selectedLabel={selectedLabel}
        selectedIcon={selectedIcon}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        loadingMessage={loadingMessage}
        clearLabel={clearLabel}
        clearable={clearable}
        disabled={disabled}
        name={name}
        id={id}
        className={className}
        data-testid={dataTestId}
      />
    );
  }

  const optionTestId = (optionValue: string) =>
    dataTestId ? `${dataTestId}-option-${optionValue}` : undefined;
  const renderItem = (option: SearchSelectOptionProp) => (
    <SelectItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      data-testid={optionTestId(option.value)}
    >
      {renderOption ? renderOption(option) : option.label}
    </SelectItem>
  );

  return (
    <SelectPrimitive.Root
      data-slot="select"
      value={value || undefined}
      defaultValue={defaultValue || undefined}
      onValueChange={(next) =>
        onValueChange?.(
          next,
          options.find((option) => option.value === next),
        )
      }
      disabled={disabled}
      name={name}
    >
      <SelectTrigger id={id} data-testid={dataTestId} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groupDataOptions(options).map((group) =>
          group.heading ? (
            <SelectGroup key={group.heading}>
              <SelectLabel>{group.heading}</SelectLabel>
              {group.items.map(renderItem)}
            </SelectGroup>
          ) : (
            <React.Fragment key="__ungrouped">{group.items.map(renderItem)}</React.Fragment>
          ),
        )}
      </SelectContent>
    </SelectPrimitive.Root>
  );
}
