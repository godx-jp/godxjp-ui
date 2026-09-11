import * as React from "react";
import {
  Button as AriaButton,
  ButtonContext,
  Header as AriaHeader,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
  Select as AriaSelect,
  SelectStateContext,
  SelectValue as AriaSelectValue,
  Separator as AriaSeparator,
} from "react-aria-components";
import { ChevronDown, Loader2, X } from "lucide-react";
import type {
  ControlStatusProp,
  ControlVariantProp,
  ControlWidthProp,
  SizeProp,
} from "../../props/vocabulary";
import { cn } from "../../lib/utils";
import { controlSurfaceTriggerClass } from "../../lib/control-styles";
import { controlSurfaceAttrs, resolveAllowClear, resolveAriaInvalid } from "./control-surface";
import {
  mergeAriaIds,
  useFieldIdentity,
  pickFieldA11y,
  useFieldNameFallback,
} from "../../lib/field-a11y";
import type { FieldA11yProps } from "../../lib/field-a11y";
import { useOverlayPortalContainer } from "../../lib/overlay-portal";
import { radixSurfaceState, toPlacement } from "../navigation/dropdown-menu";
import { SearchSelect } from "./search-select";
import { useTranslation } from "../../i18n/use-translation";
import { normalizeSelectOptions } from "../../lib/select-options";
import type {
  SearchSelectBaseProp,
  SearchSelectMultipleProp,
  SearchSelectOptionProp,
  SearchSelectProp,
  SearchSelectSingleProp,
  SelectShowSearchProp,
  SelectDataProp,
  SelectLabeledValueProp,
  SelectPlacementProp,
} from "../../props/components/data-entry.prop";

/*
 * NỀN: react-aria-components, không còn @radix-ui/react-select.
 *
 * API công khai giữ NGUYÊN VĂN hình dạng Radix — `value` / `defaultValue` / `onValueChange`, `open`,
 * `name`, `<SelectTrigger id>`, `<SelectValue placeholder>` — và component tự dịch sang cách viết của
 * react-aria (`value` → `value` kiểu Key, `onValueChange` → `onChange`, `disabled` → `isDisabled`).
 * Mọi ca consumer đo được nằm trong __tests__/select-rac.test.tsx, chạy trên CẢ bản Radix cũ lẫn
 * bản này.
 *
 * Ba chỗ react-aria mặc định khác Radix, và bản này giữ theo Radix:
 *
 * 1. TÊN CỦA TRIGGER. `useSelect` luôn ghi `aria-labelledby="<id của ô giá trị> …"` lên nút, tức là
 *    tên truy cập của trigger thành "東京 担当拠点" — và, tệ hơn, một `<label htmlFor>` bên ngoài bị
 *    `aria-labelledby` đè mất. Consumer thật đặt tên bằng đúng `<label htmlFor>` ấy (godx-task,
 *    17 tệp). Nên `ButtonContext` được cấp lại KHÔNG có `aria-labelledby`; tên đến từ đúng những gì
 *    consumer đưa, như dưới Radix.
 * 2. VAI TRÒ. react-aria dựng `<button aria-haspopup="listbox">`; Radix dựng `role="combobox"`, và
 *    283 truy vấn trong kho cùng test trình duyệt của ql đếm `[role="combobox"]`. `role` đặt qua
 *    `render` — khai báo, có trong HTML SSR, không phải `setAttribute` sau hydrate.
 * 3. HỘP THOẠI. Popover modal của react-aria tự nhận `role="dialog"`; một listbox không phải một hộp
 *    thoại (xem `radixSurfaceState` ở dropdown-menu.tsx — cùng lý do, cùng cách bỏ).
 *
 * Nền `inert` khi mở: react-aria gọi `ariaHideOutside(…, { shouldUseInert: true })`, nên
 * `useInertHiddenBackground` không còn việc gì ở đây.
 */

/** Compound-API props — the shape the Radix root had, plus the FormField field-a11y contract that
 *  this component re-routes to the trigger (see {@link SelectFieldA11yContext}). */
export type SelectCompoundProp = FieldA11yProps & {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * @deprecated Accepted so Radix-era call sites keep compiling. Direction now comes from the
   * ambient locale (`AppProvider` / `I18nProvider`), which react-aria reads itself.
   */
  dir?: "ltr" | "rtl";
  /** Form field name — a hidden native `<select>` carries the value on submit. */
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  /** Native `required`: an empty select blocks a native form submit. */
  required?: boolean;
  form?: string;
  children?: React.ReactNode;
};

export type SelectProp = SelectDataProp | SelectCompoundProp;

function isDataSelect(props: SelectProp): props is SelectDataProp {
  return "options" in props || "loadOptions" in props;
}

