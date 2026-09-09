import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { useFieldIdentity, useFieldNameFallback } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import {
  CONTROL_STATUS_CHROME_CLASS,
  CONTROL_VARIANT_CHROME_CLASS,
  controlAppearanceAttributes,
  resolveControlCount,
} from "./control-appearance";
import { resolveAllowClear } from "./control-surface";
import type { InputProp } from "../../props/components/data-entry.prop";

export type { InputProp, InputProp as InputProps } from "../../props/components/data-entry.prop";

/**
 * The chrome-free half of the field. `border-input bg-background` is NOT in here: a Tailwind
 * utility lives in `@layer utilities` and outranks every component-layer rule, so baking the
 * outlined surface into the base list would silently defeat `variant="filled"` and
 * `variant="borderless"`. The outlined variant appends exactly those two utilities and nothing
 * else changed for it — see CONTROL_VARIANT_CHROME_CLASS.
 */
const inputBaseClass = [
  "ui-control ui-input w-full rounded-[var(--control-radius)] transition-[color,box-shadow] outline-none",
  "selection:bg-primary selection:text-primary-foreground",
  "placeholder:text-muted-foreground",
  "aria-invalid:border-destructive",
  CONTROL_STATUS_CHROME_CLASS,
];

export const Input = React.forwardRef<HTMLInputElement, InputProp>(
  (
    {
      size,
      status,
      variant = "outlined",
      className,
      type,
      allowClear,
      onClear,
      leadingIcon,
      trailingIcon,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      count,
      value,
      defaultValue,
      onChange,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    // a layout wrapper (range from/to, 年/月) that the cloneElement contract cannot reach. `{}`
    // whenever the input is already labelled, so it never overrides props. (Wording note: the
    // API-manifest generator greps the source for bare inherited-prop words — keep this comment
    // free of the standalone word for the native form-submission attribute.)
    const nameFallback = useFieldNameFallback({
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
    });
    // cloneElement cannot reach (a from/to pair, a value + 「不明」 checkbox). `{}` unless this
    // input is inside a FormField, has an id of its own, and nothing upstream resolved the key.
    const identity = useFieldIdentity({
      id: props.id,
      name: props.name,
      "data-field": (props as { "data-field"?: string })["data-field"],
    });
    const appearance = controlAppearanceAttributes({
      status,
      variant,
      "aria-invalid": props["aria-invalid"],
    });
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    // Callback ref forwards the real DOM node to the parent's ref (so `ref.current`
    // stays the <input>, exactly as before) while keeping our own handle for clear().
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref],
    );

    const [text, setText] = React.useState(() => String(value ?? defaultValue ?? ""));
    const hasText = text.length > 0;
    // Keep the ✕ and the counter in sync with a controlled value.
    React.useEffect(() => {
      if (value !== undefined) setText(String(value));
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setText(event.target.value);
      onChange?.(event);
      if ((onChange as unknown) !== onValueChange) onValueChange?.(event.target.value);
    };

    const clear = () => {
      const el = innerRef.current;
      if (el) {
        // Use the native value setter + an input event so React's onChange fires —
        // this clears both controlled (parent state updates) and uncontrolled inputs.
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        setter?.call(el, "");
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.focus();
      }
      setText("");
      onClear?.();
    };

    // antd `allowClear`, incl. its `{ clearIcon, label }` form — the SAME `resolveAllowClear` the
    // select family routes through, so "clear this field" is one mechanism across the library.
    // The `clearable` fallback is `false`: a text field does not grow a ✕ unless asked.
    const clearControl = resolveAllowClear(allowClear, false, t("common.clear") ?? "Clear");
    const chrome = CONTROL_VARIANT_CHROME_CLASS[variant];
    const counter = resolveControlCount(count, text);
    // `prefix`/`suffix` are antd's names for content pinned inside the box; `leadingIcon`/
    // `trailingIcon` are this library's older names for the same two slots. One node per slot:
    // whichever is given wins, and `leadingIcon` stays the decorative (aria-hidden) form.
    const leading = prefix ?? leadingIcon;
    const leadingIsDecorative = prefix == null;
    const hasAddon = addonBefore != null || addonAfter != null;

    // Fast path: no affix at all → a bare <input>, unchanged.
    if (
      !clearControl.enabled &&
      leading == null &&
      trailingIcon == null &&
      suffix == null &&
      !counter
    ) {
      const bare = (
        <input
          type={type}
          data-slot="input"
          data-size={size}
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(inputBaseClass, chrome, className)}
          {...props}
          {...nameFallback}
          {...identity}
          {...appearance}
        />
      );
      return hasAddon ? withAddons(bare, addonBefore, addonAfter, size, appearance) : bare;
    }

    const showClear = clearControl.enabled && hasText && !props.disabled && !props.readOnly;
    // ONE trailing icon, never two: the clear ✕ REPLACES the configured trailingIcon while
    // the field holds a clearable value; otherwise the trailingIcon shows.
    const trailing = showClear ? (
      <button
        type="button"
        tabIndex={-1}
        aria-label={clearControl.label}
        onClick={clear}
        className="ui-control-inline-affix-action"
      >
        {clearControl.clearIcon ?? (
          <X className="ui-control-inline-affix-icon" aria-hidden="true" />
        )}
      </button>
    ) : (
      (suffix ?? trailingIcon)
    );

    const affixed = (
      <span data-slot="input-affix-wrapper" className="ui-input-affix-wrapper">
        {leading != null ? (
          <span
            data-slot="input-leading"
            aria-hidden={leadingIsDecorative ? "true" : undefined}
            className="ui-input-leading"
          >
            {leading}
          </span>
        ) : null}
        <input
          type={type}
          data-slot="input"
          data-size={size}
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            inputBaseClass,
            chrome,
            leading != null && "ui-input--leading-affix",
            (trailing != null || counter !== null) && "ui-input--trailing-affix",
            className,
          )}
          {...props}
          {...nameFallback}
          {...identity}
          {...appearance}
        />
        {trailing != null || counter !== null ? (
          <span className="ui-input-trailing">
            {counter ? (
              <span
                data-slot="input-count"
                data-exceeded={counter.exceeded ? "true" : undefined}
                className="ui-control-count"
                aria-hidden="true"
              >
                {counter.content}
              </span>
            ) : null}
            {trailing}
          </span>
        ) : null}
      </span>
    );

    return hasAddon ? withAddons(affixed, addonBefore, addonAfter, size, appearance) : affixed;
  },
);
Input.displayName = "Input";

/**
 * antd `addonBefore` / `addonAfter` — segments welded OUTSIDE the field's own box, sharing its
 * height and closing its corners on the joined side. They are NOT affixes: an addon is a separate
 * surface (a protocol, a currency, a unit, a button), which is why it lives outside the border
 * rather than inside the padding.
 */
function withAddons(
  field: React.ReactNode,
  addonBefore: React.ReactNode,
  addonAfter: React.ReactNode,
  size: "sm" | "md" | "lg" | undefined,
  appearance: { "data-status"?: string; "data-variant"?: string },
) {
  return (
    <span
      data-slot="input-group"
      data-size={size}
      data-status={appearance["data-status"]}
      className="ui-input-group"
    >
      {addonBefore != null ? (
        <span data-slot="input-addon-before" className="ui-input-addon">
          {addonBefore}
        </span>
      ) : null}
      {field}
      {addonAfter != null ? (
        <span data-slot="input-addon-after" className="ui-input-addon">
          {addonAfter}
        </span>
      ) : null}
    </span>
  );
}
