// dev-only — in-memory + localStorage-snapshotting record store.
// Not bundled / not exported beyond dev-probe/.

import { useSyncExternalStore } from "react";
import { generateAll } from "./fakeData";
import type { AnyRecord } from "./schemaTypes";

const STORAGE_KEY = "dev-probe:records:v1";

type Store = Record<string, AnyRecord[]>;

let store: Store = load();

function load(): Store {
  if (typeof localStorage === "undefined") return generateAll();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Store;
    } catch {
      /* fallthrough — regenerate */
    }
  }
  const fresh = generateAll();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* ignore quota */
  }
  return fresh;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  for (const l of listeners) l();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// Per-object snapshot caching — `useSyncExternalStore` requires
// stable references across re-renders to avoid infinite loops, so we
// memo the array per object name and only mint a new one when the
// underlying records mutate.
const arraySnapshotCache = new Map<string, AnyRecord[]>();

export function listRecords(objectName: string): AnyRecord[] {
  const next = store[objectName] ?? [];
  const cached = arraySnapshotCache.get(objectName);
  if (cached && cached === next) return cached;
  arraySnapshotCache.set(objectName, next);
  return next;
}

export function findRecord(objectName: string, id: string): AnyRecord | undefined {
  return (store[objectName] ?? []).find((r) => r.id === id);
}

export function createRecord(objectName: string, patch: Partial<AnyRecord>): AnyRecord {
  const record: AnyRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...patch,
  };
  const list = store[objectName] ?? [];
  store[objectName] = [record, ...list];
  arraySnapshotCache.delete(objectName);
  persist();
  emit();
  return record;
}

export function updateRecord(objectName: string, id: string, patch: Partial<AnyRecord>): AnyRecord | undefined {
  const list = store[objectName] ?? [];
  let updated: AnyRecord | undefined;
  store[objectName] = list.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, ...patch, id };
    return updated;
  });
  arraySnapshotCache.delete(objectName);
  persist();
  emit();
  return updated;
}

export function deleteRecord(objectName: string, id: string): boolean {
  const list = store[objectName] ?? [];
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  store[objectName] = next;
  arraySnapshotCache.delete(objectName);
  persist();
  emit();
  return true;
}

export function deleteRecords(objectName: string, ids: string[]): number {
  const set = new Set(ids);
  const list = store[objectName] ?? [];
  const next = list.filter((r) => !set.has(r.id));
  const removed = list.length - next.length;
  if (!removed) return 0;
  store[objectName] = next;
  arraySnapshotCache.delete(objectName);
  persist();
  emit();
  return removed;
}

export function resetStore() {
  store = generateAll();
  arraySnapshotCache.clear();
  persist();
  emit();
}

export function useRecords(objectName: string): AnyRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => listRecords(objectName),
    () => listRecords(objectName),
  );
}

// findRecord returns whatever .find() yields. As long as the array
// reference is stable (cached by arraySnapshotCache) and the entry
// objects haven't been replaced, the same object reference is
// returned — safe for useSyncExternalStore.
export function useRecord(objectName: string, id: string | undefined): AnyRecord | undefined {
  const getSnap = () => {
    if (!id) return undefined;
    // Tie the snapshot to the list-snapshot so it's referentially
    // stable across renders when the underlying records don't change.
    const list = listRecords(objectName);
    return list.find((r) => r.id === id);
  };
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}
