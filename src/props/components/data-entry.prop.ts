/** Data Entry component prop types — @see docs/COMPONENTS.md#data-entry */
import type * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type * as SliderPrimitive from "@radix-ui/react-slider";
import type * as SwitchPrimitive from "@radix-ui/react-switch";
import type { DayPickerProps } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import type * as React from "react";
import type { UploadFileItem } from "../../components/data-entry/upload-types";
import type { FieldA11yProps } from "../../lib/field-a11y";
import type {
  ClassNameProp,
  DisabledProp,
  EmptyMessageProp,
  ErrorBagProp,
  ErrorProp,
  HelperProp,
  IdProp,
  LabelProp,
  NameProp,
  OnChangeProp,
  OnValueChangeProp,
  OnSearchChangeProp,
  OpenProp,
  OnOpenChangeProp,
  PlaceholderProp,
  RequiredProp,
  ValueProp,
  DefaultValueProp,
  FormLayoutProp,
  WidthProp,
  BreakpointProp,
  DensityProp,
  SizeProp,
  TitleProp,
} from "../vocabulary";
import type { ResponsiveGridColumnsProp } from "./layout.prop";

/** One-outline-per-group appearance for the compound InputOTP control. */
export type InputOTPGroupAppearanceProp = "slots" | "grouped";

/** @see InputOTPGroup */
export type InputOTPGroupProp = React.HTMLAttributes<HTMLDivElement> & {
  appearance?: InputOTPGroupAppearanceProp;
};

/**
 * Main-axis alignment of the whole code row (groups + separators) inside its container.
 * `start` is the historical default. A centred challenge is the common auth case and used to
 * force every consumer to wrap `.ui-otp-container` in their own flex-centring div.
 * @see InputOTP
 */
export type InputOTPAlignProp = "start" | "center" | "end";

/** @see Input */
export type InputProp = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Show an inline ✕ that clears the field while it holds text (default false). */
  allowClear?: boolean;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
  /** A leading affordance pinned inside the start of the field (e.g. a mail/lock icon). */
  leadingIcon?: React.ReactNode;
  /** A trailing affordance pinned inside the end of the field (replaced by the clear ✕ when `allowClear` + value). */
  trailingIcon?: React.ReactNode;
};

/** @see Textarea */
export type TextareaProp = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Show an inline ✕ (top-end) that clears the field while it holds text (default false). */
  allowClear?: boolean;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
};

/**
 * @see NumberInput — localized numeric spinbutton (composes `Input` + step `Button`s).
 * `value`/`defaultValue`/`onValueChange` carry a `number | null` (null = empty). `step` drives both
 * the stepper buttons and ArrowUp/ArrowDown (Shift = ×10); `precision` sets the committed decimal
 * places (inferred from `step` when omitted). Value commits clamped to `min`/`max` on blur/Enter.
 */
export type NumberInputProp = FieldA11yProps & {
  value?: ValueProp<number | null>;
  defaultValue?: DefaultValueProp<number | null>;
  onValueChange?: OnValueChangeProp<number | null>;
  /** Lower bound — clamps the committed value and disables the decrement stepper at the floor. */
  min?: number;
  /** Upper bound — clamps the committed value and disables the increment stepper at the ceiling. */
  max?: number;
  /** Increment for the steppers + ArrowUp/ArrowDown (Shift = ×10). Default 1. */
  step?: number;
  /** Committed decimal places. Inferred from `step` when omitted. */
  precision?: number;
  disabled?: DisabledProp;
  /** Read-only: value is shown and selectable but neither typeable nor steppable. */
  readOnly?: boolean;
  size?: SizeProp;
  placeholder?: PlaceholderProp;
  /** Leading affix inside the field (e.g. `¥`). Decorative — `aria-hidden`. */
  prefix?: React.ReactNode;
  /** Trailing affix inside the field (e.g. `%`). Decorative — `aria-hidden`. */
  suffix?: React.ReactNode;
  /** Form field name — the visible input submits its value natively. */
  name?: NameProp;
  id?: IdProp;
  className?: ClassNameProp;
  "data-testid"?: string;
};

