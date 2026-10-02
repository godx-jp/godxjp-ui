import * as React from "react";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Paperclip,
  Quote,
  SquareCode,
  Strikethrough,
} from "lucide-react";
import { Markdown } from "@godxjp/markdown";
import { Card, CardContent, Prose } from "@godxjp/ui/data-display";
import { Segmented, Textarea } from "@godxjp/ui/data-entry";
import { Actions, Text, type ActionsItemsProp } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, ResponsiveGrid } from "@godxjp/ui/layout";

import {
  applyEdit,
  insertCodeBlock,
  insertLink,
  prefixLines,
  uploadedMarkdown,
  wrapSelection,
  type Selection,
  type TextEdit,
} from "./format";
import { ensureEditorMessages, type MarkdownEditorLabels } from "./messages";

export type MarkdownEditorMode = "write" | "preview" | "split";

/** What a custom toolbar action (a later "board" block, a template picker) is handed. */
export type MarkdownEditorApi = {
  value: () => string;
  selection: () => Selection;
  /** Replace a range and select inside the result — one undo step. */
  edit: (edit: TextEdit) => void;
  /** Insert at the caret, replacing any selection. */
  insert: (text: string) => void;
  focus: () => void;
};

export type MarkdownEditorAction = {
  key: string;
  /** Accessible name and tooltip. */
  label: string;
  icon: React.ReactNode;
  run: (api: MarkdownEditorApi) => void;
};

/** What the host's storage returns for one file. */
export type MarkdownEditorUploadResult = { url: string; name?: string };

export type MarkdownEditorProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange" | "children"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  mode?: MarkdownEditorMode;
  defaultMode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
  /**
   * Stores a pasted, dropped or attached file and returns its URL. The HOST decides where bytes go
   * (an app's own storage today, the media service later). Omit it and files are not accepted.
   */
  upload?: (file: File) => Promise<MarkdownEditorUploadResult>;
  /** When set, files are refused with this message (a quota, a read-only space). */
  uploadBlockedReason?: string | null;
  /** The preview. Default: `<Prose><Markdown>{value}</Markdown></Prose>` from `@godxjp/markdown`. */
  renderPreview?: (value: string) => React.ReactNode;
  /** Extra toolbar actions, after the built-in ones — the extension point for new block types. */
  actions?: readonly MarkdownEditorAction[];
  /** Override any string the editor renders (defaults come from the kit's ja / en / vi catalogue). */
  labels?: Partial<MarkdownEditorLabels>;
  rows?: number;
};

/** The modifier a shortcut uses: ⌘ on Apple platforms, Ctrl elsewhere; either is accepted. */
const isMod = (event: React.KeyboardEvent) => event.metaKey || event.ctrlKey;

/**
 * A Markdown editor (gh#1109): a formatting toolbar, write / preview / side-by-side, the preview
 * rendered by `@godxjp/markdown` (the same sanitiser the published page uses), and paste / drop /
 * attach of files through a host-provided `upload`.
 *
 * It is the kit's `Textarea`, not a rich-text surface: Japanese IME composition, the native caret,
 * spell-check and the browser's undo all keep working, and every edit the toolbar makes goes
 * through `execCommand("insertText")` so it is ONE undo step. Shortcuts (⌘/Ctrl + B, I, K) never
 * fire mid-composition. The toolbar is the kit's `Actions` — a WAI-ARIA toolbar with one tab stop
 * and arrow-key movement.
 */
