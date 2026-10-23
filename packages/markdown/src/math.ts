import rehypeKatex from "rehype-katex";
import type { Options as SanitizeSchema } from "rehype-sanitize";

/**
 * MATH (renderer v6). `$…$`, `$$…$$` and a ```math fence (syntax: codec/syntax.ts) are drawn by
 * KaTeX at parse time, BEFORE the sanitiser, so KaTeX's output is judged like everything else:
 * `katexSchema` below allows exactly the vocabulary KaTeX emits and nothing a body could aim.
 *
 * - `trust: false` — `\href`, `\url`, `\includegraphics`, `\htmlClass`, `\htmlId`, `\htmlStyle`,
 *   `\htmlData` render as their own source in the error colour, never as a link, image, class or
 *   style.
 * - `strict: "error"` — non-standard LaTeX is reported. rehype-katex then renders it once more
 *   leniently (Japanese inside `$…$` still draws), so strictness never blanks a formula; `trust`
 *   is not relaxed by that second pass.
 * - `maxSize: 10` — a user-sized box (`\rule{9999em}{9999em}`) is capped at 10em, so one formula
 *   cannot paint over the page.
 * - A formula that does not parse shows its source in `.katex-error`.
 */
export const KATEX_OPTIONS = {
  trust: false,
  strict: "error",
  maxSize: 10,
  output: "htmlAndMathml",
} as const;

export function rehypeMath(): ReturnType<typeof rehypeKatex> {
  return rehypeKatex(KATEX_OPTIONS);
}

/**
 * The class vocabulary of KaTeX 0.16: every class `katex.css` styles, plus the atom and helper
 * classes it emits unstyled. An unknown class is stripped (a glyph may then sit slightly off), a
 * class a body names never survives — `\htmlClass` is off anyway.
 */
const KATEX_CLASSES = `accent accent-body accent-full amsrm angl anglpad arraycolsep base boldsymbol
boxpad brace-center brace-left brace-right cancel-lap cancel-pad cd-arrow-pad cd-label-left
cd-label-right cd-vert-arrow cjk_fallback clap col-align-c col-align-l col-align-r colorbox com
delim-size1 delim-size4 delimcenter delimsizing eqn-num fbox fcolorbox fix fleqn fontsize-ensurer
frac-line halfarrow-left halfarrow-right hbox hdashline hide-tail hline inner katex katex-display
katex-error katex-html katex-mathml large-op leqno llap mainrm mathbb mathbf mathboldfrak mathboldsf
mathcal mathfrak mathit mathitsf mathnormal mathrm mathscr mathsf mathsfit mathtt mbin mclose mfrac
minner mml-eqn-num mop mopen mord mover mpunct mrel mspace msupsub mtable mtight mtr-glue mult
munder newline nobreak nulldelimiter op-limits op-symbol overlay overline overline-line pstrut
reset-size1 reset-size10 reset-size11 reset-size2 reset-size3 reset-size4 reset-size5 reset-size6
reset-size7 reset-size8 reset-size9 rlap root rule size1 size10 size11 size2 size3 size4 size5
size6 size7 size8 size9 sizing small-op smash sout sqrt stretchy strut svg-align tag text textbb
textbf textboldfrak textboldsf textfrak textit textitsf textrm textscr textsf texttt thinbox
underline underline-line vbox vertical-separator vlist vlist-r vlist-s vlist-t vlist-t2 x-arrow
x-arrow-pad`.split(/\s+/);

/**
 * KaTeX's inline geometry: a declaration list of these properties whose values are lengths,
 * colours and keywords. No parentheses, quotes or colons in a value, so no `url()`, `expression()`,
 * `var()` or `@import` can ride along.
 */
const KATEX_STYLE =
  /^(?:\s*(?:background-color|border(?:-(?:top|right|bottom|left))?(?:-(?:width|style|color))?|bottom|color|height|left|margin(?:-(?:top|right|bottom|left))?|max-width|min-width|padding(?:-(?:top|right|bottom|left))?|position|right|top|vertical-align|width)\s*:\s*[-#.%\w ]+;?)*\s*$/i;

const MATHML_TAGS = `math semantics annotation mrow mi mn mo ms mtext mspace mpadded mphantom mstyle
menclose mfrac msqrt mroot msub msup msubsup munder mover munderover mtable mtr mtd mlabeledtr`.split(
  /\s+/,
);

/** What KaTeX's output needs from the sanitiser — merged into `markdownSchema` (schema.ts). */
type Attributes = NonNullable<SanitizeSchema["attributes"]>;

export const katexSchema: {
  tagNames: string[];
  attributes: Attributes & { span: Attributes[string] };
} = {
  tagNames: [...MATHML_TAGS, "svg", "path", "line"],
  attributes: {
    span: [
      ["className", ...KATEX_CLASSES],
      ["style", KATEX_STYLE],
      ["ariaHidden", "true"],
    ],
    math: [
      ["xmlns", "http://www.w3.org/1998/Math/MathML"],
      ["display", "block", "inline"],
    ],
    annotation: [["encoding", "application/x-tex"]],
    mi: ["mathvariant"],
    mo: ["stretchy", "fence", "separator", "minsize", "maxsize", "lspace", "rspace", "accent"],
    mfrac: ["linethickness"],
    mtable: ["rowspacing", "rowlines", "columnalign", "columnspacing", "columnlines", "width"],
    mtd: ["columnalign"],
    mstyle: ["scriptlevel", "displaystyle", "mathcolor", "mathsize", "mathbackground"],
    mover: ["accent"],
    munder: ["accentunder"],
    munderover: ["accent", "accentunder"],
    mpadded: [
      "width",
      "height",
      "depth",
      "lspace",
      "voffset",
      "mathbackground",
      ["style", KATEX_STYLE],
    ],
    mspace: ["width", "height", "depth", "mathbackground"],
    menclose: ["notation", "mathbackground"],
    svg: [
      ["xmlns", "http://www.w3.org/2000/svg"],
      "width",
      "height",
      "viewBox",
      "preserveAspectRatio",
      ["style", KATEX_STYLE],
    ],
    path: ["d"],
    line: ["x1", "y1", "x2", "y2", "strokeWidth"],
  },
};
