#!/usr/bin/env node
/**
 * A docs page may not fetch an asset from the public internet.
 *
 * `docs/data-display/avatar.tsx` and `docs/data-display/card/index.tsx` loaded portraits from
 * `https://picsum.photos`. That is not merely a slow page: the browser gates navigate with
 * `waitUntil: "networkidle"`, so a request that never settles means the page never finishes
 * loading, and `page.goto` dies at its 30s timeout. Both frames failed at EVERY viewport in both
 * the axe and the geometry sweep — which for weeks read as "infrastructure errors" and sent me
 * looking at the runner, the preview server and the harness in turn (gh#333).
 *
 * The tell was that the failures were not scattered. Load scatters; these hit the same two frames
 * every time, at every width, in both gates. That is a property of the page, not of the machine.
 *
 * Inline the asset instead — a `data:` URI costs no request and renders identically offline.
 *
 * WHAT IS ALLOWED: `data:` URIs, same-origin paths, and a bare `https://` inside a COMMENT or a
 * string that is plainly documentation (a `@see` link, a spec URL). What is not allowed is an
 * `src`/`href`/`url()` that would make the browser fetch across the network at render time.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN = join(ROOT, "docs");

/**
 * Only what the RENDERER fetches and blocks on: `src`, `poster`, CSS `url()`, and a `<link href>`.
 *
 * `href` on an `<a>` is deliberately NOT matched. A link target is somewhere the user may go, not
 * something the browser loads — flagging `https://billing.example.com/portal` would be a guard
 * reporting on prose, which is the failure mode two other guards in this repo already had to be
 * taught out of.
 */
const FETCHING =
  /(?:\bsrc|\bposter)\s*=\s*["'{`]?\s*(https?:\/\/[^"'`)\s}]+)|url\(\s*["']?(https?:\/\/[^"')\s]+)|<link[^>]*?href\s*=\s*["'{`]?\s*(https?:\/\/[^"'`)\s}]+)/g;

/**
 * Hosts a docs page may fetch from, each with the reason.
 *
 * Google Fonts is the one real exception and it is a considered one: the brand showcases exist to
 * prove a consumer's design can be reproduced from tokens, and that design IS its typeface. The
 * request also fails FAST when the network is absent, which is what separates it from the case
 * that started gh#333 — picsum.photos never answered at all, so `networkidle` never fired and the
 * frame hung for the full 30s at every viewport. A dependency that degrades is survivable; one
 * that hangs is not.
 */
const ALLOWED_HOSTS = [/^https:\/\/fonts\.(googleapis|gstatic)\.com\//];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Comments are prose. A URL in an explanation is not a fetch — the same phantom-debt trap that
 * check-no-hardcoded-geometry and the raw-palette audit both had to be taught about. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
}

const findings = [];
for (const file of walk(SCAN).filter((f) => /\.(tsx?|css|mdx?)$/.test(f))) {
  const source = stripComments(readFileSync(file, "utf8"));
  for (const m of source.matchAll(FETCHING)) {
    const url = m[1] ?? m[2] ?? m[3];
    if (!url || ALLOWED_HOSTS.some((re) => re.test(url))) continue;
    const line = source.slice(0, m.index).split("\n").length;
    findings.push({ file: relative(ROOT, file), line, url });
  }
}

if (findings.length) {
  console.error("✗ a docs page fetches an asset from the public internet\n");
  for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.url}`);
  console.error(
    "\n  The browser gates navigate with `networkidle`, so a request that does not settle stops\n" +
      "  the page from ever finishing — the frame then fails at every viewport and reads as an\n" +
      "  infrastructure error rather than as this. Inline it as a `data:` URI, or serve it from\n" +
      "  preview/public so it is same-origin.",
  );
  process.exit(1);
}
console.log(`✓ no docs page fetches an external asset (${walk(SCAN).length} files scanned)`);
