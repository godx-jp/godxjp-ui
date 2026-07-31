/**
 * The canonical GoDX brand mark, as email-safe markup.
 *
 * The mark is an emerald CAPSULE with an internal light GLYPH bar — the same artwork the React
 * `<Logo mark="godx" />` paints, at the same 32×32 viewBox and the same coordinates (a test asserts
 * the capsule path is byte-identical to the component's, so the two can never diverge). A capsule
 * WITHOUT the internal glyph is the incomplete mark and must not ship.
 *
 * Nothing here references an external or relative asset: an email template has no base URL it can
 * trust, remote images are blocked by default in most clients, and a `cid:` attachment needs
 * transport support. So the mark is delivered three ways, in order of fidelity:
 *
 *  1. `svg` — inline `<svg>`. Apple Mail, iOS Mail, Thunderbird, Samsung Mail. Best fidelity.
 *  2. `dataUri` — the same SVG as a `data:` URL for `<img src>`. No network fetch.
 *  3. `tableHtml` — bulletproof `<table>`/`<div>` markup with background-color + border-radius.
 *     Renders everywhere; degrades to a square emerald block with a light bar in Outlook's Word
 *     renderer (which drops `border-radius`) — still recognisably the mark, never a broken image.
 *
 * Colours come from `EMAIL_COLORS` (derived from `--success` / `--success-foreground`, the roles
 * `--logo-godx-color` already points at), so a re-themed identity role re-tints the mark.
 */
import { EMAIL_COLORS, type EmailHex } from "./color";
import { EMAIL_GEOMETRY_SOURCE } from "./tokens.generated";

/** A rounded rectangle in the mark's 32×32 coordinate space. */
export interface EmailBrandMarkRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly radius: number;
}

/** Intrinsic coordinate space of the mark artwork. */
export const EMAIL_BRAND_MARK_VIEWBOX = "0 0 32 32";

/** The emerald capsule. */
export const EMAIL_BRAND_MARK_CAPSULE: EmailBrandMarkRect = Object.freeze({
  x: 1,
  y: 7,
  width: 30,
  height: 18,
  radius: 7,
});

/** The internal light glyph bar inside the capsule. */
export const EMAIL_BRAND_MARK_GLYPH: EmailBrandMarkRect = Object.freeze({
  x: 7,
  y: 13,
  width: 18,
  height: 6,
  radius: 1,
});

/** SVG path-data separator: a negative number is its own separator, a positive one needs a space. */
const sep = (value: number): string => (value < 0 ? String(value) : ` ${value}`);

const arc = (r: number, dx: number, dy: number): string => `a${r} ${r} 0 0 1${sep(dx)}${sep(dy)}`;

/**
 * Path data for a rounded rectangle, in the exact serialisation the canonical mark uses — so the
 * generated capsule string equals the artwork shipped by `<Logo mark="godx" />` character for
 * character.
 */
export function roundedRectPath({ x, y, width, height, radius }: EmailBrandMarkRect): string {
  const h = width - 2 * radius;
  const v = height - 2 * radius;
  return (
    `M${x + radius} ${y}h${h}${arc(radius, radius, radius)}v${v}${arc(radius, -radius, radius)}` +
    `H${x + radius}${arc(radius, -radius, -radius)}v-${v}${arc(radius, radius, -radius)}Z`
  );
}

/** Options for rendering the mark. Every default comes from the token contract. */
export interface EmailBrandMarkOptions {
  /** Rendered width in px. Default `EMAIL_BRAND_MARK.widthPx` (32). */
  width?: number;
  /** Rendered height in px. Default `EMAIL_BRAND_MARK.heightPx` (32). */
  height?: number;
  /** Capsule fill. Default `EMAIL_COLORS.brand`. */
  color?: EmailHex;
  /** Internal glyph fill. Default `EMAIL_COLORS.brandForeground`. */
  glyphColor?: EmailHex;
  /**
   * Accessible name. Pass `""` for a decorative mark that sits next to a readable wordmark — the
   * markup then carries `alt=""` / `aria-hidden` instead of a redundant announcement.
   */
  label?: string;
}

const CAPSULE_PATH = roundedRectPath(EMAIL_BRAND_MARK_CAPSULE);
const GLYPH_PATH = roundedRectPath(EMAIL_BRAND_MARK_GLYPH);

const DEFAULT_WIDTH = Number.parseFloat(EMAIL_GEOMETRY_SOURCE["--email-mark-width"]);
const DEFAULT_HEIGHT = Number.parseFloat(EMAIL_GEOMETRY_SOURCE["--email-mark-height"]);

