// dev-only — minimal hash router. No react-router.

import { useSyncExternalStore } from "react";

export type Route =
  | { kind: "home" }
  | { kind: "list"; object: string }
  | { kind: "new"; object: string }
  | { kind: "detail"; object: string; id: string }
  | { kind: "edit"; object: string; id: string }
  | { kind: "unknown"; raw: string };

function read(): Route {
  if (typeof window === "undefined") return { kind: "home" };
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || raw === "/") return { kind: "home" };
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] !== "objects") return { kind: "unknown", raw };
  const object = parts[1];
  if (!object) return { kind: "home" };
  if (!parts[2]) return { kind: "list", object };
  if (parts[2] === "new") return { kind: "new", object };
  const id = parts[2];
  if (parts[3] === "edit") return { kind: "edit", object, id };
  return { kind: "detail", object, id };
}

let cached: Route = typeof window !== "undefined" ? read() : { kind: "home" };
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    cached = read();
    for (const l of listeners) l();
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useRoute(): Route {
  return useSyncExternalStore(
    subscribe,
    () => cached,
    () => cached,
  );
}

export function navigate(path: string) {
  if (typeof window === "undefined") return;
  if (window.location.hash === `#${path}`) {
    // Force a hashchange even when the target is identical.
    window.location.hash = "";
    window.location.hash = path;
    return;
  }
  window.location.hash = path;
}

export const routes = {
  home: () => "/",
  list: (object: string) => `/objects/${object}`,
  newRec: (object: string) => `/objects/${object}/new`,
  detail: (object: string, id: string) => `/objects/${object}/${id}`,
  edit: (object: string, id: string) => `/objects/${object}/${id}/edit`,
};
