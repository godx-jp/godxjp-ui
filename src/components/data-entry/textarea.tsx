import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { controlMultilineClass } from "../../lib/control-styles";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Show an inline ✕ (top-end) that clears the field while it holds text (default false). */
  allowClear?: boolean;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, allowClear = false, onClear, value, defaultValue, onChange, ...props }, ref) => {
    const { t } = useTranslation();
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref],
    );

    const [hasText, setHasText] = React.useState(
      () => String(value ?? defaultValue ?? "").length > 0,
    );
    React.useEffect(() => {
      if (value !== undefined) setHasText(String(value).length > 0);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) setHasText(event.target.value.length > 0);
      onChange?.(event);
    };

    const clear = () => {
      const el = innerRef.current;
      if (el) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        )?.set;
        setter?.call(el, "");
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.focus();
      }
      setHasText(false);
      onClear?.();
    };

    if (!allowClear) {
      return (
        <textarea
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={cn(controlMultilineClass, className)}
          {...props}
        />
      );
    }

    const showClear = hasText && !props.disabled && !props.readOnly;

    return (
      <span data-slot="textarea-affix-wrapper" className="relative block w-full">
        <textarea
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(controlMultilineClass, showClear && "pe-9", className)}
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={t("common.clear") ?? "Clear"}
            onClick={clear}
            className="text-muted-foreground hover:text-foreground absolute end-2 top-2 inline-flex size-5 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    );
  },
);
Textarea.displayName = "Textarea";
