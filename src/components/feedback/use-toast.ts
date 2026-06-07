// Toast API — Sonner (shadcn recommended). `toast` IS Sonner's native toast:
//   toast("保存しました")
//   toast.success("承認しました") / toast.error("失敗しました") / toast.warning(…) / toast.info(…)
//   toast.promise(p, { loading, success, error })  ·  toast.dismiss()
//
// The legacy `{ title, variant }` object form + `useToast()` hook were removed — migrate to the
// native calls above (e.g. `toast({ title, variant: "success" })` → `toast.success(title)`).
import { toast as sonnerToast } from "sonner";

export type { ExternalToast } from "sonner";
export { sonnerToast, sonnerToast as toast };
