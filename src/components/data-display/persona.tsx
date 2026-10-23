import * as React from "react";
import { cn } from "../../lib/utils";
import type { PersonaProp } from "../../props/components/data-display.prop";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export type {
  PersonaProp,
  PersonaProp as PersonaProps,
} from "../../props/components/data-display.prop";

/** A person's identity, independent of row chrome, navigation and account actions. */
export const Persona = React.forwardRef<HTMLSpanElement, PersonaProp>(
  (
    { name, description, avatarSrc, avatarFallback, trailing, size = "md", className, ...props },
    ref,
  ) => (
    <span
      ref={ref}
      data-slot="persona"
      data-size={size}
      className={cn("ui-persona", className)}
      {...props}
    >
      <Avatar size={size} aria-hidden="true">
        {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
        <AvatarFallback>{avatarFallback ?? Array.from(name)[0]}</AvatarFallback>
      </Avatar>
      <span data-slot="persona-body">
        <span data-slot="persona-name-line">
          <span data-slot="persona-name" dir="auto" title={name}>
            {name}
          </span>
          {trailing != null ? <span data-slot="persona-trailing">{trailing}</span> : null}
        </span>
        {description != null ? (
          <span data-slot="persona-description" dir="auto" title={description}>
            {description}
          </span>
        ) : null}
      </span>
    </span>
  ),
);
Persona.displayName = "Persona";
