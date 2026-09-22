/**
 * Self-heal stale dynamic-import chunks after a fresh GitHub Pages deploy.
 *
 * When a new build is published, the chunk file names change (content hashes). A browser that
 * still holds the OLD `index.html` (cached, or an open tab from before the deploy) will request a
 * lazily-imported module by its old hash — which now 404s — and Vite emits `vite:preloadError`
 * ("Failed to fetch dynamically imported module: …dropdown-menu-XXXX.js"). Reloading pulls the
 * fresh `index.html` + chunk map and the import succeeds.
 *
 * Guarded so it never loops: at most one auto-reload per 10s window per tab.
 *
 * ## It is a FUNCTION you must call, and it used to be a side-effect import (gh#860)
 *
 * This module registered its listener at module scope and every entry point wrote
 * `import "./preload-recovery"`. `package.json` declares `sideEffects: false` — a promise to the
 * bundler that dropping a module nothing takes a binding from is safe — so Rollup dropped it, and
 * **this recovery never shipped once.** Typecheck, lint and build were all green throughout; the
 * only evidence was that the module's own sessionStorage key appeared in zero built chunks.
 *
 * There is no symptom until a real visitor holds a stale `index.html` after a deploy, which is the
 * failure nobody reports because the page simply does not load. The same trap took out the docs
 * message catalogue in gh#858, where it was at least visible — every page rendered raw
 * `namespace.key.path`.
 *
 * So: an exported function, called explicitly. An explicit call cannot be shaken. And
 * `preview/__tests__/preload-recovery-ships.test.ts` asserts the key is present in the built
 * output, because that is the only check that catches this class.
 */
declare global {
  // Injected by Vite `define` (preview/vite.config.ts) — the published package version.
  const __APP_VERSION__: string;
}

const KEY = "godxjp-ui-preview:preload-reload-at";

export function installPreloadRecovery(): void {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault(); // we handle recovery ourselves instead of throwing to the console
    const last = Number(sessionStorage.getItem(KEY) ?? "0");
    if (Date.now() - last < 10_000) return; // already reloaded very recently — avoid a loop
    sessionStorage.setItem(KEY, String(Date.now()));
    window.location.reload();
  });
}
