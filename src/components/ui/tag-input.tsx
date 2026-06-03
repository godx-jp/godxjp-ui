import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

export type TagInputProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
};

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value, defaultValue = [], onValueChange, placeholder, disabled, name, className }, ref) => {
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
        {tags.map((tag, i) => (
          <span key={tag} className="ui-tag-input-chip" data-slot="tag-input-chip">
            {tag}
            {!disabled ? (
              <button
                type="button"
                className="ui-tag-input-remove"
                aria-label={`${tag} を削除`}
                onClick={() => removeAt(i)}
              >
                <X aria-hidden="true" />
              </button>
            ) : null}
          </span>
        ))}
        <input
          ref={ref}
          type="text"
          className="ui-tag-input-field"
          value={draft}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (draft.trim()) {
              add(draft);
              setDraft("");
            }
          }}
        />
        {name ? <input type="hidden" name={name} value={tags.join(",")} /> : null}
      </div>
    );
  },
);
TagInput.displayName = "TagInput";