/**
 * @see Form — layout context for FormFields (Ant-style). `layout`/`labelWidth`/`controlWidth`/
 * `labelAlign` are applied to every FormField and overridable per field. `collapseBelow` sets the
 * breakpoint at which `horizontal` collapses to `vertical` (mobile-first; `false` = always
 * horizontal). `columns` lays fields out in a responsive grid (reuses ResponsiveGrid).
 */
export type FormProp = React.FormHTMLAttributes<HTMLFormElement> & {
  layout?: FormLayoutProp;
  labelWidth?: WidthProp;
  controlWidth?: WidthProp;
  labelAlign?: "start" | "end";
  collapseBelow?: BreakpointProp | false;
  columns?: ResponsiveGridColumnsProp;
  density?: DensityProp;
  /**
   * Server validation error bag (e.g. Inertia's `form.errors`). Each `FormField name="…"` inside
   * resolves its own message from the bag automatically and CLAIMS its key; `<FormErrors />`
   * renders the remaining, unclaimed entries — errors attached to hidden/derived fields that no
   * visible field displays. Works in both the `<form>` and `asChild` modes. A Form WITHOUT this
   * prop joins a surrounding `FormErrorsProvider` instead (sibling Card+Form sections sharing one
   * bag); a Form WITH it starts its own (shadowing) registry.
   */
  errors?: ErrorBagProp;
  /**
   * Render the caller's own element instead of a `<form>`, keeping only the layout context.
   * For routing libraries that own the form element (Inertia, TanStack Form) — two `<form>`
   * elements cannot nest. `columns` does not apply in this mode; wrap fields in ResponsiveGrid.
   */
  asChild?: boolean;
  className?: ClassNameProp;
};

/**
 * @see FormField — exactly one of `children` (an interactive control) or `staticText` (gh#294):
 * a read-only VALUE row inside the same Form, styled to match `Descriptions.Item`'s value
 * typography (`text-sm break-all`) byte-for-byte. This is the "mixed read-only + editable fields
 * on one form" case (an immutable name/email row above an editable role Select, for example) —
 * putting the read-only rows through FormField itself, not a separate `Descriptions` composed
 * alongside it, gets perfect layout/labelAlign/row-gap sync FOR FREE because it IS the same
 * component reading the same Form context, rather than two components whose contracts need
 * reconciling. `staticText` skips FormField's control a11y wiring (id/aria-labelledby/
 * aria-describedby cloning) entirely — there is no real control to label, so none of that applies.
 */
export type FormFieldProp =
  | {
      /** Optional — auto-generated and injected into the child control when omitted. */
      id?: IdProp;
      /**
       * Error-bag key of this field. When the surrounding `Form` carries `errors`, the field
       * resolves its message from `errors[name]` automatically (an explicit `error` prop wins)
       * and CLAIMS the key so `<FormErrors />` does not repeat it. Not injected into the child —
       * pass `name` on the control itself for native form submission.
       */
      name?: NameProp;
      label: LabelProp;
      required?: RequiredProp;
      helper?: HelperProp;
      error?: ErrorProp;
      /** Optional control rendered inline after the label (e.g. a help button). */
      labelAddon?: React.ReactNode;
      /** Override the Form's layout for this field only. */
      layout?: FormLayoutProp;
      /** Override the Form's label width for this field (horizontal layout). */
      labelWidth?: WidthProp;
      /** Override the Form's control width for this field. */
      controlWidth?: WidthProp;
      /** Span N columns when inside a `columns` Form grid. */
      colSpan?: number;
      className?: ClassNameProp;
      children: React.ReactNode;
      staticText?: never;
    }
  | {
      /** Optional — auto-generated and injected into the child control when omitted. */
      id?: IdProp;
      /**
       * Error-bag key of this field. When the surrounding `Form` carries `errors`, the field
       * resolves its message from `errors[name]` automatically (an explicit `error` prop wins)
       * and CLAIMS the key so `<FormErrors />` does not repeat it.
       */
      name?: NameProp;
      label: LabelProp;
      required?: RequiredProp;
      helper?: HelperProp;
      error?: ErrorProp;
      /** Optional control rendered inline after the label (e.g. a help button). */
      labelAddon?: React.ReactNode;
      /** Override the Form's layout for this field only. */
      layout?: FormLayoutProp;
      /** Override the Form's label width for this field (horizontal layout). */
      labelWidth?: WidthProp;
      /** Override the Form's control width for this field. */
      controlWidth?: WidthProp;
      /** Span N columns when inside a `columns` Form grid. */
      colSpan?: number;
      className?: ClassNameProp;
      children?: never;
      /** Read-only value — renders as `Descriptions.Item`-matched text instead of a control. */
      staticText: React.ReactNode;
    };

