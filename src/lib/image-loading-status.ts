import { useLayoutEffect } from "@react-aria/utils";
import type * as React from "react";

/**
 * THE ONE image-load probe in this library — do not write a second one.
 *
 * It was born inside `Avatar` (a mark with an initials fallback) and was lifted out whole when
 * `ServiceLauncherCard` needed exactly the same question answered for an uploaded service logo
 * (gh#850). Two components asking "did this URL actually produce a picture?" must not answer it
 * two different ways, or the failure path diverges where nobody looks: on the 404.
 *
 * React Aria has no avatar, so this is hand-built — but the part worth building is not a `<span>`
 * wrapper, it is the rule `@radix-ui/react-avatar` holds: the image is drawn ONLY once it has
 * finished loading, and the fallback is drawn while it has not, or has failed.
 *
 * The probe is a DETACHED `new Image()`, not `onLoad`/`onError` on the element being rendered: that
 * element only exists once the status is already `loaded`, so a handler on it can never report
 * "loading" or "error". It is also why a broken `<img>` is never in the DOM for the browser to
 * paint its torn-page glyph over the fallback.
 */
export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

/** `complete` một mình không phân biệt được "xong" với "hỏng" — `naturalWidth` mới phân biệt. */
function getImageLoadingStatus(image: HTMLImageElement): ImageLoadingStatus {
  if (!image.complete) {
    return "loading";
  }
  return image.naturalWidth > 0 ? "loaded" : "error";
}

export function useImageLoadingStatus(
  src: string | undefined,
  {
    loadingStatus,
    setLoadingStatus,
    referrerPolicy,
    crossOrigin,
  }: {
    loadingStatus: ImageLoadingStatus;
    setLoadingStatus: React.Dispatch<React.SetStateAction<ImageLoadingStatus>>;
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
