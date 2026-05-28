import path from "node:path";
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

/** Mirror package.json exports so doc demos import like app consumers. */
function packageExportAliases(): Array<{ find: string | RegExp; replacement: string }> {
  const entries: Array<{ find: string; replacement: string }> = [];
  const exports = pkg.exports as Record<string, string>;

  for (const [subpath, target] of Object.entries(exports)) {
    if (!target.endsWith(".ts") && !target.endsWith(".tsx")) continue;
    const resolved = path.resolve(uiRoot, target.replace(/^\.\//, ""));
    if (subpath === ".") {
      entries.push({ find: "@godxjp/ui", replacement: resolved });
    } else {
      entries.push({ find: `@godxjp/ui${subpath.slice(1)}`, replacement: resolved });
    }
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
