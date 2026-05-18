import { useCallback, useEffect, useState } from "react";

export interface UseTableStateOptions<T> {
  /** localStorage key — required to enable persistence. Hook acts as plain useState if omitted. */
  storageKey?: string;
  /** Initial value (used when storage is empty / invalid / disabled). */
  defaultValue: T;
  /**
   * Bump to invalidate previously persisted data. Stored records with a
   * different version are discarded on read.
   */
  version?: number;
  /**
   * Optional migration from older versions. Receives `{ version, value }`
   * and returns a value of the current schema, or `undefined` to discard.
   */
  migrate?: (stored: { version: number; value: unknown }) => T | undefined;
  /** Override the storage backend — useful in tests / SSR. Defaults to `window.localStorage`. */
  storage?: Storage | null;
}

interface PersistedEnvelope<T> {
  version: number;
  value: T;
}

function readPersisted<T>(
  storage: Storage | null | undefined,
  storageKey: string,
  currentVersion: number,
  migrate?: UseTableStateOptions<T>["migrate"],
): T | undefined {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(storageKey);
    if (raw === null) return undefined;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return undefined;
    const envelope = parsed as Partial<PersistedEnvelope<T>>;
    if (typeof envelope.version !== "number" || !("value" in envelope))
      return undefined;
    if (envelope.version === currentVersion) return envelope.value as T;
    if (migrate)
      return migrate({
        version: envelope.version,
        value: envelope.value as unknown,
      });
    return undefined;
  } catch {
    return undefined;
  }
}

function writePersisted<T>(
  storage: Storage | null | undefined,
  storageKey: string,
  version: number,
  value: T,
) {
  if (!storage) return;
  try {
    storage.setItem(
      storageKey,
      JSON.stringify({ version, value } satisfies PersistedEnvelope<T>),
    );
  } catch {
    // Storage can be unavailable in private mode or sandboxed iframes.
  }
}

function resolveStorage(
  override: Storage | null | undefined,
): Storage | null {
  if (override !== undefined) return override;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * useTableState — versioned, persistent useState.
 *
 * Drop-in replacement for `useState<T>` that mirrors writes to
 * localStorage (or a custom Storage adapter) under `storageKey`.
 * Bump `version` to invalidate older records, or provide `migrate`
 * to transform them.
 *
 * Industry pattern: TanStack / MRT / MantineRT all recommend
 * "consumer code with `onStateChange` callbacks" for persistence —
 * this hook is the canonical small wrapper.
 *
 * @example
 *   const [filters, setFilters] = useTableState({
 *     storageKey: "orders.filters.v1",
 *     defaultValue: [] as TableFilter[],
 *     version: 1,
 *   });
 */
export function useTableState<T>(
  options: UseTableStateOptions<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const {
    storageKey,
    defaultValue,
    version = 1,
    migrate,
    storage: storageOverride,
  } = options;

  const storage = resolveStorage(storageOverride);
  const [value, setValue] = useState<T>(() => {
    if (storageKey === undefined) return defaultValue;
    const persisted = readPersisted<T>(storage, storageKey, version, migrate);
    return persisted !== undefined ? persisted : defaultValue;
  });

  useEffect(() => {
    if (storageKey === undefined) return;
    writePersisted(storage, storageKey, version, value);
  }, [storage, storageKey, value, version]);

  const setNext = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) =>
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next,
      );
    },
    [],
  );

  return [value, setNext];
}
