#!/usr/bin/env node
import { spawn } from "node:child_process";

const port = 6010;
const base = `http://localhost:${port}`;
const server = spawn(
  "pnpm",
  ["exec", "vite", "--config", "preview/vite.config.ts", "--port", String(port), "--strictPort"],
  { stdio: "ignore", env: process.env },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("preview server did not start");
}

try {
  await waitForServer();
  process.env.PREVIEW_URL = base;
  await import("./run-final-touch-rtl.mjs");
} finally {
  server.kill("SIGTERM");
}
