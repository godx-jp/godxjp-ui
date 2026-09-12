/** Data Entry component prop types — @see docs/COMPONENTS.md#data-entry */
import type { RenderProps as InputOTPRenderProps } from "input-otp";
import type { DayPickerProps } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import type * as React from "react";
import type { UploadFileItem } from "../../components/data-entry/upload-types";
import type { FieldA11yProps } from "../../lib/field-a11y";
import type {
  ClassNameProp,
  ControlWidthProp,
  DisabledProp,
  EmptyMessageProp,
  ErrorBagProp,
  ErrorProp,
  HelperProp,
  IdProp,
  LabelProp,
  NameProp,
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
  DefaultOpenProp,
  ControlStatusProp,
  ControlVariantProp,
  AllowClearProp,
  MaxTagCountProp,
  MaxTagPlaceholderProp,
  NotFoundContentProp,
  PopupMatchWidthProp,
  PendingProp,
  PadProp,
  PadRawProp,
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

/**
 * antd `Input.OTP mask`. `true` paints every filled slot as `•`; a STRING uses that character
 * instead. Only the PAINT changes — the real code stays in the field's value, so submission,
 * `onChange` and the accessible value are untouched (a mask that ate the value would be a bug,
 * not a privacy feature).
 */
export type InputOTPMaskProp = boolean | string;

/**
 * @see InputOTP — the one-time-code field. A passthrough of `input-otp`'s `OTPInput` (the hidden
 * real `<input>` that owns paste, caret and arrow-key behaviour) plus this library's control-surface
 * axes, so a code field lines up with the `Input`/`Select` beside it in a form row.
 *
 * The value is ALWAYS driven from here (`value` controlled, or `defaultValue` + internal state), so
 * `formatter` and `readOnly` hold for typing AND for paste — `input-otp` writes its own internal
 * state on paste, which a wrapper that only intercepted `onChange` could not undo.
 *
 * `style` is OMITTED because it cannot be honoured: `input-otp` owns both elements it could land
 * on and writes their geometry itself — the field's own style object replaces anything passed in
 * (measured: `style={{ color: "red" }}` left the input at the library's `color: transparent`) and
 * the container's is hard-coded too. A type that accepts a prop the render can never deliver is
 * the defect gh#477 reported for `id`; `id` is real and forwarded, this one was not. The paint of
 * the field is reached through `className` / `containerClassName` and the `--otp-*` tokens.
 */
export type InputOTPProp = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "children" | "style"
> & {
  /** Number of slots — antd `length`. Required by `input-otp`. */
  maxLength: number;
  value?: string;
  /** Uncontrolled seed — the field then owns its own value. */
  defaultValue?: string;
  /** Controlled-vocabulary change handler; receives the bare code, never an event. */
  onValueChange?: (value: string) => void;
  /** `input-otp`'s own name for the same callback — kept for the existing call sites. */
  onChange?: (value: string) => void;
  /** Fires once the last slot is filled (auto-submit). */
  onComplete?: (value: string) => void;
  /**
   * antd `Input.OTP formatter` — normalise every code the field accepts (upper-case, strip spaces).
   * Runs AFTER `pattern`, which `input-otp` matches against the raw keystroke: a pattern must
   * therefore accept what the user actually types, not only what the formatter produces.
   */
  formatter?: (value: string) => string;
  /** antd `Input.OTP mask` — paint only; the real code stays in the value. */
  mask?: InputOTPMaskProp;
  /** Main-axis alignment of the whole code row. */
  align?: InputOTPAlignProp;
  /** Control height tier — the shared `--control-height` ladder, as on every other field. */
  size?: SizeProp;
  /** Validation state the field paints — antd `status`. `error` also reports `aria-invalid`. */
  status?: ControlStatusProp;
  /** Chrome level — antd `variant`. Default `outlined`. */
  variant?: ControlVariantProp;
  /** Regex source (or literal) every accepted value must match — `input-otp`'s `pattern`. */
  pattern?: string;
  /** Rewrite pasted text before it reaches the field — `input-otp`'s `pasteTransformer`. */
  pasteTransformer?: (pasted: string) => string;
  /** Class on the row container that `input-otp` renders (the slots' flex parent). */
  containerClassName?: ClassNameProp;
  /** Password-manager badge avoidance strategy — `input-otp`'s own escape hatch. */
  pushPasswordManagerStrategy?: "increase-width" | "none";
  /** No-JS fallback stylesheet emitted by `input-otp`; `null` disables it. */
  noScriptCSSFallback?: string | null;
  /** CSP nonce for the stylesheet `input-otp` injects. */
  nonce?: string;
  /** The slot tree (`InputOTPGroup` > `InputOTPSlot`) — the normal API. */
  children?: React.ReactNode;
  /** `input-otp`'s headless escape hatch: render the whole row yourself from the slot state. */
  render?: (props: InputOTPRenderProps) => React.ReactNode;
};

/**
 * Character-counter configuration shared by `Input` and `Textarea` — Ant Design's `count`
 * (`@rc-component/input`'s `CountConfig`).
 *
 * antd's `exceedFormatter` is deliberately absent: it rewrites the field's text while the user is
 * still typing, which in Japanese truncates a live IME conversion. The counter here REPORTS an
 * overrun (`data-exceeded` on the counter element) and never edits the value.
 */
export type ControlCountProp = {
  /** Ceiling reported by the counter. Displayed, never enforced — see the note above. */
  max?: number;
  /** Render the counter. Default `true` whenever `count` is given at all. */
  show?: boolean;
  /** Replaces the whole counter text. */
  formatter?: (info: { value: string; count: number; max?: number }) => React.ReactNode;
  /**
   * How a character is counted. The default counts CODE POINTS, not UTF-16 units, so one emoji
   * and one 全角 kanji each count as one. Pass `(v) => v.length` for native `maxLength` semantics.
   */
  strategy?: (value: string) => number;
};

/** @see Input */
export type InputProp = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> & {
  onValueChange?: (value: string) => void;
  /** Control height tier: `md` (default), `sm` or `lg` — the same tiers as SelectTrigger. */
  size?: "sm" | "md" | "lg";
  /** Validation state the field paints — antd `status`. `error` also reports `aria-invalid`. */
  status?: ControlStatusProp;
  /** Chrome level — antd `variant`. Default `outlined`. */
  variant?: ControlVariantProp;
  /**
   * antd `allowClear` — show an inline ✕ that clears the field while it holds text (default
   * false). The OBJECT form additionally replaces the icon and/or the accessible label.
   */
  allowClear?: AllowClearProp;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
  /** A leading affordance pinned inside the start of the field (e.g. a mail/lock icon). */
  leadingIcon?: React.ReactNode;
  /** A trailing affordance pinned inside the end of the field (replaced by the clear ✕ when `allowClear` + value). */
  trailingIcon?: React.ReactNode;
  /** antd `prefix` — content pinned INSIDE the start of the field (¥, a unit, a small glyph). */
  prefix?: React.ReactNode;
  /** antd `suffix` — content pinned INSIDE the end of the field (%, 円, a hint glyph). */
  suffix?: React.ReactNode;
  /** antd `addonBefore` — a segment welded OUTSIDE the start of the box (`https://`, a currency). */
  addonBefore?: React.ReactNode;
  /** antd `addonAfter` — a segment welded OUTSIDE the end of the box (`.com`, a unit, a button). */
  addonAfter?: React.ReactNode;
  /** Character counter — antd `count`. */
  count?: ControlCountProp;
};

/** @see Textarea */
export type TextareaProp = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  onValueChange?: (value: string) => void;
  pad?: PadProp;
  padRaw?: PadRawProp;
  /**
   * antd `allowClear` — an inline ✕ (top-end) that clears the field while it holds text (default
   * false). The OBJECT form additionally replaces the icon and/or the accessible label.
   */
  allowClear?: AllowClearProp;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
  /**
   * Chrome level. `outlined` (default) / `filled` / `borderless` are antd's `variant`; `default`
   * and `ghost` are this library's older spellings of the first and the last, still accepted.
   */
  variant?: ControlVariantProp | "default" | "ghost";
  /** Validation state the field paints — antd `status`. `error` also reports `aria-invalid`. */
  status?: ControlStatusProp;
  /** Control height tier: `md` (default), `sm` or `lg`. */
  size?: "sm" | "md" | "lg";
  autoGrow?: boolean;
  /**
   * antd `autoSize`. `true` is `autoGrow`; an object also carries the row bounds, so
   * `autoSize={{ minRows: 2, maxRows: 6 }}` is `autoGrow minRows={2} maxRows={6}`.
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Floor in text rows while `autoGrow`; never undercuts the `--control-height` tier. */
  minRows?: number;
  /** Ceiling in text rows while `autoGrow` — past it the control scrolls internally. `0` = unbounded. */
  maxRows?: number;
  /** Character counter — antd `count`. */
  count?: ControlCountProp;
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
  /**
   * antd `formatter` — how the committed number is DISPLAYED at rest (thousands separators, a
   * unit). Replaces the built-in `Intl.NumberFormat`; pair it with `parser`, or the text it
   * produces cannot be read back.
   */
  formatter?: (value: number | null) => string;
  /** antd `parser` — turns the displayed text back into a number. The inverse of `formatter`. */
  parser?: (display: string) => number | null;
  /** antd `keyboard` — ArrowUp/ArrowDown step the value. Default `true`. */
  keyboard?: boolean;
  /** antd `changeOnWheel` — a mouse wheel over the FOCUSED field steps the value. Default `false`. */
  changeOnWheel?: boolean;
  /** antd `controls` — show the increment/decrement steppers. Default `true`. */
  controls?: boolean;
  /** Validation state the field paints — antd `status`. `error` also reports `aria-invalid`. */
  status?: ControlStatusProp;
  /** Chrome level — antd `variant`. Default `outlined`. */
  variant?: ControlVariantProp;
  disabled?: DisabledProp;
  /** Read-only: value is shown and selectable but neither typeable nor steppable. */
  readOnly?: boolean;
  size?: SizeProp;
  placeholder?: PlaceholderProp;
  /** Leading affix inside the field (e.g. `¥`). */
  prefix?: React.ReactNode;
  /** Trailing affix inside the field (e.g. `%`). */
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
  disabled?: boolean;
  requiredMark?: boolean | "optional";
  layout?: FormLayoutProp;
  labelWidth?: WidthProp;
  controlWidth?: WidthProp;
  labelAlign?: "start" | "end";
  collapseBelow?: BreakpointProp | false;
  columns?: ResponsiveGridColumnsProp;
  density?: DensityProp;
  /** Server validation error bag (e.g. Inertia's `form.errors`). */
  errors?: ErrorBagProp;
  /**
   * Render the caller's own element instead of a `<form>`, keeping only the layout context. For
   * routing libraries that own the form element (Inertia, TanStack Form) — two `<form>` elements
   * cannot nest.
   */
  asChild?: boolean;
  className?: ClassNameProp;
};

