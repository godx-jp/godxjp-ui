import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { TextDiffProp, TextDiffSegment } from "../../props/components/data-display.prop";
import { Button } from "../general/button";
import { VisuallyHidden } from "../general/visually-hidden";

export type {
  TextDiffProp,
  TextDiffProp as TextDiffProps,
  TextDiffSegment,
} from "../../props/components/data-display.prop";

/** The unit a change is measured in — see `TextDiffProp["granularity"]`. */
export type TextDiffGranularity = NonNullable<TextDiffProp["granularity"]>;

/** Han, Hiragana, Katakana, Hangul — scripts written without spaces between words. */
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** Beyond this many LCS cells the changed middle is shown as one removal and one addition. */
const DEFAULT_MAX_CELLS = 4_000_000;

/** An unchanged run is folded only when folding hides at least this many lines. */
const MIN_HIDDEN_LINES = 2;

function segmenter(
  lang: string | undefined,
  granularity: "grapheme" | "word",
): Intl.Segmenter | null {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") return null;
  try {
    return new Intl.Segmenter(lang, { granularity });
  } catch {
    // An invalid BCP-47 tag throws a RangeError; the root locale still segments correctly.
    return new Intl.Segmenter(undefined, { granularity });
  }
}

function graphemes(text: string, lang: string | undefined): string[] {
  const s = segmenter(lang, "grapheme");
  return s ? Array.from(s.segment(text), (part) => part.segment) : Array.from(text);
}

/**
 * Cut a text into diff tokens. `line` keeps each line with its newline; `char` is one grapheme
 * cluster per token (an emoji or a combining mark stays whole); `word` is `Intl.Segmenter` word
 * segmentation in `lang`; `auto` is `word`, except that a CJK run is cut per character, because a
 * dictionary word boundary in Japanese moves when one particle changes. A newline is always its
 * own token so a changed line never swallows the line after it.
 */
export function tokenizeText(
  text: string,
  granularity: TextDiffGranularity = "auto",
  lang?: string,
): string[] {
  if (text === "") return [];
  if (granularity === "line") return text.match(/[^\n]*\n|[^\n]+/g) ?? [];
  if (granularity === "char") return graphemes(text, lang);

  const s = segmenter(lang, "word");
  const words = s
    ? Array.from(s.segment(text), (part) => part.segment)
    : (text.match(/\s+|[^\s]+/g) ?? []);
  const tokens: string[] = [];
  for (const word of words) {
    const pieces = word.length > 1 && word.includes("\n") ? word.split(/(\n)/) : [word];
    for (const piece of pieces) {
      if (piece === "") continue;
      if (granularity === "auto" && CJK.test(piece)) tokens.push(...graphemes(piece, lang));
      else tokens.push(piece);
    }
  }
  return tokens;
}

function push(segments: TextDiffSegment[], kind: TextDiffSegment["kind"], text: string) {
  if (text === "") return;
  const last = segments[segments.length - 1];
  if (last !== undefined && last.kind === kind) last.text += text;
  else segments.push({ kind, text });
}

/**
 * The diff `TextDiff` renders, for a caller that needs the runs themselves (a count of changes, a
 * plain-text export). A longest-common-subsequence over {@link tokenizeText} tokens, with the
 * common prefix and suffix trimmed first; adjacent runs of one kind are merged, and a removal is
 * always emitted before the addition that replaces it. Past `maxCells` LCS cells the changed
 * middle is one removal plus one addition — a bounded cost instead of a frozen tab.
 */
export function diffText(
  before: string,
  after: string,
  options: { granularity?: TextDiffGranularity; lang?: string; maxCells?: number } = {},
): TextDiffSegment[] {
  const { granularity = "auto", lang, maxCells = DEFAULT_MAX_CELLS } = options;
  const a = tokenizeText(before, granularity, lang);
  const b = tokenizeText(after, granularity, lang);

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const segments: TextDiffSegment[] = [];
  push(segments, "same", a.slice(0, start).join(""));
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);

  if ((midA.length + 1) * (midB.length + 1) > maxCells) {
    push(segments, "removed", midA.join(""));
    push(segments, "added", midB.join(""));
  } else {
    // lengths[i * width + j] = the LCS length of midA[i..] and midB[j..].
    const width = midB.length + 1;
    const lengths = new Uint32Array((midA.length + 1) * width);
    for (let i = midA.length - 1; i >= 0; i--) {
      for (let j = midB.length - 1; j >= 0; j--) {
        lengths[i * width + j] =
          midA[i] === midB[j]
            ? lengths[(i + 1) * width + j + 1] + 1
            : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < midA.length || j < midB.length) {
      if (i < midA.length && j < midB.length && midA[i] === midB[j]) {
        push(segments, "same", midA[i]);
        i++;
        j++;
      } else if (
        i < midA.length &&
        (j === midB.length || lengths[(i + 1) * width + j] >= lengths[i * width + j + 1])
      ) {
        push(segments, "removed", midA[i]);
        i++;
      } else {
        push(segments, "added", midB[j]);
        j++;
      }
    }
  }

  push(segments, "same", a.slice(endA).join(""));
  return segments;
}

type Line = TextDiffSegment[];

