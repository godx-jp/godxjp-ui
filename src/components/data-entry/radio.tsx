import * as React from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { Circle } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  choiceOptionDomId,
  pickFieldA11y,
  useFieldIdentity,
  useMirroredInputAttributes,
} from "../../lib/field-a11y";
import { Field } from "./field";
import {
  choiceGroupClassName,
  isChoiceOptionSection,
  type ChoiceOption,
  type ChoiceOptionSection,
} from "./choice-option";
import { withOwnHitTarget } from "./choice-hit-target";
import type { RadioGroupProp, RadioProp } from "../../props/components/data-entry.prop";

export type {
  RadioGroupProp,
  RadioGroupProp as RadioGroupProps,
} from "../../props/components/data-entry.prop";

/*
 * NỀN: react-aria-components, không còn @radix-ui/react-radio-group.
 *
 * API CÔNG KHAI GIỮ NGUYÊN TÊN RADIX — `value` / `defaultValue` / `onValueChange` / `disabled`,
 * và `data-state="checked" | "unchecked"` mà styles/control.css đang bám. RAC gọi chúng là
 * `onChange`, `isDisabled`, `data-selected`; bản dịch nằm gọn trong tệp này.
 *
 * Hình dạng DOM đổi đúng như ở Checkbox và Switch: `role="radio"` là `<input>` thật, còn thứ
 * ĐƯỢC TÔ là `<label>` bọc quanh nó. Vì thế `data-state` được dựng lại trong `render` — từ chính
 * state của primitive, nên hai bên không thể lệch nhau.
 */

/** `data-state` của Radix, dựng lại từ state thật của react-aria. */
function checkedState(isSelected: boolean): "checked" | "unchecked" {
  return isSelected ? "checked" : "unchecked";
}

/** Thẻ `<label>` mà một mục radio render ra. */
type RadioLabelProps = React.HTMLAttributes<HTMLLabelElement> &
  React.RefAttributes<HTMLLabelElement>;

/**
 * gh#337 puts the machine key on the control's SEMANTIC FOCUS TARGET, which under react-aria is
 * the `<input>` — where `id` already lands. It has to be written by hand because react-aria strips
 * every `data-*` off that input, and it is NOT also left on the `<label>`: one field, one node.
 */
function useFieldKeyedInput(fieldKey?: string) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  useMirroredInputAttributes(inputRef, { "data-field": fieldKey });
  return inputRef;
}

type RadioGroupRootProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange" | "dir"
> & {
  /** `""` and `null` both mean "nothing chosen" (gh#1544). */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  orientation?: "horizontal" | "vertical";
};

const RadioGroupRoot = React.forwardRef<HTMLDivElement, RadioGroupRootProps>(
  (
    { className, value, defaultValue, onValueChange, disabled, required, orientation, ...props },
    ref,
  ) => {
    // react-aria drops a raw `aria-invalid`; `isInvalid` is the knob that puts it back on the
    // `role="radiogroup"` element AND lights `data-invalid` on every member, which is what each
    // member's invalid border now reads.
    const invalid = props["aria-invalid"];
    // `aria-label` AND `aria-labelledby` together are how FormField names a group belt-and-braces.
    // ARIA gives `aria-labelledby` precedence, so under Radix the name was the visible label,
    // once. react-aria instead MERGES the two — it appends its own id to `aria-labelledby` and
    // keeps `aria-label` — and the name came out as the label read TWICE. The visible label wins,
    // which is the rule resolveFieldA11y already states for every other control here.
    const { "aria-label": ariaLabel, ...rest } = props;
    return (
      <AriaRadioGroup
        ref={ref}
        data-slot="radio-group"
        className={cn("ui-choice-group", className)}
        // gh#1544 — react-aria reads `""` as a SELECTED key that matches no radio and gives every
        // radio `tabIndex=-1`, so Tab skipped the group. `""` is how a consumer says "nothing
        // chosen" through a `string` prop; `null` is react-aria's spelling of the same thing, and it
        // keeps the group controlled (`undefined` would flip it to uncontrolled mid-life).
        value={value === "" ? null : value}
        defaultValue={defaultValue === "" ? null : defaultValue}
        onChange={onValueChange}
        isDisabled={disabled}
        isRequired={required}
        isInvalid={invalid !== undefined && invalid !== false && invalid !== "false"}
        orientation={orientation}
        aria-label={props["aria-labelledby"] ? undefined : ariaLabel}
        {...(rest as unknown as Record<string, never>)}
      />
    );
  },
);
RadioGroupRoot.displayName = "RadioGroup";

