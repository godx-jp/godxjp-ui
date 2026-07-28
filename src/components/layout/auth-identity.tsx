import type { ReactNode } from "react";
import { Clock } from "lucide-react";

import { Heading, Logo, Text } from "../general";

export interface AuthIdentityProps {
  title: ReactNode;
  requester?: ReactNode;
}

/** Canonical hosted-identity mark, heading and optional real requesting-client context. */
export function AuthIdentity({ title, requester }: AuthIdentityProps) {
  return (
    <div data-slot="auth-identity" className="ui-auth-identity">
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
