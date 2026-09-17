/**
 * WCAG contrast maths, shared by the token-palette tests.
 *
 * Two copies of a luminance formula is how one of them quietly drifts and starts certifying a
 * palette that fails in the browser.
 */

/** Read an `--name: H S% L%;` token out of a CSS/TSX source block as [h, s, l]. */
export function hsl(body: string, name: string): [number, number, number] {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`token --${name} not found`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((x) => x * 255) as [number, number, number];
}

export function luminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composite `fg` at `alpha` over `bg`, the way the browser paints a tint. */
export function over(
  fg: [number, number, number],
  bg: [number, number, number],
  alpha: number,
): [number, number, number] {
  return fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) as [number, number, number];
}

/** WCAG 2.2 SC 1.4.11 Non-text Contrast. */
export const NON_TEXT = 3;

/**
 * THE DERIVED PRIMARY FAMILY, EVALUATED THE WAY THE BROWSER DOES (gh#678).
 *
 * `--primary-hover` & co. are no longer triplets in CSS source: each is an `initial` knob whose
 * default is `hsl(from hsl(var(--primary)) <channels>)` at the call site, with `<channels>` read
 * from `--<name>-channels`. A gate that reads a literal can only ever measure ONE seed, which is how
 * a violet hover on a blue consumer shipped with every suite green. These helpers evaluate the
 * channel expressions for ANY seed, so a gate can sweep seeds instead of pinning one.
 *
 * Relative colour syntax in `hsl()` exposes `h` in degrees and `s` / `l` as bare numbers 0–100; the
 * result is clamped to that range when painted, which `relative` below does too.
 */
type Hsl = [number, number, number];

/** Read `--name: value;` out of a block body, whitespace collapsed. */
export function declaration(body: string, name: string): string {
  const m = body.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`token --${name} not found`);
  return m[1].replace(/\s+/g, " ").trim();
}

/** The channel expression for `--<name>-channels`, following one `var()` hop through `scopes`. */
export function channelsOf(name: string, ...scopes: string[]): string {
  for (const body of scopes) {
    if (!new RegExp(`--${name}-channels:`).test(body)) continue;
    const value = declaration(body, `${name}-channels`);
    const hop = value.match(/^var\(--([a-z0-9-]+)-channels\)$/);
    return hop ? channelsOf(hop[1], ...scopes) : value;
  }
  throw new Error(`--${name}-channels not declared in any scope given`);
}

/** Evaluate a CSS math expression over the channel keywords h / s / l. */
function evaluate(expression: string, [h, s, l]: Hsl): number {
  const tokens = expression.match(/\d*\.?\d+|[a-z]+|[-+*/(),]/g) ?? [];
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  const args = (): number[] => {
    const out: number[] = [];
    if (next() !== "(") throw new Error(`expected ( in ${expression}`);
    out.push(sum());
    while (peek() === ",") {
      next();
      out.push(sum());
    }
    if (next() !== ")") throw new Error(`expected ) in ${expression}`);
    return out;
  };
  const atom = (): number => {
    const t = next();
    if (t === "(") {
      const v = sum();
      next();
      return v;
    }
    if (t === "-") return -atom();
    if (/^\d|^\./.test(t)) return Number(t);
    if (t === "h") return h;
    if (t === "s") return s;
    if (t === "l") return l;
    if (t === "calc") return args()[0];
    if (t === "min") return Math.min(...args());
    if (t === "max") return Math.max(...args());
    if (t === "clamp") {
      const [lo, v, hi] = args();
      return Math.max(lo, Math.min(v, hi));
    }
    throw new Error(`unsupported token "${t}" in ${expression}`);
  };
  const product = (): number => {
    let v = atom();
    while (peek() === "*" || peek() === "/") v = next() === "*" ? v * atom() : v / atom();
    return v;
  };
  const sum = (): number => {
    let v = product();
    while (peek() === "+" || peek() === "-") v = next() === "+" ? v + product() : v - product();
    return v;
  };
  const value = sum();
  if (i !== tokens.length) throw new Error(`trailing input in ${expression}`);
  return value;
}

/** Split `h calc(s * 0.68) calc(l + 16)` into its three top-level channel expressions. */
function splitChannels(channels: string): [string, string, string] {
  const parts: string[] = [];
  let depth = 0;
  let buffer = "";
  for (const ch of channels) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === " " && depth === 0) {
      if (buffer) parts.push(buffer);
      buffer = "";
    } else buffer += ch;
  }
  if (buffer) parts.push(buffer);
  if (parts.length !== 3) throw new Error(`expected three channels, got "${channels}"`);
  return parts as [string, string, string];
}

/** `hsl(from hsl(<seed>) <channels>)`, as [h, s, l] clamped the way it paints. */
export function relative(seed: Hsl, channels: string): Hsl {
  const [h, s, l] = splitChannels(channels).map((part) => evaluate(part, seed));
  return [((h % 360) + 360) % 360, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))];
}

/** Parse an `H S% L%` triplet as written in a seed list or a token. */
export function triplet(value: string): Hsl {
  const m = value.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) throw new Error(`not an H S% L% triplet: ${value}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}
