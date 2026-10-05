import * as React from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion, type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import {
  ChevronRight,
  Code,
  Columns2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Table as TableIcon,
} from "lucide-react";

import type { BlockEditorLabels } from "./messages";

/** One row of the `/` menu. `run` receives the editor with the trigger text already removed. */
export type BlockEditorCommand = {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** Extra search terms (any language); the label and key always match. */
  keywords?: readonly string[];
  run: (editor: Editor) => void;
};

/** A block's turn-into target: the commands that RESHAPE the current block (no inserts). */
export const TURN_INTO = [
  "text",
  "heading1",
  "heading2",
  "heading3",
  "bulletList",
  "numberedList",
  "taskList",
  "quote",
  "callout",
  "code",
] as const;

/** The built-in blocks, in menu order. `insertImage` is the host's media path (pick or upload). */
export function builtinCommands(
  labels: BlockEditorLabels,
  insertImage: ((editor: Editor) => void) | null,
): BlockEditorCommand[] {
  const commands: BlockEditorCommand[] = [
    {
      key: "text",
      label: labels.text,
      icon: <Pilcrow />,
      keywords: ["paragraph", "p"],
      run: (e) => e.chain().focus().setParagraph().run(),
    },
    {
      key: "heading1",
      label: labels.heading1,
      icon: <Heading1 />,
      keywords: ["h1", "title"],
      run: (e) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      key: "heading2",
      label: labels.heading2,
      icon: <Heading2 />,
      keywords: ["h2"],
      run: (e) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      key: "heading3",
      label: labels.heading3,
      icon: <Heading3 />,
      keywords: ["h3"],
      run: (e) => e.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      key: "bulletList",
      label: labels.bulletList,
      icon: <List />,
      keywords: ["ul", "bullet", "list"],
      run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      key: "numberedList",
      label: labels.numberedList,
      icon: <ListOrdered />,
      keywords: ["ol", "number", "ordered"],
      run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "taskList",
      label: labels.taskList,
      icon: <ListChecks />,
      keywords: ["todo", "task", "checkbox"],
      run: (e) => e.chain().focus().toggleTaskList().run(),
    },
    {
      key: "quote",
      label: labels.quote,
      icon: <Quote />,
      keywords: ["blockquote", ">"],
      run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      key: "callout",
      label: labels.callout,
      icon: <Info />,
      keywords: ["note", "alert", "tip", "warning"],
      run: (e) => e.chain().focus().wrapIn("callout", { kind: "note" }).run(),
    },
    {
      key: "code",
      label: labels.code,
      icon: <Code />,
      keywords: ["codeblock", "```", "pre"],
      run: (e) => e.chain().focus().setCodeBlock().run(),
    },
    {
      key: "divider",
      label: labels.divider,
      icon: <Minus />,
      keywords: ["hr", "rule", "---"],
      run: (e) => e.chain().focus().setHorizontalRule().run(),
    },
    {
      key: "table",
      label: labels.table,
      icon: <TableIcon />,
      keywords: ["grid"],
      run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      key: "toggle",
      label: labels.toggle,
      icon: <ChevronRight />,
      keywords: ["details", "collapse", "fold"],
      run: (e) => e.chain().focus().setDetails().run(),
    },
    {
      key: "columns",
      label: labels.columns,
      icon: <Columns2 />,
      keywords: ["layout", "column", "split"],
      run: (e) =>
        e
          .chain()
          .focus()
          .insertContent({
            type: "columns",
            content: [
              { type: "column", content: [{ type: "paragraph" }] },
              { type: "column", content: [{ type: "paragraph" }] },
            ],
          })
          .run(),
    },
  ];
  if (insertImage) {
    commands.splice(11, 0, {
      key: "image",
      label: labels.image,
      icon: <ImageIcon />,
      keywords: ["img", "picture", "photo", "media"],
      run: insertImage,
    });
  }
  return commands;
}

/** Fold width and case so `ｈ１`, `H1` and `h1` all find Heading 1. */
const fold = (value: string) => value.normalize("NFKC").toLowerCase();

export function filterCommands<
  T extends { key: string; label: string; keywords?: readonly string[] },
>(commands: readonly T[], query: string): T[] {
  const q = fold(query.trim());
  if (!q) return [...commands];
  const scored = commands
    .map((command) => {
      const terms = [command.label, command.key, ...(command.keywords ?? [])].map(fold);
      const score = terms.some((t) => t.startsWith(q))
        ? 0
        : terms.some((t) => t.includes(q))
          ? 1
          : 2;
      return { command, score };
    })
    .filter((entry) => entry.score < 2);
  return scored.sort((a, b) => a.score - b.score).map((entry) => entry.command);
}

/** What the React side hands the suggestion plugin: it owns the list, the plugin owns the trigger. */
export type SuggestionBridge<I> = {
  items: (query: string) => I[] | Promise<I[]>;
  pick: (editor: Editor, range: Range, item: I) => void;
  onStart: (props: SuggestionProps<I>) => void;
  onUpdate: (props: SuggestionProps<I>) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onExit: () => void;
};

/**
 * A Tiptap suggestion trigger (`/`, `／`, `[[`) wired to React state. The plugin decides when the
 * menu is open and what was typed; it never renders anything itself. IME-safe: the plugin reads
 * the committed document, so a composition in progress does not open or filter the menu.
 */
export function suggestionTrigger<I>(
  name: string,
  char: string,
  bridge: React.RefObject<SuggestionBridge<I> | null>,
  options: { allowSpaces?: boolean; allowedPrefixes?: string[] | null } = {},
) {
  return Extension.create({
    name,
    addProseMirrorPlugins() {
      return [
        Suggestion<I>({
          editor: this.editor,
          pluginKey: new PluginKey(name),
          char,
          allowSpaces: options.allowSpaces ?? false,
          allowedPrefixes:
            options.allowedPrefixes === undefined ? [" ", "　"] : options.allowedPrefixes,
          items: ({ query }) => bridge.current?.items(query) ?? [],
          command: ({ editor, range, props }) => bridge.current?.pick(editor, range, props as I),
          render: () => ({
            onStart: (props) => bridge.current?.onStart(props),
            onUpdate: (props) => bridge.current?.onUpdate(props),
            onKeyDown: (props) => bridge.current?.onKeyDown(props) ?? false,
            onExit: () => bridge.current?.onExit(),
          }),
        }),
      ];
    },
  });
}
