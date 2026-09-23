#!/usr/bin/env node
/**
 * THE PREVIEW PORT, DERIVED FROM THE CHECKOUT RATHER THAN SHARED BY EVERY CHECKOUT (gh#875).
 *
 * `pnpm preview` was `kill-port 6008 && vite --port 6008 --strictPort`. With writing agents
 * required to work in `.claude/worktrees/**` — the standing rule — every one of them ran that same
 * line, so the port was a coin flip and `--strictPort` refused any fallback.
 *
 * gh#875 made `PREVIEW_PORT` honoured, which helps only the caller who remembers to set it. The
 * DEFAULT stayed 6008, so the collision stayed the default too.
 *
 * ── The kill is the mild failure. The silent one is worse ─────────────────────────────────────
 * A SIGKILLed server at least announces itself: the victim logs `ERR_CONNECTION_REFUSED` against a
 * server that no longer exists. The other outcome says nothing at all — the loser's browser
 * connects to the WINNER's server and measures the winner's source tree. A worktree probe then
 * reports numbers for code that is not in that worktree, and every one of them looks plausible.
 *
 * It happened twice in one session, to the author of this file:
 *   · four agents were told "use the preview on 6008"; the server was in fact being run out of one
 *     agent's worktree, so the parent's own CSS edit never reached the browser and a measurement
 *     of the loading state returned the pre-fix geometry.
 *   · one agent caught it on its own — its `base.css` edit did not show up — and started its own
 *     server, verifying with `lsof -p <pid> | grep cwd` that the process really was rooted in its
 *     worktree. That check is the one every caller would otherwise have to remember.
 *
 * ── Why a hash and not a counter ──────────────────────────────────────────────────────────────
 * A counter needs shared state and a lock, and the thing being coordinated is exactly the resource
 * that is contended. The checkout's own absolute path is already unique, already stable across
 * restarts, and needs no coordination: the same worktree always gets the same port, and two
 * worktrees cannot collide without a hash collision.
 *
 * The primary checkout keeps **6008** so every doc, script and habit that names it stays true. Only
 * a worktree is moved, and it is moved deterministically.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

/** 6100–6999: above the 6008 the primary keeps, below the ephemeral range. */
const RANGE_START = 6100;
const RANGE_SIZE = 900;

export function previewPort(cwd = process.cwd()) {
  const explicit = Number(process.env.PREVIEW_PORT);
  if (Number.isInteger(explicit) && explicit > 0) return explicit;

  let gitDir;
  let commonDir;
  let top;
  try {
    /* `--path-format=absolute` matters: in the PRIMARY checkout `--git-common-dir` answers the
     * relative `.git`, so comparing it against the absolute toplevel says "worktree" for every
     * checkout including the primary. That was this file's own first bug — the primary was handed
     * a derived port and 6008 went to nobody. */
    const q = (flag) =>
      execSync(`git rev-parse --path-format=absolute ${flag}`, { cwd, encoding: "utf8" }).trim();
    gitDir = q("--git-dir");
    commonDir = q("--git-common-dir");
    top = execSync("git rev-parse --show-toplevel", { cwd, encoding: "utf8" }).trim();
  } catch {
    // Not a git checkout at all — behave exactly as before.
    return 6008;
  }

  /* Git's OWN test, rather than a path-shape guess: in the primary the two are the same directory;
   * in a linked worktree `--git-dir` is `<primary>/.git/worktrees/<name>` while `--git-common-dir`
   * stays `<primary>/.git`. */
  if (gitDir === commonDir) return 6008;

  const digest = createHash("sha256").update(top).digest();
  return RANGE_START + (digest.readUInt32BE(0) % RANGE_SIZE);
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(String(previewPort()));
