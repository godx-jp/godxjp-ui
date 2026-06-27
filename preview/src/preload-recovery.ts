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
 */
declare global {
  // Injected by Vite `define` (preview/vite.config.ts) — the published package version.
  const __APP_VERSION__: string;
}

const KEY = "godxjp-ui-preview:preload-reload-at";

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault(); // we handle recovery ourselves instead of throwing to the console
  const last = Number(sessionStorage.getItem(KEY) ?? "0");
  if (Date.now() - last < 10_000) return; // already reloaded very recently — avoid a loop
  sessionStorage.setItem(KEY, String(Date.now()));
  window.location.reload();
});

export {};
