import { useEffectEvent, useLayoutEffect } from "@react-aria/utils";
import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
/* The probe that answers "did this URL produce a picture?" lives in `lib/` because it is no longer
 * Avatar's alone — `ServiceLauncherCard` asks the same question of an uploaded service logo
 * (gh#850). Shared implementation, one failure path. */
import { useImageLoadingStatus, type ImageLoadingStatus } from "../../lib/image-loading-status";
import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";
import type { AvatarProp } from "../../props/components/data-display.prop";

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus;
  setImageLoadingStatus: React.Dispatch<React.SetStateAction<ImageLoadingStatus>>;
};

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function useAvatarContext(part: string): AvatarContextValue {
  const context = React.useContext(AvatarContext);
  if (context === null) {
    throw new Error(`\`${part}\` must be used within \`Avatar\``);
  }
  return context;
}

export const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean } & Pick<
      AvatarProp,
      "shape" | "appearance" | "presence" | "presenceLabel" | "size"
    >
>(
  (
    {
      className,
      shape = "circle",
      size = "md",
      appearance = "default",
      presence,
      presenceLabel,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const [imageLoadingStatus, setImageLoadingStatus] = React.useState<ImageLoadingStatus>("idle");
    const context = React.useMemo<AvatarContextValue>(
      () => ({ imageLoadingStatus, setImageLoadingStatus }),
      [imageLoadingStatus],
    );
    const Comp = asChild ? Slot : "span";

    return (
      <AvatarContext.Provider value={context}>
        <Comp
          ref={ref}
          data-slot="avatar"
          // INERT DEFAULT: `circle` (a person) emits no attribute at all, so every existing `<Avatar>`
          // keeps the exact DOM and the exact round `--radius-pill` geometry it had. `square` opts into
          // the entity-header organization/service mark, whose radius, box size, brand fill and glyph
          // retunes the entity mark once in its theme instead of overriding className per call site.
          data-shape={shape === "square" ? "square" : undefined}
          // INERT DEFAULT, same reasoning as `shape`: `md` emits nothing, so every avatar written
          // before gh#716 keeps the DOM and the --control-height box it had. The other three steps
          // ride the --control-height-{xs,sm,lg} tier, which is what lets a person's mark sit in a
          // 28px `icon-sm` trigger or a 24px dense row instead of overflowing it and forcing the
          // consumer to raise the whole row. The box, the initials type step and the glyph box all
          // move together — see styles/data-display-layout.css.
          data-size={size === "md" ? undefined : size}
          // Also inert by default.
          // behind a role-coloured glyph, sized by --avatar-tinted-* — the plate a feature/capability
          // icon sits on. Orthogonal to `shape`, so `shape="square" appearance="tinted"` is the
          // canonical rounded-square medallion and a tinted circle is equally reachable.
          data-appearance={appearance === "tinted" ? "tinted" : undefined}
          // Only a marked-up presence lifts the root's `overflow:
          // hidden` so the corner dot can straddle the mark's edge — the clip then moves onto the
          data-presence={presence}
          className={cn("ui-avatar", className)}
          {...props}
        >
          {children}
          {/* Owned by Avatar rather than offered as an `AvatarPresence` part or left to the consumer, because the dot's inset is a function of the mark's OWN --avatar-* radius/size tokens and the root's clip: nothing outside the avatar can read either, which is why every consumer ended up with the same hand-rolled `<span className="relative">` + `bg-green-500 ring-2` workaround. The node exists ONLY when the prop does, so an entity with no presence concept (an organization mark, a capability medallion) emits nothing at all — and `presence="offline"` stays a different, positive statement from an absent prop. */}
          {presence !== undefined ? (
            <span data-slot="avatar-presence" data-presence={presence}>
              <span className="sr-only">
                {presenceLabel ?? t(`dataDisplay.avatar.presence.${presence}`)}
              </span>
            </span>
          ) : null}
        </Comp>
      </AvatarContext.Provider>
    );
  },
);
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<"img"> & {
    asChild?: boolean;
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
  }
>(({ className, src, onLoadingStatusChange, asChild = false, ...props }, ref) => {
  const { imageLoadingStatus, setImageLoadingStatus } = useAvatarContext("AvatarImage");
  const status = useImageLoadingStatus(src, {
    referrerPolicy: props.referrerPolicy,
    crossOrigin: props.crossOrigin,
    loadingStatus: imageLoadingStatus,
    setLoadingStatus: setImageLoadingStatus,
  });

  /*
   * `onLoadingStatusChange` chỉ được gọi khi trạng thái ĐỔI, không phải mỗi lần
   * render — và qua `useEffectEvent` để một callback inline của consumer không
   * biến effect thành vòng lặp.
   */
  const handleLoadingStatusChange = useEffectEvent((next: ImageLoadingStatus) => {
    onLoadingStatusChange?.(next);
  });
  const previousStatus = React.useRef(status);
  useLayoutEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (status !== previous) {
      handleLoadingStatusChange(status);
    }
    // `handleLoadingStatusChange` KHÔNG nằm trong deps: `useEffectEvent` trả về
    // một hàm ổn định đọc callback mới nhất, đưa nó vào là sai theo đúng luật
    // của chính hook đó.
  }, [status]);

  const Comp = asChild ? Slot : "img";

  return status === "loaded" ? (
    <Comp
      ref={ref}
      data-slot="avatar-image"
      className={cn("ui-avatar-image", className)}
      {...props}
      src={src}
    />
  ) : null;
});
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean; delayMs?: number }
>(({ className, delayMs, asChild = false, ...props }, ref) => {
  const { imageLoadingStatus } = useAvatarContext("AvatarFallback");
  /*
   * KHÔNG có `delayMs` thì fallback hiện ngay — đó là mặc định, và là hành vi
   * mọi call site hiện tại đang có. CÓ `delayMs` thì fallback im lặng bấy nhiêu
   * mili giây rồi mới được quyền vẽ: trên mạng nhanh ảnh về trước hạn, `loaded`
   * tới, và người dùng không bao giờ thấy khung initials nháy một cái.
   */
  const [canRender, setCanRender] = React.useState(delayMs === undefined);
  React.useEffect(() => {
    if (delayMs === undefined) {
      return;
    }
    const timerId = window.setTimeout(() => setCanRender(true), delayMs);
    return () => window.clearTimeout(timerId);
  }, [delayMs]);

  const Comp = asChild ? Slot : "span";

  return canRender && imageLoadingStatus !== "loaded" ? (
    <Comp
      ref={ref}
      data-slot="avatar-fallback"
      className={cn("ui-avatar-fallback", className)}
      {...props}
    />
  ) : null;
});
AvatarFallback.displayName = "AvatarFallback";