/**
 * @see FormErrors — the "no field to stand on" error summary. Renders the entries of the
 * surrounding `Form`'s error bag that no mounted `FormField name="…"` has claimed — validation
 * errors attached to hidden/derived fields (`action_mode`, `page`, a source-record id…) that
 * would otherwise fail silently. Renders nothing while every error is claimed or the bag is empty.
 */
export type FormErrorsProp = {
  /**
   * Explicit error bag — overrides the surrounding `Form errors`. Use it when the component sits
   * outside a `Form` (e.g. inside `FormRoot`); field claiming still applies when a `Form` provides
   * the registry.
   */
  errors?: ErrorBagProp;
  /** Heading above the messages. Defaults to the localized "please review your input" title. */
  title?: TitleProp;
  className?: ClassNameProp;
};

/**
 * @see FormErrorsProvider — one shared error registry over a REGION of sibling Forms. An edit
 * screen split into several Card+Form sections shares a single server bag: wrap the sections in
 * this provider instead of passing `errors` to each Form, and every `FormField name="…"` inside
 * (Forms without their own `errors` join the surrounding registry) claims into the same registry,
 * so one `<FormErrors />` anywhere in the region renders exactly the unclaimed remainder.
 * `Form errors={…}` renders this provider itself — a Form WITH its own `errors` starts a new
 * (shadowing) registry.
 */
export type FormErrorsProviderProp = {
  /** Server validation error bag shared by every Form/FormField in the region. */
  errors?: ErrorBagProp;
  children?: React.ReactNode;
};

/** @see SearchInput */
export type SearchInputProp = FieldA11yProps & {
  id?: IdProp;
  label?: LabelProp;
  placeholder?: PlaceholderProp;
  value?: ValueProp;
  onChange?: OnChangeProp;
  onSearchChange?: OnSearchChangeProp;
  debounceMs?: number;
  className?: ClassNameProp;
};

/** @see Checkbox — extends Radix checkbox root props. */
export type CheckboxProp = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

/** Shared option row — Ant Design `CheckboxOptionType`. */
export type ChoiceOptionProp = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  description?: React.ReactNode;
};

/** @see Checkbox.Group */
export type CheckboxGroupProp = FieldA11yProps & {
  value?: ValueProp<string[]>;
  defaultValue?: DefaultValueProp<string[]>;
  onValueChange?: OnValueChangeProp<string[]>;
  options?: ChoiceOptionProp[];
  orientation?: "horizontal" | "vertical";
  disabled?: DisabledProp;
  name?: NameProp;
  /** Injected by FormField (or set directly) — applied to the `role="group"` container. */
  id?: IdProp;
  className?: ClassNameProp;
  children?: React.ReactNode;
};

/** @see Radio.Group */
export type RadioGroupProp = FieldA11yProps & {
  value?: ValueProp;
  defaultValue?: DefaultValueProp;
  onValueChange?: OnValueChangeProp;
  options?: ChoiceOptionProp[];
  orientation?: "horizontal" | "vertical";
  disabled?: DisabledProp;
  name?: NameProp;
  /** Injected by FormField (or set directly) — applied to the `role="radiogroup"` container. */
  id?: IdProp;
  className?: ClassNameProp;
  children?: React.ReactNode;
};

