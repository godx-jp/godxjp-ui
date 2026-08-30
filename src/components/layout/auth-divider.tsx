import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
import type { AuthDividerProp } from "../../props/components/layout.prop";

export type {
  AuthDividerProp,
  AuthDividerProp as AuthDividerProps,
} from "../../props/components/layout.prop";

/**
 * AuthDivider — a centred, localized conjunction between two equal separator rules.
 *
 * Since gh#308 this is a thin PRESET over `Separator label`, not a parallel implementation: the
 * grid, the accessible-name contract and the rule geometry all live on the primitive, and
 * `.ui-auth-divider` only re-points Separator's `--separator-*` knobs at the `--auth-shell-divider-*`
 * layer. That keeps #263's canonical login geometry byte-for-byte identical while breaking the
 * coupling the issue reported — a service retuning its login divider no longer retunes every day
 * divider in its message streams, and vice versa. New code that wants a labelled rule outside an
 * auth form should use `<Separator label>` directly.
 */
export function AuthDivider({ label, className }: AuthDividerProp) {
  return (
    <Separator
      data-slot="auth-divider"
      label={label}
      className={cn("ui-auth-divider", className)}
    />
  );
}
