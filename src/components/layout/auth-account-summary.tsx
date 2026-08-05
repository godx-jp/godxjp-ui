import * as React from "react";
import { UserRound } from "lucide-react";

import { cn } from "../../lib/utils";
import type { AuthAccountSummaryProp } from "../../props/components/layout.prop";
import { Avatar, AvatarFallback, AvatarImage } from "../data-display";
import { Button } from "../general";

export type {
  AuthAccountSummaryProp,
  AuthAccountSummaryProp as AuthAccountSummaryProps,
} from "../../props/components/layout.prop";

/** Compact, token-owned signed-in identity row for hosted auth and device authorization. */
export const AuthAccountSummary = React.forwardRef<HTMLDivElement, AuthAccountSummaryProp>(
  ({ email, avatarSrc, avatarFallback, actionLabel, onAction, disabled, className }, ref) => (
    <div
      ref={ref}
      data-slot="auth-account-summary"
      className={cn("ui-auth-account-summary", className)}
    >
      <div data-slot="auth-account-identity" className="ui-auth-account-identity">
        <Avatar className="ui-auth-account-avatar" aria-hidden="true">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
          <AvatarFallback>
            {avatarFallback ?? (
              <UserRound className="ui-auth-account-fallback-icon" aria-hidden="true" />
            )}
          </AvatarFallback>
        </Avatar>
        <span className="ui-auth-account-email" dir="auto" title={email}>
          {email}
        </span>
      </div>
      <Button variant="ghost" size="sm" disabled={disabled} onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  ),
);
AuthAccountSummary.displayName = "AuthAccountSummary";