/** @see Radio.Item — Radix radio group item. */
export type RadioProp = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>;

/** @see Switch — extends Radix switch root props. */
export type SwitchProp = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "md";
};

/** @see Field — inline control + label + description wrapper. */
export type FieldProp = {
  id: IdProp;
  label: LabelProp;
  description?: React.ReactNode;
  className?: ClassNameProp;
  children: React.ReactNode;
};

/** @see Slider — numeric range (Radix Slider). */
export type SliderProp = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

/** @see Calendar — react-day-picker DayPicker. */
export type CalendarProp = DayPickerProps;

/** @see DatePicker */
export type DatePickerProp = FieldA11yProps & {
  value?: ValueProp<Date>;
  defaultValue?: DefaultValueProp<Date | undefined>;
  onValueChange?: OnValueChangeProp<Date | undefined>;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the value as an ISO-8601 `yyyy-MM-dd` string for native submission. */
  name?: NameProp;
  locale?: DayPickerProps["locale"];
  fromDate?: Date;
  toDate?: Date;
  /** Show an inline ✕ to clear the value when one is set (default true). */
  allowClear?: boolean;
};

/** @see MonthPicker */
export type MonthPickerProp = FieldA11yProps & {
  value?: ValueProp<Date>;
  defaultValue?: DefaultValueProp<Date | undefined>;
  onValueChange?: OnValueChangeProp<Date | undefined>;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — submits the display text (`yyyy/MM`). */
  name?: NameProp;
  /** Clamp the year navigation (inclusive). */
  fromYear?: number;
  toYear?: number;
  /** Show an inline ✕ to clear the value when one is set (default true). */
  allowClear?: boolean;
};

/**
 * @see MonthRangePicker — both edges are normalized to the FIRST day of their month
 * (the `DateRange` shape is shared with DateRangePicker so ranges interop).
 */
export type MonthRangePickerProp = FieldA11yProps & {
  value?: ValueProp<DateRange>;
  defaultValue?: DefaultValueProp<DateRange | undefined>;
  onValueChange?: OnValueChangeProp<DateRange | undefined>;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the range as `${name}_from` / `${name}_to` `yyyy/MM` fields. */
  name?: NameProp;
  /** Clamp the year navigation (inclusive). */
  fromYear?: number;
  toYear?: number;
  /** Show an inline ✕ to clear the range when one is set (default true). */
  allowClear?: boolean;
};

/** @see DateRangePicker */
export type DateRangePickerProp = FieldA11yProps & {
  value?: ValueProp<DateRange>;
  defaultValue?: DefaultValueProp<DateRange | undefined>;
  onValueChange?: OnValueChangeProp<DateRange | undefined>;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the range as `${name}_from` / `${name}_to` ISO `yyyy-MM-dd` fields. */
  name?: NameProp;
  locale?: DayPickerProps["locale"];
  fromDate?: Date;
  toDate?: Date;
  /** Show an inline ✕ to clear the range when one is set (default true). */
  allowClear?: boolean;
};

/** @see TimePicker — popover HH:mm picker (canonical 24h storage). */
export type TimePickerProp = FieldA11yProps & {
  value?: ValueProp;
  defaultValue?: DefaultValueProp;
  onValueChange?: OnValueChangeProp;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the value as a canonical 24h `HH:mm` string for native submission. */
  name?: NameProp;
  /** Minute column step — default 5 (logistics cut-offs). */
  minuteStep?: number;
  /** Show an inline ✕ to clear the value when one is set (default true). */
  allowClear?: boolean;
};

/** @see ColorPicker */
export type ColorPickerProp = FieldA11yProps & {
  value?: ValueProp;
  onValueChange?: OnValueChangeProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  showHexInput?: boolean;
};