/**
 * @see FormField — exactly one of `children` (an interactive control) or `staticText`:
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
       * resolves its message from `errors[name]` automatically (an explicit `error` prop wins) and
       * CLAIMS the key so `<FormErrors />` does not repeat it.
       */
      name?: NameProp;
      /**
       * Rendered on the control as `data-field`, and as a native `name` when the app opted in via
       * `<AppProvider emitFieldNames>`. Defaults to `name`, then `id` — which is why an app whose
       * fields already carry a column-named `id` gets the attribute on every control without
       * editing a single screen.
       */
      field?: NameProp;
      label: LabelProp;
      required?: RequiredProp;
      helper?: HelperProp;
      /**
       * Which side of the control the helper line sits on — `after` (default, under the input) or
       * `before` (between the label and the input).
       *
       * `before` is for a helper the reader needs BEFORE they answer rather than after: the
       * secondary language of a bilingual form, a unit or format note, a pick-one-of-these
       * preamble. `labelAddon` cannot carry that — it is an inline row beside the label with no
       * wrap, sized for a chip or a help button, so a full sentence squeezes the label instead of
       * taking its own line. Putting the second line inside `label` does work, but costs the
       * string-label fallbacks (`aria-label`, `FieldNameContext`), which fire only when `label` is
       * a plain string.
       *
       * Paint only: the helper keeps its id and stays on the control's `aria-describedby`, so this
       * never changes what a screen reader reads or the order it reads it in.
       */
      helperPlacement?: "before" | "after";
      error?: ErrorProp;
      validateStatus?: "success" | "warning" | "error" | "validating";
      hasFeedback?: boolean;
      feedback?: React.ReactNode;
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
      /** Stable machine key — see the `children` variant above. Unused on a read-only row. */
      field?: NameProp;
      label: LabelProp;
      required?: RequiredProp;
      helper?: HelperProp;
      /**
       * Which side of the control the helper line sits on — `after` (default, under the input) or
       * `before` (between the label and the input).
       *
       * `before` is for a helper the reader needs BEFORE they answer rather than after: the
       * secondary language of a bilingual form, a unit or format note, a pick-one-of-these
       * preamble. `labelAddon` cannot carry that — it is an inline row beside the label with no
       * wrap, sized for a chip or a help button, so a full sentence squeezes the label instead of
       * taking its own line. Putting the second line inside `label` does work, but costs the
       * string-label fallbacks (`aria-label`, `FieldNameContext`), which fire only when `label` is
       * a plain string.
       *
       * Paint only: the helper keeps its id and stays on the control's `aria-describedby`, so this
       * never changes what a screen reader reads or the order it reads it in.
       */
      helperPlacement?: "before" | "after";
      error?: ErrorProp;
      validateStatus?: "success" | "warning" | "error" | "validating";
      hasFeedback?: boolean;
      feedback?: React.ReactNode;
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
  ariaLabel?: string;
  placeholder?: PlaceholderProp;
  value?: string;
  defaultValue?: string;
  onValueChange?: (query: string) => void;
  /** Emits changed, debounced queries; does not run for the initial value. */
  onSearch?: (query: string) => void;
  debounce?: number;
  disabled?: DisabledProp;
  className?: ClassNameProp;
  inputClassName?: ClassNameProp;
  /** Validation state the field paints — antd `status`. `error` also reports `aria-invalid`. */
  status?: ControlStatusProp;
  /** Chrome level — antd `variant`. Default `outlined`. */
  variant?: ControlVariantProp;
};

/**
 * @see Checkbox
 *
 * Public shape unchanged from the @radix-ui/react-checkbox era — `checked` / `defaultChecked` take
 * the tri-state `"indeterminate"`, `onCheckedChange` reports it back, and `disabled` / `required`
 * keep their HTML spelling. checkbox.tsx translates all of it to react-aria's `isSelected` /
 * `isIndeterminate` / `onChange` / `isDisabled`; none of those names reach a consumer. Written out
 * here rather than derived from a primitive that the component no longer uses.
 */
export type CheckboxProp = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "checked" | "defaultChecked" | "onChange"
> & {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  required?: boolean;
  /**
   * antd `indeterminate` — paint the PARTIAL mark (a dash) without changing `checked`. Radix
   * spells the same state as `checked="indeterminate"`; this is the antd spelling of it, and the
   * two compose: `indeterminate` wins while it is true, and the box falls back to `checked` after.
   */
  indeterminate?: boolean;
};

/** Shared option row — the conventional `CheckboxOptionType` shape. */
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
  /**
   * antd `optionType` — how each choice is DRAWN. `default` is a radio dot beside its label;
   * `button` welds the choices into one segmented bar of radio buttons. The role stays
   * `radiogroup`/`radio` either way: this is paint, never semantics.
   */
  optionType?: RadioOptionTypeProp;
  /** antd `buttonStyle` — fill of the selected choice while `optionType="button"`. */
  buttonStyle?: RadioButtonStyleProp;
};

/** antd `RadioGroupOptionType` — a radio group drawn as dots or as a welded button bar. */
export type RadioOptionTypeProp = "default" | "button";

/** antd `RadioGroupButtonStyle` — the selected button is outlined, or filled with the brand. */
export type RadioButtonStyleProp = "outline" | "solid";

/**
 * @see Radio.Item
 *
 * Public shape unchanged from the @radix-ui/react-radio-group era — `value` / `disabled` keep
 * their HTML spelling; react-aria's `isDisabled` never reaches a consumer.
 */
export type RadioProp = Omit<React.ComponentPropsWithoutRef<"button">, "value"> & {
  value: string;
};

/**
 * @see Switch
 *
 * The PUBLIC shape is unchanged from the @radix-ui/react-switch era — `checked` /
 * `defaultChecked` / `onCheckedChange` / `disabled` / `required` keep their HTML spelling.
 * react-aria-components spells the same five `isSelected` / `defaultSelected` / `onChange` /
 * `isDisabled`, and that translation happens inside `switch.tsx`; none of those names reach a
 * consumer. Written out here rather than derived from a primitive so the surface stops moving
 * whenever the base does.
 */
export type SwitchProp = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "checked" | "defaultChecked" | "onChange" | "value"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  size?: "sm" | "md";
  /**
   * antd `loading` — the toggle is mid-flight: a spinner replaces the thumb glyph and the control
   * stops accepting input (`aria-disabled`, not `disabled`, so it keeps its tab stop and its
   * accessible name while a screen reader hears `aria-busy`).
   */
  loading?: boolean;
  /** antd `checkedChildren` — content shown INSIDE the track while on (`ON`, `有効`, a glyph). */
  checkedChildren?: React.ReactNode;
  /** antd `unCheckedChildren` — content shown inside the track while off. */
  unCheckedChildren?: React.ReactNode;
};

/** @see Field — inline control + label + description wrapper. */
export type FieldProp = {
  id: IdProp;
  label: LabelProp;
  description?: React.ReactNode;
  className?: ClassNameProp;
  children: React.ReactNode;
};

/**
 * One tick on a slider rail — antd's two spellings: the label itself, or `{ label, style }` where
 * the object also carries a per-mark inline style. `null` renders the tick with no label.
 */
export type SliderMarkProp =
  | React.ReactNode
  | {
      label?: React.ReactNode;
      /** antd's per-mark style. Prefer styling the `label` node — it is already a ReactNode. */
      style?: React.CSSProperties;
    };

