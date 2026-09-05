import * as React from "react";
import { LogOut } from "lucide-react";

import { cn } from "../../lib/utils";
import type { AccountChipProp } from "../../props/components/layout.prop";
import { Avatar, AvatarFallback, AvatarImage } from "../data-display/avatar";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { flexGapClass } from "../../lib/variants";

export type {
  AccountChipProp,
  AccountChipProp as AccountChipProps,
} from "../../props/components/layout.prop";

/**
 * Signed-in user for a PageContainer `extra` slot, a Topbar or a footer row: avatar, name and one
 * ghost action, all at the control tier height, so it sits level with the buttons beside it.
 */
export const AccountChip = React.forwardRef<HTMLDivElement, AccountChipProp>(
  ({ name, email, avatarSrc, avatarFallback, actionLabel, onAction, disabled, className }, ref) => (
    <div
      ref={ref}
      data-slot="account-chip"
      data-direction="row"
      data-align="center"
      className={cn("ui-flex", flexGapClass.xs, "ui-account-chip", className)}
      title={email}
    >
      <Avatar aria-hidden="true">
        {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
        <AvatarFallback>{avatarFallback ?? name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <Text truncate>{name}</Text>
      {onAction ? (
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onAction}
          aria-label={typeof actionLabel === "string" ? actionLabel : undefined}
          title={typeof actionLabel === "string" ? actionLabel : undefined}
        >
          <LogOut aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  ),
);
AccountChip.displayName = "AccountChip";
