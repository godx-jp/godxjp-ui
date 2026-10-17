import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  TextQuote,
  Undo2,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem, type FieldA11yProps } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";

import { ensureBlockEditorMessages, type BlockEditorLabels } from "./messages";
import { activeMarks, applyMarks } from "./toolbar";

/** The strings RichTextEditor renders — a subset of the block editor's `blockEditor.*` catalogue. */
export type RichTextEditorLabels = Pick<
  BlockEditorLabels,
  | "editor"
  | "formatting"
  | "bold"
  | "italic"
  | "strike"
  | "inlineCode"
  | "textStyle"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "quote"
  | "undo"
  | "redo"
>;

export type RichTextEditorProps = FieldA11yProps & {
  /**
   * The body as HTML. Controlled with `onValueChange`; uncontrolled with `defaultValue`. Read through
   * the editor's schema, so only the tags in {@link RICH_TEXT_ALLOWED_TAGS} survive.
   */
  value?: string;
  defaultValue?: string;
  /** Called with the schema's HTML after each edit — `""` for an empty body, never `<p></p>`. */
  onValueChange?: (html: string) => void;
  /** Shown while the body is empty. */
  placeholder?: string;
  /** Validation state the frame paints — as on Input. `error` also comes from `aria-invalid`. */
  status?: "error" | "warning";
  /** BCP-47 tag of the body's language (spell-check, screen-reader voice, CJK line breaking). */
  lang?: string;
  /** Override any string the toolbar renders (defaults: the kit's ja / en / vi catalogue). */
  labels?: Partial<RichTextEditorLabels>;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  className?: string;
};

export type RichTextEditorHandle = {
  focus: () => void;
  /** The Tiptap editor, for host integrations. */
  editor: Editor | null;
};

/**
 * Every element `onValueChange` can emit. It is the editor's SCHEMA, not a filter run afterwards:
 * HTML in `value` (or pasted) is parsed into these nodes and marks, anything else is dropped to its
 * text, and `getHTML()` writes only these back — with no attributes at all.
 */
export const RICH_TEXT_ALLOWED_TAGS = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "s",
  "code",
] as const;

/** StarterKit cut down to the toolbar's set: no code block, rule, link, underline or trailing node. */
const richTextExtensions = (placeholder: () => string) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    horizontalRule: false,
    link: false,
    underline: false,
    trailingNode: false,
  }),
  Placeholder.configure({ placeholder }),
];

const BLOCKS = ["heading1", "heading2", "heading3", "bulletList", "orderedList", "quote"] as const;
type BlockName = (typeof BLOCKS)[number] | "";

const activeBlock = (editor: Editor): BlockName => {
  for (const level of [1, 2, 3] as const) {
    if (editor.isActive("heading", { level })) return `heading${level}`;
  }
  if (editor.isActive("bulletList")) return "bulletList";
  if (editor.isActive("orderedList")) return "orderedList";
  if (editor.isActive("blockquote")) return "quote";
  return "";
};

/** One block type at a time: clear back to a paragraph, then apply the chosen one ("" = paragraph). */
function applyBlock(editor: Editor, next: string) {
  const chain = editor.chain().focus().clearNodes();
  if (next === "heading1") chain.setHeading({ level: 1 });
  else if (next === "heading2") chain.setHeading({ level: 2 });
  else if (next === "heading3") chain.setHeading({ level: 3 });
  else if (next === "bulletList") chain.toggleBulletList();
  else if (next === "orderedList") chain.toggleOrderedList();
  else if (next === "quote") chain.toggleBlockquote();
  chain.run();
}

const htmlOf = (editor: Editor) => (editor.isEmpty ? "" : editor.getHTML());

/**
 * RichTextEditor (gh#1365) — a form field that edits HTML: a fixed toolbar (bold, italic, strike,
 * inline code · paragraph / H1–H3 / bulleted / numbered list / quote · undo, redo) over a Tiptap
 * surface whose schema is exactly {@link RICH_TEXT_ALLOWED_TAGS}, so the schema IS the sanitiser on
 * the way in and on the way out.
 *
 * Controlled like the kit's other fields: a new `value` that is not what the editor last emitted
 * replaces the document WITHOUT calling `onValueChange` (a locale tab, a form reset), and never
 * while an IME composition is open. It takes FormField's `id` / `aria-*` on the editable itself.
 */
