import * as React from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { applyMaxTagCount, controlSurfaceAttrs } from "../data-entry/control-surface";
import type {
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
      name,
      className,
      id,
      "aria-label": ariaLabel,
      size,
      status,
      variant,
      maxCount,
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
      // Enter always commits — it is the field's submit gesture, not a separator character.
      if (e.key === "Enter" || tokenSeparators.includes(e.key)) {
        e.preventDefault();
        add(draft);
        setDraft("");
      } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
        removeAt(tags.length - 1);
      }
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
                    disabled: Boolean(disabled),
                    onClose: () => removeAt(chip.index),
                  })
                ) : (
                  <>
                    {chip.value}
                    {!disabled ? (
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
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
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
            if (draft.trim()) {
              add(draft);
              setDraft("");
            }
          }}
        />
        <span aria-live="polite" className="sr-only" data-slot="tag-input-status">
          {t("ui.tagInput.tagCount", { count: tags.length })}
        </span>
        {name ? <input type="hidden" name={name} value={tags.join(",")} /> : null}
      </div>
    );
  },
);
TagInput.displayName = "TagInput";
