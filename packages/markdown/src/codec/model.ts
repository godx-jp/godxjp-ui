/**
 * The codec's document: plain JSON in the ProseMirror/Tiptap shape (`type` / `attrs` / `content` /
 * `text` / `marks`), so `@godxjp/block-editor` loads it with `setContent` and hands back what
 * `getJSON()` returns. No DOM, no editor instance — this module runs in a Worker (gh#1156).
 *
 * Node names follow Tiptap's StarterKit / Table / Details extensions where one exists:
 *   doc · paragraph · heading{level} · blockquote · codeBlock{language} · horizontalRule ·
 *   bulletList{tight} · orderedList{start,tight} · listItem · taskList{tight} · taskItem{checked} ·
 *   table · tableRow · tableHeader{align} · tableCell{align} · image{src,alt,title} · hardBreak
 * and the kit's own:
 *   callout{kind,title} · details · detailsSummary · detailsContent · columns · column{width} ·
 *   embed{target} (block `![[x]]`) · wikilink{target,heading,label} · embedInline{target} ·
 *   rawBlock{source} · rawInline{source} · frontmatter{source} (YAML, first block only)
 * Marks: bold · italic · strike · code · link{href,title}.
 */
export type Mark =
  | { type: "bold" | "italic" | "strike" | "code" }
  | { type: "link"; attrs: { href: string; title: string | null } };

export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
  marks?: Mark[];
};

export type Doc = DocNode & { type: "doc"; content: DocNode[] };

/** GitHub alert kinds, the only callouts v1 knows. Serialized uppercase. */
export const CALLOUT_KINDS = ["note", "tip", "important", "warning", "caution"] as const;
export type CalloutKind = (typeof CALLOUT_KINDS)[number];

/** Columns per `:::columns` block (grammar v1). */
export const COLUMNS_MIN = 2;
export const COLUMNS_MAX = 4;
