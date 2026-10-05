import * as React from "react";
import { getMarkRange, type Editor, type Range } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { FileText } from "lucide-react";
import { normalize, parse, serialize, type DocNode } from "@godxjp/markdown/codec";
import { Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";

import { BlockKeys, insertParagraphAfter } from "./blocks";
import {
  builtinCommands,
  filterCommands,
  suggestionTrigger,
  TURN_INTO,
  type BlockEditorCommand,
  type SuggestionBridge,
} from "./commands";
import { Callout, Columns, schemaExtensions } from "./extensions";
import { BlockHandle } from "./handle";
import { LabelsContext, type LabelFn } from "./labels";
import {
  BLOCK_EDITOR_MESSAGES,
  ensureBlockEditorMessages,
  type BlockEditorLabels,
} from "./messages";
import { SuggestionMenu, type SuggestionMenuItem } from "./suggestion-menu";
import { FormatToolbar } from "./toolbar";
import { EditDrawer, type EditTarget } from "./edit-drawer";
import { calloutNode, columnsNode, embedNode, rawBlockNode, uploadNode } from "./views";

/** What the host's storage returns for one file — the same shape as MarkdownEditor's. */
export type BlockEditorUploadResult = { url: string; name?: string };

/** A row the host's `[[` source returns. `label` is what the link shows instead of the target. */
export type WikilinkSuggestion = {
  target: string;
  label?: string;
  heading?: string;
  description?: string;
};

/** What a host command (an extra `/` row) is handed. */
export type BlockEditorApi = {
  editor: Editor;
  /** Insert Markdown at the caret, parsed through the codec. */
  insertMarkdown: (markdown: string) => void;
  markdown: () => string;
};

export type BlockEditorAction = {
  key: string;
  label: string;
  icon: React.ReactNode;
  keywords?: readonly string[];
  run: (api: BlockEditorApi) => void;
};

export type BlockEditorProps = {
  /** The body, as Markdown. Controlled with `onValueChange`; uncontrolled with `defaultValue`. */
  value?: string;
  defaultValue?: string;
  /** Called with the canonical Markdown (`@godxjp/markdown/codec` `serialize`) after each edit. */
  onValueChange?: (markdown: string) => void;
  /**
   * Stores a pasted, dropped or chosen file and returns its URL (`asset:<id>` is fine). Aborted
   * with `signal` when the placeholder block is removed. Omit it and files are not accepted.
   */
  upload?: (file: File, options: { signal: AbortSignal }) => Promise<BlockEditorUploadResult>;
  /** The host's media library. When set, the `/` Image row opens it instead of a file picker. */
  pickMedia?: () => Promise<BlockEditorUploadResult | null>;
  /** When set, files are refused with this message (a quota, a read-only space). */
  uploadBlockedReason?: string | null;
  /** `[[` suggestions — the host's page index. Omit it and `[[…]]` is still typed as text. */
  suggestWikilinks?: (query: string) => WikilinkSuggestion[] | Promise<WikilinkSuggestion[]>;
  /** Renders a block embed (`![[target]]`). Default: a labelled placeholder. */
  renderEmbed?: (target: string) => React.ReactNode;
  /** Resolves a stored image URL (`asset:<id>`) for display. The body keeps the original. */
  resolveUrl?: (url: string) => string | undefined;
  /** Extra `/` rows after the built-in blocks — the extension point for host block types. */
  actions?: readonly BlockEditorAction[];
  /** Override any string the editor renders (defaults: the kit's ja / en / vi catalogue). */
  labels?: Partial<BlockEditorLabels>;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

export type BlockEditorHandle = {
  focus: () => void;
  /** The current body, serialized. */
  markdown: () => string;
  /** The Tiptap editor, for host integrations. */
  editor: Editor | null;
};

type MenuState<I> = {
  items: I[];
  active: string | undefined;
  rect: DOMRect | null;
  command: (item: I) => void;
} | null;

/** One suggestion menu's React side: the plugin opens and filters it, React draws it. */
function useSuggestion<I>(
  toMenuItem: (item: I) => SuggestionMenuItem,
  items: (query: string) => I[] | Promise<I[]>,
  pick: (editor: Editor, range: Range, item: I) => void,
) {
  const [menu, setMenu] = React.useState<MenuState<I>>(null);
  const menuRef = React.useRef(menu);
  menuRef.current = menu;
  const bridge = React.useRef<SuggestionBridge<I> | null>(null);
  const show = (props: SuggestionProps<I>) =>
    setMenu((prev) => {
      const first = props.items[0] ? toMenuItem(props.items[0]).value : undefined;
      const keep = prev?.active && props.items.some((i) => toMenuItem(i).value === prev.active);
      return {
        items: props.items,
        active: keep ? prev!.active : first,
        rect: props.clientRect?.() ?? null,
        command: props.command,
      };
    });
  bridge.current = {
    items,
    pick,
    onStart: show,
    onUpdate: show,
    onExit: () => setMenu(null),
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      const current = menuRef.current;
      if (!current) return false;
      const values = current.items.map((i) => toMenuItem(i).value);
      const at = Math.max(0, values.indexOf(current.active ?? ""));
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!values.length) return true;
        const next =
          values[(at + (event.key === "ArrowDown" ? 1 : -1) + values.length) % values.length];
        setMenu({ ...current, active: next });
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        const item = current.items[at];
        if (!item) return false;
        current.command(item);
        return true;
      }
      if (event.key === "Escape") {
        setMenu(null);
        return true;
      }
      return false;
    },
  };
  return { menu, setMenu, bridge };
}