export const MarkdownEditor = React.forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      mode: modeProp,
      defaultMode = "write",
      onModeChange,
      upload,
      uploadBlockedReason = null,
      renderPreview,
      actions = [],
      labels,
      rows = 12,
      disabled,
      readOnly,
      onKeyDown,
      onPaste,
      onDrop,
      ...textareaProps
    },
    ref,
  ) {
    ensureEditorMessages();
    const { t } = useTranslation();
    const label = (key: keyof MarkdownEditorLabels, params?: Record<string, string>) =>
      labels?.[key] ?? t(`markdownEditor.${key}`, params);

    const [inner, setInner] = React.useState(defaultValue);
    const value = valueProp ?? inner;
    const valueRef = React.useRef(value);
    valueRef.current = value;
    const setValue = React.useCallback(
      (next: string) => {
        valueRef.current = next;
        if (valueProp === undefined) setInner(next);
        onValueChange?.(next);
      },
      [valueProp, onValueChange],
    );

    const [innerMode, setInnerMode] = React.useState<MarkdownEditorMode>(defaultMode);
    const mode = modeProp ?? innerMode;
    const setMode = (next: MarkdownEditorMode) => {
      if (modeProp === undefined) setInnerMode(next);
      onModeChange?.(next);
    };

    const area = React.useRef<HTMLTextAreaElement | null>(null);
    const setArea = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        area.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // A selection to restore after the edit has been committed and React re-rendered the value.
    const pendingSelection = React.useRef<Selection | null>(null);
    React.useLayoutEffect(() => {
      const node = area.current;
      const select = pendingSelection.current;
      if (!node || !select) return;
      pendingSelection.current = null;
      node.setSelectionRange(select.start, select.end);
    });

    const selection = (): Selection => {
      const node = area.current;
      return node
        ? { start: node.selectionStart, end: node.selectionEnd }
        : { start: valueRef.current.length, end: valueRef.current.length };
    };

    const editable = !disabled && !readOnly;

    /**
     * ONE undo step. `execCommand("insertText")` is the only way to change a textarea that the
     * browser records in its own undo stack; it also fires `input`, so React's onChange (and the
     * host's `onValueChange`) see it like typing. Where it is unavailable, the value is rewritten.
     */
    const edit = (change: TextEdit) => {
      const node = area.current;
      if (!node || !editable) return;
      node.focus();
      node.setSelectionRange(change.from, change.to);
      const expected = applyEdit(valueRef.current, change);
      let applied: boolean;
      try {
        applied = document.execCommand?.("insertText", false, change.insert) ?? false;
      } catch {
        applied = false;
      }
      if (!applied || node.value !== expected) setValue(expected);
      pendingSelection.current = change.select;
      if (applied && node.value === expected)
        node.setSelectionRange(change.select.start, change.select.end);
    };

    const api: MarkdownEditorApi = {
      value: () => valueRef.current,
      selection,
      edit,
      insert: (text) => {
        const { start, end } = selection();
        edit({
          from: start,
          to: end,
          insert: text,
          select: { start: start + text.length, end: start + text.length },
        });
      },
      focus: () => area.current?.focus(),
    };

    const wrap = (before: string, after = before) =>
      edit(wrapSelection(valueRef.current, selection(), before, after, label("placeholderText")));
    const lines = (prefix: string, numbered = false) =>
      edit(prefixLines(valueRef.current, selection(), prefix, { numbered }));

    // ---- uploads ---------------------------------------------------------------------------
    const [uploading, setUploading] = React.useState(0);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const uploadSeq = React.useRef(0);
    const fileInput = React.useRef<HTMLInputElement>(null);

    const acceptFiles = async (files: File[]) => {
      if (!upload || files.length === 0 || !editable) return;
      if (uploadBlockedReason) {
        setUploadError(uploadBlockedReason);
        return;
      }
      setUploadError(null);
      for (const file of files) {
        // A placeholder per file, unique, so concurrent uploads never replace each other's.
        const placeholder = `![${label("uploading")} ${file.name.replace(/[[\]\\]/g, "")} #${++uploadSeq.current}]()`;
        api.insert(placeholder);
        setUploading((n) => n + 1);
        try {
          const result = await upload(file);
          const markdown = uploadedMarkdown(file, result.url, result.name);
          const at = valueRef.current.indexOf(placeholder);
          if (at !== -1) {
            edit({
              from: at,
              to: at + placeholder.length,
              insert: markdown,
              select: { start: at + markdown.length, end: at + markdown.length },
            });
          }
        } catch {
          const at = valueRef.current.indexOf(placeholder);
          if (at !== -1)
            edit({
              from: at,
              to: at + placeholder.length,
              insert: "",
              select: { start: at, end: at },
            });
          setUploadError(label("uploadFailed", { name: file.name }));
        } finally {
          setUploading((n) => n - 1);
        }
      }
    };

    // ---- toolbar -----------------------------------------------------------------------------
    const builtIn: MarkdownEditorAction[] = [
      { key: "bold", label: label("bold"), icon: <Bold />, run: () => wrap("**") },
      { key: "italic", label: label("italic"), icon: <Italic />, run: () => wrap("_") },
      { key: "strike", label: label("strike"), icon: <Strikethrough />, run: () => wrap("~~") },
      { key: "heading", label: label("heading"), icon: <Heading2 />, run: () => lines("## ") },
      {
        key: "link",
        label: label("link"),
        icon: <Link2 />,
        run: () => edit(insertLink(valueRef.current, selection(), label("placeholderLink"))),
      },
      { key: "code", label: label("code"), icon: <Code />, run: () => wrap("`") },
      {
        key: "codeBlock",
        label: label("codeBlock"),
        icon: <SquareCode />,
        run: () => edit(insertCodeBlock(valueRef.current, selection())),
      },
      { key: "bulletList", label: label("bulletList"), icon: <List />, run: () => lines("- ") },
      {
        key: "numberedList",
        label: label("numberedList"),
        icon: <ListOrdered />,
        run: () => lines("", true),
      },
      {
        key: "taskList",
        label: label("taskList"),
        icon: <ListChecks />,
        run: () => lines("- [ ] "),
      },
      { key: "quote", label: label("quote"), icon: <Quote />, run: () => lines("> ") },
    ];
    if (upload) {
      builtIn.push({
        key: "attach",
        label: label("attach"),
        icon: <Paperclip />,
        run: () => fileInput.current?.click(),
      });
    }
    const all = [...builtIn, ...actions];
    const toolbarDisabled = !editable || mode === "preview";

    const onEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // Never mid-composition: Enter / ⌘B while choosing kanji belong to the IME.
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      if (!isMod(event) || event.altKey || event.shiftKey) return;
      const key = event.key.toLowerCase();
      const run = key === "b" ? "bold" : key === "i" ? "italic" : key === "k" ? "link" : null;
      if (!run) return;
      event.preventDefault();
      builtIn.find((action) => action.key === run)?.run(api);
    };

    const preview = (
      <Card variant="muted" aria-label={label("preview")} role="region">
        <CardContent>
          {value.trim() === "" ? (
            <Text tone="muted">{label("emptyPreview")}</Text>
          ) : (
            (renderPreview?.(value) ?? (
              <Prose>
                <Markdown>{value}</Markdown>
              </Prose>
            ))
          )}
        </CardContent>
      </Card>
    );

    const textarea = (
      <Textarea
        {...textareaProps}
        ref={setArea}
        value={value}
        onValueChange={setValue}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        onKeyDown={onEditorKeyDown}
        onPaste={(event) => {
          onPaste?.(event);
          const files = Array.from(event.clipboardData?.files ?? []);
          if (!event.defaultPrevented && upload && files.length > 0) {
            event.preventDefault();
            void acceptFiles(files);
          }
        }}
        onDrop={(event) => {
          onDrop?.(event);
          const files = Array.from(event.dataTransfer?.files ?? []);
          if (!event.defaultPrevented && upload && files.length > 0) {
            event.preventDefault();
            void acceptFiles(files);
          }
        }}
      />
    );

    return (
      <Flex direction="col" gap="xs" data-slot="markdown-editor" data-mode={mode}>
        <Flex justify="between" align="center" gap="xs" wrap>
          <Actions
            label={label("toolbar")}
            items={all.map((action): ActionsItemsProp => ({
              key: action.key,
              label: action.label,
              icon: action.icon,
              // aria-disabled, not removed: the toolbar keeps its shape and its focus order.
              disabled: toolbarDisabled,
              onItemClick: () => action.run(api),
            }))}
          />
          <Segmented
            size="sm"
            aria-label={label("mode")}
            value={mode}
            onValueChange={(next) => setMode(next as MarkdownEditorMode)}
            options={[
              { value: "write", label: label("write") },
              { value: "preview", label: label("preview") },
              { value: "split", label: label("split") },
            ]}
          />
        </Flex>
        {mode === "split" ? (
          <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="sm">
            {textarea}
            {preview}
          </ResponsiveGrid>
        ) : (
          <>
            {/* The textarea stays MOUNTED in preview mode — hidden, not removed — so its caret,
             * selection and undo history survive a look at the preview. */}
            <div hidden={mode === "preview"}>{textarea}</div>
            {mode === "preview" ? preview : null}
          </>
        )}
        {upload ? (
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            aria-hidden="true"
            tabIndex={-1}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              void acceptFiles(files);
            }}
          />
        ) : null}
        <div role="status" aria-live="polite">
          {uploading > 0 ? <Text tone="muted">{label("uploadingStatus")}</Text> : null}
        </div>
        {uploadError ? (
          <Text tone="destructive" role="alert">
            {uploadError}
          </Text>
        ) : null}
      </Flex>
    );
  },
);
