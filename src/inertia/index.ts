import type { ComponentType, ReactNode } from "react";

import { createSidebarLink } from "../components/layout/sidebar-link";
import type { FormStateAdapter } from "../props/components/form.prop";
import type { SidebarLinkComponentProp } from "../props/components/layout.prop";

/** Structural shape of Inertia's `useForm` return that the adapter needs. */
export interface InertiaFormLike<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** Current form values (server-driven state). */
  data: TData;
  /** Write a single field back (Inertia signature: `setData(key, value)`). */
  setData(key: string, value: unknown): void;
  /** Server (Laravel FormRequest) validation errors, keyed by field name. */
  errors: Partial<Record<string, string>>;
  /** True while a submit request is in flight. */
  processing: boolean;
  reset?(): void;
}

/**
 * Wrap an Inertia `useForm()` object as a framework-agnostic {@link FormStateAdapter} so it drives
 * `FormRoot`/`FormFieldControl` with the SAME auto-binding as the react-hook-form path — no manual
 * `value`/`onChange`/`error`/`aria-invalid` per field, and `processing` flows to submit-button
 * loading via `useFormSubmitting()`. Server errors in `form.errors` surface on the matching
 * `FormFieldControl` and clear on correction (Inertia clears the error on `setData`).
 *
 * @example
 * ```tsx
 * import { FormRoot, FormFieldControl, useFormSubmitting } from "@godxjp/ui/form";
 * import { inertiaAdapter } from "@godxjp/ui/inertia";
 * import { useForm } from "@inertiajs/react";
 *
 * const form = useForm({ email: "", password: "" });
 * return (
 *   <FormRoot adapter={inertiaAdapter(form)} onSubmit={() => form.post("/login")}>
 *     <FormFieldControl name="email" label="Email" required>
 *       {(field) => <Input {...field} type="email" value={String(field.value ?? "")} />}
 *     </FormFieldControl>
 *     <Button type="submit" loading={useFormSubmitting()}>Sign in</Button>
 *   </FormRoot>
 * );
 * ```
 */
export function inertiaAdapter<TData extends Record<string, unknown>>(
  form: InertiaFormLike<TData>,
): FormStateAdapter {
  return {
    getValue: (name) => form.data[name],
    setValue: (name, value) => form.setData(name, value),
    getError: (name) => form.errors[name],
    isSubmitting: form.processing,
    getValues: () => form.data,
    reset: form.reset ? () => form.reset?.() : undefined,
  };
}

/**
 * Lighter helper for consumers who compose `FormField` by hand rather than `FormRoot`. Returns the
 * exact props to spread onto a `FormField` + its control — `value`, `onChange`, `error`, `name` —
 * so no field is hand-wired. Use `inertiaAdapter` + `FormRoot` for the full auto-binding instead.
 *
 * @example
 * ```tsx
 * const form = useForm({ email: "" });
 * const email = useInertiaField(form, "email");
 * <FormField id="email" label="Email" error={email.error}>
 *   <Input {...email} value={String(email.value ?? "")} type="email" />
 * </FormField>
 * ```
 */
export function useInertiaField<TData extends Record<string, unknown>>(
  form: InertiaFormLike<TData>,
  name: string,
): {
  name: string;
  value: unknown;
  error: string | undefined;
  onChange: (event: { target: { value: unknown } }) => void;
} {
  return {
    name,
    value: form.data[name],
    error: form.errors[name],
    onChange: (event) => form.setData(name, event?.target?.value),
  };
}

/** Structural shape of Inertia's `<Link>` that the Sidebar adapter needs. */
export interface InertiaLinkLike {
  href: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Bind Inertia's `<Link>` as the Sidebar's row element.
 *
 * The LIBRARY still composes every row — the 16px icon slot, the label, the badge, `data-active` /
 * `aria-current`, the icon-only collapsed rail and its tooltip name — and hands it to the link as
 * `children`. The consumer supplies ONLY the element, so the class of production regression where a
 * consumer `renderItem` returned `<Link>{item.label}</Link>` and silently dropped every sidebar icon
 * is no longer expressible.
 *
 * A disabled row has no destination; Inertia's `Link` requires a string `href` and would visit `""`,
 * so the adapter renders an inert `<a>` for that case while keeping the canonical row class and
 * `aria-disabled`.
 *
 * React Router / TanStack Router use `to` instead of `href` — use
 * `createSidebarLink(Link, "to")` from `@godxjp/ui/layout` for those.
 *
 * @example
 * ```tsx
 * import { Link } from "@inertiajs/react";
 * import { Sidebar } from "@godxjp/ui/layout";
 * import { inertiaSidebarLink } from "@godxjp/ui/inertia";
 *
 * const NavLink = inertiaSidebarLink(Link);
 *
 * <Sidebar
 *   activeId={page.component}
 *   linkComponent={NavLink}
 *   sections={[
 *     { label: "Operations", items: [
 *       { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
 *       { id: "invoices", label: t("nav.invoices"), icon: Receipt, href: "/invoices",
 *         badge: <Badge tone="info">{unread}</Badge> },
 *     ] },
 *   ]}
 * />;
 * ```
 */
export function inertiaSidebarLink<P extends InertiaLinkLike>(
  Link: ComponentType<P>,
): SidebarLinkComponentProp {
  return createSidebarLink(Link, "href");
}

/** Visit callbacks needed to connect Upload to an Inertia multipart endpoint. */
export interface InertiaUploadCallbacks {
  forceFormData: true;
  async: true;
  onProgress: (progress: { percentage?: number } | undefined) => void;
  onSuccess: () => void;
  onError: (errors: Record<string, string>) => void;
  onCancelToken: (token: { cancel: () => void }) => void;
  onCancel: () => void;
  onNetworkError: (error: Error) => boolean;
  onHttpException: () => boolean;
  onFinish: () => void;
}

/** Bridge redirect-based Inertia uploads to Upload's progress/abort/retry lifecycle. */
export function inertiaUpload(
  send: (file: File, callbacks: InertiaUploadCallbacks) => void,
  errorMessage: string,
): NonNullable<import("../props/components/data-entry.prop").UploadProp["onUpload"]> {
  return (file, _item, context) =>
    new Promise((resolve, reject) => {
      let cancel: (() => void) | undefined;
      let settled = false;
      const abort = () => {
        cancel?.();
        fail(new DOMException("Upload aborted", "AbortError"));
      };
      const cleanup = () => context.signal.removeEventListener("abort", abort);
      const fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };
      if (context.signal.aborted) {
        abort();
        return;
      }
      context.signal.addEventListener("abort", abort, { once: true });
      try {
        send(file, {
          forceFormData: true,
          async: true,
          onProgress: (progress) => {
            if (!settled) context.onProgress(progress?.percentage ?? 0);
          },
          onSuccess: () => {
            if (!settled) {
              settled = true;
              cleanup();
              resolve({});
            }
          },
          onError: (errors) => fail(new Error(Object.values(errors)[0] ?? errorMessage)),
          onCancelToken: (token) => {
            cancel = token.cancel;
            if (context.signal.aborted) token.cancel();
          },
          onCancel: () => fail(new DOMException("Upload aborted", "AbortError")),
          onNetworkError: () => {
            fail(new Error(errorMessage));
            return false;
          },
          onHttpException: () => {
            fail(new Error(errorMessage));
            return false;
          },
          onFinish: () => {
            if (!settled) fail(new Error(errorMessage));
          },
        });
      } catch (error) {
        fail(error);
      }
    });
}
