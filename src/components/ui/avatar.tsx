import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../../lib/utils";
import type { AvatarProp } from "../../props/components/data-display.prop";

export const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & Pick<AvatarProp, "shape">
>(({ className, shape = "circle", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    // INERT DEFAULT: `circle` (a person) emits no attribute at all, so every existing `<Avatar>`
    // keeps the exact DOM and the exact round `--radius-pill` geometry it had. `square` opts into
    // the entity-header organization/service mark, whose radius, box size, brand fill and glyph
    // colour are ALL `--avatar-square-*` component tokens (gh#249, cardinal rule #45) — a service
    // retunes the entity mark once in its theme instead of overriding className per call site.
    data-shape={shape === "square" ? "square" : undefined}
    className={cn("ui-avatar", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("ui-avatar-image", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn("ui-avatar-fallback", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
