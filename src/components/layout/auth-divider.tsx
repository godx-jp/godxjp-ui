import { cn } from "../../lib/utils";
import type { AuthDividerProp } from "../../props/components/layout.prop";

export type {
  AuthDividerProp,
  AuthDividerProp as AuthDividerProps,
} from "../../props/components/layout.prop";

/**
 * AuthDivider — a centred, localized conjunction between two equal separator rules. The grid
 * composition keeps the label optically and geometrically centred regardless of translation.
 */
export function AuthDivider({ label, className }: AuthDividerProp) {
  return (
    <div
      data-slot="auth-divider"
      className={cn("ui-auth-divider", className)}
      role="separator"
      aria-label={label}
    >
      <span className="ui-auth-divider-rule" aria-hidden="true" />
      <span className="ui-auth-divider-label" aria-hidden="true">
        {label}
      </span>
      <span className="ui-auth-divider-rule" aria-hidden="true" />
    </div>
  );
}
