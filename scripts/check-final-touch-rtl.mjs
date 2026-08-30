#!/usr/bin/env node
import { spawn } from "node:child_process";

const port = 6010;
const base = `http://localhost:${port}`;
// Serve a BUILT preview, not a dev server. This used to spawn `vite --config …`, the DEV server,
// and poll for it. On a self-hosted runner with no warm Vite cache that never came up in time:
// dependency optimisation plus on-demand compilation of the whole app is not "a bit slow", it is
// structurally slower than any poll worth writing — raising the budget 60s -> 180s changed
// nothing, which is what proved the timeout was the wrong suspect. The three browser gates that
// were always green (frame-axe, frame-geometry, contrast) build once and serve the output with
// `vite preview`; these now do the same, so there is one way to stand a preview up and it is the
// one already proven on CI.
const server = spawn(
  "pnpm",
  [
    "exec",
    "vite",
    "preview",
    "--config",
    "preview/vite.config.ts",
    "--port",
    String(port),
    "--strictPort",
  ],
  // stderr is piped, not ignored: when the server fails to bind we need to SAY why.
  { stdio: ["ignore", "ignore", "pipe"], env: process.env },
);
let serverStderr = "";
server.stderr?.on("data", (chunk) => {
  serverStderr += String(chunk);
});

// How long to wait for Vite to come up. 60s is plenty for one server on an idle machine and far
// too little for five: the rendered-runtime shards run in PARALLEL on a single self-hosted host,
// each cold-starting its own Vite dev server while a full CI job runs beside them, and all five
// died on this line at once. The budget is env-tunable so a busier pool can raise it without a
// code change, and the error now says how long it actually waited.
const PREVIEW_START_TIMEOUT_MS = Number(process.env.PREVIEW_START_TIMEOUT_MS ?? 180_000);

async function waitForServer() {
  const attempts = Math.ceil(PREVIEW_START_TIMEOUT_MS / 100);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      /* server chưa lên — thử lại */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `preview server did not start within ${Math.round(PREVIEW_START_TIMEOUT_MS / 1000)}s` +
      (serverStderr ? `\n${serverStderr}` : ""),
  );
}

try {
  await waitForServer();
  process.env.PREVIEW_URL = base;
  await import("./run-final-touch-rtl.mjs");
} finally {
  server.kill("SIGTERM");
}
