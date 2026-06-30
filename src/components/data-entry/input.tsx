import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
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
  "ui-control border-input bg-background w-full min-w-0 rounded-[var(--control-radius)] transition-[color,box-shadow] outline-none",
  "selection:bg-primary selection:text-primary-foreground",
  "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
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
        className="text-muted-foreground hover:text-foreground inline-flex size-5 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    ) : (
      trailingIcon
    );

    return (
      <span data-slot="input-affix-wrapper" className="relative inline-flex w-full items-center">
        {leadingIcon != null ? (
          <span
            data-slot="input-leading"
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute inset-y-0 start-2 inline-flex items-center"
          >
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
            leadingIcon != null && "ps-9",
            (showClear || trailingIcon != null) && "pe-9",
            className,
          )}
          {...props}
        />
        {trailing != null ? (
          <span className="absolute inset-y-0 end-2 inline-flex items-center">{trailing}</span>
        ) : null}
      </span>
    );
  },
);
Input.displayName = "Input";