/**
 * Carries the FormField field-a11y contract from `<Select>` down to `<SelectTrigger>`. FormField
 * injects `id` / `aria-labelledby` / `aria-describedby` / … onto its single child with
 * `cloneElement`.
 */
const SelectFieldA11yContext = React.createContext<(FieldA11yProps & { id?: string }) | null>(null);

/** `""` is "nothing selected" in this API; react-aria spells that `null`. */
function toKey(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value === "" ? null : value;
}

/**
 * react-aria merges the event handlers it knows about into its own; every other attribute a
 * consumer passed has to reach the DOM node as-is, or `title` / `tabIndex` / an unknown `aria-*`
 * would silently vanish (react-aria's DOM filter keeps only ids, `data-*` and a fixed event list).
 */
function splitDomProps(props: Record<string, unknown>) {
  const events: Record<string, unknown> = {};
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (/^on[A-Z]/.test(key)) events[key] = value;
    else attributes[key] = value;
  }
  return { events, attributes };
}

/** Plain text of an option's children — react-aria's type-to-select and the hidden `<option>`. */
function itemTextValue(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(itemTextValue).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return itemTextValue(node.props.children);
  }
  return "";
}

type SelectRootProp = Omit<SelectCompoundProp, keyof FieldA11yProps> & {
  isDisabled?: boolean;
  /**
   * The control's NAME, handed to react-aria as well as to the trigger.
   *
   * The trigger is named by {@link SelectTrigger} — react-aria's own labelling is deliberately
   * stripped there (see the file note). But `useLabel` WARNS once per render when the root has
   * neither a label slot nor `aria-label`/`aria-labelledby` ("If you do not provide a visible
   * label…"), which would print on every page carrying a Select. Handing it the same name is the
   * honest way to quiet it: nothing about the trigger changes, and the listbox gains a name too.
   */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Let the popup open with no options — the data API's `notFoundContent` opt-in. */
  allowsEmptyCollection?: boolean;
};

/** The react-aria root with this library's value spelling. No DOM box of its own (`display: contents`). */
function SelectRoot({
  id,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  dir,
  name,
  autoComplete,
  disabled,
  isDisabled,
  required,
  form,
  allowsEmptyCollection,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  children,
}: SelectRootProp) {
  void dir;
  return (
    <AriaSelect
      data-slot="select"
      className="ui-select-root"
      id={id}
      value={toKey(value)}
      defaultValue={toKey(defaultValue) ?? undefined}
      onChange={(key) => {
        if (key != null) onValueChange?.(String(key));
      }}
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDisabled={disabled || isDisabled}
      isRequired={required}
      name={name}
      form={form}
      autoComplete={autoComplete}
      allowsEmptyCollection={allowsEmptyCollection}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </AriaSelect>
  );
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
    // antd `labelInValue` is a DIALECT of the value, not a second component: it is translated here
    // and everything below this line only ever sees plain string values.
    if (props.labelInValue) return <LabelInValueSelect {...props} />;
    return <DataSelect {...(props as PlainDataSelectProp)} />;
  }
  return <CompoundSelect {...props} />;
}

type LabelInValueProp = SelectDataProp & { labelInValue: true };

/**
 * antd `labelInValue` — `{ value, label }` in and out.
 *
 * It earns its place on the async edit form: a screen loads a record holding `{ value: "52",
 * label: "東京本社" }` and can render the pick immediately, with no options page fetched and no
 * flash of the raw id. So the labels that arrive on the VALUE are also folded into the option list
 * (deduped), which is the only way the trigger can show them before the list loads.
 */
