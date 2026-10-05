import * as React from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { parse } from "@godxjp/markdown/codec";
import { Textarea } from "@godxjp/ui/data-entry";
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
