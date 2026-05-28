// Toast API — Sonner (shadcn recommended).
//
// `toast("msg")` / `toast.success("msg")` — Sonner native API (preferred).
// `toast({ title, description, variant })` — legacy admin compat.
import type * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export type { ExternalToast } from "sonner";
export { sonnerToast };

export type LegacyToastOptions = ExternalToast & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

function nodeText(value: React.ReactNode): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function legacyToast(options: LegacyToastOptions) {
  const { title, description, variant, ...rest } = options;
  const titleText = nodeText(title);
  const descText = nodeText(description);
  const message = titleText || descText;
  const desc = titleText && descText ? descText : undefined;
  const sonnerOptions: ExternalToast = { ...rest, description: desc };

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, sonnerOptions);
    case "success":
      return sonnerToast.success(message, sonnerOptions);
    default:
      return sonnerToast(message, sonnerOptions);
  }
}

type ToastFn = typeof sonnerToast &
  ((options: LegacyToastOptions) => ReturnType<typeof sonnerToast>);

/** Sonner toast + legacy `{ title, variant }` object form. */
const toast = Object.assign((messageOrOptions: string | LegacyToastOptions) => {
  if (typeof messageOrOptions === "string") {
    return sonnerToast(messageOrOptions);
  }
  return legacyToast(messageOrOptions);
}, sonnerToast) as ToastFn;

/** Legacy hook — prefer `toast` import directly; kept for existing admin pages. */
function useToast() {
  return {
    toast: (options: LegacyToastOptions) => legacyToast(options),
    dismiss: sonnerToast.dismiss,
    toasts: [] as const,
  };
}

export { toast, legacyToast, useToast };
