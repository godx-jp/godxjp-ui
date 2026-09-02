import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { controlTriggerClass } from "../../lib/control-styles";
import {
  mergeAriaIds,
  useFieldIdentity,
  omitFieldA11y,
  pickFieldA11y,
  useFieldNameFallback,
} from "../../lib/field-a11y";
import type { FieldA11yProps } from "../../lib/field-a11y";
import { SearchSelect } from "./search-select";
import { useTranslation } from "../../i18n/use-translation";
import type {
  SearchSelectOptionProp,
  SelectDataProp,
} from "../../props/components/data-entry.prop";

/** Compound-API props: the Radix root's own props PLUS the FormField field-a11y contract, which
 *  this component re-routes to the trigger (see {@link SelectFieldA11yContext}). */
export type SelectCompoundProp = React.ComponentProps<typeof SelectPrimitive.Root> &
  FieldA11yProps & { id?: string };

export type SelectProp = SelectDataProp | SelectCompoundProp;

function isDataSelect(props: SelectProp): props is SelectDataProp {
  return "options" in props || "loadOptions" in props;
}

/**
 * Carries the FormField field-a11y contract from `<Select>` down to `<SelectTrigger>`.
 *
 * FormField injects `id` / `aria-labelledby` / `aria-describedby` / … onto its single child with
 * `cloneElement`. In the compound API that child is `SelectPrimitive.Root` — a context-only
 * component that renders NO DOM — so those props were silently dropped and the trigger button was
 * left with no accessible name at all. `role="combobox"` does not take its name from content, so
 * the visible value ("東京") is the VALUE, not the name: axe reports `button-name`, and a screen
 * reader announces an unlabelled combobox (WCAG 4.1.2). Routing the contract through context lands
 * it on the trigger — the real focus target — for both FormField and a hand-written
 * `<Select aria-label="…">`. Props set directly on the trigger always win.
 */
const SelectFieldA11yContext = React.createContext<
  (FieldA11yProps & { id?: string; value?: string }) | null
>(null);

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
  return <CompoundSelect {...props} />;
}

function CompoundSelect({ id, ...props }: SelectCompoundProp) {
  // `id`, `data-field` and the aria-* contract are NOT Radix root props — they belong to the
  // trigger. Everything else stays on the root untouched.
  const fieldA11y = pickFieldA11y(props);
  const rootProps = omitFieldA11y(props);
  // gh#337 R-3 — the selected CODE, mirrored so the trigger can publish it as `data-value`.
  // The trigger displays the LABEL ("東京本社"); automation and tests need the value ("52"), and
  // Radix keeps it in a context this package cannot read. Controlled selects read straight off the
  // prop; an uncontrolled one is tracked here because Radix would otherwise change it without
  // re-rendering this component at all.
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const value = props.value ?? uncontrolled;
  // gh#337 — the machine key for a Select NESTED under a layout wrapper (a 年/月 combo). Resolved
  // HERE, not on the trigger: `name` belongs on the Radix root, which is what renders the native
  // <select> a form submit reads; only `data-field` continues on to the trigger.
  const identity = useFieldIdentity({
    id,
    name: props.name,
    "data-field": fieldA11y["data-field"],
  });
  return (
    <SelectFieldA11yContext.Provider
      value={{
        ...fieldA11y,
        "data-field": identity["data-field"] ?? fieldA11y["data-field"],
        id,
        value,
      }}
    >
      <SelectPrimitive.Root
        data-slot="select"
        {...rootProps}
        name={props.name ?? identity.name}
        onValueChange={(next) => {
          setUncontrolled(next);
          props.onValueChange?.(next);
        }}
      />
    </SelectFieldA11yContext.Provider>
  );
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
    /**
     * Show the built-in chevron disclosure indicator (default true). Set `false` for specialized
     * triggers — icon-only, or one that already renders its own affordance — so it isn't
     * duplicated. Omits the icon from the DOM entirely (not a CSS hide), so no consumer
     * descendant CSS is needed to remove it.
     */
    showIndicator?: boolean;
    /** Stable machine key (gh#337) — normally inherited from `FormField` through the Select. */
    "data-field"?: string;
    /**
     * The selected CODE (gh#337). Normally supplied by `Select` itself — the trigger shows the
     * option's LABEL, and this is the only place the underlying value is readable from the DOM
     * without reaching into Radix's aria-hidden native `<select>`.
     */
    "data-value"?: string;
  }
