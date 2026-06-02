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
} from "../vocabulary";

/** @see Input */
export type InputProp = React.InputHTMLAttributes<HTMLInputElement>;

/** @see Textarea */
export type TextareaProp = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** @see FormField */
export type FormFieldProp = {
  id: IdProp;
  label: LabelProp;
  required?: RequiredProp;
  helper?: HelperProp;
  error?: ErrorProp;
  /** Optional control rendered inline after the label (e.g. a help button). */
  labelAddon?: React.ReactNode;
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
  onDebouncedChange?: OnSearchChangeProp;
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
  size?: "sm" | "default";
};

/** @see Field — inline control + label + description wrapper. */
export type FieldProp = {
  id: IdProp;
  label: LabelProp;
  description?: React.ReactNode;
  className?: ClassNameProp;
  children: React.ReactNode;
};

/** @see ChoiceField — deprecated alias for Field. */
export type ChoiceFieldProp = FieldProp;

/** Country row accepted by CountrySelect / CountryOptionLabel.
 *  Accepts either a select-option (`value`) or a summary (`code`). */
export type CountryOptionProp = {
  name: string;
  nativeName?: string | null;
  flagSvgPath?: string | null;
  value?: string;
  code?: string;
  label?: string;
};

/** @see CountryOptionLabel — flag + name (+ optional code) row. */
export type CountryOptionLabelProp = {
  country: CountryOptionProp;
  showCode?: boolean;
  className?: ClassNameProp;
};

/** @see CountrySelect — country picker built on Select. */
export type CountrySelectProp = {
  id: IdProp;
  name: NameProp;
  options: CountryOptionProp[];
  defaultValue?: string | null;
  required?: RequiredProp;
  allowEmpty?: boolean;
  emptyLabel?: string;
  placeholder?: PlaceholderProp;
  invalid?: boolean;
};

/** @see Slider — numeric range (Radix Slider). */
export type SliderProp = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

/** @see Calendar — react-day-picker DayPicker. */
export type CalendarProp = DayPickerProps;

/** @see DatePicker */
export type DatePickerProp = {
  value?: Date;
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
};

/** @see DateRangePicker */
export type DateRangePickerProp = {
  value?: DateRange;
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

/** Autocomplete option row. */
export type AutocompleteOptionProp = {
  value: string;
  label: string;
};

/**
 * @see Autocomplete — searchable combobox over a static list.
 * @deprecated Use `SearchSelect` with a static `options` array — it is a superset (grouping,
 *   sublabels, async, custom render). `Autocomplete` is kept as a thin compatibility wrapper.
 */
export type AutocompleteProp = {
  options: AutocompleteOptionProp[];
  value?: ValueProp;
  onValueChange?: OnValueChangeProp;
  placeholder?: PlaceholderProp;
  searchPlaceholder?: PlaceholderProp;
  emptyMessage?: EmptyMessageProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
};

/** A SearchSelect option row. `group` buckets it under an optgroup-style heading. */
export type SearchSelectOptionProp = {
  value: string;
  label: string;
  sublabel?: string;
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
 * @see SearchSelect — searchable, optionally grouped single-select combobox (static or async).
 * @deprecated Prefer `<Select options|loadOptions showSearch …/>` — `Select` is now the single
 *   data-driven entry point and uses this engine internally. `SearchSelect` stays exported.
 */
export type SearchSelectProp = {
  value?: ValueProp;
  onValueChange?: (value: string, option?: SearchSelectOptionProp) => void;
  /** Static option list (client-side filtered). Provide this OR `loadOptions`, not both. */
  options?: SearchSelectOptionProp[];
  /** Remote fetcher — debounced search + infinite-scroll pagination call into this. Provide this
   *  OR `options`. */
  loadOptions?: (params: SearchSelectLoadParamsProp) => Promise<SearchSelectLoadResultProp>;
  /** Custom per-option renderer (Ant-Design style). Defaults to label + optional sublabel. */
  renderOption?: (option: SearchSelectOptionProp) => React.ReactNode;
  /** Label for the current value when its option isn't in the loaded page (avoids a flash of id). */
  selectedLabel?: string;
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
