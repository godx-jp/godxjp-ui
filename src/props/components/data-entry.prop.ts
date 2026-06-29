/** Data Entry component prop types — @see docs/COMPONENTS.md#data-entry */
import type * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type * as SliderPrimitive from "@radix-ui/react-slider";
import type * as SwitchPrimitive from "@radix-ui/react-switch";
import type { DayPickerProps } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import type * as React from "react";
import type { UploadFileItem } from "../../components/data-entry/upload-types";
import type {
  ClassNameProp,
  DisabledProp,
  EmptyMessageProp,
  ErrorProp,
  HelperProp,
  IdProp,
  LabelProp,
  NameProp,
  OnChangeProp,
  OnValueChangeProp,
  OnSearchChangeProp,
  PlaceholderProp,
  RequiredProp,
  ValueProp,
  DefaultValueProp,
  FormLayoutProp,
  WidthProp,
  BreakpointProp,
  DensityProp,
  SizeProp,
} from "../vocabulary";
import type { ResponsiveGridColumnsProp } from "./layout.prop";

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
export type NumberInputProp = {
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
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
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
  className?: ClassNameProp;
};

/** @see FormField */
export type FormFieldProp = {
  /** Optional — auto-generated and injected into the child control when omitted. */
  id?: IdProp;
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
};

/** @see SearchInput */
export type SearchInputProp = {
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
export type CheckboxGroupProp = {
  value?: ValueProp<string[]>;
  defaultValue?: DefaultValueProp<string[]>;
  onValueChange?: OnValueChangeProp<string[]>;
  options?: ChoiceOptionProp[];
  orientation?: "horizontal" | "vertical";
  disabled?: DisabledProp;
  name?: NameProp;
  className?: ClassNameProp;
  children?: React.ReactNode;
};

/** @see Radio.Group */
export type RadioGroupProp = {
  value?: ValueProp;
  defaultValue?: DefaultValueProp;
  onValueChange?: OnValueChangeProp;
  options?: ChoiceOptionProp[];
  orientation?: "horizontal" | "vertical";
  disabled?: DisabledProp;
  name?: NameProp;
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
export type DatePickerProp = {
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
export type MonthPickerProp = {
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
export type MonthRangePickerProp = {
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
export type DateRangePickerProp = {
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
export type TimePickerProp = {
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
export type ColorPickerProp = {
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
  clearLabel?: string;
  /** Show a "clear" row when a value is selected (default true). */
  clearable?: boolean;
  disabled?: DisabledProp;
  /** Form field name — submits the selected value via a hidden input. */
  name?: NameProp;
  id?: IdProp;
  className?: ClassNameProp;
  "data-testid"?: string;
};

/**
 * Data-driven (Ant-style) form of {@link Select} — one component covering static `options` or
 * async `loadOptions`, with `showSearch` toggling the searchable combobox vs a plain listbox.
 * Passing `options`/`loadOptions` to `<Select>` switches it from the compound API to this one.
 */
export type SelectDataProp = SearchSelectProp & {
  /** Show the search box (combobox). Defaults to true when `loadOptions` is set, otherwise false. */
  showSearch?: boolean;
};

/** @see UploadFileItem */
export type UploadFileItemProp = UploadFileItem;

/** @see Upload */
export type UploadVariantProp =
  | "dropzone"
  | "button"
  | "picture-card"
  | "picture"
  | "avatar"
  | "avatar-crop";

/** @see Upload — presentational; wire `onUpload` to media-service in app api.ts */
export type UploadProp = {
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
export type CascaderProp = {
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
};

export type ShowCheckedStrategyProp = "SHOW_CHILD" | "SHOW_PARENT" | "SHOW_ALL";

/** @see TreeSelect — tree in Popover (cmdk search + expand/collapse). */
export type TreeSelectProp = {
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
};

/** @see TransferItem */
export type TransferItemProp = {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

/** @see Transfer — dual-list shuttle (Checkbox + SearchInput). */
export type TransferProp = {
  dataSource: TransferItemProp[];
  targetKeys: string[];
  onValueChange?: (targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => void;
  titles?: [React.ReactNode, React.ReactNode];
  showSearch?: boolean;
  oneWay?: boolean;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  selectedKeys?: [string[], string[]];
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
};
