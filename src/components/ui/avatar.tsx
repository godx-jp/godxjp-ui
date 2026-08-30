import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { AvatarProp } from "../../props/components/data-display.prop";

export const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    Pick<AvatarProp, "shape" | "appearance" | "presence" | "presenceLabel">
>(
  (
    {
      className,
      shape = "circle",
      appearance = "default",
      presence,
      presenceLabel,
      children,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        // INERT DEFAULT: `circle` (a person) emits no attribute at all, so every existing `<Avatar>`
        // keeps the exact DOM and the exact round `--radius-pill` geometry it had. `square` opts into
        // the entity-header organization/service mark, whose radius, box size, brand fill and glyph
        // colour are ALL `--avatar-square-*` component tokens (gh#249, cardinal rule #45) — a service
        // retunes the entity mark once in its theme instead of overriding className per call site.
        data-shape={shape === "square" ? "square" : undefined}
        // Also inert by default. `tinted` is the CAPABILITY MEDALLION skin (gh#12): a soft role wash
        // behind a role-coloured glyph, sized by --avatar-tinted-* — the plate a feature/capability
        // icon sits on. Orthogonal to `shape`, so `shape="square" appearance="tinted"` is the
        // canonical rounded-square medallion and a tinted circle is equally reachable.
        data-appearance={appearance === "tinted" ? "tinted" : undefined}
        // Inert by default too (gh#309). Only a marked-up presence lifts the root's `overflow:
        // hidden` so the corner dot can straddle the mark's edge — the clip then moves onto the
        // image/fallback, so an avatar WITHOUT presence is byte-identical to the pre-#309 one.
        data-presence={presence}
        className={cn("ui-avatar", className)}
        {...props}
      >
        {children}
        {/*
         * PRESENCE — the realtime reachability dot (gh#309). Owned by Avatar rather than offered as
         * an `AvatarPresence` part or left to the consumer, because the dot's inset is a function of
         * the mark's OWN --avatar-* radius/size tokens and the root's clip: nothing outside the
         * avatar can read either, which is why every consumer ended up with the same hand-rolled
         * `<span className="relative">` + `bg-green-500 ring-2` workaround.
         *
         * The node exists ONLY when the prop does, so an entity with no presence concept (an
         * organization mark, a capability medallion) emits nothing at all — and `presence="offline"`
         * stays a different, positive statement from an absent prop.
         *
         * Never colour-only (WCAG 1.4.1): the localized string below is real, non-hidden text in the
         * accessible tree — visually hidden, but announced — and it renders AFTER `children` so a
         * screen reader reads the person first and their state second ("田中, Online"), not the
         * other way round. The silhouette (filled / half-filled / barred / hollow) carries the same
         * distinction for a sighted user in greyscale or forced colors.
         */}
        {presence !== undefined ? (
          <span data-slot="avatar-presence" data-presence={presence}>
            <span className="sr-only">
              {presenceLabel ?? t(`dataDisplay.avatar.presence.${presence}`)}
            </span>
          </span>
        ) : null}
      </AvatarPrimitive.Root>
    );
  },
);
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