const RadioItem = React.forwardRef<HTMLLabelElement, RadioProp>(
  ({ className, disabled, value, ...props }, ref) => {
    // `data-field` is INTERNAL plumbing, not published prop surface — `Radio.Group` passes it down
    // and nothing else should. Read off the rest bag rather than declared on `RadioProp`.
    const { "data-field": fieldKey } = props as { "data-field"?: string };
    const inputRef = useFieldKeyedInput(fieldKey);
    return (
      <AriaRadio
        ref={ref}
        inputRef={inputRef}
        value={value}
        isDisabled={disabled}
        data-slot="radio-group-item"
        className={cn(
          // `.ui-radio:disabled, .ui-radio[data-disabled]` in styles/control.css already declares both
          // and reads --disabled-opacity. The utility was layered after components, so it silently
          // outranked that token — a service theme's --disabled-opacity never reached a radio.
          // Byte-identical: --disabled-opacity defaults to 0.5.
          //
          // `inline-flex items-center justify-center` is load-bearing, for the reason Checkbox
          // records: react-aria's root is a `<label>`, which is `display:inline`, so without it the
          // 16px dot collapses to nothing. `data-[invalid]` replaces `aria-invalid:` because
          // react-aria puts `aria-invalid` on the `<input>` and `data-invalid` on this box.
          "ui-radio data-[invalid]:border-destructive inline-flex shrink-0 items-center justify-center shadow-xs transition-shadow",
          className,
        )}
        {...(props as unknown as Record<string, never>)}
        // `withOwnHitTarget` replaces react-aria's 1px clipped input wrapper with one the
        // stylesheet sizes to the painted dot — see gh#476 and choice-hit-target.tsx.
        render={(domProps, state) => (
          <label {...(domProps as RadioLabelProps)} data-state={checkedState(state.isSelected)}>
            {withOwnHitTarget(domProps.children)}
          </label>
        )}
      >
        <span data-slot="radio-group-indicator" className="ui-choice-indicator">
          <Circle className="ui-radio-icon" aria-hidden="true" />
        </span>
      </AriaRadio>
    );
  },
);
RadioItem.displayName = "Radio";

/** One member of the welded bar. Its own component so it can own the `data-field` input hook. */
function RadioBarButton({
  id,
  option,
  resolvedField,
}: {
  id: string;
  option: ChoiceOption;
  resolvedField?: string;
}) {
  const inputRef = useFieldKeyedInput(resolvedField);
  return (
    <AriaRadio
      id={id}
      inputRef={inputRef}
      value={option.value}
      isDisabled={option.disabled}
      data-slot="radio-button"
      className="ui-radio-button ui-focus-ring"
      // `data-state` used to be derived from the `value` PROP, so an UNCONTROLLED bar never
      // painted a selection at all. Reading the primitive's own state fixes that and removes the
      // second source of truth in one move.
      render={(domProps, state) => (
        <label {...(domProps as RadioLabelProps)} data-state={checkedState(state.isSelected)}>
          {withOwnHitTarget(domProps.children)}
        </label>
      )}
    >
      <span className="ui-radio-button-label">{option.label}</span>
    </AriaRadio>
  );
}

