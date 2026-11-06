/**
 * The prop a kit composite uses to name the slot of a kit component it renders (gh#1527).
 *
 * `AuthDivider` IS a `Separator` whose root is `data-slot="auth-divider"`; `<DialogClose asChild>`
 * around a `Button` is the dialog's close trigger. Those are the kit naming its own parts, so they
 * must still win over the inner component's slot. A consumer's `data-slot` must not: that is what
 * `withoutSlot` discards. This key is the one channel that tells the two apart.
 */
export const KIT_SLOT = "data-kit-slot";

/**
 * Drops a caller's `data-slot` from a props bag before it is spread onto an element whose own
 * `data-slot` is the component's identity (gh#1527).
 *
 * Every rule a component's stylesheet keys on is anchored to its slot (`[data-slot="alert"]`
 * carries Alert's flex row, surface, border and padding). When the slot sat before `{...props}`,
 * a consumer's `data-slot` replaced it and all of those rules silently stopped matching. The
 * component's slot is not a styling knob, so it wins: the caller's value is discarded.
 *
 * A kit composite's {@link KIT_SLOT} is turned back into `data-slot`, so the composite's name
 * still lands on the element. The attribute keeps its position in the markup, so output is
 * byte-identical whenever neither key is passed, and the bag is returned as-is, with no copy.
 */
export function withoutSlot<T>(props: T): T {
  if (props === null || typeof props !== "object") return props;
  if (!("data-slot" in props) && !(KIT_SLOT in props)) return props;
  const {
    "data-slot": _discarded,
    [KIT_SLOT]: kitSlot,
    ...rest
  } = props as T & { "data-slot"?: unknown; [KIT_SLOT]?: unknown };
  return (kitSlot === undefined ? rest : { ...rest, "data-slot": kitSlot }) as T;
}
