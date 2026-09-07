import * as React from "react";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { useFieldIdentity } from "../../lib/field-a11y";
import {
  controlMultilineClass,
  controlMultilineFilledClass,
  controlMultilineGhostClass,
} from "../../lib/control-styles";
import { controlAppearanceAttributes, resolveControlCount } from "./control-appearance";
import type { ControlVariantProp } from "../../props/vocabulary";

import type { TextareaProp } from "../../props/components/data-entry.prop";

export type {
  TextareaProp,
  TextareaProp as TextareaProps,
} from "../../props/components/data-entry.prop";

/** `maxRows={0}` means "no ceiling" — CSS says that as an infinite length, not as zero rows. */
const UNBOUNDED_ROWS = "infinity";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProp>(
  (
    {
      className,
      allowClear = false,
      onClear,
      variant = "outlined",
      status,
      size,
      autoGrow = false,
      autoSize,
      minRows,
      maxRows,
      count,
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
    // `default`/`ghost` are this library's older spellings of antd's `outlined`/`borderless`.
    // Folding them here keeps ONE axis in the DOM and in CSS, so a consumer reading
    // `[data-variant]` never has to know which spelling the call site used.
    const resolvedVariant: ControlVariantProp =
      variant === "default" ? "outlined" : variant === "ghost" ? "borderless" : variant;
    const base =
      resolvedVariant === "borderless"
        ? controlMultilineGhostClass
        : resolvedVariant === "filled"
          ? controlMultilineFilledClass
          : controlMultilineClass;
    // antd `autoSize`: `true` is the boolean `autoGrow`, and the object form carries the row
    // bounds with it. An explicit `minRows`/`maxRows` still wins, so the two spellings compose.
    const autoSizeEnabled = autoSize === true || typeof autoSize === "object";
    const growing = autoGrow || autoSizeEnabled;
    const floorRowsProp = minRows ?? (typeof autoSize === "object" ? autoSize.minRows : undefined);
    const ceilRowsProp = maxRows ?? (typeof autoSize === "object" ? autoSize.maxRows : undefined);
    const appearance = controlAppearanceAttributes({
      status,
      variant: resolvedVariant,
      "aria-invalid": props["aria-invalid"],
    });
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

    const [text, setText] = React.useState(() => String(value ?? defaultValue ?? ""));
    const hasText = text.length > 0;
    React.useEffect(() => {
      if (value !== undefined) setText(String(value));
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
      if (growing) syncMirror();
    });

    /** `form.reset()` restores an uncontrolled value without rendering anything. */
    React.useEffect(() => {
      const form = innerRef.current?.form;
      if (!growing || !form) return;
      const onReset = () => {
        // The reset applies after the event, so measure on the next frame of the task queue.
        queueMicrotask(syncMirror);
      };
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    }, [growing, syncMirror]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) setText(event.target.value);
      if (growing && !composing.current) setMirror(event.target.value);
      onChange?.(event);
    };

    const handleCompositionStart = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      composing.current = true;
      onCompositionStart?.(event);
    };

    const handleCompositionEnd = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      composing.current = false;
      if (growing) setMirror(event.currentTarget.value);
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
      setText("");
      if (growing) setMirror("");
      onClear?.();
    };

    const floorRows = floorRowsProp ?? (typeof rows === "number" ? rows : undefined);
    const autoGrowVars = growing
      ? ({
          ...(floorRows === undefined
            ? null
            : { "--textarea-autogrow-min-height-rows": floorRows }),
          ...(ceilRowsProp === undefined
            ? null
            : {
                "--textarea-autogrow-max-height-rows":
                  ceilRowsProp === 0 ? UNBOUNDED_ROWS : ceilRowsProp,
              }),
        } as React.CSSProperties)
      : undefined;

    const showClear = allowClear && hasText && !props.disabled && !props.readOnly;
    const counter = resolveControlCount(count, text);
    const needsWrapper = allowClear || growing || counter !== null;

    const field = (
      <textarea
        ref={setRefs}
        value={value}
        defaultValue={defaultValue}
        /* In `autoGrow` the intrinsic `rows` height would become a floor the ceiling could not
         * clamp, so the attribute drops to its minimum and the row count is carried by the
         * `--textarea-autogrow-*-rows` knobs instead. */
        rows={growing ? 1 : rows}
        data-size={size}
        onChange={needsWrapper ? handleChange : onChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        style={style}
        className={cn(base, showClear && "ui-input--trailing-affix", className)}
        {...props}
        {...identity}
        {...appearance}
      />
    );

    if (!needsWrapper) return field;

    return (
      <span
        data-slot="textarea-affix-wrapper"
        data-autogrow-value={growing ? mirror : undefined}
        style={autoGrowVars}
        className={cn(
          "relative w-full",
          growing ? "grid" : "block",
          growing && "ui-textarea-autogrow",
          growing && resolvedVariant === "borderless" && "ui-textarea-autogrow--ghost",
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
        {counter ? (
          <span
            data-slot="textarea-count"
            data-exceeded={counter.exceeded ? "true" : undefined}
            className="ui-control-count ui-textarea-count"
            aria-hidden="true"
          >
            {counter.content}
          </span>
        ) : null}
      </span>
    );
  },
);
Textarea.displayName = "Textarea";
