import * as React from "react";
import { X } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";

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
};

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
      commit([...tags, tag]);
    };
    const removeAt = (i: number) => commit(tags.filter((_, idx) => idx !== i));

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        add(draft);
        setDraft("");
      } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
        removeAt(tags.length - 1);
      }
    };

    return (
      <div
        data-slot="tag-input"
        className={cn("ui-tag-input", disabled && "ui-tag-input-disabled", className)}
      >
        {tags.length > 0 ? (
          <ul role="list" className="ui-tag-input-list" data-slot="tag-input-list">
            {tags.map((tag, i) => (
              <li
                key={tag}
                role="listitem"
                className="ui-tag-input-chip"
                data-slot="tag-input-chip"
              >
                {tag}
                {!disabled ? (
                  <button
                    type="button"
                    className="ui-tag-input-remove"
                    aria-label={t("ui.tagInput.removeTag", { tag })}
                    onClick={() => removeAt(i)}
                  >
                    <X aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            ))}
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