function LabelInValueSelect({
  labelInValue,
  value,
  defaultValue,
  onValueChange,
  onSelect,
  ...rest
}: LabelInValueProp) {
  void labelInValue;
  const multiple = rest.mode === "multiple" || rest.mode === "tags";
  const onDeselect = (
    rest as { onDeselect?: (value: unknown, option: SearchSelectOptionProp) => void }
  ).onDeselect;
  const entries = React.useMemo(() => {
    const current = (value ?? defaultValue) as
      SelectLabeledValueProp | SelectLabeledValueProp[] | null | undefined;
    if (current == null) return [] as SelectLabeledValueProp[];
    return Array.isArray(current) ? current : [current];
  }, [value, defaultValue]);

  const options = React.useMemo(() => {
    const base = normalizeSelectOptions(rest.options, rest.fieldNames);
    const known = new Set(base.map((option) => option.value));
    const carried = entries
      .filter((entry) => entry && !known.has(entry.value))
      .map((entry) => ({ value: entry.value, label: itemTextValue(entry.label) || entry.value }));
    return carried.length ? [...base, ...carried] : base;
  }, [rest.options, rest.fieldNames, entries]);

  const toLabeled = (picked: string, option?: SearchSelectOptionProp): SelectLabeledValueProp => ({
    value: picked,
    // The OPTION's label wins when the row is known; the label that rode in on the value is the
    // fallback for the row that has not loaded.
    label: option?.label ?? entries.find((entry) => entry.value === picked)?.label ?? picked,
  });

  // ONE cast, at the boundary: below this object every value is a plain string again, which is the
  // whole point of the adapter. Spreading it into the union-typed DataSelect otherwise asks
  // TypeScript to pick a branch of a union that `mode` decides at runtime.
  const shared = {
    ...rest,
    options,
    fieldNames: undefined,
    onSelect: onSelect
      ? (picked: string, option: SearchSelectOptionProp) =>
          (onSelect as (v: SelectLabeledValueProp, o: SearchSelectOptionProp) => void)(
            toLabeled(picked, option),
            option,
          )
      : undefined,
  } as Record<string, unknown>;

  if (multiple) {
    const labeledValues = value as SelectLabeledValueProp[] | undefined;
    const labeledDefaults = defaultValue as SelectLabeledValueProp[] | undefined;
    const adapted = {
      ...shared,
      value: labeledValues?.map((entry) => entry.value),
      defaultValue: labeledDefaults?.map((entry) => entry.value),
      onValueChange: (picked: string[], pickedOptions?: SearchSelectOptionProp[]) =>
        (
          onValueChange as
            ((v: SelectLabeledValueProp[], o?: SearchSelectOptionProp[]) => void) | undefined
        )?.(
          picked.map((entry) =>
            toLabeled(
              entry,
              pickedOptions?.find((option) => option.value === entry),
            ),
          ),
          pickedOptions,
        ),
      onDeselect: onDeselect
        ? (picked: string, option: SearchSelectOptionProp) =>
            onDeselect(toLabeled(picked, option), option)
        : undefined,
    } as unknown as PlainDataSelectProp;
    return <DataSelect {...adapted} />;
  }

  const labeledValue = value as SelectLabeledValueProp | null | undefined;
  const labeledDefault = defaultValue as SelectLabeledValueProp | null | undefined;
  const adapted = {
    ...shared,
    value: value === undefined ? undefined : (labeledValue?.value ?? ""),
    defaultValue: labeledDefault?.value,
    onValueChange: (picked: string, option?: SearchSelectOptionProp) =>
      (
        onValueChange as
          ((v: SelectLabeledValueProp | undefined, o?: SearchSelectOptionProp) => void) | undefined
      )?.(picked ? toLabeled(picked, option) : undefined, option),
  } as unknown as PlainDataSelectProp;
  return <DataSelect {...adapted} />;
}

function CompoundSelect({ id, name, ...props }: SelectCompoundProp) {
  // `id`, `data-field` and the aria-* contract are NOT root props — they belong to the trigger.
  const fieldA11y = pickFieldA11y(props);
  // Resolved HERE, not on the trigger: `name` belongs on the root, which is what renders the
  // native <select> a form submit reads; only `data-field` continues on to the trigger.
  const identity = useFieldIdentity({ id, name, "data-field": fieldA11y["data-field"] });
  return (
    <SelectFieldA11yContext.Provider
      value={{
        ...fieldA11y,
        "data-field": identity["data-field"] ?? fieldA11y["data-field"],
        id,
      }}
    >
      <SelectRoot
        {...props}
        id={id}
        name={name ?? identity.name}
        aria-label={fieldA11y["aria-label"]}
        aria-labelledby={fieldA11y["aria-labelledby"]}
      />
    </SelectFieldA11yContext.Provider>
  );
}

export function SelectGroup({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <ListBoxSection
      data-slot="select-group"
      className={className}
      {...(splitDomProps(props).attributes as object)}
    >
      {children}
    </ListBoxSection>
  );
}

export type SelectValueProp = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Shown while nothing is selected. */
  placeholder?: React.ReactNode;
  /** Replaces the selected option's label on the trigger while a value is selected. */
  children?: React.ReactNode;
  /** @deprecated Radix-only; has no effect. */
  asChild?: boolean;
};

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProp>(function SelectValue(
  { placeholder, children, asChild, className, style, ...props },
  ref,
) {
  void asChild;
  return (
    <AriaSelectValue
      ref={ref}
      data-slot="select-value"
      className={className ?? ""}
      style={style}
      {...(props as object)}
    >
      {({ isPlaceholder, defaultChildren }) =>
        isPlaceholder ? (placeholder ?? null) : (children ?? defaultChildren)
      }
    </AriaSelectValue>
  );
});

