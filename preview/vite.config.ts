import path from "node:path";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import pkg from "../package.json";

const require = createRequire(import.meta.url);
const previewRoot = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(previewRoot, "..");
const fontDir = path.dirname(require.resolve("@fontsource/m-plus-2/package.json"));

/**
 * Mirror package.json exports so doc demos import like app consumers — but resolve to
 * the SOURCE (for live HMR), not the published `dist`. The exports map points each subpath
 * at a built `./dist/*.js` (often via a conditional `{ types, import }` object); we reverse
 * that to the matching `src/*.{ts,tsx}` entry (same logic as tsup.config.ts entriesFromExports).
 */
type ExportTarget = string | { types?: string; import?: string };
function packageExportAliases(): Array<{ find: string | RegExp; replacement: string }> {
  const entries: Array<{ find: string; replacement: string }> = [];
  const exports = pkg.exports as Record<string, ExportTarget>;

  for (const [subpath, target] of Object.entries(exports)) {
    const dist = typeof target === "string" ? target : target.import;
    if (!dist || !dist.endsWith(".js")) continue; // skip css / type-only targets
    const base = dist.replace(/^\.\//, "").replace(/^dist\//, "src/").replace(/\.js$/, "");
    const srcRel = [".tsx", ".ts"].map((ext) => base + ext).find((p) => existsSync(path.resolve(uiRoot, p)));
    if (!srcRel) continue; // no source entry → leave to node resolution
    const replacement = path.resolve(uiRoot, srcRel);
    entries.push({ find: subpath === "." ? "@godxjp/ui" : `@godxjp/ui${subpath.slice(1)}`, replacement });
  }

  // Longest match first — avoid `@godxjp/ui` swallowing `/data-display` subpaths.
  entries.sort((a, b) => b.find.length - a.find.length);
  return entries;
}

/** `/isolate/:storyId` and `/frame/:storyId` → separate HTML entries (not SPA hash). */
function standaloneRoutePlugin(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = req.url ?? "";
    const pathname = url.split("?")[0] ?? "";
    const qs = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    if (pathname.startsWith("/isolate/") && !pathname.includes(".")) {
      req.url = `/isolate.html${qs}`;
    } else if (pathname.startsWith("/frame/") && !pathname.includes(".")) {
      req.url = `/frame.html${qs}`;
    }
    next();
  };

  return {
    name: "preview-standalone-routes",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  root: previewRoot,
  // "/" for local dev; the Pages CI sets PREVIEW_BASE=/godxjp-ui/ for project-page asset paths.
  base: process.env.PREVIEW_BASE ?? "/",
  plugins: [react(), tailwindcss(), standaloneRoutePlugin()],
  server: {
    port: 6008,
    strictPort: true,
    fs: {
      allow: [previewRoot, uiRoot, fontDir],
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: path.resolve(previewRoot, "index.html"),
        isolate: path.resolve(previewRoot, "isolate.html"),
        frame: path.resolve(previewRoot, "frame.html"),
      },
    },
  },
  resolve: {
    alias: packageExportAliases(),
  },
  optimizeDeps: {
    include: ["@radix-ui/react-alert-dialog", "@radix-ui/react-context", "@radix-ui/react-dialog"],
  },
});
