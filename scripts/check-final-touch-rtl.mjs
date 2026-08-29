#!/usr/bin/env node
import { spawn } from "node:child_process";

const port = 6010;
const base = `http://localhost:${port}`;
const server = spawn(
  "pnpm",
  ["exec", "vite", "--config", "preview/vite.config.ts", "--port", String(port), "--strictPort"],
  // stderr is piped, not ignored: when the server fails to bind we need to SAY why.
  { stdio: ["ignore", "ignore", "pipe"], env: process.env },
);
let serverStderr = "";
server.stderr?.on("data", (chunk) => {
  serverStderr += String(chunk);
});

async function waitForServer() {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      /* server chưa lên — thử lại */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    "preview server did not start within 60s" + (serverStderr ? `\n${serverStderr}` : ""),
  );
}

try {
  await waitForServer();
  process.env.PREVIEW_URL = base;
  await import("./run-final-touch-rtl.mjs");
} finally {
  server.kill("SIGTERM");
}
