import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { useFieldIdentity } from "../../lib/field-a11y";
import { controlMultilineClass, controlMultilineGhostClass } from "../../lib/control-styles";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Show an inline ✕ (top-end) that clears the field while it holds text (default false). */
  allowClear?: boolean;
  /** Called after the field is cleared via the inline ✕. */
  onClear?: () => void;
  /**
   * `ghost` strips the field's own border, background and focus ring, for a textarea embedded in a
   * surface that already draws the box (a chat composer inside a Card). The surface then owns
   * focus — give it `focus-within`.
   */
  variant?: "default" | "ghost";
  /**
   * The floor is `minRows` (or `rows`, when that is the only one given) and never undercuts the
   * `--control-height` tier; past `maxRows` the control stops growing and scrolls internally.
   * Sizing is done in CSS by a hidden replica of the text, so it follows a paste, a programmatic
   * value change, a font swap and a container resize — not just typing — and it never writes
   * `style.height` or reads `scrollHeight`.
   */
  autoGrow?: boolean;
  /**
   * Floor in text rows while `autoGrow` (theme default `--textarea-autogrow-min-height-rows`, 1).
   * Ignored when `autoGrow` is false.
   */
  minRows?: number;
  /**
   * Ceiling in text rows while `autoGrow` (theme default `--textarea-autogrow-max-height-rows`,
   * 8); beyond it the control scrolls internally rather than pushing the page. Pass `0` for no
   * ceiling — only correct inside an owning scroll container.
   */
  maxRows?: number;
};

/** `maxRows={0}` means "no ceiling" — CSS says that as an infinite length, not as zero rows. */
const UNBOUNDED_ROWS = "infinity";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      allowClear = false,
      onClear,
      variant = "default",
      autoGrow = false,
      minRows,
      maxRows,
      rows,
      style,
      value,
      defaultValue,
      onChange,
      onCompositionStart,
      onCompositionEnd,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const base = variant === "ghost" ? controlMultilineGhostClass : controlMultilineClass;
    // `{}` in every other
    // case (see useFieldIdentity), so a standalone Textarea is untouched.
    const identity = useFieldIdentity({
      id: props.id,
      name: props.name,
      "data-field": (props as { "data-field"?: string })["data-field"],
    });
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

    /**
     * The text the CSS mirror replicates. Seeded from the initial value so the very first paint
     * is already the right height — the box must never render at one row and jump.
     */
    const [mirror, setMirror] = React.useState(() => String(value ?? defaultValue ?? ""));
    /**
     * An IME composition (ja / vi) fires `input` on every intermediate candidate. Resizing on
     * those visibly jitters the box and can dismiss the candidate window, so the mirror is held
     * still between `compositionstart` and `compositionend` and re-synced once, at the end.
     */
    const composing = React.useRef(false);
    const syncMirror = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || composing.current) return;
      setMirror(el.value);
    }, []);

    /**
     * Runs after EVERY render, before paint. That is what makes a programmatic change resize: a
     * controlled `value` set from outside, a restored draft arriving after mount, a changed
     * `defaultValue`.
     */
    React.useLayoutEffect(() => {
      if (autoGrow) syncMirror();
    });

    /** `form.reset()` restores an uncontrolled value without rendering anything. */
    React.useEffect(() => {
      const form = innerRef.current?.form;
      if (!autoGrow || !form) return;
      const onReset = () => {
        // The reset applies after the event, so measure on the next frame of the task queue.
        queueMicrotask(syncMirror);
      };
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, [autoGrow, syncMirror]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) setHasText(event.target.value.length > 0);
      if (autoGrow && !composing.current) setMirror(event.target.value);
      onChange?.(event);
    };

    const handleCompositionStart = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      composing.current = true;
      onCompositionStart?.(event);
    };

    const handleCompositionEnd = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      composing.current = false;
      if (autoGrow) setMirror(event.currentTarget.value);
      onCompositionEnd?.(event);
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
      if (autoGrow) setMirror("");
      onClear?.();
    };

    const floorRows = minRows ?? (typeof rows === "number" ? rows : undefined);
    const autoGrowVars = autoGrow
      ? ({
          ...(floorRows === undefined
            ? null
            : { "--textarea-autogrow-min-height-rows": floorRows }),
          ...(maxRows === undefined
            ? null
            : {
                "--textarea-autogrow-max-height-rows": maxRows === 0 ? UNBOUNDED_ROWS : maxRows,
              }),
        } as React.CSSProperties)
      : undefined;

    const showClear = allowClear && hasText && !props.disabled && !props.readOnly;
    const needsWrapper = allowClear || autoGrow;

    const field = (
      <textarea
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        /* In `autoGrow` the intrinsic `rows` height would become a floor the ceiling could not
         * clamp, so the attribute drops to its minimum and the row count is carried by the
         * `--textarea-autogrow-*-rows` knobs instead. */
        rows={autoGrow ? 1 : rows}
        onChange={needsWrapper ? handleChange : onChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        style={style}
        className={cn(base, showClear && "ui-input--trailing-affix", className)}
        {...props}
        {...identity}
      />
    );

    if (!needsWrapper) return field;

    return (
      <span
        data-slot="textarea-affix-wrapper"
        data-autogrow-value={autoGrow ? mirror : undefined}
        style={autoGrowVars}
        className={cn(
          "relative w-full",
          autoGrow ? "grid" : "block",
          autoGrow && "ui-textarea-autogrow",
          autoGrow && variant === "ghost" && "ui-textarea-autogrow--ghost",
        )}
      >
        {field}
        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={t("common.clear") ?? "Clear"}
            onClick={clear}
            className="ui-control-inline-affix-action ui-textarea-clear"
          >
            <X className="ui-control-inline-affix-icon" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    );
  },
);
Textarea.displayName = "Textarea";
