/**
 * `isDevelopment()` — the ONE place this package is allowed to ask whether it is in a dev build.
 *
 * WHY THIS EXISTS, and it is a crash rather than a tidiness question. Eight shipped modules read
 * `process.env.NODE_ENV` to decide whether to emit a development warning. Three of them guarded
 * the read with `typeof process !== "undefined"`; five did not, and `process` is not a browser
 * global. Nothing in the build replaces it either — `tsup.config.ts` declares no `define`, and
 * `grep -o 'process\.env' dist` on the published tarball of 23.4.4 returns 9 hits, raw.
 *
 * Measured, not theorised: this repo's own preview app (Vite 8, dev mode) renders
 * `/isolate/data-entry-password-strength` as **"Preview render failed — process is not defined"**,
 * six DOM nodes and nothing else. `PasswordInput` is one of the five unguarded modules and that
 * page renders it. A bundler that happens to define `process.env.NODE_ENV` papers over it, which
 * is exactly why it survived: most consumers' toolchains do, and the ones that do not get a blank
 * screen rather than a warning.
 *
 * The helper reads the guard ONCE so the two halves cannot drift apart again, and it fails SAFE:
 * where `process` is absent we cannot tell dev from production, so the answer is `false` and the
 * warnings go quiet. A missing warning is a cost; a component that throws while rendering is not
 * a cost, it is a broken page.
 *
 * A new bare `process.env` read in `src/components/**` is a CI failure — see
 * `src/lib/__tests__/dev-guard.test.ts`.
 *
 * TWO THINGS ABOUT THE SHAPE BELOW, and the first one is why the three "guarded" modules were
 * only half guarded.
 *
 * NO OPTIONAL CHAINING ON `process.env`. It does not survive the build. Written as
 * `process.env?.NODE_ENV`, the transformed output measured in this repo's own vitest pipeline is
 *
 *     return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
 *
 * — the `?.` is GONE, because a bundler `define` matches the text `process.env` and substitutes
 * through it, discarding the chain. So `?.` is not a guard here; it reads like one, which is
 * worse than nothing. `typeof process` does survive (measured in the same dump), and a truthiness
 * test on `process.env` survives as a truthiness test whatever it is replaced with.
 *
 * THE LITERAL IS KEPT ON THE LAST LINE ON PURPOSE. `process.env.NODE_ENV` is the exact text every
 * bundler's `define` looks for, and that substitution is what lets a consumer's production build
 * fold these branches away and drop the warning strings entirely. Reading the global indirectly
 * (`globalThis.process`) would be equally crash-proof and would cost every consumer that
 * dead-code elimination, so the order of the checks does the work instead: the guard runs first,
 * and the replaceable literal is only reached once `env` is known to exist.
 */
export function isDevelopment(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  return process.env.NODE_ENV !== "production";
}