export const RichTextEditor = React.forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      placeholder,
      status,
      lang,
      labels,
      disabled = false,
      readOnly = false,
      autoFocus = false,
      id,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      "aria-errormessage": ariaErrormessage,
      "aria-invalid": ariaInvalid,
      "aria-required": ariaRequired,
      "data-field": dataField,
    },
    ref,
  ) {
    ensureBlockEditorMessages();
    const { t } = useTranslation();
    const label = (key: keyof RichTextEditorLabels) => labels?.[key] ?? t(`blockEditor.${key}`);

    const onValueChangeRef = React.useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const placeholderRef = React.useRef(placeholder ?? "");
    placeholderRef.current = placeholder ?? "";

    const initial = valueProp ?? defaultValue;
    // The last HTML the editor emitted or was given: a `value` equal to it is our own echo.
    const lastHtml = React.useRef(initial);

    const extensions = React.useMemo(() => richTextExtensions(() => placeholderRef.current), []);

    const invalid = status === "error" || ariaInvalid === true || ariaInvalid === "true";
    const editor = useEditor({
      extensions,
      content: initial,
      editable: !disabled && !readOnly,
      autofocus: autoFocus ? "end" : false,
      immediatelyRender: false,
      editorProps: {
        // Re-applied on every render by useEditor, so `lang`, the FormField ids and the error state
        // follow the props (a locale tab switches `lang` on this same node).
        attributes: Object.fromEntries(
          Object.entries({
            class: "ui-prose ui-block-editor-content",
            role: "textbox",
            "aria-multiline": "true",
            id,
            lang,
            "aria-label": ariaLabelledby ? undefined : (ariaLabel ?? label("editor")),
            "aria-labelledby": ariaLabelledby,
            "aria-describedby": ariaDescribedby,
            "aria-errormessage": ariaErrormessage,
            "aria-invalid": invalid ? "true" : undefined,
            "aria-required": ariaRequired ? String(ariaRequired) : undefined,
            "aria-placeholder": placeholder || undefined,
            "aria-readonly": readOnly ? "true" : undefined,
            "aria-disabled": disabled ? "true" : undefined,
            "data-field": dataField,
          }).filter((entry): entry is [string, string] => entry[1] !== undefined),
        ),
      },
      onUpdate: ({ editor: instance }) => {
        const html = htmlOf(instance);
        if (html === lastHtml.current) return;
        lastHtml.current = html;
        onValueChangeRef.current?.(html);
      },
    });

    // Controlled: a new `value` that is not what the editor just emitted replaces the document,
    // silently. Never mid-composition — an IME session in progress would be torn down.
    React.useEffect(() => {
      if (!editor || valueProp === undefined) return;
      if (valueProp === lastHtml.current || editor.view.composing) return;
      lastHtml.current = valueProp;
      editor.commands.setContent(valueProp, { emitUpdate: false });
    }, [editor, valueProp]);

    React.useEffect(() => {
      editor?.setEditable(!disabled && !readOnly);
    }, [editor, disabled, readOnly]);

    React.useImperativeHandle(
      ref,
      () => ({ focus: () => editor?.commands.focus(), editor }),
      [editor],
    );

    return (
      <div
        className={["ui-rich-text-editor", className].filter(Boolean).join(" ")}
        data-status={invalid ? "error" : status}
        data-disabled={disabled ? "" : undefined}
      >
        {editor && !readOnly ? (
          <RichTextToolbar editor={editor} disabled={disabled} label={label} />
        ) : null}
        <EditorContent editor={editor} />
      </div>
    );
  },
);

function RichTextToolbar({
  editor,
  disabled,
  label,
}: {
  editor: Editor;
  disabled: boolean;
  label: (key: keyof RichTextEditorLabels) => string;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      marks: activeMarks(e),
      block: activeBlock(e),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  return (
    <div className="ui-rich-text-editor-toolbar">
      <ToggleGroup
        type="multiple"
        size="sm"
        aria-label={label("formatting")}
        value={state.marks}
        onValueChange={(next) => applyMarks(editor, state.marks, next)}
        disabled={disabled}
      >
        <ToggleGroupItem value="bold" aria-label={label("bold")}>
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label={label("italic")}>
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem value="strike" aria-label={label("strike")}>
          <Strikethrough />
        </ToggleGroupItem>
        <ToggleGroupItem value="code" aria-label={label("inlineCode")}>
          <Code />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="single"
        size="sm"
        aria-label={label("textStyle")}
        value={state.block}
        onValueChange={(next) => applyBlock(editor, next)}
        disabled={disabled}
      >
        <ToggleGroupItem value="heading1" aria-label={label("heading1")}>
          <Heading1 />
        </ToggleGroupItem>
        <ToggleGroupItem value="heading2" aria-label={label("heading2")}>
          <Heading2 />
        </ToggleGroupItem>
        <ToggleGroupItem value="heading3" aria-label={label("heading3")}>
          <Heading3 />
        </ToggleGroupItem>
        <ToggleGroupItem value="bulletList" aria-label={label("bulletList")}>
          <List />
        </ToggleGroupItem>
        <ToggleGroupItem value="orderedList" aria-label={label("numberedList")}>
          <ListOrdered />
        </ToggleGroupItem>
        <ToggleGroupItem value="quote" aria-label={label("quote")}>
          <TextQuote />
        </ToggleGroupItem>
      </ToggleGroup>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={label("undo")}
        disabled={disabled || !state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={label("redo")}
        disabled={disabled || !state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 />
      </Button>
    </div>
  );
}
