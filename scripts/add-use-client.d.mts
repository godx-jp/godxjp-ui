/** Type surface for the gh#128 "use client" stamper (scripts/add-use-client.mjs). */

/** True when source code directly uses a client-only React API / dep (createContext, a hook call, or a client-only import). */
export function isClientSource(code: string): boolean;

/** Absolute src file paths that must ship `"use client"` (direct usage + `.tsx` wrappers of client children). */
export function clientSources(): Set<string>;

/** The `clientSources()` set mapped to their emitted dist `.js` modules. */
export function clientDistModules(): string[];