/** A SearchSelect option row. `group` buckets it under an optgroup-style heading. */
export type SearchSelectOptionProp = {
  value: string;
  label: string;
  sublabel?: string;
  /**
   * Leading node (icon / avatar / flag) shown before the label in BOTH the option row and the
   * trigger once selected. Keep it small (≈1em / a 16–20px avatar) so the trigger stays one line.
   */
  icon?: React.ReactNode;
  /** Optgroup-style heading this option belongs to (rendered once, in first-seen order). */
  group?: string;
  disabled?: boolean;
};

export type SearchSelectLoadParamsProp = {
  query: string;
  /** 1-based page for infinite scroll. */
  page: number;
};

export type SearchSelectLoadResultProp = {
  options: SearchSelectOptionProp[];
  /** True if another page is available (drives infinite scroll). */
  hasMore?: boolean;
};

/**
 * @see Select — the data-driven entry point (`<Select options|loadOptions showSearch …/>`).
 * This is the shape of its internal engine (`SelectDataProp` extends it); use `Select` directly.
 */
export type SearchSelectProp = {
  value?: ValueProp;
  /** Uncontrolled initial value — the trigger shows its option's label at rest (controlled-triad). */
  defaultValue?: DefaultValueProp;
  onValueChange?: (value: string, option?: SearchSelectOptionProp) => void;
  /** Static option list (client-side filtered). Provide this OR `loadOptions`, not both. */
  options?: SearchSelectOptionProp[];
  /** Remote fetcher — debounced search + infinite-scroll pagination call into this. Provide this
   *  OR `options`. */
  loadOptions?: (params: SearchSelectLoadParamsProp) => Promise<SearchSelectLoadResultProp>;
  /** Custom per-option renderer (Ant-Design style). Defaults to label + optional sublabel. */
  renderOption?: (option: SearchSelectOptionProp) => React.ReactNode;
  /**
   * Custom renderer for the SELECTED value shown on the trigger (Ant Design `labelRender`).
   * Receives the value, the resolved label, and the full option when it is loaded (undefined for
   * an async preset whose page hasn't arrived). Only used while a value is selected; the
   * placeholder still shows when empty. Overrides the default icon + label trigger content.
   */
  labelRender?: (selected: {
    value: string;
    label: React.ReactNode;
    option?: SearchSelectOptionProp;
  }) => React.ReactNode;
  /** Label for the current value when its option isn't in the loaded page (avoids a flash of id). */
  selectedLabel?: string;
  /**
   * Leading icon for the current value when its option isn't loaded yet (async + preset value) —
   * the trigger counterpart of `selectedLabel`, so an edit form shows the picked icon at rest.
   */
  selectedIcon?: React.ReactNode;
  placeholder?: PlaceholderProp;
  searchPlaceholder?: PlaceholderProp;
  emptyMessage?: EmptyMessageProp;
  loadingMessage?: string;
  /** Message shown when an async `loadOptions` rejects — a distinct state from empty/loading. Used
   *  as-is unless `renderError` is provided. */
  errorMessage?: string;
  clearLabel?: string;
  /** Show a "clear" row when a value is selected (default true). */
  clearable?: boolean;
  disabled?: DisabledProp;
  /**
   * Read-only: the current value is shown (and the clear affordance hidden) but the popover cannot
   * be opened — no new pick, no search. Mirrors the Input/NumberInput readOnly contract (stays
   * focusable + submits its value, unlike `disabled`). Default false.
   */
  readOnly?: boolean;
  /** Trigger height tier — forwarded to the underlying Button. Default matches Button's own default. */
  size?: SizeProp;
  /** Controlled open state for the popover (uncontrolled by default). */
  open?: OpenProp;
  onOpenChange?: OnOpenChangeProp;
  /** Controlled search-box query (uncontrolled by default). Pairs with `onSearchChange`. */
  search?: string;
  onSearchChange?: OnSearchChangeProp;
  /**
   * Override the default client-side filter (`options` mode only — ignored with `loadOptions`,
   * which is responsible for its own server-side filtering). Receives the option and the trimmed
   * query; return true to keep the row. Only consulted while the query is non-empty.
   */
  filterOption?: (option: SearchSelectOptionProp, query: string) => boolean;
  /**
   * Custom error slot — receives the resolved message and a `retry` callback that reloads from the
   * first page (a predictable recovery, not a resume of a failed page-N append). Overrides the
   * default `errorMessage` row.
   */
  renderError?: (params: { message: string; retry: () => void }) => React.ReactNode;
  /**
   * Custom "load more" affordance appended below the list while another page is available — pairs
   * with (does not replace) the built-in scroll-triggered pagination.
   */
  renderLoadMore?: (params: {
    hasMore: boolean;
    loading: boolean;
    loadMore: () => void;
  }) => React.ReactNode;
  /** Form field name — submits the selected value via a hidden input. */
  name?: NameProp;
  id?: IdProp;
  className?: ClassNameProp;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
  "data-testid"?: string;
};