type SelectTriggerProp = React.ButtonHTMLAttributes<HTMLButtonElement> & {
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
   * only place the underlying value is readable from the DOM without reaching into the aria-hidden
   * native `<select>`.
   */
  "data-value"?: string;
  /** @deprecated Radix-only; has no effect — the trigger is always the library's own button. */
  asChild?: boolean;
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProp>(
  (
    {
      className,
      children,
      size = "md",
      variant,
      status,
      width = "full",
      showIndicator = true,
      disabled,
      asChild,
      style,
      ...props
    },
    ref,
  ) => {
    void asChild;
    // The FormField contract reaches the compound trigger through context, because the root drops
    // the cloneElement props. Anything set directly on the trigger wins; the two id-list attributes
    // merge rather than replace so a local description survives.
    const field = React.useContext(SelectFieldA11yContext);
    const state = React.useContext(SelectStateContext);
    const ariaTrigger = React.useContext(ButtonContext);
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
    const hasField = Boolean(field) || nameFallback["aria-labelledby"] !== undefined;
    const fieldA11y = hasField
      ? {
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
          "aria-invalid": resolveAriaInvalid(
            props["aria-invalid"] ?? field?.["aria-invalid"],
            status,
          ),
          "data-field": props["data-field"] ?? field?.["data-field"],
        }
      : { "aria-invalid": resolveAriaInvalid(props["aria-invalid"], status) };
    const id = props.id ?? (hasField ? field?.id : undefined);
    const isOpen = state?.isOpen ?? false;
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const composedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [ref],
    );
    const wasOpen = React.useRef(false);
    React.useEffect(() => {
      // …AND THE SAME REPAIR ONE TICK LATER. react-aria restores focus from its focus scope on a
      // path this effect cannot order against: measured in jsdom, the scope's restore sometimes
      // runs AFTER this effect and lands on <body>, so a check made here would read the still
      // connected listbox and do nothing. Deferred by one macrotask, the check runs last and only
      // acts when focus really ended up nowhere — a no-op wherever react-aria restored correctly.
      if (!wasOpen.current || isOpen) {
        wasOpen.current = isOpen;
        return;
      }
      wasOpen.current = isOpen;
      const button = buttonRef.current;
      if (!button) return;
      const restore = button.ownerDocument.defaultView?.setTimeout(() => {
        const owner = button.ownerDocument;
        if (!button.isConnected) return;
        if (owner.activeElement === null || owner.activeElement === owner.body) button.focus();
      }, 0);
      return () => {
        if (restore !== undefined) button.ownerDocument.defaultView?.clearTimeout(restore);
      };
    }, [isOpen]);
    const selected = state ? (state.value as string | number | null) : null;
    const hasValue = selected != null && selected !== "";
    // The trigger shows "東京本社" where the row's real value is "52". Publishing the value here is
    // the one thing no consumer can do for itself — hence a library-level attribute.
    const dataValue =
      (props["data-value"] ?? (hasValue ? String(selected) : undefined)) || undefined;
    const { events, attributes } = splitDomProps(props);
    delete attributes.id;
    // See the file note (1): react-aria's `aria-labelledby` would name the trigger after its VALUE
    // and bury any `<label htmlFor>`. The trigger is named by exactly what the consumer gave it.
    const triggerContext = React.useMemo(() => {
      if (!ariaTrigger || "slots" in ariaTrigger) return ariaTrigger;
      const next = { ...(ariaTrigger as Record<string, unknown>) };
      delete next["aria-labelledby"];
      return next as typeof ariaTrigger;
    }, [ariaTrigger]);
    return (
      <ButtonContext.Provider value={triggerContext}>
        <AriaButton
          ref={composedRef}
          id={id}
          // RADIX PARITY, FOCUS ON CLOSE. react-aria's menu trigger deliberately does not focus a
          // trigger pressed with the MOUSE, so its focus scope captures <body> as the node to
          // restore, and Escape drops the user at the top of the document instead of back on the
          // field. Radix focused the trigger from its own pointerdown handler; doing the same here
          // means the scope captures the TRIGGER, so every close path (Escape, pick, outside
          // click) restores to it. Flipping react-aria's `preventFocusOnPress` instead is WRONG:
          // it stops the popup opening at all (measured: 34 red tests).
          onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
            event.currentTarget.focus();
          }}
          {...(events as object)}
          isDisabled={disabled || undefined}
          style={style}
          className={cn(
            controlSurfaceTriggerClass,
            // `bounded` deliberately emits NO width utility: its width is owned by the
            // `[data-width="bounded"]` rule in control.css. A utility here would win the layer order
            // and make that rule — and therefore the token — dead, the way `w-full` did to
            // `.ui-app-setting-picker-icon`'s `inline-size` (gh#366, gh#371).
            width === "auto" && "w-auto",
            width === "full" && "w-full",
            "aria-invalid:border-destructive data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground whitespace-nowrap transition-[color,box-shadow] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center",
            className,
          )}
          render={(domProps) => (
            <button
              {...domProps}
              {...(attributes as React.ButtonHTMLAttributes<HTMLButtonElement>)}
              {...fieldA11y}
              // See the file note (2).
              role="combobox"
              aria-autocomplete="none"
              data-slot="select-trigger"
              data-size={size}
              data-variant={controlSurfaceAttrs({ variant })["data-variant"]}
              data-status={status}
              data-width={width}
              data-state={isOpen ? "open" : "closed"}
              data-placeholder={hasValue ? undefined : ""}
              data-value={dataValue}
            />
          )}
        >
          {children}
          {showIndicator ? (
            <ChevronDown
              data-slot="select-chevron"
              className="ui-select-chevron"
              aria-hidden="true"
            />
          ) : null}
        </AriaButton>
      </ButtonContext.Provider>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

type SelectScrollButtonProp = React.HTMLAttributes<HTMLDivElement>;

/**
 * @deprecated Radix-only. react-aria's listbox is a native scroll container, so there is nothing
 * to render; kept (as a no-op) so existing imports keep compiling until the next major.
 */
export const SelectScrollUpButton = React.forwardRef<HTMLDivElement, SelectScrollButtonProp>(
  function SelectScrollUpButton(props, ref) {
    void props;
    void ref;
    return null;
  },
);

/** @deprecated Radix-only — see {@link SelectScrollUpButton}. */
export const SelectScrollDownButton = React.forwardRef<HTMLDivElement, SelectScrollButtonProp>(
  function SelectScrollDownButton(props, ref) {
    void props;
    void ref;
    return null;
  },
);

type RadixSide = "top" | "right" | "bottom" | "left";

type SelectContentProp = Omit<React.HTMLAttributes<HTMLDivElement>, "dir"> & {
  /**
   * How the popup sizes against its trigger — the DOM half of antd `popupMatchSelectWidth`.
   * Absent = the trigger's width is the floor (antd's `true`); `content` releases that floor;
   * `fixed` pins both edges to `--select-content-inline-size`.
   */
  "data-popup-match"?: "content" | "fixed";
  side?: RadixSide;
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  /** `false` keeps the popup on `side` even when it would overflow. */
  avoidCollisions?: boolean;
  collisionPadding?: number;
  /** @deprecated Radix-only. The popup always positions against the trigger (`popper`). */
  position?: "popper" | "item-aligned";
  /** @deprecated Radix-only; has no effect. */
  sticky?: "partial" | "always";
  /** @deprecated Radix-only; has no effect. */
  hideWhenDetached?: boolean;
  /** @deprecated Radix-only; has no effect. */
  onCloseAutoFocus?: (event: Event) => void;
  /** @deprecated Radix-only; has no effect — Escape always closes. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** @deprecated Radix-only; has no effect — an outside press always closes. */
  onPointerDownOutside?: (event: Event) => void;
  /** @deprecated Radix-only; has no effect. */
  forceMount?: true;
};

type SelectPopupProp = SelectContentProp & {
  /** Rendered by the listbox when it has no options (antd `notFoundContent`). */
  renderEmpty?: React.ReactNode;
  /** antd `placement`, logical. Overrides `side`/`align`. */
  placement?: SelectPlacementProp;
  /** antd `popupRender` — wraps the list, which it must still render. */
  popupRender?: (originNode: React.ReactNode) => React.ReactNode;
  /** antd `listHeight` — per-instance override of `--select-content-max-height`. */
  listHeight?: number;
  /** antd `onPopupScroll`. */
  onPopupScroll?: (event: React.UIEvent<HTMLElement>) => void;
};

/** antd's four block-axis placements, on the logical inline axis (see SelectPlacementProp). */
const SELECT_PLACEMENT: Record<
  SelectPlacementProp,
  { side: "top" | "bottom"; align: "start" | "end" }
> = {
  bottomStart: { side: "bottom", align: "start" },
  bottomEnd: { side: "bottom", align: "end" },
  topStart: { side: "top", align: "start" },
  topEnd: { side: "top", align: "end" },
};

const SelectPopup = React.forwardRef<HTMLDivElement, SelectPopupProp>(function SelectPopup(
  {
    className,
    children,
    style,
    side,
    sideOffset = 4,
    align = "start",
    alignOffset,
    avoidCollisions,
    collisionPadding,
    position,
    sticky,
    hideWhenDetached,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    forceMount,
    renderEmpty,
    placement,
    popupRender,
    listHeight,
    onPopupScroll,
    "data-popup-match": popupMatch,
    ...props
  },
  ref,
) {
  void position;
  void sticky;
  void hideWhenDetached;
  void onCloseAutoFocus;
  void onEscapeKeyDown;
  void onPointerDownOutside;
  void forceMount;
  const portalContainer = useOverlayPortalContainer();
  const { events, attributes } = splitDomProps(props);
  const anchor = placement ? SELECT_PLACEMENT[placement] : undefined;
  const list = (
    <ListBox
      data-slot="select-viewport"
      className="ui-select-viewport"
      {...(events as object)}
      onScroll={onPopupScroll}
      renderEmptyState={
        renderEmpty === undefined
          ? undefined
          : () => (
              <div data-slot="select-empty" className="ui-select-empty">
                {renderEmpty}
              </div>
            )
      }
    >
      {children}
    </ListBox>
  );
  return (
    <AriaPopover
      ref={ref}
      UNSTABLE_portalContainer={portalContainer}
      placement={toPlacement(side ?? anchor?.side, align ?? anchor?.align)}
      offset={sideOffset}
      crossOffset={alignOffset}
      shouldFlip={avoidCollisions}
      containerPadding={collisionPadding}
      // antd `listHeight` — a per-instance override of the token the CSS cap reads, not a
      // hand-written height: `.ui-select-viewport` still says `max-block-size:
      // var(--select-content-max-height)`, and this only changes what that resolves to here.
      style={
        listHeight === undefined
          ? style
          : ({ ...style, "--select-content-max-height": `${listHeight}px` } as React.CSSProperties)
      }
      className={cn(
        "ui-select-content data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      render={(popoverProps, popoverState) => (
        // `role={undefined}`: a listbox is not a dialog — see the file note (3).
        <div
          {...popoverProps}
          {...(attributes as React.HTMLAttributes<HTMLDivElement>)}
          role={undefined}
          {...radixSurfaceState(popoverState)}
          data-slot="select-content"
          data-popup-match={popupMatch}
        />
      )}
    >
      {/* antd `popupRender` wraps the list and must render it: react-aria reads the listbox out of
          the tree below this popover, so a renderer that drops `originNode` leaves an empty popup. */}
      {popupRender ? popupRender(list) : list}
    </AriaPopover>
  );
});

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProp>(
  function SelectContent(props, ref) {
    return <SelectPopup ref={ref} {...props} />;
  },
);

export const SelectLabel = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function SelectLabel({ className, ...props }, ref) {
    return (
      <AriaHeader
        ref={ref}
        data-slot="select-label"
        className={cn("ui-select-label", className)}
        {...props}
      />
    );
  },
);