/**
 * antd `optionType="button"` — one welded bar of radio buttons instead of a column of dots.
 *
 * IT IS PAINT, NOT SEMANTICS. The roles stay `radiogroup` / `radio`, so arrow keys still move the
 * selection, a screen reader still says "1 of 3, selected", and a native submit still works. That
 * is the whole reason this is a prop on RadioGroup rather than a ToggleGroup: a row of
 * `aria-pressed` buttons permits "none chosen", and a radio group does not.
 */
function RadioButtonBar({
  options,
  optionDomId,
  resolvedField,
}: {
  options: readonly ChoiceOption[];
  optionDomId: (optionValue: string, index: number) => string;
  resolvedField?: string;
}) {
  return (
    <>
      {options.map((opt, index) => (
        <RadioBarButton
          key={opt.value}
          id={optionDomId(opt.value, index)}
          option={opt}
          resolvedField={resolvedField}
        />
      ))}
    </>
  );
}

/**
 * `optionType="card"` (gh#1555) — one bordered row per choice. The WHOLE row is the radio's
 * `<label>` (the same react-aria root the button bar uses), so a press anywhere on it selects, and
 * the hidden `<input>` is stretched over the row by `withOwnHitTarget` + `.ui-choice-input`.
 *
 * The accessible name is the `label` alone (`aria-labelledby` → the title), not the row's whole
 * text: `extra` and `description` are wired to `aria-describedby` by id (react-aria's own
 * description slot resolved a second card to the FIRST card's text, measured in jsdom), so a screen reader hears "Acme, radio, 1 of 3, Last used, Owner · 12
 * members". `leading` is decorative and hidden.
 */
function RadioCard({
  id,
  option,
  resolvedField,
}: {
  id: string;
  option: ChoiceOption;
  resolvedField?: string;
}) {
  const inputRef = useFieldKeyedInput(resolvedField);
  const titleId = `${id}-title`;
  const extraId = option.extra != null ? `${id}-extra` : undefined;
  const descriptionId = option.description != null ? `${id}-description` : undefined;
  const describedBy = [extraId, descriptionId].filter(Boolean).join(" ") || undefined;
  return (
    <AriaRadio
      id={id}
      inputRef={inputRef}
      value={option.value}
      isDisabled={option.disabled}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      data-slot="radio-card"
      className="ui-radio-card ui-focus-ring"
      render={(domProps, state) => (
        <label {...(domProps as RadioLabelProps)} data-state={checkedState(state.isSelected)}>
          {withOwnHitTarget(domProps.children)}
        </label>
      )}
    >
      {({ isSelected }) => (
        <>
          <span className="ui-radio ui-radio-card-mark" data-state={checkedState(isSelected)}>
            <span className="ui-choice-indicator">
              <Circle className="ui-radio-icon" aria-hidden="true" />
            </span>
          </span>
          {option.leading != null ? (
            <span className="ui-radio-card-leading" aria-hidden="true">
              {option.leading}
            </span>
          ) : null}
          <span className="ui-radio-card-content">
            <span id={titleId} className="ui-radio-card-title">
              {option.label}
            </span>
            {option.description != null ? (
              <span id={descriptionId} className="ui-radio-card-description">
                {option.description}
              </span>
            ) : null}
          </span>
          {option.extra != null ? (
            <span id={extraId} className="ui-radio-card-extra">
              {option.extra}
            </span>
          ) : null}
        </>
      )}
    </AriaRadio>
  );
}

/**
 * A labelled section (gh#1555): a `role="group"` named by its heading, INSIDE the one
 * `radiogroup` — react-aria's arrow-key walker reads every radio input under the group root, so
 * the arrows run straight across section boundaries.
 */
function RadioSection({
  id,
  section,
  children,
}: {
  id: string;
  section: ChoiceOptionSection;
  children: React.ReactNode;
}) {
  const labelId = `${id}-label`;
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-slot="radio-section"
      data-appearance={section.appearance}
      className="ui-radio-section"
    >
      <span id={labelId} className="ui-radio-section-label">
        {section.label}
      </span>
      {children}
    </div>
  );
}