/**
 * Data-driven (Ant-style) form of {@link Select} — one component covering static `options` or
 * async `loadOptions`, with `showSearch` toggling the searchable combobox vs a plain listbox.
 * Passing `options`/`loadOptions` to `<Select>` switches it from the compound API to this one.
 *
 * `readOnly`/`size`/`open`/`onOpenChange`/`search`/`onSearchChange`/`filterOption`/`renderError`/
 * `renderLoadMore` (inherited from {@link SearchSelectProp}) take effect ONLY in searchable mode
 * (`showSearch` or `loadOptions`) — they configure the `SearchSelect` engine that mode delegates
 * to. The plain listbox (no search) is a native Radix listbox and ignores them.
 */
export type SelectDataProp = SearchSelectProp & {
  /** Show the search box (combobox). Defaults to true when `loadOptions` is set, otherwise false. */
  showSearch?: boolean;
};

/** @see UploadFileItem */
export type UploadFileItemProp = UploadFileItem;

/** @see Upload */
export type UploadVariantProp =
  "dropzone" | "button" | "picture-card" | "picture" | "avatar" | "avatar-crop";

/** @see Upload — presentational; wire `onUpload` to media-service in app api.ts */
export type UploadProp = FieldA11yProps & {
  variant?: UploadVariantProp;
  value?: ValueProp<UploadFileItemProp[]>;
  defaultValue?: DefaultValueProp<UploadFileItemProp[]>;
  onValueChange?: OnValueChangeProp<UploadFileItemProp[]>;
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  maxSizeBytes?: number;
  disabled?: DisabledProp;
  removable?: boolean;
  /** App: issue → PUT → complete; return mediaId + optional preview URL */
  onUpload?: (
    file: File,
    item: UploadFileItemProp,
  ) => Promise<{ mediaId: string; previewUrl?: string }>;
  /** Injected by FormField (or set directly) — applied to the native `<input type="file">`. */
  id?: IdProp;
  /**
   * `variant="button"` only — the size of the visible trigger, forwarded to
   * Button. An icon size renders the trigger icon-only and moves the label to
   * `aria-label`, which is what a toolbar wants: a 32px square beside the other
   * icon buttons rather than a 147px labelled one that outweighs them.
   *
   * @see Button — same size scale
   */
  triggerSize?: "default" | "md" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: ClassNameProp;
  children?: React.ReactNode;
};

/** Tree node — shared by Cascader options & TreeSelect treeData. */
export type TreeOptionProp = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: TreeOptionProp[];
};

export type TreeFieldNamesProp = {
  label?: string;
  value?: string;
  children?: string;
};

/** @see Cascader — cascade picker (Popover + multi-column). */
export type CascaderProp = FieldA11yProps & {
  options: TreeOptionProp[];
  value?: ValueProp<string[] | string[][]>;
  defaultValue?: DefaultValueProp<string[] | string[][]>;
  onValueChange?: (
    value: string[] | string[][],
    selectedOptions?: TreeOptionProp[] | TreeOptionProp[][],
  ) => void;
  multiple?: boolean;
  changeOnSelect?: boolean;
  showSearch?: boolean;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  expandTrigger?: "click" | "hover";
  fieldNames?: TreeFieldNamesProp;
  allowClear?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
};

