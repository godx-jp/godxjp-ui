#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";

const port = 6010;
const base = `http://localhost:${port}`;
// The preview server comes from `frame-harness.ensurePreviewServer`, the one path with a green
// record on this pool. These gates used to hand-roll it — first with `vite` (the DEV server,
// which on a cold runner never binds in time), then with `vite preview`, which still failed while
// frame-axe / frame-geometry / contrast passed doing the apparently same thing. Rather than keep
// guessing which of the small differences mattered (detached process group, an early reachability
// check, an explicit cwd), they now call the function that works. One way to stand a preview up.
const stopServer = await ensurePreviewServer(base);

try {
  process.env.PREVIEW_URL = base;
  await import("./run-final-touch-rtl.mjs");
} finally {
  stopServer();
}
