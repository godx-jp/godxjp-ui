import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
import type { AuthDividerProp } from "../../props/components/layout.prop";

export type {
  AuthDividerProp,
  AuthDividerProp as AuthDividerProps,
} from "../../props/components/layout.prop";

/**
 * AuthDivider — a centred, localized conjunction between two equal separator rules. New code that
 * wants a labelled rule outside an auth form should use `<Separator label>` directly.
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