export type ShowCheckedStrategyProp = "SHOW_CHILD" | "SHOW_PARENT" | "SHOW_ALL";

/** @see TreeSelect — tree in Popover (cmdk search + expand/collapse). */
export type TreeSelectProp = FieldA11yProps & {
  treeData: TreeOptionProp[];
  value?: ValueProp<string | string[]>;
  defaultValue?: DefaultValueProp<string | string[]>;
  onValueChange?: OnValueChangeProp<string | string[] | undefined>;
  multiple?: boolean;
  treeCheckable?: boolean;
  treeCheckStrictly?: boolean;
  showSearch?: boolean;
  showCheckedStrategy?: ShowCheckedStrategyProp;
  treeDefaultExpandAll?: boolean;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  allowClear?: boolean;
  className?: ClassNameProp;
  id?: IdProp;
  fieldNames?: TreeFieldNamesProp;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
};

/** @see TransferItem */
export type TransferItemProp = {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

/** @see Transfer — dual-list shuttle (Checkbox + SearchInput). */
export type TransferProp = FieldA11yProps & {
  dataSource: TransferItemProp[];
  targetKeys: string[];
  onValueChange?: (targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => void;
  titles?: [React.ReactNode, React.ReactNode];
  showSearch?: boolean;
  oneWay?: boolean;
  disabled?: DisabledProp;
  /** Injected by FormField (or set directly) — applied to the `role="group"` shuttle container. */
  id?: IdProp;
  className?: ClassNameProp;
  selectedKeys?: [string[], string[]];
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
};

// ─── BranchScopePicker (gh#257 / DXS platform#311) ───────────────────────────────────────────────

/** @see BranchScopePicker — scope mode: every branch, or an explicit subset. */
export type BranchScopeModeProp = "all" | "selected";

/**
 * @see BranchScopePicker — the picker value. `mode: "all"` ignores `branchIds`; `mode: "selected"`
 * carries the checked branch ids.
 */
export type BranchScopeValueProp = {
  mode: BranchScopeModeProp;
  branchIds?: readonly string[];
};

/** @see BranchScopePicker — one selectable branch. Domain data is consumer-supplied. */
export type BranchScopeOptionProp = {
  /** Stable branch id. */
  id: string;
  /** Human branch name (also the search haystack, so a plain string). */
  name: string;
  /** Secondary line under the branch name (e.g. an address or code). */
  description?: string;
  /** Keep the branch visible but unselectable. */
  disabled?: boolean;
};

/** @see BranchScopePicker */
export type BranchScopePickerProp = FieldA11yProps & {
  /** The selectable branches. */
  branches: readonly BranchScopeOptionProp[];
  /** Controlled value. */
  value?: BranchScopeValueProp;
  /** Uncontrolled initial value. Default `{ mode: "all" }`. */
  defaultValue?: BranchScopeValueProp;
  /** Value change handler (fires for mode switches AND branch checks). */
  onValueChange?: (value: BranchScopeValueProp) => void;
  /** Disable the whole control. */
  disabled?: DisabledProp;
  /** Render the current value without any editable affordance (locked view). */
  readOnly?: boolean;
  /** Show a branch search input above the list once there is anything to search. Default `true`. */
  searchable?: boolean;
  /** Validation message under the control (wired via `aria-errormessage`/`aria-invalid`). */
  error?: ErrorProp;
  /** Show the loading skeleton instead of the list. Precedence: loading → denied → listError → empty. */
  loading?: boolean;
  /** Custom empty content when `branches` is empty; defaults to a localized message. */
  empty?: React.ReactNode;
  /** Branch-collection READ failure (distinct from `error`, which is field validation). */
  listError?: React.ReactNode;
  /** Permission-denied state — the branch read was refused. Takes precedence over `listError`. */
  denied?: React.ReactNode;
  /** Radio labels override (localized defaults otherwise). */
  allLabel?: React.ReactNode;
  selectedLabel?: React.ReactNode;
  name?: NameProp;
  id?: IdProp;
  className?: ClassNameProp;
};