/**
 * Tick marks on a slider rail — antd `SliderMarks`. Keyed by the value the mark sits on. With
 * `step={null}` the marks (plus `min` and `max`) are the ONLY values the slider can take.
 */
export type SliderMarksProp = Record<number, SliderMarkProp>;

/**
 * antd `tooltip` — the value bubble over a thumb. `false` switches it off, `true` uses the raw
 * value, and the object form formats and places it.
 */
export type SliderTooltipProp =
  | boolean
  | {
      /**
       * `true` keeps the bubble visible; `false` keeps it hidden even while dragging or hovering —
       * both exactly as antd. Unset, it follows hover, keyboard focus and drag.
       */
      open?: boolean;
      /**
       * Which side of the thumb. `left` / `right` are the INLINE sides and mirror under RTL like
       * the rest of the slider. Defaults to `top`, or `right` on a vertical slider (antd's default).
       */
      placement?: "top" | "bottom" | "left" | "right";
      /** Flip to the opposite side when the bubble would leave the viewport. Default `true`. */
      autoAdjustOverflow?: boolean;
      /**
       * Render the bubble's content. `null` switches the bubble off, exactly as antd's does. A
       * string or number result is ALSO the thumb's `aria-valuetext`, so a `¥50,000` slider is
       * announced as ¥50,000 and not as a bare 50000.
       */
      formatter?: ((value: number) => React.ReactNode) | null;
    };

/**
 * antd's range object — `range={{ editable, minCount, maxCount, draggableTrack }}`. Any object is
 * a range, exactly like `range={true}`.
 */
export type SliderRangeConfigProp = {
  /**
   * Thumbs can be added and removed: a press on the rail ADDS one there, and Delete / Backspace on
   * a focused thumb removes it. Ignored while any thumb is disabled, and wins over `draggableTrack`
   * — both exactly as antd.
   */
  editable?: boolean;
  /** Fewest thumbs `editable` may leave. Default 0. */
  minCount?: number;
  /** Most thumbs `editable` may create. Default unlimited. */
  maxCount?: number;
  /** Drag the painted span to move every thumb at once, keeping their distance. */
  draggableTrack?: boolean;
};

/**
 * @see Slider — numeric slider on react-aria-components, antd 6 `Slider` API.
 *
 * Written out rather than derived from the primitive, so what is public is exactly what is listed
 * here: the Radix-era spelling (`number[]` values, `onValueChange`, `onValueCommit`, `inverted`,
 * `dir`, `minStepsBetweenThumbs`) keeps compiling beside antd's (`number` values, `onChange`,
 * `onChangeComplete`, `reverse`, `vertical`, `range` objects, `step={null}`).
 *
 * The union is on `range`, as in antd: without it `onChange` reports a `number`, with a literal
 * `range` (or a range object) it reports `number[]`. A `range` held in a boolean variable cannot
 * say which, so that spelling takes `onValueChange` — which always reports every thumb.
 */
export type SliderProp = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "dir" | "children"
> & {
  /** The low end of the scale. Default 0. */
  min?: number;
  /** The high end of the scale. Default 100. */
  max?: number;
  /**
   * Granularity. `null` is antd's marks-only mode: the thumbs can only rest on a mark, `min` or
   * `max`. Default 1.
   */
  step?: number | null;
  /**
   * Disable the whole slider, or — antd's array form — one thumb each: `[true, false]` locks the
   * first thumb of a range. A disabled thumb leaves the tab order and does not submit.
   */
  disabled?: boolean | boolean[];
  /** Layout axis. Default `horizontal`. Wins over `vertical`, as in antd 6. */
  orientation?: "horizontal" | "vertical";
  /** antd's boolean spelling of `orientation="vertical"`. */
  vertical?: boolean;
  /**
   * Reading direction of a horizontal slider — which end is `min` and which arrow increases.
   * Defaults to the locale's direction (the `I18nProvider` that `AppProvider` sets).
   */
  dir?: "ltr" | "rtl";
  /** antd `reverse` — run the scale the other way (`min` at the inline end, or at the top). */
  reverse?: boolean;
  /** The Radix-era name for `reverse`. When both are given, `inverted` wins. */
  inverted?: boolean;
  /** Radix-era: the fewest steps two neighbouring thumbs may be apart. Default 0. */
  minStepsBetweenThumbs?: number;
  /** Every change, with EVERY thumb — the Radix-era callback, valid in every spelling. */
  onValueChange?: (value: number[]) => void;
  /** Once per finished gesture (pointer release, key press), with every thumb. */
  onValueCommit?: (value: number[]) => void;
  /**
   * Native form field name. One thumb submits `name`; several submit `name[]`, once each.
   */
  name?: string;
  /** Associate the thumbs' inputs with a form elsewhere in the document, by id. */
  form?: string;
  /** antd `marks` — labelled ticks along the rail. */
  marks?: SliderMarksProp;
  /** antd `dots` — a tick at every `step` (at every mark when `step={null}`). */
  dots?: boolean;
  /**
   * antd `included` — whether the painted span runs from the start to the thumb (`true`, the
   * default) or nothing is painted at all (`false`, for a rail that only holds marks).
   */
  included?: boolean;
  /** antd `tooltip` — the value bubble over a thumb. Off by default. */
  tooltip?: SliderTooltipProp;
} & (
    | {
        /**
         * One thumb. An array `value` with no `range` still draws a thumb per entry — the
         * Radix-era inference — but `onChange` then reports only the first; use `onValueChange`
         * for all of them, or declare `range`.
         */
        range?: false;
        /** Controlled value — a number, or the Radix-era `number[]`. */
        value?: number | number[];
        /** Uncontrolled initial value. With nothing given the thumb starts at `min`. */
        defaultValue?: number | number[];
        /** antd `onChange` — every change, as a number. */
        onChange?: (value: number) => void;
        /** antd `onChangeComplete` — pointer release / key press, as a number. */
        onChangeComplete?: (value: number) => void;
      }
    | {
        /**
         * antd `range` — two or more thumbs bounding spans. A DECLARATION: a range whose value is
         * still loading does not render as a point, and without a value it spans `[min, max]`.
         */
        range: true | SliderRangeConfigProp;
        value?: number[];
        defaultValue?: number[];
        onChange?: (value: number[]) => void;
        onChangeComplete?: (value: number[]) => void;
      }
    | {
        /** A `range` known only at run time (a boolean variable) — report through `onValueChange`. */
        range: boolean;
        value?: number | number[];
        defaultValue?: number | number[];
        onChange?: never;
        onChangeComplete?: never;
      }
  );

/** @see Calendar — react-day-picker DayPicker plus an opt-in footer. */
/**
 * Decorate one day cell — antd's `cellRender`, in the shape the Japanese market actually needs it:
 * marking 祝日, a company holiday, a day already booked, a deadline.
 *
 * It WRAPS rather than replaces. `originNode` is the library's own day button, with its selection
 * state, its `aria-selected`, its disabled handling and its place in the roving-tabindex grid
 * already wired; returning something that does not contain it throws all of that away. The
 * ordinary use is `<>{originNode}<span className="…" /></>` — decorate, do not rebuild.
 */
export type CalendarCellRenderProp = (
  date: Date,
  info: { originNode: React.ReactNode },
) => React.ReactNode;

export type CalendarProp = DayPickerProps &
  CalendarFooterProp & {
    /** Replaces the built-in footer actions. */
    footer?: React.ReactNode;
    /**
     * How the grid claims horizontal space. Default `auto` shrink-wraps to seven fixed day
     * columns — the shape a picker popover needs, because the panel is shrink-to-fit and takes
     * ITS width from the calendar inside it.
     *
     * `full` is for an EMBEDDED calendar — a shift board, a booking month — where the calendar is
     * the content of a card rather than a dropdown. It stacks the months, lets each one grow, and
     * lets the day cells share the row.
     *
     * Opt-in on purpose, and the default is load-bearing: making the calendar fluid globally was
     * measured to collapse the DatePicker popover from 250px to 157.8px with 18.8px day cells.
     * `Calendar` and `DatePicker` want opposite answers here, which is why the enterprise
     * libraries split them too
     * (`Calendar fullscreen` is 100% of its container; the DatePicker dropdown is a fixed 288px).
     */
    width?: Extract<ControlWidthProp, "auto" | "full">;
    /**
     * Rule the grid: one border per day cell, weekday header included.
     *
     * NOT a box around the calendar — that is what `Card` is for, and nesting one inside a section
     * card was measured on a real page as two rounded edges 16px apart with both paddings stacked.
     * What a month grid needs is the ruling BETWEEN days, so a week reads as a row of cells the
     * eye can track across.
     *
     * Default `false`, because a picker popover wants the opposite: floating day buttons with no
     * ruling, so the selected day is the only shape in the panel.
     */
    bordered?: boolean;
    /** Decorate a day cell — 祝日, a booked day, a deadline. @see CalendarCellRenderProp */
    cellRender?: CalendarCellRenderProp;
  };

