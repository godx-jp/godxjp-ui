import * as React from "react";

import type { AuthExpiryProviderProp } from "../../props/components/feedback.prop";

export type {
  AuthExpiryProviderProp,
  AuthExpiryProviderProp as AuthExpiryProviderProps,
} from "../../props/components/feedback.prop";

/**
 * `"redirecting"` — the handler has been invoked (or is about to be); render a neutral pending state.
 * `"failed"` — the handler threw or rejected; fall back to the sign-in alert so the user is not left
 * on an endless spinner.
 */
export type AuthExpiryStatus = "redirecting" | "failed";

type AuthExpiryContextValue = {
  /** Register one view that is showing an auth-class error. Returns its unregister function. */
  register: (error: unknown) => () => void;
  /** Invoke the handler again from the fallback alert's sign-in button. */
  retry: (error: unknown) => void;
  failed: boolean;
};

const AuthExpiryContext = React.createContext<AuthExpiryContextValue | null>(null);

/**
 * Central handling for an expired session (401 / invalid or expired token) — the SSO norm: the app
 * sends the user back through the IdP, which returns immediately while the IdP session is alive, so
 * no page-level error is ever painted.
 *
 * Every `DataState`, `InfiniteQueryState`, `AlertMutationFeedback` and `AlertQueryError` under this
 * provider consults it. On an auth-class error it calls `onAuthExpired` **once** — any number of
 * simultaneous 401s share one call — and renders a neutral pending state with a polite live region
 * instead of an alert. The call is re-armed once every auth-errored view has gone (navigated away,
 * or the queries recovered after a silent refresh), so a later expiry fires again.
 */
export function AuthExpiryProvider({ onAuthExpired, children }: AuthExpiryProviderProp) {
  const handlerRef = React.useRef(onAuthExpired);
  handlerRef.current = onAuthExpired;
  const countRef = React.useRef(0);
  const firedRef = React.useRef(false);
  const [failed, setFailed] = React.useState(false);

  const invoke = React.useCallback((error: unknown) => {
    firedRef.current = true;
    setFailed(false);
    const fail = () => setFailed(true);
    try {
      const result = handlerRef.current({ error });
      if (result && typeof (result as Promise<void>).then === "function") {
        (result as Promise<void>).then(undefined, fail);
      }
    } catch {
      fail();
    }
  }, []);

  const register = React.useCallback(
    (error: unknown) => {
      countRef.current += 1;
      if (!firedRef.current) invoke(error);
      return () => {
        countRef.current -= 1;
        // Re-arm on a later task, not synchronously: StrictMode's unmount/remount (and a view that
        // swaps one auth error for another within one commit) must not fire the handler twice.
        setTimeout(() => {
          if (countRef.current === 0) {
            firedRef.current = false;
            setFailed(false);
          }
        }, 0);
      };
    },
    [invoke],
  );

  const value = React.useMemo<AuthExpiryContextValue>(
    () => ({ register, retry: invoke, failed }),
    [register, invoke, failed],
  );

  return <AuthExpiryContext.Provider value={value}>{children}</AuthExpiryContext.Provider>;
}

/**
 * Internal hook for the query surfaces. `active` = this view is currently showing an auth-class
 * error. Returns `null` when there is no provider (the caller keeps its legacy alert), otherwise the
 * status to render plus a `retry` for the fallback alert's sign-in button.
 */
export function useAuthExpiry(
  active: boolean,
  error: unknown,
): { status: AuthExpiryStatus; retry: () => void } | null {
  const ctx = React.useContext(AuthExpiryContext);
  const errorRef = React.useRef(error);
  errorRef.current = error;
  const register = ctx?.register;

  React.useEffect(() => {
    if (!register || !active) return undefined;
    return register(errorRef.current);
  }, [register, active]);

  if (!ctx || !active) return null;
  return {
    status: ctx.failed ? "failed" : "redirecting",
    retry: () => ctx.retry(errorRef.current),
  };
}