type SelectItemProp = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  value: string;
  disabled?: boolean;
  /** Text for type-to-select and the hidden native `<option>`; derived from `children` if omitted. */
  textValue?: string;
  /**
   * antd `menuItemSelectedIcon` — a decorative mark on the picked row. Off by default: this
   * library marks the picked row with fill + weight, which costs no width.
   */
  selectedIcon?: React.ReactNode;
  /** @deprecated Radix-only; has no effect. */
  asChild?: boolean;
};

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProp>(function SelectItem(
  { className, children, selectedIcon, value, disabled, textValue, asChild, ...props },
  ref,
) {
  void asChild;
  const { events, attributes } = splitDomProps(props);
  return (
    <ListBoxItem
      ref={ref}
      id={value}
      textValue={textValue ?? (itemTextValue(children) || value)}
      isDisabled={disabled}
      {...(events as object)}
      className={cn(
        "ui-select-item [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      render={(itemProps, itemState) => (
        // The Radix `data-*` vocabulary control.css reads (`[data-state="checked"]`,
        // `[data-highlighted]`), translated from react-aria's state.
        <div
          {...(itemProps as React.HTMLAttributes<HTMLDivElement>)}
          {...(attributes as React.HTMLAttributes<HTMLDivElement>)}
          data-slot="select-item"
          data-state={itemState.isSelected ? "checked" : "unchecked"}
          data-highlighted={itemState.isFocused ? "" : undefined}
          data-disabled={itemState.isDisabled ? "" : undefined}
        />
      )}
    >
      {/* A render function, not a node: `SelectValue` renders the picked option's children on the
          trigger and calls this with `isSelected: false`, so the selected-row mark stays in the list. */}
      {({ isSelected }) => (
        <>
          {children}
          {selectedIcon && isSelected ? (
            <span
              data-slot="select-item-selected-icon"
              className="ui-search-select-selected-icon"
              aria-hidden="true"
            >
              {selectedIcon}
            </span>
          ) : null}
        </>
      )}
    </ListBoxItem>
  );
});

