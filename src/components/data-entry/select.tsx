import * as React from "react";
import type {
  ControlStatusProp,
  ControlVariantProp,
  ControlWidthProp,
  SizeProp,
} from "../../props/vocabulary";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { controlSurfaceTriggerClass } from "../../lib/control-styles";
import { controlSurfaceAttrs, resolveAllowClear, resolveAriaInvalid } from "./control-surface";
import { useInertHiddenBackground } from "../general/inert-background";
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
 * Carries the FormField field-a11y contract from `<Select>` down to `<SelectTrigger>`. FormField
 * injects `id` / `aria-labelledby` / `aria-describedby` / … onto its single child with
 * `cloneElement`.
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
  // The trigger displays the LABEL ("東京本社"); automation and tests need the value ("52"), and
  // Radix keeps it in a context this package cannot read. Controlled selects read straight off the
  // prop; an uncontrolled one is tracked here because Radix would otherwise change it without
  // re-rendering this component at all.
  const [uncontrolled, setUncontrolled] = React.useState(props.defaultValue);
  const value = props.value ?? uncontrolled;
  // Resolved
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
    /** Control height tier — the shared `--control-height` ladder (antd `size`). */
    size?: SizeProp;
    /** Control surface (antd `variant`). Default `outlined`. */
    variant?: ControlVariantProp;
    /** Validation status (antd `status`). `error` also sets `aria-invalid`. */
    status?: ControlStatusProp;
    /**
     * `full` (default) fills the field column — right inside a FormField. `auto` sizes to the
     * selected label — right in a PageContainer `extra` slot, a toolbar or a footer row, where a
     * full-width trigger swallows the row and starves its siblings (text truncated to "UA…").
     * `bounded` holds one width from `--control-bounded-width`, for a trigger whose VALUE varies
     * in length and must not move its neighbours when it changes (gh#375).
     */
    width?: ControlWidthProp;
    /**
     * Show the built-in chevron disclosure indicator (default true). Set `false` for specialized
     * triggers — icon-only, or one that already renders its own affordance — so it isn't
     * duplicated.
     */
    showIndicator?: boolean;
    "data-field"?: string;
    /**
     * Normally supplied by `Select` itself — the trigger shows the option's LABEL, and this is the
     * only place the underlying value is readable from the DOM without reaching into Radix's
     * aria-hidden native `<select>`.
     */
    "data-value"?: string;
  }
>(
  (
    {
      className,
      children,
      size = "md",
      variant,
      status,
      width = "full",
      showIndicator = true,
      ...props
    },
    ref,
  ) => {
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
            "aria-describedby": mergeAriaIds(
              props["aria-describedby"],
              field?.["aria-describedby"],
            ),
            "aria-errormessage": mergeAriaIds(
              props["aria-errormessage"],
              field?.["aria-errormessage"],
            ),
            "aria-required": props["aria-required"] ?? field?.["aria-required"],
            "aria-invalid": resolveAriaInvalid(
              props["aria-invalid"] ?? field?.["aria-invalid"],
              status,
            ),
            "data-field": props["data-field"] ?? field?.["data-field"],
          }
        : { "aria-invalid": resolveAriaInvalid(props["aria-invalid"], status) };
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
        data-variant={controlSurfaceAttrs({ variant })["data-variant"]}
        data-status={status}
        data-width={width}
        className={cn(
          controlSurfaceTriggerClass,
          // `bounded` deliberately emits NO width utility: its width is owned by the
          // `[data-width="bounded"]` rule in control.css. A utility here would win the layer order
          // and make that rule — and therefore the token — dead, the way `w-full` did to
          // `.ui-app-setting-picker-icon` (gh#366, gh#371).
          width === "auto" && "w-auto",
          width === "full" && "w-full",
          "aria-invalid:border-destructive data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground whitespace-nowrap transition-[color,box-shadow] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center",
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
  },
);
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
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    /**
     * How the popup sizes against its trigger — the DOM half of antd `popupMatchSelectWidth`.
     * Absent = the trigger's width is the floor (antd's `true`); `content` releases that floor;
     * `fixed` pins both edges to `--select-content-inline-size`.
     */
    "data-popup-match"?: "content" | "fixed";
  }