/** Footer actions shared by Calendar and the pickers that embed it. Both default to off. */
export type CalendarFooterProp = {
  /**
   * Show a Today action: jumps to the current month and selects today (single), fills the open
   * end of the range (range) or adds today (multiple). Disabled when today is outside
   * `startMonth` / `endMonth` or matches `disabled`.
   */
  showToday?: boolean;
  /** Show a Close action that calls `onClose`. */
  showClose?: boolean;
  onClose?: () => void;
};

/** Shared picker chrome. Placement uses logical start/end so RTL follows the locale. */
export type PickerChromeProp = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  status?: ControlStatusProp;
  variant?: ControlVariantProp;
  size?: Extract<SizeProp, "sm" | "md" | "lg">;
  inputReadOnly?: boolean;
  preserveInvalidOnBlur?: boolean;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  renderExtraFooter?: () => React.ReactNode;
  ref?: React.Ref<HTMLInputElement>;
};

/** date-fns pattern, Intl options (including Japanese era), or a display function. */
export type PickerDateFormatProp = string | Intl.DateTimeFormatOptions | ((date: Date) => string);

/**
 * @see DatePicker — ONE date control for every date-shaped question this library used to ask with
 * four components (`DatePicker`, `DateRangePicker`, `MonthPicker`, `MonthRangePicker`).
 *
 * Two axes, both antd's: `picker` chooses the GRANULARITY of a selection, `range` chooses its
 * CARDINALITY. Everything else — bounds, disabling, formatting, clearing, the open triad, the
 * chrome ladder — is written once and therefore behaves the same on all eight combinations.
 *
 * ON THE NAME `picker`. It is antd's own prop name for this axis, and it already shipped here with
 * exactly this union, so keeping it renames nothing and breaks no call site. (`granularity` is
 * react-aria's spelling; this cluster is not on react-aria.) The house rule stated on `TreeProp` —
 * map Ant's KEY-SHAPED names onto this package's controlled vocabulary and do not re-spell the
 * rest — is what the surrounding props already do: `showTime`, `needConfirm`, `allowClear`,
 * `cellRender`, `disabledDate`, `inputReadOnly`, `preserveInvalidOnBlur`, `renderExtraFooter`,
 * `presets`, `order`, `minDate`/`maxDate` are all spelled antd's way, while selection is spelled
 * `value`/`defaultValue`/`onValueChange` rather than antd's `onChange`.
 */
export type DatePickerBaseProp = FieldA11yProps &
  PickerChromeProp & {
    /**
     * The accessible NAME of the button that opens the calendar, for a screen where more than one
     * date field exists. Default 「カレンダーを開く」 / "Open calendar" — correct for one picker on a
     * page, and useless for three: a reader hears the same sentence three times with nothing to
     * say which field each button belongs to (WCAG 2.2 SC 2.4.6, gh#551).
     *
     * Same axis, same shape, same reason as Select's `clearLabel`: name the control after the
     * FIELD it serves — `開始日のカレンダーを開く`. The default is unchanged, so nothing moves until
     * a caller says something.
     */
    triggerLabel?: string;
    /** Display format; native submission remains ISO. */
    format?: PickerDateFormatProp;
    /** Parser for a custom display function or Intl era display; ISO always remains accepted. */
    parseFormat?: (text: string) => Date | undefined;
    /**
     * Selectable bounds, inclusive, at day precision (antd `minDate`/`maxDate`).
     *
     * These are the ONLY bounds props. `MonthPicker`/`MonthRangePicker` used to take
     * `fromYear`/`toYear` numbers instead, which expressed strictly less (a whole year is the
     * smallest thing they could say) and — measurably — clamped nothing: they only greyed the
     * grid's year chevrons, while both routes into the value, the grid cells and the typed text,
     * ignored them. `minDate`/`maxDate` are enforced on BOTH routes for every `picker`, so the
     * keyboard is not a way around the rule the mouse obeys. Migration is mechanical:
     * `fromYear={2024}` → `minDate={new Date(2024, 0, 1)}`, `toYear={2027}` →
     * `maxDate={new Date(2027, 11, 31)}`.
     */
    minDate?: Date;
    maxDate?: Date;
    showWeek?: boolean;
    needConfirm?: boolean;
    /**
     * Which period the PANEL opens on, independently of the value (antd `defaultPickerValue`, and
     * like antd's it is RE-APPLIED every time the panel opens rather than only at mount).
     *
     * Without it a panel can only open on the value or on today, so "open on the fiscal year's
     * start month" and "open on the month of the row being edited" have no expression — the two
     * cases the parity audit files as P1. Only the period matters; the day is ignored.
     */
    defaultPickerValue?: Date;
    /** Controlled panel period (antd `pickerValue`) — wins over `defaultPickerValue` and over the value. */
    pickerValue?: Date;
    /**
     * GRANULARITY of one selection (antd `picker`). `date` picks a day from a month grid; `week`
     * picks a day and normalises it to the locale's week start; `month`, `quarter` and `year` swap
     * the day grid for a period grid and normalise to the period's first day.
     *
     * The emitted value is always a `Date` at the START of the chosen period, so a coarse
     * selection interoperates with a fine one and with `DateRange`.
     */
    picker?: "date" | "week" | "month" | "quarter" | "year";
    /**
     * Normalise the selection into ascending order (antd `order`; default `true`).
     *
     * ONE rule, applied to whichever value shape is in play: a `range` whose endpoints were picked
     * backwards is SWAPPED, and a `multiple` selection is SORTED. The four split components spelled
     * this two ways — `DatePicker.order` sorted an array, `DateRangePicker.order` swapped a pair,
     * `MonthRangePicker` swapped unconditionally with no prop at all — which read as a collision
     * but is one invariant seen through three value shapes. Set `false` to keep pick order.
     */
    order?: boolean;
    showTime?:
      | boolean
      | Pick<
          TimePickerProp,
          "hourStep" | "minuteStep" | "secondStep" | "showSeconds" | "use12Hours" | "disabledTime"
        >;
    placeholder?: PlaceholderProp;
    /**
     * Inert control. With `range`, the TUPLE form `[from, to]` locks one endpoint and leaves the
     * other editable (antd's RangePicker `disabled`) — "the start date is fixed by the contract,
     * only the end is negotiable" is a real screen that a scalar cannot say. The tuple is
     * meaningless without `range` and is ignored there.
     */
    disabled?: DisabledProp | [boolean, boolean];
    className?: ClassNameProp;
    id?: IdProp;
    /**
     * Form field name. Submits ISO-8601 at the precision `picker` selects — `2026-03-01` for
     * `date`/`week`, `2026-03` for `month` and `quarter` (the period's first month), `2026` for
     * `year`. With `range`, the pair submits as `${name}_from` / `${name}_to`.
     */
    name?: NameProp;
    locale?: DayPickerProps["locale"];
    fromDate?: Date;
    toDate?: Date;
    /** Decorate a day cell — 祝日, a booked day, a deadline. @see CalendarCellRenderProp */
    cellRender?: CalendarCellRenderProp;
    /**
     * Forbid individual dates by predicate — the rule `minDate`/`maxDate` cannot express, because a
     * business calendar is rarely one contiguous range: 土日, a closed accounting period, a 祝日, a
     * day already fully booked.
     *
     * Applies to BOTH routes into the value. The grid greys the cell out, and a date typed into
     * the field is rejected the same way an unparseable one is — otherwise the keyboard becomes a
     * way around the rule the mouse obeys.
     */
    disabledDate?: (date: Date) => boolean;
    /**
     * antd `allowClear` — an inline ✕ that clears the value when one is set (default true). The
     * OBJECT form additionally replaces the icon and/or the accessible label.
     */
    allowClear?: AllowClearProp;
  } & Pick<CalendarFooterProp, "showToday" | "showClose">;

/**
 * CARDINALITY. One `Date`, an array of them, or a `DateRange` — each keeps its own callback type,
 * so a consumer never has to narrow what it gets back.
 */
export type DatePickerProp = DatePickerBaseProp &
  (
    | {
        range?: false;
        multiple?: false;
        value?: Date;
        defaultValue?: Date;
        onValueChange?: (value: Date | undefined) => void;
        presets?: { label: React.ReactNode; value: Date | (() => Date) }[];
      }
    | {
        range?: false;
        multiple: true;
        value?: Date[];
        defaultValue?: Date[];
        onValueChange?: (value: Date[] | undefined) => void;
        showTime?: false;
        presets?: { label: React.ReactNode; value: Date | (() => Date) }[];
      }
    | {
        /**
         * Two endpoints in one field — antd's `DatePicker.RangePicker`, which this library used to
         * ship as two separate components (`DateRangePicker`, `MonthRangePicker`). It composes with
         * `picker`, so a month range is `<DatePicker range picker="month" />`.
         */
        range: true;
        multiple?: false;
        value?: DateRange;
        defaultValue?: DateRange;
        onValueChange?: (value: DateRange | undefined) => void;
        showTime?: false;
        /** Which endpoints may stay empty (antd `allowEmpty`), as `[from, to]`. */
        allowEmpty?: [boolean, boolean];
        presets?: { label: React.ReactNode; value: DateRange | (() => DateRange) }[];
      }
  );