export const SelectSeparator = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function SelectSeparator({ className, ...props }, ref) {
    return (
      <AriaSeparator
        ref={ref}
        data-slot="select-separator"
        className={cn("ui-select-separator", className)}
        {...(splitDomProps(props).attributes as object)}
      />
    );
  },
);

// ── Data-driven (Ant-style) Select ─────────────────────────────────────────
// Rendered when `<Select>` receives `options` / `loadOptions`. With search (or async) it
// delegates to the SearchSelect combobox; without, it builds the plain react-aria listbox from the
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

/**
 * antd `labelRender` on the plain listbox. It reads the picked key out of react-aria's state
 * rather than off a prop, so an UNCONTROLLED Select renders a custom label too — the branch a
 * `value`-only implementation silently skips.
 */
function DataSelectLabel({
  labelRender,
  options,
}: {
  labelRender: NonNullable<SelectDataProp["labelRender"]>;
  options: SearchSelectOptionProp[];
}) {
  const state = React.useContext(SelectStateContext);
  const selected = state ? (state.value as string | number | null) : null;
  if (selected == null || selected === "") return null;
  const value = String(selected);
  const option = options.find((entry) => entry.value === value);
  return <>{labelRender({ value, label: option?.label ?? value, option })}</>;
}

/**
 * What DataSelect actually receives: `SelectDataProp` minus the `labelInValue` dialect, which
 * {@link LabelInValueSelect} has already translated into plain strings. Spelled out rather than
 * derived, because `Exclude` does not reach into an intersection with a union.
 */
