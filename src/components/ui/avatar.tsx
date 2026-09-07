import { useEffectEvent, useLayoutEffect } from "@react-aria/utils";
import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { Slot } from "../../lib/slot";
import { cn } from "../../lib/utils";
import type { AvatarProp } from "../../props/components/data-display.prop";

/**
 * Trạng thái tải của ảnh trong avatar — chia sẻ giữa `AvatarImage` và
 * `AvatarFallback` qua context, đúng như Radix làm.
 *
 * React Aria KHÔNG có avatar, nên đây là việc TỰ DỰNG. Nhưng phần cần dựng lại
 * không phải cái vỏ `<span>` — mà là logic thật mà `@radix-ui/react-avatar` cầm:
 * ảnh chỉ được vẽ khi đã tải XONG, fallback chỉ được vẽ khi ảnh CHƯA xong hoặc
 * HỎNG, và `delayMs` giữ fallback im lặng đủ lâu để mạng nhanh không kịp nháy
 * một khung initials trước khi ảnh về.
 *
 * Phép dò là một `new Image()` RỜI, không phải `onLoad`/`onError` trên chính
 * thẻ được vẽ: thẻ chỉ tồn tại khi đã `loaded`, nên handler trên nó không bao
 * giờ có cơ hội báo "đang tải" hay "hỏng". Đây cũng là lý do một `<img>` hỏng
 * không bao giờ nằm trong DOM để trình duyệt vẽ biểu tượng ảnh vỡ lên trên
 * fallback.
 */
type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

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

/** `complete` một mình không phân biệt được "xong" với "hỏng" — `naturalWidth` mới phân biệt. */
function getImageLoadingStatus(image: HTMLImageElement): ImageLoadingStatus {
  if (!image.complete) {
    return "loading";
  }
  return image.naturalWidth > 0 ? "loaded" : "error";
}

function useImageLoadingStatus(
  src: string | undefined,
  {
    loadingStatus,
    setLoadingStatus,
    referrerPolicy,
    crossOrigin,
  }: {
    loadingStatus: ImageLoadingStatus;
    setLoadingStatus: AvatarContextValue["setImageLoadingStatus"];
    referrerPolicy?: React.HTMLAttributeReferrerPolicy;
    crossOrigin?: "anonymous" | "use-credentials" | "";
  },
): ImageLoadingStatus {
  useLayoutEffect(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }

    const image = new window.Image();
    const handleLoad = (event: Event) =>
      setLoadingStatus(getImageLoadingStatus(event.currentTarget as HTMLImageElement));
    const handleError = () => setLoadingStatus("error");

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    image.crossOrigin = crossOrigin ?? null;
    image.src = src;
    // Ảnh đã nằm trong cache của trình duyệt thì `complete` đúng NGAY đây và
    // không sự kiện nào nữa được bắn — bỏ lượt đọc đồng bộ này là avatar đứng
    // mãi ở fallback trên mọi lượt điều hướng thứ hai.
    setLoadingStatus(getImageLoadingStatus(image));

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      setLoadingStatus("idle");
    };
  }, [src, crossOrigin, referrerPolicy, setLoadingStatus]);

  return loadingStatus;
}

export const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & { asChild?: boolean } & Pick<
      AvatarProp,
      "shape" | "appearance" | "presence" | "presenceLabel"
    >
>(
  (
    {
      className,
      shape = "circle",
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
