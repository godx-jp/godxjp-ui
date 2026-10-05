import * as React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { ChevronDown, LoaderCircle, TriangleAlert } from "lucide-react";
import { parse } from "@godxjp/markdown/codec";
import { Input, Select, Textarea } from "@godxjp/ui/data-entry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import { Button, Text } from "@godxjp/ui/general";

import { Embed, RawBlock } from "./extensions";
import { useLabel } from "./labels";

/**
 * Markdown the document does not model, shown as its source and editable as source. On "Done" the
 * text is parsed again: if it now IS something the editor models (the HTML was replaced by a list,
 * the malformed fence fixed), it becomes those blocks; otherwise it stays a raw block.
 */
function RawBlockView({ node, editor, getPos, updateAttributes, selected }: NodeViewProps) {
  const tr = useLabel();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(node.attrs.source as string);
  const commit = () => {
    setEditing(false);
    const doc = parse(draft);
    const pos = getPos();
    const stillRaw = doc.content.length === 1 && doc.content[0]!.type === "rawBlock";
    if (stillRaw || typeof pos !== "number") {
      updateAttributes({ source: draft });
      return;
    }
    editor
      .chain()
      .focus()
      .insertContentAt({ from: pos, to: pos + node.nodeSize }, doc.content)
      .run();
  };
  return (
    <NodeViewWrapper
      className="ui-block-editor-raw-block"
      data-selected={selected ? "" : undefined}
    >
      <div className="ui-block-editor-raw-block-head" contentEditable={false}>
        <Text size="xs" tone="muted">
          {tr("rawBlock")}
        </Text>
        {editor.isEditable ? (
          <Button
            size="xs"
            variant="ghost"
            onClick={() =>
              editing ? commit() : (setDraft(node.attrs.source as string), setEditing(true))
            }
          >
            {editing ? tr("done") : tr("editSource")}
          </Button>
        ) : null}
      </div>
      {editing ? (
        <Textarea
          aria-label={tr("rawBlock")}
          value={draft}
          rows={Math.min(12, Math.max(3, draft.split("\n").length))}
          onValueChange={setDraft}
          onKeyDown={(event) => {
            // The textarea is inside the editor's DOM: keep its keys out of ProseMirror.
            event.stopPropagation();
            if (event.key === "Escape") commit();
          }}
          autoFocus
        />
      ) : (
        <pre className="ui-block-editor-raw-block-source" contentEditable={false}>
          {node.attrs.source as string}
        </pre>
      )}
    </NodeViewWrapper>
  );
}

export function rawBlockNode(): Node {
  return RawBlock.extend({ addNodeView: () => ReactNodeViewRenderer(RawBlockView) }) as Node;
}

export function embedNode(render: ((target: string) => React.ReactNode) | undefined): Node {
  function EmbedView({ node, selected }: NodeViewProps) {
    const tr = useLabel();
    const target = node.attrs.target as string;
    return (
      <NodeViewWrapper
        className="ui-block-editor-embed"
        data-selected={selected ? "" : undefined}
        contentEditable={false}
      >
        {render ? (
          render(target)
        ) : (
          <Text size="sm" tone="muted">
            {tr("embed", { target })}
          </Text>
        )}
      </NodeViewWrapper>
    );
  }
  return Embed.extend({ addNodeView: () => ReactNodeViewRenderer(EmbedView) }) as Node;
}

/** An upload in flight. Transient: the codec has no such node, so it is never serialized. */
export type UploadState = { name: string; status: "uploading" | "error" };

export function uploadNode(actions: {
  retry: (id: string) => void;
  remove: (id: string) => void;
}): Node {
  function UploadView({ node }: NodeViewProps) {
    const tr = useLabel();
    const { id, name, status } = node.attrs as {
      id: string;
      name: string;
      status: UploadState["status"];
    };
    return (
      // A plain span, not NodeViewWrapper: Tiptap's wrapper spreads its `as` prop onto the DOM as an
      // invalid attribute, and this inline view needs nothing else it adds (no drag).
      <span
        data-node-view-wrapper=""
        className="ui-block-editor-upload"
        data-status={status}
        contentEditable={false}
      >
        {status === "uploading" ? (
          <>
            <LoaderCircle className="ui-block-editor-upload-spinner" aria-hidden="true" />
            <Text as="span" size="sm" tone="muted" role="status">
              {tr("uploading", { name })}
            </Text>
          </>
        ) : (
          <>
            <TriangleAlert aria-hidden="true" />
            <Text as="span" size="sm" tone="destructive" role="alert">
              {tr("uploadFailed", { name })}
            </Text>
            <Button size="xs" variant="ghost" onClick={() => actions.retry(id)}>
              {tr("retry")}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => actions.remove(id)}>
              {tr("remove")}
            </Button>
          </>
        )}
      </span>
    );
  }
  return Node.create({
    name: "uploadPlaceholder",
    group: "inline",
    inline: true,
    atom: true,
    selectable: false,
    addAttributes() {
      return { id: { default: "" }, name: { default: "" }, status: { default: "uploading" } };
    },
    parseHTML() {
      return [{ tag: "span[data-upload]" }];
    },
    renderHTML({ HTMLAttributes }) {
      return ["span", mergeAttributes(HTMLAttributes, { "data-upload": "" })];
    },
    addNodeView: () => ReactNodeViewRenderer(UploadView, { as: "span" }),
  }) as Node;
}

