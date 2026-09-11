/*
 * BẢN RADIX CỦA `Select` (phần compound), chép nguyên văn từ src/components/data-entry/select.tsx
 * @ 9638ee65 — lần cuối nó còn chạy trên @radix-ui/react-select. Chỉ đổi tên (tiền tố `Radix`) và
 * đường import. Nó là CHỨNG CỨ cho select-rac.test.tsx: cùng một cây consumer dựng bằng hai nền phải
 * cho ra cùng tên truy cập, cùng giá trị form, cùng thuộc tính trên trigger. Đừng "dọn" nó.
 */
import * as React from "react";
import type {
  ControlStatusProp,
  ControlVariantProp,
  ControlWidthProp,
  SizeProp,
} from "../../../props/vocabulary";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { controlSurfaceTriggerClass } from "../../../lib/control-styles";
import { controlSurfaceAttrs, resolveAriaInvalid } from "../control-surface";
import { useInertHiddenBackground } from "../../general/inert-background";
import {
  mergeAriaIds,
  useFieldIdentity,
  omitFieldA11y,
  pickFieldA11y,
  useFieldNameFallback,
} from "../../../lib/field-a11y";
import type { FieldA11yProps } from "../../../lib/field-a11y";

/** Compound-API props: the Radix root's own props PLUS the FormField field-a11y contract, which
 *  this component re-routes to the trigger (see {@link SelectFieldA11yContext}). */
export type RadixSelectCompoundProp = React.ComponentProps<typeof SelectPrimitive.Root> &
  FieldA11yProps & { id?: string };

/**
 * Carries the FormField field-a11y contract from `<Select>` down to `<RadixSelectTrigger>`. FormField
 * injects `id` / `aria-labelledby` / `aria-describedby` / … onto its single child with
 * `cloneElement`.
 */
const SelectFieldA11yContext = React.createContext<
  (FieldA11yProps & { id?: string; value?: string }) | null
>(null);

export function RadixSelect({ id, ...props }: RadixSelectCompoundProp) {
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

export function RadixSelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function RadixSelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export const RadixSelectTrigger = React.forwardRef<
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
RadixSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const RadixSelectScrollUpButton = React.forwardRef<
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
RadixSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const RadixSelectScrollDownButton = React.forwardRef<
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
RadixSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

export const RadixSelectContent = React.forwardRef<
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
        <RadixSelectScrollUpButton />
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
        <RadixSelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
RadixSelectContent.displayName = SelectPrimitive.Content.displayName;

export const RadixSelectLabel = React.forwardRef<
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
RadixSelectLabel.displayName = SelectPrimitive.Label.displayName;

export const RadixSelectItem = React.forwardRef<
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
RadixSelectItem.displayName = SelectPrimitive.Item.displayName;

export const RadixSelectSeparator = React.forwardRef<
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
RadixSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