function options(o: EmailBrandMarkOptions = {}) {
  return {
    width: o.width ?? DEFAULT_WIDTH,
    height: o.height ?? DEFAULT_HEIGHT,
    color: o.color ?? EMAIL_COLORS.brand,
    glyphColor: o.glyphColor ?? EMAIL_COLORS.brandForeground,
    label: o.label ?? "GoDX",
  };
}

/** Escape a caller-supplied string for an HTML attribute value. */
const attr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Inline `<svg>` markup for the mark — self-contained, no external or relative asset reference.
 * The `xmlns` attribute is required: an email body is not always parsed as HTML5.
 */
export function emailBrandMarkSvg(o: EmailBrandMarkOptions = {}): string {
  const { width, height, color, glyphColor, label } = options(o);
  const a11y = label
    ? ` role="img" aria-label="${attr(label)}"`
    : ` role="presentation" aria-hidden="true"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="${EMAIL_BRAND_MARK_VIEWBOX}" focusable="false"${a11y} ` +
    `style="display:block;border:0;outline:none;text-decoration:none">` +
    `<path fill="${color}" d="${CAPSULE_PATH}"/>` +
    `<path fill="${glyphColor}" d="${GLYPH_PATH}"/>` +
    `</svg>`
  );
}

/**
 * The mark as a `data:image/svg+xml` URL for `<img src>`. Percent-encoded (not base64) so it stays
 * readable in a template and needs no `Buffer`/`btoa`. Still zero network requests.
 */
export function emailBrandMarkDataUri(o: EmailBrandMarkOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(emailBrandMarkSvg(o))}`;
}

/**
 * Bulletproof `<table>` markup for clients with no SVG support. Uses only `background-color`,
 * `border-radius`, fixed cell sizes and `font-size:0` — the intersection every client renders.
 */
export function emailBrandMarkTableHtml(o: EmailBrandMarkOptions = {}): string {
  const { width, height, color, glyphColor, label } = options(o);
  const scale = width / 32;
  const box = (rect: EmailBrandMarkRect) => ({
    width: Math.round(rect.width * scale),
    height: Math.round((rect.height * scale * height) / width),
    radius: Math.round(rect.radius * scale),
  });
  const capsule = box(EMAIL_BRAND_MARK_CAPSULE);
  const glyph = box(EMAIL_BRAND_MARK_GLYPH);
  const a11y = label
    ? ` role="img" aria-label="${attr(label)}"`
    : ` role="presentation" aria-hidden="true"`;
  return (
    `<table${a11y} border="0" cellpadding="0" cellspacing="0" width="${capsule.width}" ` +
    `style="border-collapse:separate;border-spacing:0;width:${capsule.width}px">` +
    `<tr><td width="${capsule.width}" height="${capsule.height}" align="center" valign="middle" ` +
    `style="width:${capsule.width}px;height:${capsule.height}px;line-height:${capsule.height}px;` +
    `font-size:0;mso-line-height-rule:exactly;background-color:${color};` +
    `border-radius:${capsule.radius}px">` +
    `<div style="width:${glyph.width}px;height:${glyph.height}px;line-height:${glyph.height}px;` +
    `font-size:0;background-color:${glyphColor};border-radius:${glyph.radius}px">&#8203;</div>` +
    `</td></tr></table>`
  );
}

/** The canonical mark at its default size and colours, in all three delivery forms. */
export interface EmailBrandMark {
  readonly viewBox: string;
  readonly width: string;
  readonly widthPx: number;
  readonly height: string;
  readonly heightPx: number;
  readonly capsule: EmailBrandMarkRect;
  readonly glyph: EmailBrandMarkRect;
  readonly capsulePath: string;
  readonly glyphPath: string;
  /** Inline `<svg>` — highest fidelity. */
  readonly svg: string;
  /** `data:` URL of the same SVG, for `<img src>`. */
  readonly dataUri: string;
  /** `<table>` fallback for clients with no SVG support. */
  readonly tableHtml: string;
}

export const EMAIL_BRAND_MARK: EmailBrandMark = Object.freeze({
  viewBox: EMAIL_BRAND_MARK_VIEWBOX,
  width: EMAIL_GEOMETRY_SOURCE["--email-mark-width"],
  widthPx: DEFAULT_WIDTH,
  height: EMAIL_GEOMETRY_SOURCE["--email-mark-height"],
  heightPx: DEFAULT_HEIGHT,
  capsule: EMAIL_BRAND_MARK_CAPSULE,
  glyph: EMAIL_BRAND_MARK_GLYPH,
  capsulePath: CAPSULE_PATH,
  glyphPath: GLYPH_PATH,
  svg: emailBrandMarkSvg(),
  dataUri: emailBrandMarkDataUri(),
  tableHtml: emailBrandMarkTableHtml(),
});
