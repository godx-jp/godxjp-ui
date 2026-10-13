// Toast API — Sonner (shadcn recommended). `toast` IS Sonner's native toast:
//   toast("保存しました")
//   toast.success("承認しました") / toast.error("失敗しました") / toast.warning(…) / toast.info(…)
//   toast.promise(p, { loading, success, error })  ·  toast.dismiss()
//
// The legacy `{ title, variant }` object form + `useToast()` hook were removed — migrate to the
// native calls above (e.g. `toast({ title, variant: "success" })` → `toast.success(title)`).
//
// One default differs from Sonner's (gh#1253): `toast.error` and `toast.warning` carry a close
// button. A failure is the message a reader may need to keep on screen while acting on it, so it
// gets a way to dismiss it on the reader's own time; success/info stay auto-dismiss only. It is a
// per-toast default, so `toast.error(msg, { closeButton: false })` still opts out. Sonner offers
// no per-type `closeButton` on the Toaster (`toastOptions.closeButton` is one switch for every
// type), which is why the default lives on the call and not in `Toaster`.
import { toast as sonnerToast } from "sonner";

type SonnerToast = typeof sonnerToast;
type TypedToast = SonnerToast["error"];

const withCloseButton =
  (show: TypedToast): TypedToast =>
  (message, data) =>
    show(message, { closeButton: true, ...data });

const toast: SonnerToast = Object.assign(
  (...args: Parameters<SonnerToast>) => sonnerToast(...args),
  sonnerToast,
  {
    error: withCloseButton(sonnerToast.error),
    warning: withCloseButton(sonnerToast.warning),
  },
);

export type { ExternalToast } from "sonner";
export { sonnerToast, toast };