type PlainDataSelectProp = SearchSelectBaseProp & {
  showSearch?: boolean | SelectShowSearchProp;
} & (SearchSelectSingleProp | SearchSelectMultipleProp);

function DataSelect(props: PlainDataSelectProp) {
  const { t } = useTranslation();
  // Resolved here rather than on the trigger: `name` belongs on the root / SearchSelect's hidden
  // input (what a native submit reads), and only `data-field` travels on to the visible trigger.
  const identity = useFieldIdentity({
    id: props.id,
    name: props.name,
    "data-field": props["data-field"],
  });
  const resolvedName = props.name ?? identity.name;
  const resolvedField = props["data-field"] ?? identity["data-field"];
  // One list, whatever the call site wrote: flat rows, antd's nested groups, or foreign rows read
  // through `fieldNames`. Both branches below (and SearchSelect) see the same normalised array.
  const options = React.useMemo(
    () => normalizeSelectOptions(props.options, props.fieldNames),
    [props.options, props.fieldNames],
  );
  const hasOptions = options.length > 0;
  // antd's `showSearch` OBJECT form configures the search in one place — and, by existing at all,
  // turns it on.
  const showSearchConfig =
    typeof props.showSearch === "object" && props.showSearch !== null
      ? props.showSearch
      : undefined;
  const showSearch = showSearchConfig ? true : (props.showSearch as boolean | undefined);
  // antd defaults `showSearch` to true for a multi-value select, and the plain listbox here is
  // single-value, so a multi-value `mode` always routes to the searchable panel (a
  // `showSearch={false}` beside it is ignored, and says so in the prop docs).
  const searchable = showSearch ?? (Boolean(props.loadOptions) || props.mode !== undefined);

  // `mode !== undefined` rather than naming both multi modes: it is the discriminant that narrows
  // `props` to the single-value member below, which is what makes `value` a plain string there.
  if (props.mode !== undefined || searchable) {
    // antd's `filterOption(input, option)` takes its arguments the other way round from this
    // library's long-standing `filterOption(option, query)`, and `false` means "the server already
    // filtered — keep every row". Both are translated into the one shape the engine takes.
    const antdFilter = showSearchConfig?.filterOption;
    const filterOption =
      antdFilter === undefined
        ? props.filterOption
        : antdFilter === false
          ? () => true
          : antdFilter === true
            ? undefined
            : (option: SearchSelectOptionProp, query: string) => antdFilter(query, option);
    const onSearch = showSearchConfig?.onSearch;
    return (
      <SearchSelect
        // `labelInValue` was translated away before this point, so every value here is a string —
        // which is exactly the difference between SelectDataProp's union and SearchSelectProp's.
        {...(props as SearchSelectProp)}
        options={options}
        // Already applied above — passing it on would map the normalised rows a second time.
        fieldNames={undefined}
        filterOption={filterOption}
        filterSort={showSearchConfig?.filterSort ?? props.filterSort}
        optionFilterProp={showSearchConfig?.optionFilterProp ?? props.optionFilterProp}
        search={showSearchConfig?.searchValue ?? props.search}
        onSearchChange={
          onSearch || props.onSearchChange
            ? (query: string) => {
                onSearch?.(query);
                props.onSearchChange?.(query);
              }
            : undefined
        }
        autoClearSearchValue={showSearchConfig?.autoClearSearchValue ?? props.autoClearSearchValue}
        disabled={props.disabled || (!props.loadOptions && !hasOptions)}
        name={resolvedName}
        data-field={resolvedField}
      />
    );
  }

  // ── Plain (no-search) SINGLE select, react-aria-powered ─────────────────────────────────────
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
    labelRender,
    prefix,
    suffixIcon,
    placement,
    popupRender,
    listHeight,
    onPopupScroll,
    id,
    className,
    "data-testid": dataTestId,
    ...rest
  } = props;
  // FormField injects a11y wiring (aria-labelledby/-describedby/-errormessage/-invalid) via
  // cloneElement — forward it to the trigger or the control loses its accessible name. Only aria-*
  // passes through; anything else in rest (e.g. a misused prop) must not leak onto the DOM button.
  const ariaProps = Object.fromEntries(
    Object.entries(rest as Record<string, unknown>).filter(([key]) => key.startsWith("aria-")),
  );

  const optionTestId = (optionValue: string) =>
    dataTestId ? `${dataTestId}-option-${optionValue}` : undefined;
  // Flat index across every group, so antd's `optionRender(option, { index })` gets the same
  // ordinal a consumer would count on screen (groups render in first-seen order, exactly the
  // order this counter walks).
  let flatIndex = 0;
  const renderItem = (option: SearchSelectOptionProp) => {
    const index = flatIndex++;
    return (
      <SelectItem
        key={option.value}
        value={option.value}
        textValue={option.label}
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

  // Collapsing "" → undefined flipped a controlled Select to uncontrolled on the empty state and
  // back on first pick (React's controlled↔uncontrolled warning). An unmatched value (incl. "")
  // simply shows the placeholder.
  const isControlled = value !== undefined;
  // Same contract as SearchSelect: default ON, shown only while a controlled value is selected;
  // clearing emits `onValueChange("", undefined)` and the trigger shows the placeholder.
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
    <SelectRoot
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : defaultValue || undefined}
      onValueChange={(next) => {
        onValueChange?.(
          next,
          options.find((option) => option.value === next),
        );
      }}
      disabled={disabled || (!hasOptions && !showEmptyPopup)}
      allowsEmptyCollection={showEmptyPopup}
      aria-label={ariaProps["aria-label"] as string | undefined}
      aria-labelledby={ariaProps["aria-labelledby"] as string | undefined}
      name={resolvedName}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        id={id}
        data-testid={dataTestId}
        data-field={resolvedField}
        size={size}
        variant={variant}
        status={status}
        width={width}
        aria-busy={loading || undefined}
        className={cn(
          prefix === undefined || prefix === null ? undefined : "ui-select-trigger-prefixed",
          (showClear || loading) && "ui-control-trigger-affixed",
          canClear || loading ? undefined : className,
        )}
        // antd `suffixIcon`: a node replaces the chevron, `null` removes the indicator entirely
        // (antd's own replacement for the `showArrow` it deprecated).
        showIndicator={suffixIcon === undefined && !showClear && !loading}
        {...ariaProps}
      >
        {/* antd `prefix` — NOT aria-hidden: for a `role="combobox"` the trigger's text is the
            VALUE a screen reader announces, and a prefix that is part of the value ("To:", a
            currency mark) belongs in it. The control's NAME still comes from its label. */}
        {prefix === undefined || prefix === null ? null : (
          <span data-slot="select-prefix" className="ui-select-prefix">
            {prefix}
          </span>
        )}
        <SelectValue placeholder={placeholder}>
          {labelRender ? (
            <DataSelectLabel labelRender={labelRender} options={options} />
          ) : undefined}
        </SelectValue>
        {suffixIcon === undefined || suffixIcon === null || showClear || loading ? null : (
          <span data-slot="select-suffix" className="ui-select-suffix" aria-hidden="true">
            {suffixIcon}
          </span>
        )}
      </SelectTrigger>
      <SelectPopup
        renderEmpty={showEmptyPopup ? notFoundContent : undefined}
        placement={placement}
        popupRender={popupRender}
        listHeight={listHeight}
        onPopupScroll={onPopupScroll}
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
      </SelectPopup>
    </SelectRoot>
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
