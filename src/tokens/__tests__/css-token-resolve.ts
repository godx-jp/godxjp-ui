/**
 * Resolve the token graph from the CSS SOURCE.
 *
 * jsdom does no layout and applies no author cascade, so `getComputedStyle` on a token is
 * always the empty string — every "did the token move?" question has to be answered by
 * reading the stylesheets and doing the substitution by hand. That is what this file is.
 *
 * Three things it models that a naive regex does not:
 *
 *   1. **Cascade order comes from `base.css`.** Equal-specificity `:root` declarations in
 *      different tier files are decided by `@import` order, not by filename. A helper that
 *      globbed `components/*.css` alphabetically would read `banner.css` before
 *      `feedback.css` and get the winner backwards.
 *   2. **Brace structure, not lines.** A declaration's owning selector is the innermost
 *      non-at-rule frame, and this repo wraps long values onto the next line.
 *   3. **`initial` is not a value.** A role-mirror knob declared `initial` (docs/TOKENS.md)
 *      falls through to the `var(--knob, <role>)` fallback at the call site, exactly as a
 *      browser would.
 *
 * `--scaling` is injectable so a test can resolve the same graph at compact / default /
 * comfortable density: a token declared at `:root` substitutes `var(--scaling)` at `:root`,
 * so the density axis (`:root[data-density]`) re-resolves it on the same element.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

export interface Declaration {
  /** Innermost non-at-rule frame, e.g. `:root` or `.ui-scale-fixed`. */
  selector: string;
  /** Enclosing at-rules, e.g. `@media (pointer: coarse)`. Empty for the plain cascade. */
  atRules: string[];
  token: string;
  value: string;
  file: string;
  line: number;
}

/** Tier files in cascade order: base.css's own `@import` list, then the density layer. */
export function tierFiles(): string[] {
  const base = readFileSync(join(ROOT, "src/tokens/base.css"), "utf8");
  const imports = [...base.matchAll(/@import\s+"\.\/([^"]+)"/g)].map((m) => `src/tokens/${m[1]}`);
  return [...imports, "src/styles/density.css"];
}

/** Every custom-property declaration in `css`, with its owning selector. */
export function declarations(css: string, file: string): Declaration[] {
  const out: Declaration[] = [];
  const stack: string[] = [];
  let buffer = "";
  let line = 1;
  let i = 0;
  while (i < css.length) {
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const comment = css.slice(i, end + 2);
      line += (comment.match(/\n/g) ?? []).length;
      i = end + 2;
      continue;
    }
    const ch = css[i];
    if (ch === "\n") line += 1;
    if (ch === "{") {
      stack.push(buffer.trim().split("\n").pop()!.trim());
      buffer = "";
    } else if (ch === "}") {
      stack.pop();
      buffer = "";
    } else if (ch === ";") {
      const match = buffer.trim().match(/^(--[a-z0-9-]+)\s*:\s*([\s\S]+)$/);
      if (match) {
        out.push({
          selector: stack.filter((s) => !s.startsWith("@")).join(" ") || "(top level)",
          atRules: stack.filter((s) => s.startsWith("@")),
          token: match[1],
          value: match[2].replace(/\s+/g, " ").trim(),
          file,
          line,
        });
      }
      buffer = "";
    } else {
      buffer += ch;
    }
    i += 1;
  }
  return out;
}

/** Every declaration across the tier files, in cascade order. */
export function allDeclarations(): Declaration[] {
  return tierFiles().flatMap((file) => declarations(readFileSync(join(ROOT, file), "utf8"), file));
}

export interface EnvOptions {
  /** Selectors in play, e.g. `[":root"]` or `[":root", ".ui-scale-fixed"]`. */
  selectors: string[];
  /** Override `--scaling` — models `:root[data-density="…"]` / AppProvider `scaling`. */
  scaling?: string;
}

/**
 * The resolved declaration map for a set of selectors, applied in the order given.
 *
 * `scaling` is injected right after the `:root` layer, NOT at the end — otherwise it would
 * stomp the `--scaling: 1` that `.ui-scale-fixed` and the density scopes declare for
 * themselves, and a scale-fixed subtree would appear to track density when the whole point of
 * it is that it does not.
 */
export function environment({ selectors, scaling }: EnvOptions): Map<string, string> {
  const env = new Map<string, string>();
  const decls = allDeclarations().filter((d) => d.atRules.length === 0);
  for (const selector of selectors) {
    for (const decl of decls) {
      if (decl.selector !== selector) continue;
      env.set(decl.token, decl.value);
    }
    if (selector === ":root" && scaling !== undefined) env.set("--scaling", scaling);
  }
  return env;
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of input) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  return parts;
}

function substitute(value: string, env: Map<string, string>, seen: Set<string>): string {
  let out = "";
  let i = 0;
  while (i < value.length) {
    if (!value.startsWith("var(", i)) {
      out += value[i];
      i += 1;
      continue;
    }
    let depth = 0;
    let j = i + 3;
    for (; j < value.length; j += 1) {
      if (value[j] === "(") depth += 1;
      else if (value[j] === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const [nameRaw, ...rest] = splitTopLevel(value.slice(i + 4, j));
    const name = nameRaw.trim();
    const fallback = rest.join(",").trim();
    const declared = env.get(name);
    if (declared === undefined || declared === "initial") {
      out += fallback ? substitute(fallback, env, seen) : "(unset)";
    } else if (seen.has(name)) {
      out += "(cycle)";
    } else {
      out += substitute(declared, env, new Set([...seen, name]));
    }
    i = j + 1;
  }
  return out;
}

/** Evaluate a fully-substituted single-unit length expression; `null` if not arithmetic. */
function arithmetic(expression: string): string | null {
  let expr = expression;
  let guard = 0;
  while (expr.includes("calc(") && guard < 64) {
    expr = expr.replace("calc(", "(");
    guard += 1;
  }
  if (!/^[\d\s().*/+\-rempx]+$/i.test(expr)) return null;
  const units = [...expr.matchAll(/[\d.](rem|px)\b/g)].map((m) => m[1]);
  const unit = units[0];
  if (unit !== undefined && units.some((u) => u !== unit)) return null;
  let n: unknown;
  try {
    n = Function(`"use strict";return (${expr.replace(/(rem|px)\b/g, "")})`)();
  } catch {
    return null;
  }
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const rounded = Math.round(n * 1e6) / 1e6;
  return unit === undefined ? String(rounded) : `${rounded}${unit}`;
}

/** Resolve one token to a final length (e.g. `"1.08rem"`), or a descriptive string. */
export function resolveToken(token: string, env: Map<string, string>): string {
  const raw = env.get(token);
  if (raw === undefined) return "(undeclared)";
  const flat = substitute(raw, env, new Set([token]))
    .replace(/\s+/g, " ")
    .trim();
  return arithmetic(flat) ?? flat;
}