let uploadSeq = 0;

/**
 * BlockEditor (gh#1156) — a Notion / note.com style block editor that reads and writes MARKDOWN.
 *
 * Its document is `@godxjp/markdown/codec`'s: `value` is parsed by the codec, every edit is
 * serialized by it, so what `onValueChange` hands back is byte-for-byte `normalize(body)` — the
 * same canonical form a server computes. The surface is the kit's `Prose`, so the body looks the
 * way the published page draws it. `/` opens the block menu at the caret; ⋮⋮ beside a block drags
 * it and opens its menu (turn into, duplicate, move, delete); selecting text raises the format
 * toolbar. Japanese IME composition is never interrupted: menus read the committed document.
 */
export const BlockEditor = React.forwardRef<BlockEditorHandle, BlockEditorProps>(
  function BlockEditor(
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      upload,
      pickMedia,
      uploadBlockedReason = null,
      suggestWikilinks,
      renderEmbed,
      resolveUrl,
      actions = [],
      labels,
      disabled = false,
      readOnly = false,
      autoFocus = false,
      id,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
    },
    ref,
  ) {
    ensureBlockEditorMessages();
    const { t } = useTranslation();
    const label = React.useCallback<LabelFn>(
      (key, params) => labels?.[key] ?? t(`blockEditor.${key}`, params),
      [labels, t],
    );
    const labelRef = React.useRef(label);
    labelRef.current = label;

    const hostRef = React.useRef<HTMLDivElement | null>(null);
    const [host, setHost] = React.useState<HTMLDivElement | null>(null);
    const [status, setStatus] = React.useState<string | null>(null);
    const [menuRequest, setMenuRequest] = React.useState<{ start: number; nonce: number } | null>(
      null,
    );
    const fileInput = React.useRef<HTMLInputElement | null>(null);
    const [editTarget, setEditTarget] = React.useState<EditTarget | null>(null);
    // Set while the file picker is open to REPLACE an image (its position), not to insert one.
    const replacing = React.useRef<number | null>(null);

    // Live props, read from inside long-lived editor callbacks.
    const live = React.useRef({
      onValueChange,
      upload,
      pickMedia,
      uploadBlockedReason,
      suggestWikilinks,
      actions,
    });
    live.current = {
      onValueChange,
      upload,
      pickMedia,
      uploadBlockedReason,
      suggestWikilinks,
      actions,
    };

    const initial = valueProp ?? defaultValue;
    const lastMarkdown = React.useRef<string>(normalize(initial));

    // ── uploads ──────────────────────────────────────────────────────────────────────────────────
    const uploads = React.useRef(new Map<string, { file: File; controller: AbortController }>());
    const editorRef = React.useRef<Editor | null>(null);

    const findUpload = (editor: Editor, uploadId: string) => {
      let found: { pos: number; size: number } | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (found) return false;
        if (node.type.name === "uploadPlaceholder" && node.attrs.id === uploadId)
          found = { pos, size: node.nodeSize };
        return true;
      });
      return found as { pos: number; size: number } | null;
    };

    const runUpload = React.useCallback((uploadId: string) => {
      const entry = uploads.current.get(uploadId);
      const editor = editorRef.current;
      const store = live.current.upload;
      if (!entry || !editor || !store) return;
      const { file, controller } = entry;
      store(file, { signal: controller.signal })
        .then((result) => {
          const target = findUpload(editor, uploadId);
          uploads.current.delete(uploadId);
          if (!target) return;
          const name = result.name ?? file.name;
          const node: DocNode = file.type.startsWith("image/")
            ? { type: "image", attrs: { src: result.url, alt: name, title: null } }
            : {
                type: "text",
                text: name,
                marks: [{ type: "link", attrs: { href: result.url, title: null } }],
              };
          editor
            .chain()
            .insertContentAt({ from: target.pos, to: target.pos + target.size }, node)
            .run();
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          const target = findUpload(editor, uploadId);
          if (!target) return;
          editor.view.dispatch(editor.state.tr.setNodeAttribute(target.pos, "status", "error"));
        });
    }, []);

    const startUploads = React.useCallback(
      (editor: Editor, files: File[], at?: number) => {
        if (files.length === 0) return false;
        const blocked = live.current.uploadBlockedReason;
        if (blocked || !live.current.upload) {
          if (blocked) setStatus(blocked);
          return Boolean(blocked);
        }
        const nodes = files.map((file) => {
          const uploadId = `upload-${++uploadSeq}`;
          uploads.current.set(uploadId, { file, controller: new AbortController() });
          return {
            uploadId,
            node: {
              type: "uploadPlaceholder",
              attrs: { id: uploadId, name: file.name, status: "uploading" },
            },
          };
        });
        const position = at ?? editor.state.selection.from;
        editor
          .chain()
          .focus()
          .insertContentAt(
            position,
            nodes.map((n) => n.node),
          )
          .run();
        for (const { uploadId } of nodes) runUpload(uploadId);
        return true;
      },
      [runUpload],
    );

    const uploadActions = React.useMemo(
      () => ({
        retry: (uploadId: string) => {
          const editor = editorRef.current;
          const entry = uploads.current.get(uploadId);
          if (!editor || !entry) return;
          entry.controller = new AbortController();
          const target = findUpload(editor, uploadId);
          if (target)
            editor.view.dispatch(
              editor.state.tr.setNodeAttribute(target.pos, "status", "uploading"),
            );
          runUpload(uploadId);
        },
        remove: (uploadId: string) => {
          const editor = editorRef.current;
          const target = editor ? findUpload(editor, uploadId) : null;
          if (editor && target)
            editor
              .chain()
              .focus()
              .deleteRange({ from: target.pos, to: target.pos + target.size })
              .run();
        },
      }),
      [runUpload],
    );

    const insertImage = React.useCallback((editor: Editor) => {
      const pick = live.current.pickMedia;
      if (pick) {
        const at = editor.state.selection.from;
        void pick().then((media) => {
          if (media)
            editor
              .chain()
              .focus()
              .insertContentAt(at, {
                type: "image",
                attrs: { src: media.url, alt: media.name ?? "", title: null },
              })
              .run();
        });
        return;
      }
      fileInput.current?.click();
    }, []);

    // ── link / image drawer ───────────────────────────────────────────────────────────────────
    /** The link under `pos` (its whole range), or — with a text selection — a link to create. */
    const linkTargetAt = React.useCallback(
      (
        editor: Editor,
        pos: number,
        selection?: { from: number; to: number },
      ): EditTarget | null => {
        const { state } = editor;
        const type = state.schema.marks.link!;
        const $pos = state.doc.resolve(pos);
        const range = getMarkRange($pos, type);
        if (range) {
          const mark =
            $pos.marks().find((m) => m.type === type) ??
            state.doc.nodeAt(range.from)?.marks.find((m) => m.type === type);
          return {
            kind: "link",
            from: range.from,
            to: range.to,
            text: state.doc.textBetween(range.from, range.to),
            href: (mark?.attrs.href as string | undefined) ?? "",
            title: (mark?.attrs.title as string | null | undefined) ?? "",
          };
        }
        if (selection && selection.from !== selection.to) {
          return {
            kind: "link",
            from: selection.from,
            to: selection.to,
            text: state.doc.textBetween(selection.from, selection.to),
            href: "",
            title: "",
          };
        }
        return null;
      },
      [],
    );

    const editLinkAtSelection = React.useCallback(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const target = linkTargetAt(editor, from, { from, to });
      if (target) setEditTarget(target);
    }, [linkTargetAt]);

    const replaceImage = React.useCallback((pos: number) => {
      const editor = editorRef.current;
      if (!editor) return;
      const pick = live.current.pickMedia;
      if (pick) {
        void pick().then((media) => {
          const node = editor.state.doc.nodeAt(pos);
          if (!media || node?.type.name !== "image") return;
          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              src: media.url,
              alt: media.name ?? node.attrs.alt,
            }),
          );
        });
        return;
      }
      replacing.current = pos;
      fileInput.current?.click();
    }, []);

    // ── commands ─────────────────────────────────────────────────────────────────────────────────
    const canInsertImage = Boolean(pickMedia || upload);
    const commands = React.useMemo<BlockEditorCommand[]>(() => {
      const builtin = builtinCommands(
        Object.fromEntries(
          Object.keys(BLOCK_EDITOR_MESSAGES.en).map((k) => [
            k,
            label(k as keyof BlockEditorLabels),
          ]),
        ) as BlockEditorLabels,
        canInsertImage ? insertImage : null,
      );
      const host = actions.map<BlockEditorCommand>((action) => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        keywords: action.keywords,
        run: (editor) =>
          action.run({
            editor,
            insertMarkdown: (markdown) =>
              editor.chain().focus().insertContent(parse(markdown).content).run(),
            markdown: () => serialize(editor.getJSON()),
          }),
      }));
      return [...builtin, ...host];
    }, [actions, canInsertImage, insertImage, label]);
    const commandsRef = React.useRef(commands);
    commandsRef.current = commands;
    const turnInto = React.useMemo(
      () => commands.filter((c) => (TURN_INTO as readonly string[]).includes(c.key)),
      [commands],
    );

    const slash = useSuggestion<BlockEditorCommand>(
      (c) => ({ value: c.key, label: c.label, icon: c.icon }),
      (query) => filterCommands(commandsRef.current, query),
      (editor, range, command) => {
        editor.chain().focus().deleteRange(range).run();
        command.run(editor);
      },
    );

    const wiki = useSuggestion<WikilinkSuggestion>(
      (s) => ({
        value: `${s.target}#${s.heading ?? ""}`,
        label: s.label ?? s.target,
        description: s.description,
        icon: <FileText />,
      }),
      (query) => live.current.suggestWikilinks?.(query) ?? [],
      (editor, range, item) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: "wikilink",
            attrs: {
              target: item.target,
              heading: item.heading ?? null,
              label: item.label ?? null,
            },
          })
          .run();
      },
    );

    // ── editor ───────────────────────────────────────────────────────────────────────────────────
    const extensions = React.useMemo(
      () => [
        ...schemaExtensions({
          placeholder: labelRef.current("placeholder"),
          headingPlaceholder: (level) => labelRef.current("placeholderHeading", { level }),
          togglePlaceholder: labelRef.current("placeholderToggle"),
          calloutTitles: {
            note: labelRef.current("calloutNote"),
            tip: labelRef.current("calloutTip"),
            important: labelRef.current("calloutImportant"),
            warning: labelRef.current("calloutWarning"),
            caution: labelRef.current("calloutCaution"),
          },
          embed: embedNode(renderEmbed),
          rawBlock: rawBlockNode(),
          callout: calloutNode(Callout),
          columns: columnsNode(Columns),
          toggleLabel: (open) => labelRef.current(open ? "collapseToggle" : "expandToggle"),
          resolveUrl,
        }),
        uploadNode(uploadActions),
        BlockKeys.configure({
          openMenu: (start) => setMenuRequest({ start, nonce: Date.now() }),
          editLink: () => editLinkRef.current(),
        }),
        suggestionTrigger("slashMenu", "/", slash.bridge),
        // A Japanese keyboard types the full-width slash; it opens the same menu.
        suggestionTrigger("slashMenuWide", "／", slash.bridge),
        suggestionTrigger("wikilinkMenu", "[[", wiki.bridge, {
          allowSpaces: true,
          allowedPrefixes: null,
        }),
      ],
      // Built once per editor: labels are read through a ref, host callbacks through `live`.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const editLinkRef = React.useRef(editLinkAtSelection);
    editLinkRef.current = editLinkAtSelection;

    const editor = useEditor({
      extensions,
      content: parse(initial),
      editable: !disabled && !readOnly,
      autofocus: autoFocus ? "end" : false,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "ui-prose ui-block-editor-content",
          role: "textbox",
          "aria-multiline": "true",
          ...(id ? { id } : {}),
          ...(ariaLabelledby
            ? { "aria-labelledby": ariaLabelledby }
            : { "aria-label": ariaLabel ?? label("editor") }),
          ...(ariaDescribedby ? { "aria-describedby": ariaDescribedby } : {}),
        },
        // A click on a link or an image opens its settings drawer (text / URL / title; src / alt /
        // title). Read-only, links behave as links.
        handleClick: (view, pos) => {
          const instance = editorRef.current;
          if (!instance || !view.editable) return false;
          const target = linkTargetAt(instance, pos);
          if (!target) return false;
          setEditTarget(target);
          return true;
        },
        handleClickOn: (view, pos, node) => {
          if (!view.editable || node.type.name !== "image") return false;
          setEditTarget({
            kind: "image",
            pos,
            src: (node.attrs.src as string) ?? "",
            alt: (node.attrs.alt as string) ?? "",
            title: (node.attrs.title as string | null) ?? "",
          });
          return true;
        },
        // Copy writes Markdown, so a block pasted into a plain-text field reads as the body does.
        clipboardTextSerializer: (slice) =>
          serialize({ type: "doc", content: slice.content.toJSON() as DocNode[] }).trimEnd(),
        handlePaste: (view, event) => {
          const instance = editorRef.current;
          if (!instance) return false;
          const files = [...(event.clipboardData?.files ?? [])];
          if (files.length) return startUploads(instance, files);
          const html = event.clipboardData?.getData("text/html");
          const text = event.clipboardData?.getData("text/plain");
          // Plain text is read as Markdown (the codec), so `- item` pastes as a list. HTML (from a
          // web page or another editor) goes through the schema's own parser.
          if (!html && text && !view.state.selection.$from.parent.type.spec.code) {
            const doc = parse(text);
            instance.chain().focus().insertContent(doc.content).run();
            return true;
          }
          return false;
        },
        handleDrop: (view, event, _slice, moved) => {
          const instance = editorRef.current;
          if (moved || !instance) return false;
          const files = [...(event.dataTransfer?.files ?? [])];
          if (!files.length) return false;
          const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          event.preventDefault();
          return startUploads(instance, files, at);
        },
      },
      onUpdate: ({ editor: instance }) => {
        const markdown = serialize(instance.getJSON());
        // Abort an upload whose placeholder the user deleted.
        for (const [uploadId, entry] of uploads.current) {
          if (!findUpload(instance, uploadId)) {
            entry.controller.abort();
            uploads.current.delete(uploadId);
          }
        }
        if (markdown === lastMarkdown.current) return;
        lastMarkdown.current = markdown;
        live.current.onValueChange?.(markdown);
      },
    });
    editorRef.current = editor;

    // Controlled: a new `value` that is not what the editor just emitted replaces the document.
    // Never mid-composition — an IME session in progress would be torn down.
    React.useEffect(() => {
      if (!editor || valueProp === undefined) return;
      const next = normalize(valueProp);
      if (next === lastMarkdown.current || editor.view.composing) return;
      lastMarkdown.current = next;
      editor.commands.setContent(parse(valueProp), { emitUpdate: false });
    }, [editor, valueProp]);

    React.useEffect(() => {
      editor?.setEditable(!disabled && !readOnly);
    }, [editor, disabled, readOnly]);

    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => editor?.commands.focus(),
        markdown: () => (editor ? serialize(editor.getJSON()) : lastMarkdown.current),
        editor,
      }),
      [editor],
    );

    const openSlashBelow = (start: number) => {
      if (!editor) return;
      if (insertParagraphAfter(editor, start) == null) return;
      editor.chain().focus().insertContent("/").run();
    };

    const menuItems = (state: MenuState<BlockEditorCommand>) =>
      (state?.items ?? []).map((c) => ({ value: c.key, label: c.label, icon: c.icon }));

    return (
      <LabelsContext.Provider value={label}>
        <div
          ref={(node) => {
            hostRef.current = node;
            setHost(node);
          }}
          className={["ui-block-editor", className].filter(Boolean).join(" ")}
          data-disabled={disabled ? "" : undefined}
        >
          {editor ? (
            <>
              <BlockHandle
                editor={editor}
                host={host}
                turnInto={turnInto}
                onAddBelow={openSlashBelow}
                menuRequest={menuRequest}
              />
              <FormatToolbar editor={editor} onEditLink={editLinkAtSelection} />
              <EditDrawer
                editor={editor}
                target={editTarget}
                onClose={() => setEditTarget(null)}
                resolveUrl={resolveUrl}
                replaceImage={pickMedia || upload ? replaceImage : null}
              />
            </>
          ) : null}
          <EditorContent editor={editor} />
          <SuggestionMenu
            open={slash.menu != null}
            rect={slash.menu?.rect ?? null}
            host={host}
            items={menuItems(slash.menu)}
            active={slash.menu?.active}
            onActiveChange={(active) => slash.setMenu((m) => (m ? { ...m, active } : m))}
            onPick={(key) => {
              const item = slash.menu?.items.find((c) => c.key === key);
              if (item) slash.menu?.command(item);
            }}
            onDismiss={() => slash.setMenu(null)}
            label={label("blocks")}
            empty={label("noResults")}
            countLabel={t("dataEntry.chatSuggestion.count", {
              count: slash.menu?.items.length ?? 0,
            })}
            editable={editor?.view.dom ?? null}
          />
          <SuggestionMenu
            open={wiki.menu != null}
            rect={wiki.menu?.rect ?? null}
            host={host}
            items={(wiki.menu?.items ?? []).map((s) => ({
              value: `${s.target}#${s.heading ?? ""}`,
              label: s.label ?? s.target,
              description: s.description,
              icon: <FileText />,
            }))}
            active={wiki.menu?.active}
            onActiveChange={(active) => wiki.setMenu((m) => (m ? { ...m, active } : m))}
            onPick={(value) => {
              const item = wiki.menu?.items.find((s) => `${s.target}#${s.heading ?? ""}` === value);
              if (item) wiki.menu?.command(item);
            }}
            onDismiss={() => wiki.setMenu(null)}
            label={label("link")}
            empty={label("noResults")}
            countLabel={t("dataEntry.chatSuggestion.count", {
              count: wiki.menu?.items.length ?? 0,
            })}
            editable={editor?.view.dom ?? null}
          />
          {status ? (
            <Text size="sm" tone="destructive" role="alert" className="ui-block-editor-status">
              {status}
            </Text>
          ) : null}
          {canInsertImage && !pickMedia ? (
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              aria-hidden="true"
              tabIndex={-1}
              onChange={(event) => {
                const files = [...(event.currentTarget.files ?? [])];
                event.currentTarget.value = "";
                if (!editor) return;
                const at = replacing.current;
                replacing.current = null;
                if (at != null && files.length) {
                  const node = editor.state.doc.nodeAt(at);
                  if (node?.type.name === "image") {
                    editor.view.dispatch(editor.state.tr.delete(at, at + node.nodeSize));
                  }
                  startUploads(editor, files.slice(0, 1), at);
                  return;
                }
                startUploads(editor, files);
              }}
            />
          ) : null}
        </div>
      </LabelsContext.Provider>
    );
  },
);
