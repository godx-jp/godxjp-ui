import * as React from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import {
  applyMaxTagCount,
  controlSurfaceAttrs,
  resolveAllowClear,
} from "../data-entry/control-surface";
import type {
  AllowClearProp,
  ControlStatusProp,
  ControlVariantProp,
  MaxTagCountProp,
  MaxTagPlaceholderProp,
  SizeProp,
} from "../../props/vocabulary";

/**
 * TagInput is this library's answer to antd's `Select mode="tags"` — a free-text token field — so
 * it takes the same token-level props antd puts on that mode.
 */
export type TagInputProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Read-only: the tags stay visible, selectable and submitted, but nothing can be added or
   * removed — the draft field is read-only, the chip removers and the clear ✕ are withdrawn, and
   * the container reports `aria-readonly`. Mirrors Select's readOnly contract (still focusable and
   * still in the tab order, unlike `disabled`).
   */
  readOnly?: boolean;
  name?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  /** Control height tier (antd `size`) — the shared `--control-height` ladder. */
  size?: SizeProp;
  /** Validation status (antd `status`). `error` also sets `aria-invalid`; `warning` recolours only. */
  status?: ControlStatusProp;
  /** Control surface (antd `variant`). Default `outlined`. */
  variant?: ControlVariantProp;
  /** Hard ceiling on how many tags may be held (antd `maxCount`). Further input is refused. */
  maxCount?: number;
  /**
   * antd `allowClear` — a single ✕ that drops EVERY tag at once. Off by default (antd's own
   * default for a tags field). The object form replaces the icon and/or the accessible label.
   */
  allowClear?: AllowClearProp;
  /** Fired after every tag is dropped through the ✕ (antd `onClear`). */
  onClear?: () => void;
  /** How many chips render before the rest collapse into the overflow node (antd `maxTagCount`). */
  maxTagCount?: MaxTagCountProp;
  /** The node standing in for what `maxTagCount` hid (antd `maxTagPlaceholder`). */
  maxTagPlaceholder?: MaxTagPlaceholderProp;
  /** Render one chip yourself (antd `tagRender`) — receives the value and an `onClose` remover. */
  tagRender?: (props: {
    value: string;
    label: React.ReactNode;
    onClose: () => void;
    index: number;
    disabled: boolean;
  }) => React.ReactNode;
  /**
   * Characters that commit the draft into a tag (antd `tokenSeparators`). Default `[","]`; Enter
   * always commits and is not a separator. Pasting a run containing a separator splits it into
   * several tags, which is antd's behaviour and the reason the prop exists.
   */
  tokenSeparators?: string[];
};

