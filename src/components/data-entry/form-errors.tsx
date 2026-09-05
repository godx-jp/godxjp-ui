import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { Alert, AlertContent, AlertDescription, AlertTitle } from "../feedback/alert";
import type {
  FormErrorsProp,
  FormErrorsProviderProp,
} from "../../props/components/data-entry.prop";
import type { ErrorBagProp } from "../../props/vocabulary";

export type {
  FormErrorsProp,
  FormErrorsProp as FormErrorsProps,
  FormErrorsProviderProp,
  FormErrorsProviderProp as FormErrorsProviderProps,
} from "../../props/components/data-entry.prop";

/** SSR-safe layout effect — claims must land before paint so FormErrors never flashes a claimed key. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Registry shared by a `Form` with its FormFields and `<FormErrors />`. Each mounted `FormField
 * name="…"` CLAIMS its error-bag key (it is the visible owner of that message); `<FormErrors />`
 * renders only the unclaimed remainder.
 */
interface FormErrorsRegistryValue {
  errors: ErrorBagProp;
  claimed: ReadonlyMap<string, number>;
  /** Claim `key`; returns the release function (stable identity — safe as an effect dep). */
  claim: (key: string) => () => void;
}

const FormErrorsRegistryContext = React.createContext<FormErrorsRegistryValue | null>(null);

/** Read the nearest Form's error registry (null when used outside a Form). */
export function useFormErrorsRegistry(): FormErrorsRegistryValue | null {
  return React.useContext(FormErrorsRegistryContext);
}

/** First message of a bag entry — Laravel arrays surface their first message on the field. */
export function firstBagMessage(entry: string | string[] | undefined): string | undefined {
  const message = Array.isArray(entry) ? entry[0] : entry;
  return message ? message : undefined;
}

/**
 * FormErrorsProvider — one shared error registry (error bag + claim set) over a region. 兄弟 Form 群で
 * 1 つのエラーバッグを共有するための公開プロバイダ。Two ways to get one: 1. `Form errors={…}` renders this provider itself
 * (both `<form>` and `asChild` modes) — the single-form case needs nothing else. 2.
 */
export function FormErrorsProvider({ errors, children }: FormErrorsProviderProp) {
  const [claimed, setClaimed] = React.useState<ReadonlyMap<string, number>>(new Map());
  const claim = React.useCallback((key: string) => {
    setClaimed((prev) => {
      const next = new Map(prev);
      next.set(key, (next.get(key) ?? 0) + 1);
      return next;
    });
    return () => {
      setClaimed((prev) => {
        const next = new Map(prev);
        const count = (next.get(key) ?? 0) - 1;
        if (count <= 0) next.delete(key);
        else next.set(key, count);
        return next;
      });
    };
  }, []);
  const value = React.useMemo<FormErrorsRegistryValue>(
    () => ({ errors: errors ?? {}, claimed, claim }),
    [errors, claimed, claim],
  );
  return (
    <FormErrorsRegistryContext.Provider value={value}>
      {children}
    </FormErrorsRegistryContext.Provider>
  );
}

/** FormField calls this to claim its error-bag key while mounted (no-op outside a Form). */
export function useClaimErrorKey(name: string | undefined) {
  const registry = useFormErrorsRegistry();
  const claim = registry?.claim;
  useIsomorphicLayoutEffect(() => {
    if (!name || !claim) return;
    return claim(name);
  }, [name, claim]);
}

/**
 * FormErrors — renders the error-bag entries no mounted `FormField name="…"` displays: server
 * validation errors attached to hidden/derived fields (an `action_mode`, a `page`, a source-record
 * id) that would otherwise fail silently. Place it inside a `Form errors={…}` — typically above
 * the fields; it renders nothing while every entry is claimed or the bag is empty.
 */
export function FormErrors({ errors: errorsProp, title, className }: FormErrorsProp) {
  const { t } = useTranslation();
  const registry = useFormErrorsRegistry();
  const errors = errorsProp ?? registry?.errors;
  const claimed = registry?.claimed;

  const messages: { key: string; message: string }[] = [];
  for (const [key, entry] of Object.entries(errors ?? {})) {
    if (entry == null || (claimed?.get(key) ?? 0) > 0) continue;
    for (const message of Array.isArray(entry) ? entry : [entry]) {
      if (message) messages.push({ key, message });
    }
  }
  if (!messages.length) return null;

  return (
    <Alert tone="destructive" className={className}>
      <AlertContent>
        <AlertTitle>{title ?? t("dataEntry.formErrors.title")}</AlertTitle>
        {messages.map(({ key, message }, index) => (
          <AlertDescription key={`${key}-${index}`}>{message}</AlertDescription>
        ))}
      </AlertContent>
    </Alert>
  );
}
