import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export type AuthStackProps = HTMLAttributes<HTMLDivElement>;

/** Canonical 12px vertical rhythm for the direct sections inside an auth card. */
export function AuthStack({ className, ...props }: AuthStackProps) {
  return <div data-slot="auth-stack" className={cn("ui-auth-stack", className)} {...props} />;
}