/**
 * Which times a TimePicker refuses, in antd's shape: one call returns the two predicates, so a
 * consumer computing them from the same source (a start time, a shift window) does that work once
 * per render rather than once per option.
 *
 * `disabledMinutes` receives the hour the minute would belong to, which is what makes the ordinary
 * pair rule expressible: "終了 must be after 開始" forbids every minute before the start minute in
 * the start hour, and no minute at all in any later hour.
 */
export type TimePickerDisabledTimeProp = () => {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
};

/** @see TimePicker — popover HH:mm picker (canonical 24h storage). */
export type TimePickerProp = FieldA11yProps &
  PickerChromeProp & {
    /** Opt-in wheel selection; defaults off to avoid accidental edits. */
    changeOnScroll?: boolean;
    hourStep?: number;
    secondStep?: number;
    showSeconds?: boolean;
    use12Hours?: boolean;
    /** Time pattern: HH:mm, HH:mm:ss, h:mm A (or date-fns a). Storage stays 24-hour. */
    format?: string;
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
    /**
     * Forbid individual hours and minutes. Without it a 開始/終了 pair has no way to stop the end
     * time being set before the start time — the columns will happily offer it.
     *
     * Applies to BOTH routes into the value: a disabled option cannot be clicked, is skipped by the
     * arrow keys, and a forbidden time typed into the field is rejected.
     */
    disabledTime?: TimePickerDisabledTimeProp;
    /**
     * Drop disabled options from the columns instead of showing them greyed out (default false, as
     * antd). Greyed-out is usually the better default — a visible-but-refused option tells the
     * reader the rule exists — but a column that is mostly forbidden reads better short.
     */
    hideDisabledOptions?: boolean;
    /**
     * Offer a "now" action in the panel footer (default true, as antd's `showNow`). It is refused,
     * not hidden, when `disabledTime` forbids the current time — the same treatment a forbidden
     * column option gets, and for the same reason.
     */
    showNow?: boolean;
    /**
     * Hold the panel's choices as a DRAFT until a confirm action commits them (antd's `needConfirm`).
     *
     * DEFAULT `false`, which is where this diverges from antd deliberately. antd defaults it on; this
     * library has always committed on select and closed, and every consumer's flow is built on that.
     * Flipping the default would silently add a click to every existing time field. Opt in where the
     * value is expensive to change (a saved shift, a published slot); leave it off otherwise.
     */
    needConfirm?: boolean;
    /**
     * antd `allowClear` — an inline ✕ that clears the value when one is set (default true). The
     * OBJECT form additionally replaces the icon and/or the accessible label.
     */
    allowClear?: AllowClearProp;
  };

/** A pair of canonical times, ordered by default; empty endpoints are explicitly configurable. */
export type TimeRangePickerProp = Omit<
  TimePickerProp,
  "value" | "defaultValue" | "onValueChange" | "placeholder"
> & {
  value?: [string, string];
  defaultValue?: [string, string];
  onValueChange?: (value: [string, string]) => void;
  placeholder?: [string, string];
  order?: boolean;
  allowEmpty?: [boolean, boolean];
};

