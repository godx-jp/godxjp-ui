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
  ErrorProp,
  HelperProp,
  IdProp,
  LabelProp,
  OnChangeProp,
  OnSearchChangeProp,
  PlaceholderProp,
  RequiredProp,
  ValueProp,
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
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  options?: ChoiceOptionProp[];
  orientation?: "horizontal" | "vertical";
  disabled?: DisabledProp;
  name?: string;
  className?: ClassNameProp;
  children?: React.ReactNode;
};

/** @see Radio.Group */
export type RadioGroupProp = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options?: ChoiceOptionProp[];
  orientation?: "horizontal" | "vertical";
  disabled?: DisabledProp;
  name?: string;
  className?: ClassNameProp;
  children?: React.ReactNode;
};

/** @see Radio.Item — Radix radio group item. */
export type RadioProp = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>;

/** @see Switch — extends Radix switch root props. */
export type SwitchProp = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
};

/** @see SwitchField — labelled switch with hidden input for HTML forms. */
export type SwitchFieldProp = {
  id: IdProp;
  label: LabelProp;
  name: string;
  required?: RequiredProp;
  helper?: HelperProp;
  error?: ErrorProp;
  labelAddon?: React.ReactNode;
  className?: ClassNameProp;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: DisabledProp;
  size?: SwitchProp["size"];
};

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
  name: string;
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
  onChange?: (date: Date | undefined) => void;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the value as an ISO-8601 `yyyy-MM-dd` string for native submission. */
  name?: string;
  locale?: DayPickerProps["locale"];
  fromDate?: Date;
  toDate?: Date;
};

/** @see DateRangePicker */
export type DateRangePickerProp = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the range as `${name}_from` / `${name}_to` ISO `yyyy-MM-dd` fields. */
  name?: string;
  locale?: DayPickerProps["locale"];
  fromDate?: Date;
  toDate?: Date;
};

/** @see TimePicker — popover HH:mm picker (canonical 24h storage). */
export type TimePickerProp = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: PlaceholderProp;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
  /** Form field name — emits the value as a canonical 24h `HH:mm` string for native submission. */
  name?: string;
  /** Minute column step — default 5 (logistics cut-offs). */
  minuteStep?: number;
};

/** @see ColorPicker */
export type ColorPickerProp = {
  value?: string;
  onChange?: (hex: string) => void;
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

/** @see Autocomplete — searchable combobox. */
export type AutocompleteProp = {
  options: AutocompleteOptionProp[];
  value?: ValueProp;
  onValueChange?: (value: string) => void;
  placeholder?: PlaceholderProp;
  searchPlaceholder?: PlaceholderProp;
  emptyMessage?: string;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  id?: IdProp;
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
  value?: UploadFileItemProp[];
  defaultValue?: UploadFileItemProp[];
  onChange?: (items: UploadFileItemProp[]) => void;
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
  value?: string[] | string[][];
  defaultValue?: string[] | string[][];
  onChange?: (
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
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
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
  onChange?: (targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => void;
  titles?: [React.ReactNode, React.ReactNode];
  showSearch?: boolean;
  oneWay?: boolean;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  selectedKeys?: [string[], string[]];
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
};