function RadioGroupOptions({
  value,
  defaultValue,
  onValueChange,
  options,
  orientation = "vertical",
  optionType = "default",
  buttonStyle = "outline",
  size,
  disabled,
  name,
  id,
  className,
  children,
  ...ariaProps
}: RadioGroupProp) {
  const reactId = React.useId();
  // role="radiogroup" IS a widget → it supports the full validation contract (aria-invalid /
  // -errormessage / -required), so forward every field-a11y relationship FormField injects.
  const groupA11y = pickFieldA11y(ariaProps);
  // `name` goes on the group
  // root, which is what feeds each option's native radio input.
  const identity = useFieldIdentity({ id, name, "data-field": groupA11y["data-field"] });
  const resolvedName = name ?? identity.name;
  const resolvedField = groupA11y["data-field"] ?? identity["data-field"];
  // A radio is the one control whose focusable element is NOT the one
  // that carries the field's id — the group holds that — so each button needs an id of its own,
  // and `React.useId()` produces `«r3»-52-0`: unique, but regenerated on every mount and different
  // in every build, so nothing outside React can address it. Derive it from the group's OWN id
  // whenever there is one; `useId` stays the fallback for a group that has none.
  const optionDomId = (optionValue: string, index: number) =>
    choiceOptionDomId(id, reactId, optionValue, index);

  if (options && options.length > 0) {
    // One running index across sections, so option ids stay unique when sections are used.
    let flatIndex = 0;
    const renderOption = (opt: ChoiceOption) => {
      const optionId = optionDomId(opt.value, flatIndex++);
      if (optionType === "card") {
        return (
          <RadioCard key={opt.value} id={optionId} option={opt} resolvedField={resolvedField} />
        );
      }
      return (
        <Field key={opt.value} id={optionId} label={opt.label} description={opt.description}>
          <RadioItem
            id={optionId}
            value={opt.value}
            disabled={opt.disabled}
            data-field={resolvedField}
          />
        </Field>
      );
    };
    const sectionBase = id ?? reactId;
    return (
      <RadioGroupRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={resolvedName}
        id={id}
        orientation={orientation}
        {...groupA11y}
        data-field={resolvedField}
        data-orientation={orientation}
        data-option-type={optionType === "default" ? undefined : optionType}
        data-button-style={optionType === "button" ? buttonStyle : undefined}
        data-size={optionType === "button" && size === "touch" ? size : undefined}
        className={cn(
          optionType === "button" ? "ui-radio-button-bar" : choiceGroupClassName(orientation),
          optionType === "card" && "ui-radio-card-group",
          className,
        )}
      >
        {optionType === "button" ? (
          // A welded bar has no room for headings: sections are flattened into one bar.
          <RadioButtonBar
            options={options.flatMap((entry) =>
              isChoiceOptionSection(entry) ? entry.options : [entry],
            )}
            optionDomId={optionDomId}
            resolvedField={resolvedField}
          />
        ) : (
          options.map((entry, sectionIndex) =>
            isChoiceOptionSection(entry) ? (
              <RadioSection
                key={`section-${sectionIndex}`}
                id={`${sectionBase}-section-${sectionIndex}`}
                section={entry}
              >
                {entry.options.map(renderOption)}
              </RadioSection>
            ) : (
              renderOption(entry)
            ),
          )
        )}
      </RadioGroupRoot>
    );
  }

  return (
    <RadioGroupRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={resolvedName}
      id={id}
      orientation={orientation}
      {...groupA11y}
      data-field={resolvedField}
      data-orientation={orientation}
      className={choiceGroupClassName(orientation, className)}
    >
      {children}
    </RadioGroupRoot>
  );
}

/** Single radio — use inside `Radio.Group` / `RadioGroupRoot`, or via `options` API. */
export const Radio = Object.assign(RadioItem, {
  Root: RadioGroupRoot,
  Group: RadioGroupOptions,
  Item: RadioItem,
});

export { RadioGroupRoot, RadioItem, RadioGroupOptions as RadioGroup };
