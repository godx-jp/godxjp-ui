import { Clock } from "lucide-react";

import { cn } from "../../lib/utils";
import { Heading, Logo, Text } from "../general";
import type { AuthIdentityProp } from "../../props/components/layout.prop";

export type { AuthIdentityProp } from "../../props/components/layout.prop";
export type { AuthIdentityProp as AuthIdentityProps } from "../../props/components/layout.prop";

/** Canonical hosted-identity mark, heading and optional real requesting-client context. */
export function AuthIdentity({ title, requester, className }: AuthIdentityProp) {
  return (
    <div data-slot="auth-identity" className={cn("ui-auth-identity", className)}>
      <Logo mark="godx" tone="success" />
      <Heading level={1}>{title}</Heading>
      {requester !== undefined && requester !== null ? (
        <div data-slot="auth-requester" className="ui-auth-requester">
          <span data-slot="auth-requester-icon" className="ui-auth-requester-icon">
            <Clock aria-hidden="true" />
          </span>
          <Text as="span" size="xs" tone="muted">
            {requester}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