/** @see ColorPicker */
export type ColorPickerProp = FieldA11yProps & {
  /** Hex colour (`#rgb` or `#rrggbb`). `""`/omitted = no colour chosen. */
  value?: ValueProp;
  /**
   * Uncontrolled initial colour (controlled-triad rule). Without it the control starts EMPTY —
   * it never invents a colour of its own, so nothing brand-shaped is baked into the framework.
   */
  defaultValue?: DefaultValueProp;
  onValueChange?: OnValueChangeProp;
  disabled?: DisabledProp;
  /** Form field name — submits the hex through a hidden input (`""` while no colour is chosen). */
  name?: NameProp;
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
 * antd `fieldNames` — read rows in a FOREIGN shape (`{id, name}`, `{code, title}`) without mapping
 * them first. The spelling matches the `fieldNames` Cascader and TreeSelect already take.
 */
export type SelectFieldNamesProp = {
  label?: string;
  value?: string;
  /** Key holding a group's child rows — antd nests a group's options under the group. */
  options?: string;
  /** Key holding a group's heading; defaults to `label`, as in antd. */
  groupLabel?: string;
  disabled?: string;
};

/**
 * A GROUP in antd's nested `options` shape — a heading plus its own rows. The flat
 * `option.group` spelling this library already had keeps working; both arrive at the same list.
 */
export type SelectOptionGroupProp = {
  label: string;
  options: SearchSelectOptionProp[];
  disabled?: boolean;
};

/** What `<Select options>` accepts: a row, a group of rows, or (with `fieldNames`) a foreign row. */
export type SelectOptionInputProp =
  SearchSelectOptionProp | SelectOptionGroupProp | Record<string, unknown>;

/**
 * antd `labelInValue` — the value carries its own label, so a screen that only ever sees
 * `{ value, label }` never has to keep the option list around to render what was picked (an async
 * edit form whose page has not loaded yet is the case that needs it).
 */
export type SelectLabeledValueProp = { value: string; label: React.ReactNode };

/**
 * antd `placement`, spelled on the LOGICAL inline axis — the same vocabulary
 * `DropdownMenuPlacementProp` publishes, and for the same reason: antd's `bottomLeft` / `topRight`
 * cannot mirror for an Arabic or Hebrew layout.
 */
export type SelectPlacementProp = "bottomStart" | "bottomEnd" | "topStart" | "topEnd";

/**
 * antd `showSearch`'s OBJECT form. Every field is the antd one, including
 * `filterOption(input, option)` — note the argument order is antd's here, while the long-standing
 * top-level `filterOption(option, query)` keeps this library's. Pass whichever you prefer; the
 * object form wins when both are given.
 */
export type SelectShowSearchProp = {
  /** `false` keeps every row (a server-filtered list); a function decides per row. */
  filterOption?: boolean | ((input: string, option: SearchSelectOptionProp) => boolean);
  /** Which field the default filter matches. antd's default is `value`; `label` is the common one. */
  optionFilterProp?: "label" | "value" | "sublabel";
  filterSort?: (
    a: SearchSelectOptionProp,
    b: SearchSelectOptionProp,
    info: { searchValue: string },
  ) => number;
  searchValue?: string;
  onSearch?: (value: string) => void;
  autoClearSearchValue?: boolean;
};

/**
 * @see Select — the data-driven entry point (`<Select options|loadOptions showSearch …/>`).
 * This is the shape of its internal engine (`SelectDataProp` extends it); use `Select` directly.
 */
export type SearchSelectBaseProp = {
  /**
   * Static option list (client-side filtered). Provide this OR `loadOptions`, not both.
   *
   * A row, or one of antd's nested GROUPS (`{ label, options }`) — both land in the same list, the
   * group's heading becoming the `group` this library's flat rows already carry. Rows in a foreign
   * shape go through `fieldNames` and need a cast at the call site, exactly as Cascader's and
   * TreeSelect's do.
   */
  options?: (SearchSelectOptionProp | SelectOptionGroupProp)[];
  /** Remote fetcher — debounced search + infinite-scroll pagination call into this. Provide this
   *  OR `options`. */
  loadOptions?: (params: SearchSelectLoadParamsProp) => Promise<SearchSelectLoadResultProp>;
  /** Custom per-option renderer. Defaults to label + optional sublabel. */
  renderOption?: (option: SearchSelectOptionProp) => React.ReactNode;
  /**
   * Custom renderer for the SELECTED value shown on the trigger (the conventional `labelRender`).
   * Receives the value, the resolved label, and the full option when it is loaded (undefined for
   * an async preset whose page hasn't arrived).
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
   * focusable + submits its value, unlike `disabled`).
   */
  readOnly?: boolean;
  /** Trigger height tier — forwarded to the underlying Button. Default matches Button's own default. */
  size?: SizeProp;
  /**
   * Trigger width, the SAME axis `SelectTrigger` carries on the compound API — `full` (default,
   * the width a field wants), `auto` (the width the current label wants), `bounded` (one width
   * from `--control-bounded-width`, for a trigger whose value varies in length).
   *
   * It exists here because the two APIs are one component to a caller: `docs/CONSUMER-RULES.md`
   * rule 5 tells everyone that "a Select outside a form takes `width=\"auto\"`", and until this
   * prop existed that sentence was false for the `options` form — a filter bar with two of them
   * stretched each to full width and stacked them, and the only way out was to wrap each in a
   * `<Flex width={280}>`.
   */
  width?: ControlWidthProp;
  /**
   * Validation status (antd `status`). `error` recolours the trigger AND sets `aria-invalid`;
   * `warning` recolours only. A `status` set here never overrides an `aria-invalid` arriving from
   * `FormField` — the field's own validation state wins.
   */
  status?: ControlStatusProp;
  /** Control surface (antd `variant`). Default `outlined`. */
  variant?: ControlVariantProp;
  /**
   * In-flight state (antd `loading`) — the trailing chevron becomes a spinner and the trigger
   * reports `aria-busy`. Distinct from the internal `loadOptions` fetch spinner, which describes
   * the LIST; this one describes the FIELD (e.g. the form is still hydrating its value).
   */
  loading?: PendingProp;
  /** Controlled open state for the popover (uncontrolled by default). */
  open?: OpenProp;
  /** Uncontrolled initial open state (antd `defaultOpen`). */
  defaultOpen?: DefaultOpenProp;
  onOpenChange?: OnOpenChangeProp;
  /** Controlled search-box query (uncontrolled by default). Pairs with `onSearchChange`. */
  search?: string;
  onSearchChange?: OnSearchChangeProp;
  /**
   * Override the default client-side filter (`options` mode only — ignored with `loadOptions`,
   * which is responsible for its own server-side filtering). Receives the option and the trimmed
   * query; return true to keep the row.
   */
  filterOption?: (option: SearchSelectOptionProp, query: string) => boolean;
  /**
   * Order the filtered rows (antd `filterSort`). Runs AFTER `filterOption`, on the client, in
   * `options` mode only — with `loadOptions` the server owns the order.
   */
  filterSort?: (
    a: SearchSelectOptionProp,
    b: SearchSelectOptionProp,
    info: { searchValue: string },
  ) => number;
  /**
   * Clear the search box after a pick (antd `autoClearSearchValue`, default `true`). Set `false`
   * to keep the query so the next open resumes the same filtered list.
   */
  autoClearSearchValue?: boolean;
  /**
   * Per-option renderer in antd's own shape — `(option, { index })`. Takes precedence over the
   * older `renderOption`, which stays for the many call sites already using it.
   */
  optionRender?: (option: SearchSelectOptionProp, info: { index: number }) => React.ReactNode;
  /**
   * Node rendered on the SELECTED row (antd `menuItemSelectedIcon`). Off by default: this library's
   * selected row is marked by fill + weight, which costs no width.
   */
  menuItemSelectedIcon?: React.ReactNode;
  /** Node shown when the list has nothing to offer (antd `notFoundContent`). Beats `emptyMessage`. */
  notFoundContent?: NotFoundContentProp;
  /**
   * Popup width (antd `popupMatchSelectWidth`). `true` (default) pins it to the trigger, `false`
   * lets it hug its content, a number pins it to that many pixels.
   */
  popupMatchSelectWidth?: PopupMatchWidthProp;
  /**
   * antd `allowClear`. `true`/`false` toggles the clear ✕ (same meaning as `clearable`, which
   * stays as this library's own name); the OBJECT form additionally replaces the icon and/or the
   * accessible label. When both are given, `allowClear` wins — it is the more specific statement.
   */
  allowClear?: AllowClearProp;
  /** Fired after the value is cleared through the ✕ (antd `onClear`). */
  onClear?: () => void;
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
  /** Normally injected by `FormField`. */
  "data-field"?: string;
  /**
   * antd `fieldNames` — map `{label, value, options, groupLabel, disabled}` onto foreign rows, so a
   * server payload can be passed straight through instead of being copied into a second array.
   */
  fieldNames?: SelectFieldNamesProp;
  /**
   * antd `prefix` — a node pinned BEFORE the value on the trigger (a currency mark, an icon, a
   * "To:" label). Decorative: it is not part of the control's accessible name.
   */
  prefix?: React.ReactNode;
  /**
   * antd `suffixIcon` — replaces the trailing chevron. `null` removes the indicator entirely (antd
   * spells that `showArrow={false}`, which it deprecated in favour of exactly this).
   */
  suffixIcon?: React.ReactNode;
  /**
   * antd `placement`, on the logical inline axis. Absent = `bottomStart` with collision flipping,
   * which is what a picker wants; set it only when the popup must open a specific way.
   */
  placement?: SelectPlacementProp;
  /**
   * antd `popupRender` — wrap the popup's own node (add a footer, a "create" action, a hint line).
   * Receives the list and must render it: dropping `originNode` leaves a popup with no options.
   */
  popupRender?: (originNode: React.ReactNode) => React.ReactNode;
  /**
   * antd `listHeight` — the option list's maximum height in px. It overrides
   * `--select-content-max-height` for this one control; the token stays the default everywhere
   * else, so this is a per-instance override of a knob, not a new hard-coded height.
   */
  listHeight?: number;
  /** antd `onPopupScroll` — fires on the option list's own scroll (an infinite-scroll hook). */
  onPopupScroll?: (event: React.UIEvent<HTMLElement>) => void;
  /**
   * antd `optionFilterProp` — which field the default filter matches while searching. antd's
   * default is `value`; this library keeps matching BOTH label and value when it is unset, because
   * every call site that has ever relied on the default expects a label search.
   */
  optionFilterProp?: "label" | "value" | "sublabel";
};

/**
 * Single-select (the default): one `string` in, one `string` out — `""` means nothing selected.
 * `mode` is absent rather than `"single"` so every existing call site keeps its exact type.
 */
export type SearchSelectSingleProp = {
  mode?: undefined;
  /** @see SelectLabelInValueSingleProp for the `{value,label}` dialect. */
  labelInValue?: false;
  value?: ValueProp;
  /** Uncontrolled initial value — the trigger shows its option's label at rest (controlled-triad). */
  defaultValue?: DefaultValueProp;
  onValueChange?: (value: string, option?: SearchSelectOptionProp) => void;
  /** Fired when an option is picked (antd `onSelect`). */
  onSelect?: (value: string, option: SearchSelectOptionProp) => void;
};

/**
 * antd `mode="multiple"` — pick several from ONE flat, searchable, possibly async option list.
 *
 * The panel stays OPEN across picks (a multi-pick is a run of gestures, not one), each row toggles,
 * and the trigger collapses the picked labels through the shared `maxTagCount` / `maxTagPlaceholder`
 * helper Cascader and TreeSelect already use — so three multi-value triggers in one form read the
 * same. Removal happens in the list (or with the clear ✕): the trigger is a `<button>`, and a
 * per-chip remove button inside it would be a button nested in a button.
 */
export type SearchSelectMultipleProp = {
  /**
   * `multiple` picks from the list; `tags` also ACCEPTS what was typed, so a value that is not in
   * the list can still be committed (antd's own distinction between the two).
   */
  mode: "multiple" | "tags";
  /** @see SelectLabelInValueMultipleProp for the `{value,label}` dialect. */
  labelInValue?: false;
  value?: ValueProp<string[]>;
  /** Uncontrolled initial selection (controlled-triad). */
  defaultValue?: DefaultValueProp<string[]>;
  onValueChange?: (value: string[], options?: SearchSelectOptionProp[]) => void;
  /** Fired when an option JOINS the selection (antd `onSelect`). */
  onSelect?: (value: string, option: SearchSelectOptionProp) => void;
  /** Fired when an option LEAVES the selection (antd `onDeselect`). */
  onDeselect?: (value: string, option: SearchSelectOptionProp) => void;
  /**
   * Hard ceiling on how many options may be held (antd `maxCount`). A pick past the ceiling is
   * REFUSED — the value handed to `onValueChange` is never over the limit — and the remaining rows
   * report `aria-disabled` so the ceiling is visible before it is hit.
   */
  maxCount?: number;
  /** How many labels the trigger shows before the rest collapse (antd `maxTagCount`). */
  maxTagCount?: MaxTagCountProp;
  /** The node standing in for what `maxTagCount` hid (antd `maxTagPlaceholder`). */
  maxTagPlaceholder?: MaxTagPlaceholderProp;
  /**
   * antd `maxTagTextLength` — cut each chip's text to this many characters (an ellipsis marks the
   * cut). It trims what the TRIGGER shows only; the value keeps its whole label.
   */
  maxTagTextLength?: number;
  /**
   * antd `tagRender` — render one chip yourself. Exactly the shape `TagInput`'s `tagRender` takes,
   * so the two chip surfaces in this library are configured the same way. The `onClose` handed in
   * is the same remover the built-in ✕ calls, so a custom chip cannot end up unremovable.
   */
  tagRender?: (props: {
    value: string;
    label: React.ReactNode;
    onClose: () => void;
    index: number;
    disabled: boolean;
  }) => React.ReactNode;
  /**
   * antd `tokenSeparators` — characters that commit what has been typed. Typing or PASTING
   * "a,b,c" with `[","]` commits three values in one change, which is the point: a run pasted out
   * of a spreadsheet becomes a selection instead of one long nonsense token. In `mode="multiple"`
   * a token only counts when it matches a row; in `mode="tags"` it is accepted as it stands.
   */
  tokenSeparators?: string[];
};

/**
 * antd `labelInValue`, single. The value carries its own label, so a screen that never sees the
 * option list can still render what was picked.
 */
export type SelectLabelInValueSingleProp = {
  labelInValue: true;
  mode?: undefined;
  value?: SelectLabeledValueProp | null;
  defaultValue?: SelectLabeledValueProp | null;
  onValueChange?: (
    value: SelectLabeledValueProp | undefined,
    option?: SearchSelectOptionProp,
  ) => void;
  onSelect?: (value: SelectLabeledValueProp, option: SearchSelectOptionProp) => void;
};

/** antd `labelInValue`, multiple/tags. */
export type SelectLabelInValueMultipleProp = {
  labelInValue: true;
  mode: "multiple" | "tags";
  value?: SelectLabeledValueProp[];
  defaultValue?: SelectLabeledValueProp[];
  onValueChange?: (value: SelectLabeledValueProp[], options?: SearchSelectOptionProp[]) => void;
  onSelect?: (value: SelectLabeledValueProp, option: SearchSelectOptionProp) => void;
  onDeselect?: (value: SelectLabeledValueProp, option: SearchSelectOptionProp) => void;
  maxCount?: number;
  maxTagCount?: MaxTagCountProp;
  maxTagPlaceholder?: MaxTagPlaceholderProp;
  maxTagTextLength?: number;
  tokenSeparators?: string[];
  tagRender?: (props: {
    value: string;
    label: React.ReactNode;
    onClose: () => void;
    index: number;
    disabled: boolean;
  }) => React.ReactNode;
};

/** @see Select — the searchable engine. Single by default; `mode="multiple"` switches the shape. */
export type SearchSelectProp = SearchSelectBaseProp &
  (SearchSelectSingleProp | SearchSelectMultipleProp);

/**
 * Data-driven (Ant-style) form of {@link Select} — one component covering static `options` or
 * async `loadOptions`, with `showSearch` toggling the searchable combobox vs a plain listbox.
 * Passing `options`/`loadOptions` to `<Select>` switches it from the compound API to this one.
 */
export type SelectDataProp = SearchSelectBaseProp & {
  /**
   * Show the search box (combobox). Defaults to true when `loadOptions` is set or a multi-value
   * `mode` is in force (antd's own defaults), otherwise false.
   *
   * The OBJECT form is antd's, and configures the search in one place —
   * `{ filterOption, optionFilterProp, filterSort, searchValue, onSearch, autoClearSearchValue }`.
   * Passing it also turns the search on.
   */
  showSearch?: boolean | SelectShowSearchProp;
} & (
    | SearchSelectSingleProp
    | SearchSelectMultipleProp
    | SelectLabelInValueSingleProp
    | SelectLabelInValueMultipleProp
  );

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
  readOnly?: boolean;
  directory?: boolean;
  pastable?: boolean;
  openFileDialogOnClick?: boolean;
  name?: string;
  action?: string | ((file: File) => string | Promise<string>);
  method?: "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  data?:
    | Record<string, string | Blob>
    | ((file: File) => Record<string, string | Blob> | Promise<Record<string, string | Blob>>);
  withCredentials?: boolean;
  beforeUpload?: (
    file: File,
    files: File[],
  ) =>
    | boolean
    | File
    | Blob
    | typeof import("../../components/data-entry/upload-types").UPLOAD_LIST_IGNORE
    | Promise<
        | boolean
        | File
        | Blob
        | typeof import("../../components/data-entry/upload-types").UPLOAD_LIST_IGNORE
      >;
  onReject?: (
    rejection: import("../../components/data-entry/upload-types").UploadRejection,
  ) => void;
  onRemove?: (item: UploadFileItemProp) => boolean | void | Promise<boolean | void>;
  onPreview?: (item: UploadFileItemProp) => void;
  onDownload?: (item: UploadFileItemProp) => void;
  previewFile?: (file: File) => Promise<string>;
  onDrop?: React.DragEventHandler<HTMLElement>;
  showUploadList?: boolean;
  itemRender?: (
    node: React.ReactElement,
    item: UploadFileItemProp,
    items: UploadFileItemProp[],
    actions: import("../../components/data-entry/upload-types").UploadItemActions,
  ) => React.ReactNode;

  removable?: boolean;
  /** App: issue → PUT → complete; return mediaId + optional preview URL */
  onUpload?: (
    file: File,
    item: UploadFileItemProp,
    context: import("../../components/data-entry/upload-types").UploadRequestContext,
  ) => Promise<import("../../components/data-entry/upload-types").UploadResult>;
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
  /**
   * `variant="button"` only — the visual weight of the visible trigger, forwarded to Button.
   * Defaults to `outline`, which is right for a standalone form field. Pass `ghost` when the
   * trigger sits in a toolbar row beside other icon buttons — inside a chat composer, say —
   * where a bordered square reads as the odd one out.
   *
   * @see Button — same variant scale
   */
  triggerVariant?:
    "default" | "destructive" | "outline" | "dashed" | "secondary" | "ghost" | "link";
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
  /**
   * Read-only: the selection stays visible, focusable and submitted, but the panel refuses to open
   * and the clear ✕ is withdrawn. The same contract Select states — unlike `disabled`, the field
   * keeps its tab stop and still posts its value, which is what a locked-for-this-role field needs.
   */
  readOnly?: boolean;
  /**
   * Form field name — submits through hidden input(s). A path is joined with `/`
   * (`"jp/13/shibuya"`), and `multiple` emits ONE field per selected path under the same name (the
   * native `<select multiple>` contract). Option values must therefore not contain `/`.
   */
  name?: NameProp;
  className?: ClassNameProp;
  id?: IdProp;
  expandTrigger?: "click" | "hover";
  fieldNames?: TreeFieldNamesProp;
  allowClear?: AllowClearProp;
  /** Control height tier (antd `size`) — the shared `--control-height` ladder. */
  size?: SizeProp;
  /** Validation status (antd `status`). `error` also sets `aria-invalid`; `warning` recolours only. */
  status?: ControlStatusProp;
  /** Control surface (antd `variant`). Default `outlined`. */
  variant?: ControlVariantProp;
  /** In-flight state (antd `loading`) — spinner in place of the chevron, `aria-busy` on the trigger. */
  loading?: PendingProp;
  /** Controlled panel open state (antd `open`). */
  open?: OpenProp;
  /** Uncontrolled initial open state (antd `defaultOpen`). */
  defaultOpen?: DefaultOpenProp;
  /** Panel open change (antd `onOpenChange`). Fires for both controlled and uncontrolled panels. */
  onOpenChange?: OnOpenChangeProp;
  /**
   * `multiple` only — which checked paths appear in the trigger label (antd `showCheckedStrategy`).
   * `SHOW_PARENT` collapses a fully-checked parent's children into the parent; `SHOW_CHILD`
   * (default) lists the leaves. `SHOW_ALL` is TreeSelect-only in antd and is not accepted here.
   */
  showCheckedStrategy?: Exclude<ShowCheckedStrategyProp, "SHOW_ALL">;
  /**
   * Lazy children (antd `loadData`). Called ONCE per node the first time a branch with no
   * `children` and `isLeaf !== true` is expanded; push the fetched children into `options`.
   */
  loadData?: (selectedOptions: TreeOptionProp[]) => void | Promise<void>;
  /** Render the trigger label from the selected path (antd `displayRender`). */
  displayRender?: (labels: string[], selectedOptions?: TreeOptionProp[]) => React.ReactNode;
  /** Per-option renderer for a column row (antd `optionRender`). */
  optionRender?: (option: TreeOptionProp) => React.ReactNode;
  /** `multiple` only — visible paths in the trigger before the rest collapse (antd `maxTagCount`). */
  maxTagCount?: MaxTagCountProp;
  /** The node standing in for what `maxTagCount` hid (antd `maxTagPlaceholder`). */
  maxTagPlaceholder?: MaxTagPlaceholderProp;
  /** Node shown when the search finds nothing (antd `notFoundContent`). */
  notFoundContent?: NotFoundContentProp;
  /** Clear the search box after a pick (antd `autoClearSearchValue`, default `true`). */
  autoClearSearchValue?: boolean;
  /** Controlled search query (antd `showSearch.searchValue`). */
  search?: string;
  /** Search query change (antd `showSearch.onSearch`). */
  onSearchChange?: OnSearchChangeProp;
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
  /**
   * Read-only: the selection stays visible, focusable and submitted, but the tree refuses to open
   * and the clear ✕ is withdrawn. The same contract Select states — unlike `disabled`, the field
   * keeps its tab stop and still posts its value.
   */
  readOnly?: boolean;
  /**
   * Form field name — submits through hidden input(s). `multiple`/`treeCheckable` emits ONE field
   * per checked value under the same name (the native `<select multiple>` contract).
   */
  name?: NameProp;
  allowClear?: AllowClearProp;
  className?: ClassNameProp;
  id?: IdProp;
  fieldNames?: TreeFieldNamesProp;
  /** Control height tier (antd `size`) — the shared `--control-height` ladder. */
  size?: SizeProp;
  /** Validation status (antd `status`). `error` also sets `aria-invalid`; `warning` recolours only. */
  status?: ControlStatusProp;
  /** Control surface (antd `variant`). Default `outlined`. */
  variant?: ControlVariantProp;
  /** In-flight state (antd `loading`) — spinner in place of the chevron, `aria-busy` on the trigger. */
  loading?: PendingProp;
  /** Controlled panel open state (antd `open`). */
  open?: OpenProp;
  /** Uncontrolled initial open state (antd `defaultOpen`). */
  defaultOpen?: DefaultOpenProp;
  /** Panel open change (antd `onOpenChange`). Fires for both controlled and uncontrolled panels. */
  onOpenChange?: OnOpenChangeProp;
  /**
   * Lazy children (antd `loadData`). Called ONCE per node the first time a branch with no
   * `children` and `isLeaf !== true` is expanded; push the fetched children into `treeData`.
   */
  loadData?: (node: TreeOptionProp) => void | Promise<void>;
  /** Render a node's title (antd `treeTitleRender`). */
  treeTitleRender?: (node: TreeOptionProp) => React.ReactNode;
  /** Visible values in the trigger label before the rest collapse (antd `maxTagCount`). */
  maxTagCount?: MaxTagCountProp;
  /** The node standing in for what `maxTagCount` hid (antd `maxTagPlaceholder`). */
  maxTagPlaceholder?: MaxTagPlaceholderProp;
  /** Node shown when the tree has nothing to list (antd `notFoundContent`). */
  notFoundContent?: NotFoundContentProp;
  /** Clear the search box after a pick (antd `autoClearSearchValue`, default `true`). */
  autoClearSearchValue?: boolean;
  /** Controlled search query (antd `showSearch.searchValue`). */
  search?: string;
  /** Search query change (antd `showSearch.onSearch`). */
  onSearchChange?: OnSearchChangeProp;
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
  /** Canonical controlled value; wins over targetKeys when both are provided. */
  value?: string[];
  defaultValue?: string[];
  name?: string;
  readOnly?: boolean;
  /** Independent per-pane pagination. Select-all applies to visible enabled rows. */
  pagination?: boolean | { pageSize?: number };
  dataSource: TransferItemProp[];
  /**
   * The keys currently in the TARGET pane (antd's own name, and the controlled half of the triad).
   * Optional since the control can run uncontrolled from `defaultTargetKeys`.
   */
  targetKeys?: string[];
  /**
   * Uncontrolled initial target keys (controlled-triad rule). Without one the shuttle starts empty
   * and still shuttles — a Transfer with no `targetKeys` handler used to be frozen.
   */
  defaultTargetKeys?: string[];
  onValueChange?: (targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => void;
  titles?: [React.ReactNode, React.ReactNode];
  showSearch?: boolean;
  /**
   * Render one row's body yourself (antd `render`). Receives the item; return the node shown beside
   * its checkbox. The checkbox, its label association and the row's keyboard behaviour stay ours —
   * a custom row cannot end up unlabelled.
   */
  render?: (item: TransferItemProp) => React.ReactNode;
  /**
   * Override the search predicate (antd `filterOption`). Receives the trimmed query and the item;
   * return true to keep the row. Default matches title + description, case-insensitively.
   */
  filterOption?: (query: string, item: TransferItemProp) => boolean;
  /**
   * Show the per-pane select-all checkbox (antd `showSelectAll`, default `true`). `false` withdraws
   * it — a pane whose items are individually meaningful (permissions, billable seats) often should
   * not offer "all" as one click.
   */
  showSelectAll?: boolean;
  oneWay?: boolean;
  disabled?: DisabledProp;
  /** Injected by FormField (or set directly) — applied to the `role="group"` shuttle container. */
  id?: IdProp;
  className?: ClassNameProp;
  selectedKeys?: [string[], string[]];
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
};

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

/**
 * Which keystroke SENDS and which one breaks the line — Ant Design X `Sender.submitType`.
 *
 * `enter` (default) is the chat convention: `Enter` sends, `Shift+Enter` inserts a newline.
 * `shiftEnter` is the inverse, for composers that hold long, deliberately multi-line drafts.
 * Neither ever fires while an IME conversion is in flight.
 * @see ChatComposer
 */
export type ChatComposerSubmitTypeProp = "enter" | "shiftEnter";

/**
 * @see ChatComposer — the message input of a conversation (Ant Design X `Sender`; the industry
 * calls the control a *composer*, so that is what it is named).
 *
 * Built on the real `Textarea` (auto-growing between `--chat-composer-min-height` and
 * `--chat-composer-max-height`, both derived from the `--control-height` tier) plus real
 * `Button`s. The `<textarea>` is the semantic focus target: `ref`, `id`, `name` and the whole
 * `FormField` label/helper/error contract land on it, so a ChatComposer inside a `FormField`
 * behaves exactly like an `Input` does.
 */
export type ChatComposerProp = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSubmit" | "defaultValue" | "prefix" | "onChange" | "onKeyDown"
> &
  FieldA11yProps & {
    /** Controlled draft text. Pair with `onValueChange` or the box freezes. */
    value?: ValueProp<string>;
    /** Uncontrolled initial draft text. */
    defaultValue?: DefaultValueProp<string>;
    /** Draft-text change handler — fires on every keystroke, including during an IME conversion. */
    onValueChange?: OnValueChangeProp<string>;
    /**
     * Send the draft. Receives the text as typed; never fires for an empty or whitespace-only
     * draft, and never while `loading`, `disabled` or `readOnly`.
     */
    onSubmit?: (value: string) => void;
    /** Stop the in-flight response. Only reachable while `loading`. */
    onCancel?: () => void;
    /**
     * A response is streaming. The trailing action becomes CANCEL — exactly one trailing action
     * exists at a time, the same discipline as the picker trailing-action rule.
     */
    loading?: PendingProp;
    /** Which keystroke sends and which breaks the line. Default `enter`. */
    submitType?: ChatComposerSubmitTypeProp;
    /** Empty-state text of the draft box; pass it through `t()` at the call site. */
    placeholder?: PlaceholderProp;
    /** Disable the whole composer (draft box and every action). */
    disabled?: DisabledProp;
    /** Show the draft without allowing an edit; still focusable and selectable. */
    readOnly?: boolean;
    /** Slot ABOVE the draft row — attachments, a reply-to banner, a model picker. */
    header?: React.ReactNode;
    /** Slot at the inline START of the draft row — an attach button, an avatar. */
    prefix?: React.ReactNode;
    /** Slot BELOW the draft row — a hint line, a token counter. */
    footer?: React.ReactNode;
    /** Extra trailing actions, rendered BEFORE the send/cancel action. */
    actions?: React.ReactNode;
    /** Control height tier on the shared `--control-height` ladder. Default `md`. */
    size?: SizeProp;
    /** Hard ceiling on the draft length, forwarded to the textarea. */
    maxLength?: number;
    /** Validation state the composer paints. `error` also reports `aria-invalid`. */
    status?: ControlStatusProp;
    /** Accessible name override for the send action (localized default otherwise). */
    submitLabel?: string;
    /** Accessible name override for the cancel action (localized default otherwise). */
    cancelLabel?: string;
    /** Keydown on the draft box — how `ChatSuggestion` drives its list from the composer. */
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
    name?: NameProp;
    id?: IdProp;
    className?: ClassNameProp;
  };

/** @see ChatSuggestion — one row of the trigger-character list. One level of `children` is honoured. */
export type ChatSuggestionItemProp = {
  /** Stable value handed to `onValueChange`, and the search haystack when there is no `label`. */
  value: string;
  /** Human row label. Falls back to `value`. */
  label?: string;
  /** Secondary line under the label. */
  description?: string;
  /** Decorative leading node (an icon). */
  icon?: React.ReactNode;
  /** Keep the row visible but unselectable. */
  disabled?: DisabledProp;
  /** One level of sub-rows; picking the parent drills into them instead of emitting a value. */
  children?: readonly ChatSuggestionItemProp[];
};

/** The render-prop bag `ChatSuggestion` hands to the composer it wraps. */
export type ChatSuggestionRenderProp = {
  /**
   * Re-read the caret and decide whether the list belongs open — call it from the composer's
   * `onValueChange`. `false` force-closes; no argument force-opens with an empty query.
   */
  onTrigger: (value?: string | false) => void;
  /** Forward to the composer's `onKeyDown`: arrows move, Enter/Tab pick, Escape closes. */
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
};

/**
 * @see ChatSuggestion — trigger-character autocomplete over a `ChatComposer` (Ant Design X
 * `Suggestion`).
 *
 * The list itself is the existing `Command` (cmdk) inside a `Popover`, so the listbox ARIA comes
 * from a primitive that already ships it. What this component owns is the part `Command` does not:
 * spotting the trigger character at the caret in a textarea, tracking the query as the caret
 * moves, and closing on `Escape` / blur / a word break — `Escape` returns focus to the textarea
 * and leaves the typed text exactly as it was.
 */
export type ChatSuggestionProp = {
  /** The rows to offer. One level of `children` is honoured. */
  items: readonly ChatSuggestionItemProp[];
  /** Fires with the picked row's `value`. The caller owns what that does to the draft text. */
  onValueChange?: OnValueChangeProp<string>;
  /** The character that opens the list when typed at a word boundary. Default `/`. */
  triggerCharacter?: string;
  /** Controlled open state. */
  open?: OpenProp;
  /** Uncontrolled initial open state. */
  defaultOpen?: DefaultOpenProp;
  /** Open-state change handler. */
  onOpenChange?: OnOpenChangeProp;
  /** The composer to wrap — receives `{ onTrigger, onKeyDown }`. */
  children: (props: ChatSuggestionRenderProp) => React.ReactNode;
  /** Text shown when the query matches nothing (localized default otherwise). */
  emptyMessage?: EmptyMessageProp;
  /** Accessible name of the suggestion listbox — a plain string (localized default otherwise). */
  listLabel?: string;
  id?: IdProp;
  className?: ClassNameProp;
};