const CALLOUT_KINDS = ["note", "tip", "important", "warning", "caution"] as const;
type CalloutKind = (typeof CALLOUT_KINDS)[number];
const kindLabelKey = {
  note: "calloutNote",
  tip: "calloutTip",
  important: "calloutImportant",
  warning: "calloutWarning",
  caution: "calloutCaution",
} as const;

/**
 * A callout you can retype and retitle in place (phase 2): the kind is a menu of the five GitHub
 * alert kinds (a radio group — one is current), the title an inline field whose placeholder is the
 * kind's default title. Read-only, it draws exactly what the renderer draws.
 */
function CalloutView({ node, updateAttributes, editor }: NodeViewProps) {
  const label = useLabel();
  const kind = node.attrs.kind as CalloutKind;
  const title = (node.attrs.title as string | null) ?? "";
  const defaultTitle = label(kindLabelKey[kind] ?? "calloutNote");
  return (
    <NodeViewWrapper className="ui-prose-callout" data-type="callout" data-kind={kind} role="note">
      {editor.isEditable ? (
        <div className="ui-block-editor-callout-head" contentEditable={false}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                variant="ghost"
                aria-label={`${label("calloutKind")}: ${defaultTitle}`}
              >
                {defaultTitle}
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" aria-label={label("calloutKind")}>
              <DropdownMenuRadioGroup
                value={kind}
                onValueChange={(next) => updateAttributes({ kind: next })}
              >
                {CALLOUT_KINDS.map((k) => (
                  <DropdownMenuRadioItem key={k} value={k}>
                    {label(kindLabelKey[k])}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            size="sm"
            className="ui-block-editor-callout-title"
            aria-label={label("calloutTitle")}
            placeholder={defaultTitle}
            value={title}
            onValueChange={(next) => updateAttributes({ title: next.trim() === "" ? null : next })}
          />
        </div>
      ) : (
        <p className="ui-prose-callout-title" contentEditable={false}>
          {title || defaultTitle}
        </p>
      )}
      <NodeViewContent className="ui-block-editor-callout-body" />
    </NodeViewWrapper>
  );
}

export function calloutNode(base: Node): Node {
  return base.extend({ addNodeView: () => ReactNodeViewRenderer(CalloutView) }) as Node;
}

const WIDTHS = [25, 33, 50, 67, 75] as const;

/**
 * A column row you can reshape (phase 2): while the caret is inside, a bar offers Add a column
 * (up to 4), Remove this column (down to 2) and this column's width (auto, or a share of the row)
 * — the keyboard path to what a drag would do.
 */
function ColumnsView({ node, editor, getPos }: NodeViewProps) {
  const label = useLabel();
  const [current, setCurrent] = React.useState<number | null>(null);

  React.useEffect(() => {
    const read = () => {
      const pos = getPos();
      if (typeof pos !== "number") return setCurrent(null);
      const { $from } = editor.state.selection;
      for (let depth = $from.depth; depth > 0; depth--) {
        if ($from.node(depth).type.name === "columns" && $from.before(depth) === pos) {
          return setCurrent($from.index(depth));
        }
      }
      setCurrent(null);
    };
    read();
    editor.on("selectionUpdate", read);
    editor.on("update", read);
    return () => {
      editor.off("selectionUpdate", read);
      editor.off("update", read);
    };
  }, [editor, getPos]);

  const columnPos = (index: number) => {
    const pos = getPos();
    if (typeof pos !== "number") return null;
    let at = pos + 1;
    for (let i = 0; i < index; i++) at += node.child(i).nodeSize;
    return at;
  };

  const addColumn = () => {
    const pos = getPos();
    if (typeof pos !== "number" || node.childCount >= 4) return;
    const end = pos + node.nodeSize - 1;
    const column = editor.schema.nodes.column!.create(
      null,
      editor.schema.nodes.paragraph!.create(),
    );
    editor.view.dispatch(editor.state.tr.insert(end, column));
  };
  const removeColumn = () => {
    if (current == null || node.childCount <= 2) return;
    const at = columnPos(current);
    if (at == null) return;
    editor.view.dispatch(editor.state.tr.delete(at, at + node.child(current).nodeSize));
  };
  const setWidth = (value: string) => {
    if (current == null) return;
    const at = columnPos(current);
    if (at == null) return;
    const width = value === "auto" ? null : Number(value);
    editor.view.dispatch(editor.state.tr.setNodeAttribute(at, "width", width));
  };

  const width =
    current == null ? null : ((node.child(current).attrs.width as number | null) ?? null);
  return (
    <NodeViewWrapper className="ui-block-editor-columns" data-type="columns">
      {editor.isEditable && current != null ? (
        <div className="ui-block-editor-columns-bar" contentEditable={false}>
          <Button size="xs" variant="ghost" disabled={node.childCount >= 4} onClick={addColumn}>
            {label("addColumn")}
          </Button>
          <Button size="xs" variant="ghost" disabled={node.childCount <= 2} onClick={removeColumn}>
            {label("removeColumn")}
          </Button>
          <Select
            size="xs"
            aria-label={label("columnWidth")}
            value={width == null ? "auto" : String(width)}
            onValueChange={setWidth}
            options={[
              { value: "auto", label: label("widthAuto") },
              ...WIDTHS.map((w) => ({ value: String(w), label: `${w}%` })),
            ]}
          />
        </div>
      ) : null}
      <NodeViewContent className="ui-block-editor-columns-content" />
    </NodeViewWrapper>
  );
}

export function columnsNode(base: Node): Node {
  return base.extend({ addNodeView: () => ReactNodeViewRenderer(ColumnsView) }) as Node;
}