>(({ className, children, size = "md", showIndicator = true, ...props }, ref) => {
  // The FormField contract reaches the compound trigger through context, because Radix's root
  // drops the cloneElement props. Anything set directly on the trigger wins; the two id-list
  // attributes merge rather than replace so a local description survives.
  const field = React.useContext(SelectFieldA11yContext);
  // The NAME is inherited as a unit, not attribute by attribute: a trigger that states its own
  // name keeps it whole. Merging per-attribute would leave the inherited `aria-labelledby` in
  // place next to the local `aria-label`, and labelledby outranks label — the trigger's own name
  // would lose to the one it deliberately overrode.
  const ownsName = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  const fieldOwnsName =
    field?.["aria-label"] !== undefined || field?.["aria-labelledby"] !== undefined;
  // gh#303 — last resort, when neither the trigger nor the Select-level contract names it: a
  // Select NESTED under a layout wrapper inside FormField (年/月 combo, range pair) still takes
  // its name from the enclosing field's label. `{}` whenever a name already exists.
  const nameFallback = useFieldNameFallback({
    "aria-label": ownsName ? props["aria-label"] : field?.["aria-label"],
    "aria-labelledby": ownsName ? props["aria-labelledby"] : field?.["aria-labelledby"],
  });
  const fieldA11y =
    field || nameFallback["aria-labelledby"] !== undefined
      ? {
          id: props.id ?? field?.id,
          ...(ownsName
            ? {}
            : fieldOwnsName
              ? {
                  "aria-label": field?.["aria-label"],
                  "aria-labelledby": field?.["aria-labelledby"],
                }
              : nameFallback),
          "aria-describedby": mergeAriaIds(props["aria-describedby"], field?.["aria-describedby"]),
          "aria-errormessage": mergeAriaIds(
            props["aria-errormessage"],
            field?.["aria-errormessage"],
          ),
          "aria-required": props["aria-required"] ?? field?.["aria-required"],
          "aria-invalid": props["aria-invalid"] ?? field?.["aria-invalid"],
          "data-field": props["data-field"] ?? field?.["data-field"],
        }
      : undefined;
  // gh#337 R-3 — the CODE behind the visible label, on the element that is actually visible.
  // A Radix select's native `<select>` is a 1x1px aria-hidden bubble input that exists only so a
  // native form submit carries the value; the trigger is what a person (or a screen automation)
  // sees, and it renders "東京本社" where the row's real value is "52". Publishing the value here
  // is the one thing no consumer can do for itself — hence a library-level attribute, not a
  // per-screen prop. Nothing about the DOM structure changes.
  const dataValue = (props["data-value"] ?? field?.value) || undefined;
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        controlTriggerClass,
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground w-full whitespace-nowrap transition-[color,box-shadow] outline-none *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center",
        className,
      )}
      {...props}
      {...fieldA11y}
      data-value={dataValue}
    >
      {children}
      {showIndicator ? (
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            data-slot="select-chevron"
            className="ui-select-chevron"
            aria-hidden="true"
          />
        </SelectPrimitive.Icon>
      ) : null}
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn("ui-select-scroll-button", className)}
    {...props}
  >
    <ChevronUp className="ui-select-scroll-icon" aria-hidden="true" />
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
    className={cn("ui-select-scroll-button", className)}
    {...props}
  >
    <ChevronDown className="ui-select-scroll-icon" aria-hidden="true" />
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
        "ui-select-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
          "ui-select-viewport",
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
    className={cn("ui-select-label", className)}
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
    className={cn("ui-select-item [&_svg:not([class*='text-'])]:text-muted-foreground", className)}
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
    className={cn("ui-select-separator", className)}
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
  labelRender,
  selectedLabel,
  selectedIcon,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loadingMessage,
  errorMessage,
  clearLabel,
  clearable,
  disabled,
  readOnly,
  size,
  open,
  onOpenChange,
  search,
  onSearchChange,
  filterOption,
  renderError,
  renderLoadMore,
  name,
  id,
  className,
  "data-testid": dataTestId,
  "data-field": dataField,
  ...rest
}: SelectDataProp) {
  // FormField injects a11y wiring (aria-labelledby/-describedby/-errormessage/
  // -invalid) via cloneElement — forward it to the trigger or the control loses
  // its accessible name. Only aria-* passes through; anything else in rest
  // (e.g. a misused prop) must not leak onto the DOM button.
  const ariaProps = Object.fromEntries(
    Object.entries(rest as Record<string, unknown>).filter(([key]) => key.startsWith("aria-")),
  );
  const { t } = useTranslation();
  // gh#337 R-3 — the selected CODE for `data-value` on the trigger. Radix owns the value of an
  // UNCONTROLLED select and changing it does not re-render this component, so the pick is mirrored
  // here; a controlled select reads straight off the prop. Declared ABOVE the `searchable` branch
  // because that branch returns early and a hook may not be called conditionally.
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  // gh#337 — the machine key for a Select NESTED under a layout wrapper. Resolved here rather than
  // on the trigger: `name` belongs on the Radix root / SearchSelect's hidden input (what a native
  // submit reads), and only `data-field` travels on to the visible trigger.
  const identity = useFieldIdentity({ id, name, "data-field": dataField });
  const resolvedName = name ?? identity.name;
  const resolvedField = dataField ?? identity["data-field"];
  const searchable = showSearch ?? Boolean(loadOptions);
  const hasOptions = options.length > 0;

  if (searchable) {
    return (
      <SearchSelect
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        options={options}
        loadOptions={loadOptions}
        renderOption={renderOption}
        labelRender={labelRender}
        selectedLabel={selectedLabel}
        selectedIcon={selectedIcon}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        loadingMessage={loadingMessage}
        errorMessage={errorMessage}
        clearLabel={clearLabel}
        clearable={clearable}
        disabled={disabled || (!loadOptions && !hasOptions)}
        readOnly={readOnly}
        size={size}
        open={open}
        onOpenChange={onOpenChange}
        search={search}
        onSearchChange={onSearchChange}
        filterOption={filterOption}
        renderError={renderError}
        renderLoadMore={renderLoadMore}
        name={resolvedName}
        id={id}
        className={className}
        data-testid={dataTestId}
        data-field={resolvedField}
        {...ariaProps}
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

  // Controlled-ness is fixed by whether `value` was passed — NOT by its emptiness.
  // Collapsing "" → undefined flipped a controlled Select to uncontrolled on the
  // empty state and back on first pick (React's controlled↔uncontrolled warning).
  // An unmatched value (incl. "") simply shows the placeholder in Radix.
  const isControlled = value !== undefined;
  // Clear affordance for the PLAIN branch (gh#280) — the searchable branch already gets it
  // from SearchSelect. Same contract: default ON, shown only while a controlled value is
  // selected; clearing emits `onValueChange("", undefined)` and Radix shows the placeholder.
  // Only controlled selects can clear (an uncontrolled Radix value cannot be reset from here),
  // and their DOM gains a relative wrapper so the X can overlay the trigger like SearchSelect.
  const canClear = clearable !== false && isControlled && !disabled && !readOnly;
  const showClear = canClear && Boolean(value);
  const select = (
    <SelectPrimitive.Root
      data-slot="select"
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : defaultValue || undefined}
      onValueChange={(next) => {
        setUncontrolledValue(next);
        onValueChange?.(
          next,
          options.find((option) => option.value === next),
        );
      }}
      disabled={disabled || !hasOptions}
      name={resolvedName}
    >
      <SelectTrigger
        id={id}
        data-testid={dataTestId}
        data-field={resolvedField}
        data-value={currentValue || undefined}
        className={cn(showClear && "ui-control-trigger-affixed", canClear ? undefined : className)}
        showIndicator={!showClear}
        {...ariaProps}
      >
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

  if (!canClear) return select;

  return (
    <div className={cn("relative", className)}>
      {select}
      {showClear ? (
        <div className="ui-control-affix">
          <button
            type="button"
            aria-label={clearLabel ?? t("dataEntry.searchSelect.clear")}
            data-testid={dataTestId ? `${dataTestId}-clear` : undefined}
            className="ui-control-affix-action"
            onClick={() => onValueChange?.("", undefined)}
          >
            <X className="ui-control-affix-icon" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
