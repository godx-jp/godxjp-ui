import { cn } from "../../lib/utils";
import type {
  EditorialToggleGroupItemProp,
  EditorialToggleGroupProp,
} from "../../props/components/editorial-account.prop";

export type {
  EditorialToggleGroupItemProp,
  EditorialToggleGroupProp,
  EditorialToggleGroupProp as EditorialToggleGroupProps,
} from "../../props/components/editorial-account.prop";

/*
 * THE EDITORIAL ACCOUNT FAMILY (gh#1439) — the signed-in pages of an editorial site (a collection,
 * display settings, sign-in). Same contract as the editorial family (gh#1435): every length and
 * colour is an --editorial-* token (tokens/components/editorial-account.css), the rules live in
 * styles/editorial-account-layout.css, and no rule names a breakpoint — a theme re-declares the
 * tokens under its own width queries.
 */

/** A named group of `aria-pressed` buttons, one pressed at a time: text filter or icon switch. */
export function EditorialToggleGroup({
  items,
  value,
  onValueChange,
  variant = "text",
  className,
  ...rest
}: EditorialToggleGroupProp) {
  return (
    <div
      role="group"
      aria-label={rest["aria-label"]}
      data-slot="editorial-toggle-group"
      data-variant={variant}
      className={cn("ui-editorial-toggle-group", className)}
    >
      {items.map((item: EditorialToggleGroupItemProp) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={item.value === value}
          aria-label={variant === "icon" ? item.label : undefined}
          title={variant === "icon" ? item.label : undefined}
          className="ui-editorial-toggle-group-option ui-focus-ring"
          onClick={() => onValueChange(item.value)}
        >
          {item.icon != null && (
            <span aria-hidden className="ui-editorial-toggle-group-icon">
              {item.icon}
            </span>
          )}
          {variant === "text" && item.label}
        </button>
      ))}
    </div>
  );
}
