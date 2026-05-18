import * as SelectPrimitive from "@radix-ui/react-select";
import { Command } from "cmdk";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  forwardRef,
  Fragment,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Popover } from "../data-display/Popover";
import { cn } from "../cn";

/**
 * Select — single-select picker.
 *
 *   <Select options={[…]} value={…} onValueChange={…} placeholder="…" />
 *
 * Pass `searchable` for a filterable variant backed by cmdk + Popover
 * (replaces the former standalone Combobox primitive):
 *
 *   <Select options={…} value={…} onValueChange={…} searchable
 *           searchPlaceholder="Find…" emptyLabel="No matches" />
 */

export interface SelectOption {
  value: string;
  /** Display content — usually a string, but ReactNode is fine for
   * icon + label compositions. When `searchable`, string labels are
   * used as filter keywords automatically. */
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: ReactNode;
  options: SelectOption[];
}

export type SelectOptions = ReadonlyArray<SelectOption | SelectOptionGroup>;

export interface SelectProps
  extends Omit<
    ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
    "children"
  > {
  options: SelectOptions;
  placeholder?: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  /** Render a searchable variant (cmdk + Popover) instead of Radix Select. */
  searchable?: boolean;
  /** Search input placeholder (searchable mode only). */
  searchPlaceholder?: string;
  /** Shown when the filter matches nothing (searchable mode only). */
  emptyLabel?: ReactNode;
  /** Render a disabled loading row instead of options (searchable mode only). */
  loading?: boolean;
  /** Loading row text (searchable mode only). */
  loadingLabel?: ReactNode;
}

function isOptionGroup(
  opt: SelectOption | SelectOptionGroup,
): opt is SelectOptionGroup {
  return Array.isArray((opt as SelectOptionGroup).options);
}

function flattenOptions(options: SelectOptions): SelectOption[] {
  const out: SelectOption[] = [];
  for (const opt of options) {
    if (isOptionGroup(opt)) out.push(...opt.options);
    else out.push(opt);
  }
  return out;
}

export function Select({
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  searchable,
  searchPlaceholder,
  emptyLabel,
  loading,
  loadingLabel = "Loading…",
  ...rest
}: SelectProps) {
  if (searchable) {
    return (
      <SearchableSelect
        options={options}
        placeholder={placeholder}
        triggerClassName={triggerClassName}
        contentClassName={contentClassName}
        searchPlaceholder={searchPlaceholder}
        emptyLabel={emptyLabel}
        loading={loading}
        loadingLabel={loadingLabel}
        {...rest}
      />
    );
  }
  return (
    <SelectPrimitive.Root {...rest}>
      <Trigger className={triggerClassName}>
        <SelectPrimitive.Value placeholder={placeholder} />
      </Trigger>
      <Content className={contentClassName}>
        {options.map((opt, i) =>
          isOptionGroup(opt) ? (
            <Fragment key={`group-${i}`}>
              <SelectPrimitive.Group>
                <Label>{opt.label}</Label>
                {opt.options.map((leaf) => (
                  <Item
                    key={leaf.value}
                    value={leaf.value}
                    disabled={leaf.disabled}
                  >
                    {leaf.label}
                  </Item>
                ))}
              </SelectPrimitive.Group>
              {i < options.length - 1 && <Separator />}
            </Fragment>
          ) : (
            <Item key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </Item>
          ),
        )}
      </Content>
    </SelectPrimitive.Root>
  );
}

interface SearchableSelectProps
  extends Omit<SelectProps, "searchable"> {}

function SearchableSelect({
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  searchPlaceholder,
  emptyLabel,
  loading,
  loadingLabel,
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  disabled,
  name: _name,
  required: _required,
  dir: _dir,
  autoComplete: _autoComplete,
  ...rest
}: SearchableSelectProps) {
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const currentValue = isValueControlled ? value : internalValue;

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = isOpenControlled ? openProp : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isOpenControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const selected = flattenOptions(options).find(
    (option) => option.value === currentValue,
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      sideOffset={4}
      className={cn("select-content", contentClassName)}
      trigger={
        <button
          type="button"
          className={cn("input", "select-trigger", triggerClassName)}
          disabled={disabled}
          aria-haspopup="listbox"
        >
          <span className={selected ? undefined : "muted"}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className="muted"
            aria-hidden
            style={{
              width: "var(--spacing-4)",
              height: "var(--spacing-4)",
              flexShrink: 0,
            }}
          />
        </button>
      }
      {...rest}
    >
      <Command className="combobox-command">
        <Command.Input
          className="combobox-input"
          placeholder={searchPlaceholder}
        />
        <Command.List className="combobox-list">
          {loading ? (
            <Command.Item value="__loading" disabled className="combobox-item">
              {loadingLabel}
            </Command.Item>
          ) : (
            <>
              {emptyLabel !== undefined && (
                <Command.Empty className="combobox-empty">
                  {emptyLabel}
                </Command.Empty>
              )}
              {options.map((opt, i) =>
                isOptionGroup(opt) ? (
                  <Command.Group
                    key={`group-${i}`}
                    heading={
                      typeof opt.label === "string" ? opt.label : undefined
                    }
                  >
                    {opt.options.map((leaf) => (
                      <SearchableItem
                        key={leaf.value}
                        option={leaf}
                        onSelect={(picked) => {
                          if (!isValueControlled) setInternalValue(picked);
                          onValueChange?.(picked);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </Command.Group>
                ) : (
                  <SearchableItem
                    key={opt.value}
                    option={opt}
                    onSelect={(picked) => {
                      if (!isValueControlled) setInternalValue(picked);
                      onValueChange?.(picked);
                      setOpen(false);
                    }}
                  />
                ),
              )}
            </>
          )}
        </Command.List>
      </Command>
    </Popover>
  );
}

function SearchableItem({
  option,
  onSelect,
}: {
  option: SelectOption;
  onSelect: (value: string) => void;
}) {
  const keywords =
    typeof option.label === "string" ? [option.label] : undefined;
  return (
    <Command.Item
      value={option.value}
      keywords={keywords}
      disabled={option.disabled}
      className="combobox-item"
      onSelect={onSelect}
    >
      {option.label}
    </Command.Item>
  );
}

const Trigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function Trigger({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn("input", "select-trigger", className)}
      {...rest}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className="muted"
          aria-hidden
          style={{
            width: "var(--spacing-4)",
            height: "var(--spacing-4)",
            flexShrink: 0,
          }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const Content = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function Content(
  { className, children, position = "popper", sideOffset = 4, ...rest },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn("select-content", className)}
        position={position}
        sideOffset={sideOffset}
        {...rest}
      >
        <ScrollUp>
          <ChevronUp
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </ScrollUp>
        <SelectPrimitive.Viewport className="select-viewport">
          {children}
        </SelectPrimitive.Viewport>
        <ScrollDown>
          <ChevronDown
            aria-hidden
            style={{ width: "var(--spacing-4)", height: "var(--spacing-4)" }}
          />
        </ScrollDown>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

const Label = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function Label({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("select-label", className)}
      {...rest}
    />
  );
});

const Item = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function Item({ className, children, ...rest }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn("select-item", className)}
      {...rest}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

const Separator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function Separator({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("select-separator", className)}
      {...rest}
    />
  );
});

const ScrollUp = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(function ScrollUp({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn("select-scroll-btn", className)}
      {...rest}
    />
  );
});

const ScrollDown = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(function ScrollDown({ className, ...rest }, ref) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn("select-scroll-btn", className)}
      {...rest}
    />
  );
});
