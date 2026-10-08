import type { Locale } from "date-fns";
import type {
  AppDateFormat,
  AppLocale,
  AppRequestHeaders,
  AppTimeFormat,
  AppTimezone,
} from "./types";

/**
 * THE PER-REQUEST HOME OF EVERYTHING A NON-REACT CALLER READS (v32, gh#1219).
 *
 * Locale, timezone, the date/time formats and the request headers used to be three module-level
 * variables (`translate.ts`, `request-headers.ts`, `lib/datetime/sync.ts`). In a browser that is
 * one user and harmless. On a server it is every request at once: the last `AppProvider` to render
 * wrote them, so a `translateCurrent` / `formatDate` / `getAppRequestHeaders` call in request A
 * answered with request B's language and zone — measured in `ssr-request-isolation.test.tsx`.
 *
 * Now each of those modules keeps its slot in ONE `AppSettingsState` object, and which object is
 * "current" depends on where the call runs:
 *
 * 1. inside `runWithAppSettings(settings, fn)` → that call's own object. On a server it is carried
 *    by `AsyncLocalStorage`, so it survives every `await` inside `fn`; where no AsyncLocalStorage
 *    exists it covers the synchronous part of `fn` only.
 * 2. otherwise → one module-level object, which is the browser's single-user case.
 *
 * React components do not need this: they read `AppProvider`'s context, which is per tree by
 * construction. The scope is for code that has no React context to read.
 */
export type AppSettings = {
  locale: AppLocale;
  fallbackLocale: AppLocale;
  timezone: AppTimezone;
  timeFormat: AppTimeFormat;
  dateFormat: AppDateFormat;
};

/** @internal Each module owns one slot; an unset slot means "nothing chose it — use the default". */
export type AppSettingsState = {
  i18n?: Partial<Pick<AppSettings, "locale" | "fallbackLocale">>;
  datetime?: Partial<Pick<AppSettings, "locale" | "timezone" | "timeFormat" | "dateFormat">> & {
    dateFnsLocale?: Locale;
  };
  headers?: Partial<AppRequestHeaders>;
};

type Als<T> = { getStore(): T | undefined; run<R>(store: T, fn: () => R): R };
type AlsConstructor = new <T>() => Als<T>;

/**
 * AsyncLocalStorage WITHOUT a static `node:` import, so the browser bundle never sees one. Edge
 * runtimes (Next.js, Cloudflare `nodejs_compat`) put it on `globalThis`; Node ≥ 20.16 exposes it
 * through `process.getBuiltinModule`. Neither present → `null`, and the synchronous fallback runs.
 */
function findAsyncLocalStorage(): AlsConstructor | null {
  const g = globalThis as { AsyncLocalStorage?: AlsConstructor };
  if (typeof g.AsyncLocalStorage === "function") return g.AsyncLocalStorage;
  const proc = (
    globalThis as {
      process?: { getBuiltinModule?: (id: string) => { AsyncLocalStorage?: AlsConstructor } };
    }
  ).process;
  if (proc && typeof proc.getBuiltinModule === "function") {
    try {
      return proc.getBuiltinModule("node:async_hooks")?.AsyncLocalStorage ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

let als: Als<AppSettingsState> | null | undefined;
let syncScope: AppSettingsState | null = null;
const globalState: AppSettingsState = {};

/** @internal The state object the current call belongs to. Mutated in place by the `sync*` writers. */
export function getAppSettingsState(): AppSettingsState {
  return als?.getStore() ?? syncScope ?? globalState;
}

function definedOnly<T extends object>(value: T): Partial<T> | undefined {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  return entries.length > 0 ? (Object.fromEntries(entries) as Partial<T>) : undefined;
}

/**
 * Run `fn` with its own locale / timezone / format / header state — one call per server request.
 *
 * Everything `fn` reaches without a React context (`translateCurrent`, `formatDate` with no
 * options, `getAppRequestHeaders`, and an `AppProvider` rendered inside it syncing its values for
 * those callers) reads and writes THIS call's state, never another request's. Unset fields keep
 * the neutral defaults (`<html lang>`/`en`, UTC on a server, formats from `Intl`).
 *
 * ```ts
 * const html = await runWithAppSettings({ locale: "de", timezone: "Europe/Berlin" }, () =>
 *   renderToString(<App />),
 * );
 * ```
 */
export function runWithAppSettings<R>(settings: Partial<AppSettings>, fn: () => R): R {
  const { locale, fallbackLocale, timezone, timeFormat, dateFormat } = settings;
  const state: AppSettingsState = {
    i18n: definedOnly({ locale, fallbackLocale }),
    datetime: definedOnly({ locale, timezone, timeFormat, dateFormat }),
  };

  if (als === undefined) {
    const Ctor = findAsyncLocalStorage();
    als = Ctor ? new Ctor<AppSettingsState>() : null;
  }
  if (als) return als.run(state, fn);

  const previous = syncScope;
  syncScope = state;
  try {
    return fn();
  } finally {
    syncScope = previous;
  }
}
