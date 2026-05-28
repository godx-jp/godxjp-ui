#!/usr/bin/env node
/**
 * Free preview port before start — godxjp-ui preview is :6008 only (strictPort, no fallback).
 */
import { execSync } from "node:child_process";

const PORT = 6008;

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
