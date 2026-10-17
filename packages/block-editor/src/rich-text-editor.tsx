import * as React from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { OrderedList } from "@tiptap/extension-list";
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
import { Toggle, type FieldA11yProps } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";
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
 * text, and `getHTML()` writes only these back — with one attribute in all: `start` on an `<ol>`
 * that does not start at 1, always an integer.
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

/**
 * A numbered list keeps where it starts and nothing else: Tiptap's own list also reads `type` from
 * the tag, its inline style or a Google Docs `<li>`, and writes it back as a free string.
 */
const OrderedListStartOnly = OrderedList.extend({
  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: (element: HTMLElement) => {
          const start = Number.parseInt(element.getAttribute("start") ?? "", 10);
          return Number.isSafeInteger(start) ? start : 1;
        },
      },
    };
  },
});

/** StarterKit cut down to the toolbar's set: no code block, rule, link, underline or trailing node. */
const richTextExtensions = (placeholder: () => string) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    horizontalRule: false,
    link: false,
    underline: false,
    trailingNode: false,
    orderedList: false,
  }),
  OrderedListStartOnly,
  Placeholder.configure({ placeholder }),
];

/** The text-style group's value; `""` is a paragraph. */
type BlockName = "heading1" | "heading2" | "heading3" | "bulletList" | "orderedList" | "quote" | "";

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

    React.useImperativeHandle(ref, () => ({ focus: () => editor?.commands.focus(), editor }), [
      editor,
    ]);

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

  const [focusKey, setFocusKey] = React.useState("bold");
  const enabledKeys = disabled
    ? []
    : [
        "bold",
        "italic",
        "strike",
        "code",
        "heading1",
        "heading2",
        "heading3",
        "bulletList",
        "orderedList",
        "quote",
        ...(state.canUndo ? ["undo"] : []),
        ...(state.canRedo ? ["redo"] : []),
      ];
  const tabStop = enabledKeys.includes(focusKey) ? focusKey : enabledKeys[0];
  const focusProps = (key: string) => ({
    "data-command": key,
    tabIndex: key === tabStop ? 0 : -1,
    onFocus: () => setFocusKey(key),
  });
  const marks = [
    ["bold", "bold", Bold],
    ["italic", "italic", Italic],
    ["strike", "strike", Strikethrough],
    ["code", "inlineCode", Code],
  ] as const;
  const blocks = [
    [
      ["heading1", "heading1", Heading1],
      ["heading2", "heading2", Heading2],
      ["heading3", "heading3", Heading3],
    ],
    [
      ["bulletList", "bulletList", List],
      ["orderedList", "numberedList", ListOrdered],
      ["quote", "quote", TextQuote],
    ],
  ] as const;

  return (
    <div
      className="ui-rich-text-editor-toolbar"
      role="toolbar"
      aria-label={label("formatting")}
      aria-orientation="horizontal"
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || !enabledKeys.length) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const index = enabledKeys.indexOf((event.target as HTMLElement).dataset.command ?? "");
        let next: number;
        if (event.key === "Home") next = 0;
        else if (event.key === "End") next = enabledKeys.length - 1;
        else if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);
        else if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
        else return;
        event.preventDefault();
        const key = enabledKeys[(next + enabledKeys.length) % enabledKeys.length];
        event.currentTarget.querySelector<HTMLButtonElement>(`[data-command="${key}"]`)?.focus();
      }}
    >
      <Flex direction="row" gap="xs">
        {marks.map(([key, labelKey, Icon]) => (
          <Toggle
            key={key}
            type="button"
            size="sm"
            variant="quiet"
            aria-label={label(labelKey)}
            title={label(labelKey)}
            pressed={state.marks.includes(key)}
            onPressedChange={(pressed) =>
              applyMarks(
                editor,
                state.marks,
                pressed ? [...state.marks, key] : state.marks.filter((mark) => mark !== key),
              )
            }
            disabled={disabled}
            {...focusProps(key)}
          >
            <Icon aria-hidden="true" />
          </Toggle>
        ))}
      </Flex>
      {blocks.map((group, index) => (
        <Flex key={index} direction="row" gap="xs">
          {group.map(([key, labelKey, Icon]) => (
            <Toggle
              key={key}
              type="button"
              size="sm"
              variant="quiet"
              aria-label={label(labelKey)}
              title={label(labelKey)}
              pressed={state.block === key}
              onPressedChange={(pressed) => applyBlock(editor, pressed ? key : "")}
              disabled={disabled}
              {...focusProps(key)}
            >
              <Icon aria-hidden="true" />
            </Toggle>
          ))}
        </Flex>
      ))}
      <Flex direction="row" gap="xs">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={label("undo")}
          title={label("undo")}
          disabled={disabled || !state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
          {...focusProps("undo")}
        >
          <Undo2 aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={label("redo")}
          title={label("redo")}
          disabled={disabled || !state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
          {...focusProps("redo")}
        >
          <Redo2 aria-hidden="true" />
        </Button>
      </Flex>
    </div>
  );
}
