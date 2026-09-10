import * as React from "react";
import { SendHorizontal, Square } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { omitFieldA11y, pickFieldA11y, useFieldIdentity } from "../../lib/field-a11y";
import { Button } from "../general/button";
import { Textarea } from "./textarea";
import { controlSurfaceAttrs, resolveAriaInvalid } from "./control-surface";

import type { ChatComposerProp } from "../../props/components/data-entry.prop";

export type {
  ChatComposerProp,
  ChatComposerProp as ChatComposerProps,
  ChatComposerSubmitTypeProp,
} from "../../props/components/data-entry.prop";

/** A draft that is only spaces, tabs or newlines is not a message. */
function isSendable(text: string): boolean {
  return text.trim().length > 0;
}

/**
 * ChatComposer — the message input of a conversation (Ant Design X `Sender`).
 *
 * ## Why a component and not a composition
 *
 * Three behaviours live here and nowhere else, and every app that hand-rolls a composer gets at
 * least one of them wrong:
 *
 * 1. **An IME conversion is not a message.** Between `compositionstart` and `compositionend` the
 *    text in the box is a CANDIDATE being converted, and the `Enter` that accepts it belongs to
 *    the IME. A composer that reads that `Enter` as "send" makes Japanese and Vietnamese input
 *    impossible — the first kanji conversion sends a half-written line. The guard is a ref, not
 *    state, because it has to be readable inside the keydown that fires between the two events.
 * 2. **One trailing action at a time.** While a response streams the send button IS the cancel
 *    button — the same discipline as the picker trailing-action rule. Rendering both is how a
 *    user cancels by aiming for send.
 * 3. **The draft box is the focus target.** `ref`, `id`, `name` and the whole `FormField`
 *    label/helper/error contract land on the `<textarea>`, not on the frame, so a composer inside
 *    a `FormField` is labelled and described exactly like an `Input`.
 *
 * Everything visible is a real primitive: the draft box is `Textarea` (`variant="borderless"`, so
 * the frame is the only boundary) and every action is a `Button`.
 */
export const ChatComposer = React.forwardRef<HTMLTextAreaElement, ChatComposerProp>(
  (
    {
      className,
      id,
      name,
      value,
      defaultValue,
      onValueChange,
      onSubmit,
      onCancel,
      loading = false,
      submitType = "enter",
      placeholder,
      disabled = false,
      readOnly = false,
      header,
      prefix,
      footer,
      actions,
      size,
      maxLength,
      status,
      submitLabel,
      cancelLabel,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
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

    /*
     * The draft is mirrored here even when `value` is controlled, because the send button's
     * enabled state and the submit path both need the CURRENT text, and a controlled parent that
     * forgets `onValueChange` would otherwise leave them reading a value that never moves. The
     * mirror follows `value` whenever it changes, so the controlled parent still wins.
     */
    const [draft, setDraft] = React.useState(() => String(value ?? defaultValue ?? ""));
    React.useEffect(() => {
      if (value !== undefined) setDraft(String(value));
    }, [value]);

    /** True between `compositionstart` and `compositionend` — see the note above. */
    const composing = React.useRef(false);

    // The naming/validation contract belongs to the `<textarea>` ALONE. Leaving it in the frame's
    // spread too would put `aria-label` on a plain `<div>` as well, and a screen reader would then
    // meet the same name twice — once on a group with no role and once on the control.
    const fieldA11y = pickFieldA11y(props);
    const rest = omitFieldA11y(props);
    const identity = useFieldIdentity({ id, name, "data-field": props["data-field"] });
    const surface = controlSurfaceAttrs({ status, size });

    const canSubmit = isSendable(draft) && !disabled && !readOnly && !loading;

    const submit = React.useCallback(() => {
      const text = innerRef.current?.value ?? draft;
      if (!isSendable(text) || disabled || readOnly || loading) return;
      onSubmit?.(text);
    }, [draft, disabled, readOnly, loading, onSubmit]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      // A consumer (ChatSuggestion) that handled the key owns it — Enter picked a suggestion, it
      // did not send a message.
      if (event.defaultPrevented) return;
      if (event.key !== "Enter") return;
      // `isComposing` is the standards answer and `keyCode === 229` the legacy one; the ref covers
      // the browsers (and the test harness) that report neither on the keydown itself.
      if (
        composing.current ||
        event.nativeEvent.isComposing ||
        (event.nativeEvent as KeyboardEvent).keyCode === 229
      ) {
        return;
      }
      const wantsSend = submitType === "enter" ? !event.shiftKey : event.shiftKey;
      if (!wantsSend) return;
      // A newline is what the OTHER modifier does; sending must not also leave one behind.
      event.preventDefault();
      submit();
    };

    const sendName = submitLabel ?? t("dataEntry.chatComposer.send");
    const cancelName = cancelLabel ?? t("dataEntry.chatComposer.cancel");
    /*
     * The trailing action follows the composer's own size step, using Button's official icon
     * rungs rather than a bare `icon` (whose square reads the ambient `--control-height` and would
     * therefore drop to 24px at `size="xs"` with no coarse-pointer floor). `icon-xs` carries rule
     * #24's `pointer: coarse` bump; a touch target must not shrink because the box did.
     */
    const actionSize =
      size === "xs" ? "icon-xs" : size === "sm" ? "icon-sm" : size === "lg" ? "icon-lg" : "icon";

    return (
      <div
        data-slot="chat-composer"
        data-disabled={disabled ? "" : undefined}
        data-loading={loading ? "" : undefined}
        data-submit-type={submitType}
        aria-busy={loading || undefined}
        className={cn("ui-chat-composer ui-control-surface", className)}
        {...rest}
        {...surface}
      >
        {header ? (
          <div data-slot="chat-composer-header" className="ui-chat-composer-header">
            {header}
          </div>
        ) : null}

        <div data-slot="chat-composer-row" className="ui-chat-composer-row">
          {prefix ? (
            <div data-slot="chat-composer-prefix" className="ui-chat-composer-prefix">
              {prefix}
            </div>
          ) : null}

          <Textarea
            ref={setRefs}
            id={id}
            name={name}
            variant="borderless"
            autoGrow
            className="ui-chat-composer-field"
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder ?? t("dataEntry.chatComposer.placeholder")}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            status={status}
            aria-invalid={resolveAriaInvalid(fieldA11y["aria-invalid"], status)}
            onValueChange={(next) => {
              if (value === undefined) setDraft(next);
              onValueChange?.(next);
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            {...fieldA11y}
            {...identity}
          />

          <div data-slot="chat-composer-actions" className="ui-chat-composer-actions">
            {actions}
            {/* ONE trailing action, never two: while a response streams the send button IS the
                cancel button. Both are icon-only, so both carry a t()-routed accessible name. */}
            {loading ? (
              <Button
                type="button"
                size={actionSize}
                variant="secondary"
                aria-label={cancelName}
                onClick={onCancel}
                disabled={disabled}
              >
                <Square aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                size={actionSize}
                aria-label={sendName}
                onClick={submit}
                disabled={!canSubmit}
              >
                <SendHorizontal aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        {footer ? (
          <div data-slot="chat-composer-footer" className="ui-chat-composer-footer">
            {footer}
          </div>
        ) : null}
      </div>
    );
  },
);
ChatComposer.displayName = "ChatComposer";