/** Split the runs at every newline, whatever side the newline belongs to. */
function toLines(segments: TextDiffSegment[]): Line[] {
  const lines: Line[] = [];
  let current: Line = [];
  for (const segment of segments) {
    for (const piece of segment.text.split(/(?<=\n)/)) {
      if (piece === "") continue;
      current.push({ kind: segment.kind, text: piece });
      if (piece.endsWith("\n")) {
        lines.push(current);
        current = [];
      }
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

type Item =
  { type: "lines"; changed: boolean; lines: Line[] } | { type: "gap"; id: number; lines: Line[] };

/**
 * Group lines into unchanged and changed runs, then fold the middle of every long unchanged run,
 * keeping `context` lines next to each change (none before the first or after the last).
 */
function toItems(lines: Line[], collapse: boolean, context: number): Item[] {
  const runs: { changed: boolean; lines: Line[] }[] = [];
  for (const line of lines) {
    const changed = line.some((piece) => piece.kind !== "same");
    const last = runs[runs.length - 1];
    if (last !== undefined && last.changed === changed) last.lines.push(line);
    else runs.push({ changed, lines: [line] });
  }
  const anyChange = runs.some((run) => run.changed);
  const items: Item[] = [];
  runs.forEach((run, index) => {
    if (run.changed || !collapse || !anyChange) {
      items.push({ type: "lines", ...run });
      return;
    }
    const head = index === 0 ? 0 : context;
    const tail = index === runs.length - 1 ? 0 : context;
    const hidden = run.lines.length - head - tail;
    if (hidden < MIN_HIDDEN_LINES) {
      items.push({ type: "lines", ...run });
      return;
    }
    if (head > 0) items.push({ type: "lines", changed: false, lines: run.lines.slice(0, head) });
    items.push({ type: "gap", id: index, lines: run.lines.slice(head, head + hidden) });
    if (tail > 0) {
      items.push({ type: "lines", changed: false, lines: run.lines.slice(head + hidden) });
    }
  });
  return items;
}

type Side = "both" | "before" | "after";

function Runs({ lines, side }: { lines: Line[]; side: Side }) {
  const { t } = useTranslation();
  const runs: TextDiffSegment[] = [];
  for (const piece of lines.flat()) {
    if (side === "before" && piece.kind === "added") continue;
    if (side === "after" && piece.kind === "removed") continue;
    push(runs, piece.kind, piece.text);
  }
  return (
    <>
      {runs.map((run, index) =>
        run.kind === "same" ? (
          <React.Fragment key={index}>{run.text}</React.Fragment>
        ) : run.kind === "removed" ? (
          <del key={index} className="ui-text-diff-removed">
            <VisuallyHidden>{t("ui.textDiff.removedStart")}</VisuallyHidden>
            {run.text}
            <VisuallyHidden>{t("ui.textDiff.removedEnd")}</VisuallyHidden>
          </del>
        ) : (
          <ins key={index} className="ui-text-diff-added">
            <VisuallyHidden>{t("ui.textDiff.addedStart")}</VisuallyHidden>
            {run.text}
            <VisuallyHidden>{t("ui.textDiff.addedEnd")}</VisuallyHidden>
          </ins>
        ),
      )}
    </>
  );
}

/**
 * TextDiff — what changed between two versions of a text (gh#1096): removed runs in `<del>`,
 * added runs in `<ins>`, each with a struck-through or underlined mark AND a spoken start/end
 * label, so the change is never carried by colour alone. Inline (one flow, GitHub's "unified")
 * or split (before | after side by side); per line, per word, per character, or `auto` (words,
 * with CJK cut per character). Long unchanged runs fold behind a button that reveals them.
 */
export const TextDiff = React.forwardRef<HTMLDivElement, TextDiffProp>(function TextDiff(
  {
    before,
    after,
    mode = "inline",
    granularity = "auto",
    collapseUnchanged = true,
    contextLines = 2,
    maxCells,
    beforeLabel,
    afterLabel,
    lang,
    className,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const items = React.useMemo(
    () =>
      toItems(
        toLines(diffText(before, after, { granularity, lang, maxCells })),
        collapseUnchanged,
        Math.max(0, contextLines),
      ),
    [before, after, granularity, lang, maxCells, collapseUnchanged, contextLines],
  );
  const [expanded, setExpanded] = React.useState<ReadonlySet<number>>(() => new Set());
  React.useEffect(() => setExpanded(new Set()), [items]);

  const gap = (item: Extract<Item, { type: "gap" }>, split: boolean) => (
    <div key={`gap-${item.id}`} className="ui-text-diff-gap" data-span={split || undefined}>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setExpanded((previous) => new Set(previous).add(item.id))}
      >
        {t("ui.textDiff.showUnchanged", { count: item.lines.length })}
      </Button>
    </div>
  );

  const resolved = items.map((item) =>
    item.type === "gap" && expanded.has(item.id)
      ? ({ type: "lines", changed: false, lines: item.lines } as const)
      : item,
  );

  return (
    <div
      ref={ref}
      data-slot="text-diff"
      data-mode={mode}
      lang={lang}
      className={cn("ui-text-diff", className)}
      {...props}
    >
      {mode === "split" ? (
        <div className="ui-text-diff-split">
          <div className="ui-text-diff-heading">{beforeLabel ?? t("ui.textDiff.before")}</div>
          <div className="ui-text-diff-heading">{afterLabel ?? t("ui.textDiff.after")}</div>
          {resolved.map((item, index) =>
            item.type === "gap" ? (
              gap(item, true)
            ) : (
              <React.Fragment key={index}>
                <div
                  className="ui-text-diff-cell"
                  data-side="before"
                  data-changed={item.changed || undefined}
                >
                  <Runs lines={item.lines} side="before" />
                </div>
                <div
                  className="ui-text-diff-cell"
                  data-side="after"
                  data-changed={item.changed || undefined}
                >
                  <Runs lines={item.lines} side="after" />
                </div>
              </React.Fragment>
            ),
          )}
        </div>
      ) : (
        <div className="ui-text-diff-body">
          {resolved.map((item, index) =>
            item.type === "gap" ? (
              gap(item, false)
            ) : (
              <Runs key={index} lines={item.lines} side="both" />
            ),
          )}
        </div>
      )}
    </div>
  );
});