/** Escape a separator so it is a literal inside the `[...]` character class built from the list. */
function escapeForCharClass(character: string): string {
  return character.replace(/[\\\]^-]/g, "\\$&");
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value,
      defaultValue = [],
      onValueChange,
      placeholder,
      disabled,
      readOnly,
      name,
      className,
      id,
      "aria-label": ariaLabel,
      size,
      status,
      variant,
      maxCount,
      allowClear,
      onClear,
      maxTagCount,
      maxTagPlaceholder,
      tagRender,
      tokenSeparators = [","],
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const tags = value ?? internal;
    const [draft, setDraft] = React.useState("");

    const commit = (next: string[]) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const add = (raw: string) => {
      const tag = raw.trim();
      if (!tag || tags.includes(tag)) return;
      // antd `maxCount` — a HARD ceiling, not a hint: the tag is refused rather than accepted and
      // trimmed later, so the value handed to `onValueChange` is never over the limit.
      if (maxCount !== undefined && tags.length >= maxCount) return;
      commit([...tags, tag]);
    };
    /** Commit a run of text, splitting it on every `tokenSeparators` entry (antd's paste contract). */
    const addAll = (raw: string) => {
      let next = [...tags];
      const pieces = tokenSeparators.length
        ? raw.split(new RegExp(`[${tokenSeparators.map(escapeForCharClass).join("")}]`))
        : [raw];
      for (const piece of pieces) {
        const tag = piece.trim();
        if (!tag || next.includes(tag)) continue;
        if (maxCount !== undefined && next.length >= maxCount) break;
        next = [...next, tag];
      }
      if (next.length !== tags.length) commit(next);
    };
    const removeAt = (i: number) => commit(tags.filter((_, idx) => idx !== i));

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) return;
      // JAPANESE INPUT: between compositionstart and compositionend the box holds a CANDIDATE, and
      // the Enter that ends a conversion is "accept this 変換", not "commit this field". Without
      // this guard「とうきょう」→「東京」would land a half-converted reading as a tag and swallow
      // the keystroke the IME needed. `isComposing` is the DOM's own answer (KeyboardEvent.
      // isComposing, UI Events §5.1.4) and is what NumberInput/SearchInput/Textarea already read.
      if (e.nativeEvent.isComposing) return;
      // Enter always commits — it is the field's submit gesture, not a separator character.
      if (e.key === "Enter" || tokenSeparators.includes(e.key)) {
        e.preventDefault();
        add(draft);
        setDraft("");
      } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
        removeAt(tags.length - 1);
      }
    };

    // antd `allowClear` — OFF unless asked for (a tags field clears one chip at a time by default).
    // Withdrawn while disabled/read-only/empty, exactly like Input's and Select's ✕.
    const clearControl = resolveAllowClear(allowClear, false, t("common.clear"));
    const showClear = clearControl.enabled && tags.length > 0 && !disabled && !readOnly;
    const clearAll = () => {
      commit([]);
      onClear?.();
    };

    const chips = tags.map((tag, index) => ({ value: tag, label: tag, index }));
    const {
      visible: visibleChips,
      omitted: omittedChips,
      overflow,
    } = applyMaxTagCount(chips, maxTagCount, maxTagPlaceholder);

    return (
      <div
        data-slot="tag-input"
        // The disabled state dims the whole control (chips + field) to `--disabled-opacity`;
        // that composite lowers the chip text/background pair below the WCAG AA contrast
        // threshold. Marking the container `aria-disabled` makes it an INACTIVE control, which
        // WCAG 1.4.3 exempts from contrast and which axe honours (it skips color-contrast on any
        // node under `aria-disabled="true"`) — the same exemption native disabled form controls
        // get for free.
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        // The same `variant` × `status` × `size` matrix the select family reads, so a form row
        // holding a Select and a TagInput cannot end up with two different fields.
        {...controlSurfaceAttrs({ variant, status, size })}
        aria-invalid={status === "error" ? true : undefined}
        className={cn(
          "ui-tag-input ui-control-surface",
          disabled && "ui-tag-input-disabled",
          className,
        )}
      >
        {tags.length > 0 ? (
          <ul role="list" className="ui-tag-input-list" data-slot="tag-input-list">
            {visibleChips.map((chip) => (
              <li
                key={chip.value}
                role="listitem"
                className="ui-tag-input-chip"
                data-slot="tag-input-chip"
              >
                {/* antd `tagRender` replaces the chip BODY. The remover it receives is the same
                    `removeAt` the built-in ✕ calls, so a custom chip cannot end up unremovable. */}
                {tagRender ? (
                  tagRender({
                    value: chip.value,
                    label: chip.label,
                    index: chip.index,
                    disabled: Boolean(disabled) || Boolean(readOnly),
                    onClose: () => removeAt(chip.index),
                  })
                ) : (
                  <>
                    {chip.value}
                    {!disabled && !readOnly ? (
                      <button
                        type="button"
                        className="ui-tag-input-remove"
                        aria-label={t("ui.tagInput.removeTag", { tag: chip.value })}
                        onClick={() => removeAt(chip.index)}
                      >
                        <X aria-hidden="true" />
                      </button>
                    ) : null}
                  </>
                )}
              </li>
            ))}
            {omittedChips.length > 0 ? (
              <li role="listitem" className="ui-tag-input-chip" data-slot="tag-input-overflow">
                {overflow ?? t("dataEntry.selection.overflow", { count: omittedChips.length })}
              </li>
            ) : null}
          </ul>
        ) : null}
        <input
          ref={ref}
          id={id}
          type="text"
          className="ui-tag-input-field"
          value={draft}
          placeholder={tags.length === 0 && !readOnly ? placeholder : undefined}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel ?? t("ui.tagInput.inputLabel")}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={(e) => {
            // A pasted "a, b, c" is three tags, not one — that is what `tokenSeparators` buys, and
            // it is the whole reason a bulk paste from a spreadsheet is usable at all.
            const text = e.clipboardData.getData("text");
            if (!tokenSeparators.some((separator) => text.includes(separator))) return;
            e.preventDefault();
            addAll(text);
            setDraft("");
          }}
          onBlur={() => {
            // DELIBERATE DIVERGENCE from antd, which DISCARDS the draft on blur: a half-typed tag
            // that vanishes when the user tabs to the next field is a silent data loss, and the
            // count/✕ would disagree with what the box showed. Committing is the recoverable
            // choice — the chip is visible and removable.
            if (readOnly) return;
            if (draft.trim()) {
              add(draft);
              setDraft("");
            }
          }}
        />
        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={clearControl.label}
            data-slot="tag-input-clear"
            className="ui-control-inline-affix-action ui-tag-input-clear"
            onClick={clearAll}
          >
            {clearControl.clearIcon ?? (
              <X className="ui-control-inline-affix-icon" aria-hidden="true" />
            )}
          </button>
        ) : null}
        <span aria-live="polite" className="sr-only" data-slot="tag-input-status">
          {t("ui.tagInput.tagCount", { count: tags.length })}
        </span>
        {name ? <input type="hidden" name={name} value={tags.join(",")} /> : null}
      </div>
    );
  },
);
TagInput.displayName = "TagInput";