>(({ className, children, position = "popper", ...props }, ref) => {
  // Radix hides the app behind an open Select from assistive tech but leaves it tabbable —
  // axe `aria-hidden-focus`. See components/general/inert-background.ts.
  // Đăng ký chính phần tử content: nó mang `data-state`, và đó là tín hiệu ý định đóng mà
  // nền dựa vào để nhả `inert` NGAY, thay vì đợi hết animation thoát (gh#385).
  const contentRef = useInertHiddenBackground(ref);
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={contentRef}
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
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full",
            // The trigger-width floor is a UTILITY, so no `[data-popup-match]` rule in control.css
            // could ever lift it (gh#366). It is therefore WITHHELD whenever the consumer stated a
            // width of their own — which is exactly what antd's `popupMatchSelectWidth` is for.
            position === "popper" &&
              !props["data-popup-match"] &&
              "min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
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
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    /**
     * antd `menuItemSelectedIcon` — a decorative mark on the picked row. Off by default: this
     * library marks the picked row with fill + weight, which costs no width.
     */
    selectedIcon?: React.ReactNode;
  }
>(({ className, children, selectedIcon, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn("ui-select-item [&_svg:not([class*='text-'])]:text-muted-foreground", className)}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    {selectedIcon ? (
      <SelectPrimitive.ItemIndicator asChild>
        <span
          data-slot="select-item-selected-icon"
          className="ui-search-select-selected-icon"
          aria-hidden="true"
        >
          {selectedIcon}
        </span>
      </SelectPrimitive.ItemIndicator>
    ) : null}
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

function DataSelect(props: SelectDataProp) {
  const { t } = useTranslation();
  // Radix owns the value of an
  // UNCONTROLLED select and changing it does not re-render this component, so the pick is mirrored
  // here; a controlled select reads straight off the prop. Declared ABOVE the `searchable` branch
  // because that branch returns early and a hook may not be called conditionally.
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(
    typeof props.defaultValue === "string" ? props.defaultValue : undefined,
  );
  // Resolved here rather than
  // on the trigger: `name` belongs on the Radix root / SearchSelect's hidden input (what a native
  // submit reads), and only `data-field` travels on to the visible trigger.
  const identity = useFieldIdentity({
    id: props.id,
    name: props.name,
    "data-field": props["data-field"],
  });
  const resolvedName = props.name ?? identity.name;
  const resolvedField = props["data-field"] ?? identity["data-field"];
  const options = props.options ?? [];
  const hasOptions = options.length > 0;
  // antd defaults `showSearch` to true for a multiple select, and this library has no no-search
  // multi surface at all: Radix's Select is single-value by construction, so `mode="multiple"`
  // always routes to the searchable panel (a `showSearch={false}` beside it is ignored, and says
  // so in the prop docs).
  const searchable = props.showSearch ?? (Boolean(props.loadOptions) || props.mode === "multiple");

  if (props.mode === "multiple" || searchable) {
    return (
      <SearchSelect
        {...props}
        options={options}
        disabled={props.disabled || (!props.loadOptions && !hasOptions)}
        name={resolvedName}
        data-field={resolvedField}
      />
    );
  }

  // ── Plain (no-search) SINGLE select, Radix-powered ──────────────────────────────────────────
  const {
    renderOption,
    optionRender,
    menuItemSelectedIcon,
    placeholder,
    clearLabel,
    clearable,
    disabled,
    readOnly,
    size,
    status,
    variant,
    width,
    loading,
    open,
    defaultOpen,
    onOpenChange,
    notFoundContent,
    popupMatchSelectWidth,
    allowClear,
    onClear,
    value,
    defaultValue,
    onValueChange,
    id,
    className,
    "data-testid": dataTestId,
    ...rest
  } = props;
  const currentValue = value ?? uncontrolledValue;
  // FormField injects a11y wiring (aria-labelledby/-describedby/-errormessage/
  // -invalid) via cloneElement — forward it to the trigger or the control loses
  // its accessible name. Only aria-* passes through; anything else in rest
  // (e.g. a misused prop) must not leak onto the DOM button.
  const ariaProps = Object.fromEntries(
    Object.entries(rest as Record<string, unknown>).filter(([key]) => key.startsWith("aria-")),
  );

  const optionTestId = (optionValue: string) =>
    dataTestId ? `${dataTestId}-option-${optionValue}` : undefined;
  // Flat index across every group, so antd's `optionRender(option, { index })` gets the same
  // ordinal a consumer would count on screen (the grouped Select renders groups in first-seen
  // order, exactly the order this counter walks).
  let flatIndex = 0;
  const renderItem = (option: SearchSelectOptionProp) => {
    const index = flatIndex++;
    return (
      <SelectItem
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        data-testid={optionTestId(option.value)}
        selectedIcon={menuItemSelectedIcon}
      >
        {optionRender
          ? optionRender(option, { index })
          : renderOption
            ? renderOption(option)
            : option.label}
      </SelectItem>
    );
  };

  // Collapsing "" → undefined flipped a controlled Select to uncontrolled on the
  // empty state and back on first pick (React's controlled↔uncontrolled warning).
  // An unmatched value (incl. "") simply shows the placeholder in Radix.
  const isControlled = value !== undefined;
  // from SearchSelect. Same contract: default ON, shown only while a controlled value is
  // selected; clearing emits `onValueChange("", undefined)` and Radix shows the placeholder.
  // Only controlled selects can clear (an uncontrolled Radix value cannot be reset from here),
  // and their DOM gains a relative wrapper so the X can overlay the trigger like SearchSelect.
  const clearControl = resolveAllowClear(
    allowClear,
    clearable,
    clearLabel ?? t("dataEntry.searchSelect.clear"),
  );
  const canClear = clearControl.enabled && isControlled && !disabled && !readOnly && !loading;
  const showClear = canClear && Boolean(value);
  // A plain (no-search) Select with nothing to list is normally an inert trigger — there is no
  // popup worth opening. `notFoundContent` is the opt-in that says otherwise: the consumer WANTS
  // the empty state seen ("no branches yet — add one"), so the trigger stays operable and the
  // popup carries their node. Nothing changes for the call sites that pass neither.
  const showEmptyPopup = !hasOptions && notFoundContent !== undefined;
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
      disabled={disabled || (!hasOptions && !showEmptyPopup)}
      name={resolvedName}
      // Radix owns the popup, so antd's open contract is a straight pass-through here. It was
      // simply never wired: a `<Select options open>` used to render a permanently shut listbox.
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        id={id}
        data-testid={dataTestId}
        data-field={resolvedField}
        data-value={currentValue || undefined}
        size={size}
        variant={variant}
        status={status}
        width={width}
        aria-busy={loading || undefined}
        className={cn(
          (showClear || loading) && "ui-control-trigger-affixed",
          canClear || loading ? undefined : className,
        )}
        showIndicator={!showClear && !loading}
        {...ariaProps}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        data-popup-match={
          popupMatchSelectWidth === undefined || popupMatchSelectWidth === true
            ? undefined
            : popupMatchSelectWidth === false
              ? "content"
              : "fixed"
        }
        style={
          typeof popupMatchSelectWidth === "number"
            ? ({
                "--select-content-inline-size": `${popupMatchSelectWidth}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {showEmptyPopup ? (
          <div data-slot="select-empty" className="ui-select-empty">
            {notFoundContent}
          </div>
        ) : null}
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

  if (!canClear && !loading) return select;

  return (
    <div className={cn("relative", className)}>
      {select}
      {loading ? (
        <div className="ui-control-affix">
          <Loader2
            data-slot="select-loading"
            className="ui-control-affix-icon ui-control-affix-indicator animate-spin"
            aria-hidden="true"
          />
        </div>
      ) : showClear ? (
        <div className="ui-control-affix">
          <button
            type="button"
            aria-label={clearControl.label}
            data-testid={dataTestId ? `${dataTestId}-clear` : undefined}
            className="ui-control-affix-action"
            onClick={() => {
              onValueChange?.("", undefined);
              onClear?.();
            }}
          >
            {clearControl.clearIcon ?? <X className="ui-control-affix-icon" aria-hidden="true" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
