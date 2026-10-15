import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { controlIconLeadingClass } from "../../lib/control-styles";
import type { CommandProp, CommandSeparatorProp } from "../../props/components/data-entry.prop";

export type { CommandProp, CommandProp as CommandProps };
export type { CommandSeparatorProp, CommandSeparatorProp as CommandSeparatorProps };

export const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive> & CommandProp
>(({ className, split = false, ...props }, ref) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // cmdk unconditionally renders a hidden `<label cmdk-label for={inputId}>`
  // wired to its own CommandInput. When the consumer renders a CUSTOM search
  // input instead (SearchSelect does), that `for` dangles — Chrome flags it as
  // "Incorrect use of <label for=FORM_ELEMENT>". Adopt the expected id onto
  // the real input when there is one, otherwise drop the `for` entirely.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const label = root.querySelector<HTMLLabelElement>(":scope > label[cmdk-label]");
    if (!label || root.querySelector("[cmdk-input]")) return;
    const expectedId = label.getAttribute("for");
    const input = root.querySelector<HTMLInputElement>('input:not([type="hidden"])');
    if (input && expectedId && !input.id) input.id = expectedId;
    else if (!input || input.id !== expectedId) label.removeAttribute("for");
  });

  // `split` is presentation only, so it travels as ONE attribute on the root and the group and
  // item rules key off it in CSS — no part needs to be told, and rows a composite renders itself
  // with `.ui-command-item` (SearchSelect's listbox) pick it up too.
  return (
    <CommandPrimitive
      ref={setRefs}
      className={cn("ui-command", className)}
      data-split={split ? "" : undefined}
      {...props}
    />
  );
});
Command.displayName = CommandPrimitive.displayName;

export const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  // cmdk uses this non-standard attribute for input wrapper styling
  // eslint-disable-next-line react/no-unknown-property -- cmdk convention
  <div className="ui-command-input-wrapper" cmdk-input-wrapper="">
    <Search className={cn(controlIconLeadingClass, "ui-command-search-icon")} aria-hidden="true" />
    <CommandPrimitive.Input ref={ref} className={cn("ui-command-input", className)} {...props} />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn("ui-command-list", className)} {...props} />
));
CommandList.displayName = CommandPrimitive.List.displayName;

export const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="ui-command-empty" {...props} />);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={cn("ui-command-group", className)} {...props} />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

export const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={cn("ui-command-item", className)} {...props} />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

/**
 * A hairline between two groups of one list — e.g. the matches, then `+ Create "<q>"` (gh#1335).
 * It is cmdk's own `Command.Separator`, so it must sit inside the same `Command` as its groups.
 *
 * `alwaysRender` defaults to `true`, the OPPOSITE of cmdk: cmdk drops a separator as soon as the
 * search is non-empty, because in a palette the groups collapse under filtering. A "Create" group
 * exists only BECAUSE the user typed, so with cmdk's default the rule vanished exactly when it
 * was needed. Pass `alwaysRender={false}` for cmdk's palette behaviour.
 *
 * `aria-hidden` by default: the rule is decorative, and a `role="separator"` child is not allowed
 * in the `listbox` CommandList renders (ARIA owns only `option` / `group` there); the groups'
 * headings carry the structure.
 */
export const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> & CommandSeparatorProp
>(({ className, alwaysRender = true, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("ui-command-separator", className)}
    data-slot="command-separator"
    aria-hidden="true"
    alwaysRender={alwaysRender}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
