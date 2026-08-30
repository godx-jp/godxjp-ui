import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { useFieldNameFallback } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Show an inline ✕ that clears the field while it holds text (default false). */
  allowClear?: boolean;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
  /**
   * A leading affordance pinned inside the start of the field — e.g. a mail or
   * search icon (the common auth/search pattern). Decorative by default; the
   * input keeps the keyboard focus. Pairs with `trailingIcon`/`allowClear`.
   */
  leadingIcon?: React.ReactNode;
  /**
   * A trailing affordance pinned inside the field — e.g. a calendar / clock popover
   * trigger button. ONE trailing icon shows at a time: when `allowClear` and the field
   * holds a value the clear ✕ REPLACES this icon; otherwise this icon shows. Never both.
   */
  trailingIcon?: React.ReactNode;
};

const inputBaseClass = [
  "ui-control ui-input border-input bg-background w-full rounded-[var(--control-radius)] transition-[color,box-shadow] outline-none",
  "selection:bg-primary selection:text-primary-foreground",
  "placeholder:text-muted-foreground",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
];

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      allowClear = false,
      onClear,
      leadingIcon,
      trailingIcon,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    // gh#303 — last-resort accessible label from an enclosing FormField, for inputs NESTED under
    // a layout wrapper (range from/to, 年/月) that the cloneElement contract cannot reach. `{}`
    // whenever the input is already labelled, so it never overrides props. (Wording note: the
    // API-manifest generator greps the source for bare inherited-prop words — keep this comment
    // free of the standalone word for the native form-submission attribute.)
    const nameFallback = useFieldNameFallback({
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
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

    const [hasText, setHasText] = React.useState(
      () => String(value ?? defaultValue ?? "").length > 0,
    );
    // Keep the ✕ visibility in sync with a controlled value.
    React.useEffect(() => {
      if (value !== undefined) setHasText(String(value).length > 0);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setHasText(event.target.value.length > 0);
      onChange?.(event);
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
      setHasText(false);
      onClear?.();
    };

    // Fast path: no affix at all → a bare <input>, unchanged.
    if (!allowClear && trailingIcon == null && leadingIcon == null) {
      return (
        <input
          type={type}
          data-slot="input"
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={cn(inputBaseClass, className)}
          {...props}
          {...nameFallback}
        />
      );
    }

    const showClear = allowClear && hasText && !props.disabled && !props.readOnly;
    // ONE trailing icon, never two: the clear ✕ REPLACES the configured trailingIcon while
    // the field holds a clearable value; otherwise the trailingIcon shows.
    const trailing = showClear ? (
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("common.clear") ?? "Clear"}
        onClick={clear}
        className="ui-control-inline-affix-action"
      >
        <X className="ui-control-inline-affix-icon" aria-hidden="true" />
      </button>
    ) : (
      trailingIcon
    );

    return (
      <span data-slot="input-affix-wrapper" className="ui-input-affix-wrapper">
        {leadingIcon != null ? (
          <span data-slot="input-leading" aria-hidden="true" className="ui-input-leading">
            {leadingIcon}
          </span>
        ) : null}
        <input
          type={type}
          data-slot="input"
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            inputBaseClass,
            leadingIcon != null && "ui-input--leading-affix",
            (showClear || trailingIcon != null) && "ui-input--trailing-affix",
            className,
          )}
          {...props}
          {...nameFallback}
        />
        {trailing != null ? <span className="ui-input-trailing">{trailing}</span> : null}
      </span>
    );
  },
);
Input.displayName = "Input";
