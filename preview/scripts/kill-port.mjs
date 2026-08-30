#!/usr/bin/env node
/**
 * Free a preview port before start — `pnpm preview` is :6008 (strictPort, no fallback).
 *
 * The port is an ARGUMENT, defaulting to 6008. It used to be a hard-coded constant, and that cost
 * a whole CI lane: `check-layout-nav-frames.mjs` calls this unconditionally, so on a self-hosted
 * host where several browser jobs share a machine it SIGKILLed whatever held 6008 — which was
 * another job's preview server. The victim then logged over a thousand `ERR_CONNECTION_REFUSED`
 * against a server that no longer existed, and the failure surfaced anywhere but here.
 *
 * Usage: node preview/scripts/kill-port.mjs [port]   (or PREVIEW_PORT=6041 …)
 */
import { execSync } from "node:child_process";

const PORT = Number(process.argv[2] ?? process.env.PREVIEW_PORT) || 6008;

let pids = [];
try {
  pids = execSync(`lsof -ti tcp:${PORT}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    .trim()
    .split("\n")
    .filter(Boolean);
} catch {
  /* nothing listening */
}

for (const pid of pids) {
  try {
    process.kill(Number(pid), "SIGKILL");
  } catch {
    /* already gone */
  }
}

if (pids.length > 0) {
  console.log(`[preview] freed :${PORT} (killed ${pids.length} process(es))`);
}
