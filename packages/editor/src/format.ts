/**
 * The text operations behind the toolbar and the shortcuts, as pure functions of
 * (text, selection) → (replacement range, new selection). Pure so they are tested without a DOM,
 * and so the editor can apply them through `execCommand("insertText")`, which keeps the
 * browser's own undo stack (a value rewrite would erase it).
 */
export type Selection = { start: number; end: number };

/** Replace `[from, to)` with `insert`, then select `select` (absolute offsets in the new text). */
export type TextEdit = { from: number; to: number; insert: string; select: Selection };

/**
 * Wrap the selection in `before`…`after` (bold, italic, code). With nothing selected, inserts the
 * markers around `placeholder` and selects the placeholder, so typing replaces it. A selection that
 * is already wrapped is unwrapped — the toolbar toggles, as every editor's B button does.
 */
export function wrapSelection(
  text: string,
  { start, end }: Selection,
  before: string,
  after: string,
  placeholder: string,
): TextEdit {
  const selected = text.slice(start, end);
  const outerStart = start - before.length;
  const outerEnd = end + after.length;
  if (
    outerStart >= 0 &&
    text.slice(outerStart, start) === before &&
    text.slice(end, outerEnd) === after
  ) {
    return {
      from: outerStart,
      to: outerEnd,
      insert: selected,
      select: { start: outerStart, end: outerStart + selected.length },
    };
  }
  const body = selected || placeholder;
  return {
    from: start,
    to: end,
    insert: `${before}${body}${after}`,
    select: { start: start + before.length, end: start + before.length + body.length },
  };
}

/** The offsets of the whole lines the selection touches. */
function lineRange(text: string, { start, end }: Selection): Selection {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const next = text.indexOf("\n", end > start && text[end - 1] === "\n" ? end - 1 : end);
  return { start: lineStart, end: next === -1 ? text.length : next };
}

/**
 * Prefix every line the selection touches (`## `, `- `, `> `, `- [ ] `). `numbered` writes
 * `1. `, `2. `… If every touched line already carries the prefix, it is removed instead.
 */
export function prefixLines(
  text: string,
  selection: Selection,
  prefix: string,
  options: { numbered?: boolean } = {},
): TextEdit {
  const range = lineRange(text, selection);
  const lines = text.slice(range.start, range.end).split("\n");
  const marker = (index: number) => (options.numbered ? `${index + 1}. ` : prefix);
  const numberedPattern = /^\d+\. /;
  const has = (line: string, index: number) =>
    options.numbered ? numberedPattern.test(line) : line.startsWith(marker(index));
  const allPrefixed = lines.every(has);
  const next = lines.map((line, index) =>
    allPrefixed
      ? line.replace(options.numbered ? numberedPattern : marker(index), "")
      : `${marker(index)}${line}`,
  );
  const insert = next.join("\n");
  return {
    from: range.start,
    to: range.end,
    insert,
    select: { start: range.start, end: range.start + insert.length },
  };
}

/** `[text](url)`: the selection becomes the text and `url` is selected for typing. */
export function insertLink(text: string, { start, end }: Selection, placeholder: string): TextEdit {
  const label = text.slice(start, end) || placeholder;
  const insert = `[${label}](url)`;
  const urlStart = start + label.length + 3;
  return { from: start, to: end, insert, select: { start: urlStart, end: urlStart + 3 } };
}

/** A fenced block on its own lines around the selection. */
export function insertCodeBlock(text: string, { start, end }: Selection): TextEdit {
  const body = text.slice(start, end);
  const lead = start > 0 && text[start - 1] !== "\n" ? "\n" : "";
  const insert = `${lead}\`\`\`\n${body}\n\`\`\`\n`;
  const bodyStart = start + lead.length + 4;
  return {
    from: start,
    to: end,
    insert,
    select: { start: bodyStart, end: bodyStart + body.length },
  };
}

/** Apply an edit to a string (the fallback when `execCommand` is unavailable, and in tests). */
export function applyEdit(text: string, edit: TextEdit): string {
  return text.slice(0, edit.from) + edit.insert + text.slice(edit.to);
}

/** Markdown for an uploaded file: an image embed for images, a link otherwise. */
export function uploadedMarkdown(file: { name: string; type: string }, url: string, name?: string) {
  const label = (name ?? file.name).replace(/[[\]\\]/g, "\\$&");
  // A URL with a space or a parenthesis would end the destination early; `<…>` keeps it whole.
  const target = /[\s()<>]/.test(url) ? `<${url.replace(/[<>]/g, encodeURIComponent)}>` : url;
  return file.type.startsWith("image/") ? `![${label}](${target})` : `[${label}](${target})`;
}
