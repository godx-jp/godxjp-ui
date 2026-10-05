import { Extension, type Editor } from "@tiptap/core";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

/**
 * Top-level block operations, shared by the handle's menu, drag and the keyboard. A "block" is a
 * child of the document: a paragraph, a list (all its items), a table, a callout, a column row.
 */

/** Start position of the top-level block containing `pos`. */
export function blockStartAt(editor: Editor, pos: number): number | null {
  const { doc } = editor.state;
  if (pos < 0 || pos > doc.content.size) return null;
  const $pos = doc.resolve(pos);
  if ($pos.depth === 0) {
    // Between blocks (an atom's own position): the block AFTER it.
    return pos < doc.content.size ? pos : null;
  }
  return $pos.before(1);
}

export function selectionBlockStart(editor: Editor): number | null {
  return blockStartAt(editor, editor.state.selection.from);
}

function nodeAt(editor: Editor, start: number) {
  const node = editor.state.doc.nodeAt(start);
  return node ? { node, end: start + node.nodeSize } : null;
}

export function moveBlock(editor: Editor, start: number, direction: -1 | 1): number | null {
  const current = nodeAt(editor, start);
  if (!current) return null;
  const { doc } = editor.state;
  const $start = doc.resolve(start);
  const index = $start.index(0);
  const sibling =
    direction === -1
      ? index > 0
        ? doc.child(index - 1)
        : null
      : index < doc.childCount - 1
        ? doc.child(index + 1)
        : null;
  if (!sibling) return null;
  const tr = editor.state.tr.delete(start, current.end);
  const target = direction === -1 ? start - sibling.nodeSize : start + sibling.nodeSize;
  tr.insert(target, current.node);
  tr.setSelection(TextSelection.near(tr.doc.resolve(target + 1)));
  editor.view.dispatch(tr.scrollIntoView());
  return target;
}

export function duplicateBlock(editor: Editor, start: number): void {
  const current = nodeAt(editor, start);
  if (!current) return;
  const tr = editor.state.tr.insert(current.end, current.node.copy(current.node.content));
  tr.setSelection(TextSelection.near(tr.doc.resolve(current.end + 1)));
  editor.view.dispatch(tr.scrollIntoView());
}

export function deleteBlock(editor: Editor, start: number): void {
  const current = nodeAt(editor, start);
  if (!current) return;
  const tr = editor.state.tr.delete(start, current.end);
  // Never leave the document empty: the schema wants a block, and the caret needs somewhere.
  if (tr.doc.childCount === 0) tr.insert(0, editor.schema.nodes.paragraph!.create());
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(start, tr.doc.content.size))));
  editor.view.dispatch(tr.scrollIntoView());
}

/** Put the caret inside the block so a reshaping command (turn into) applies to it. */
export function focusBlock(editor: Editor, start: number): void {
  const current = nodeAt(editor, start);
  if (!current) return;
  const tr = editor.state.tr.setSelection(TextSelection.near(editor.state.doc.resolve(start + 1)));
  editor.view.dispatch(tr);
  editor.view.focus();
}

/** Insert an empty paragraph after the block and put the caret in it. */
export function insertParagraphAfter(editor: Editor, start: number): number | null {
  const current = nodeAt(editor, start);
  if (!current) return null;
  const tr = editor.state.tr.insert(current.end, editor.schema.nodes.paragraph!.create());
  tr.setSelection(TextSelection.create(tr.doc, current.end + 1));
  editor.view.dispatch(tr.scrollIntoView());
  editor.view.focus();
  return current.end;
}

/** Start a ProseMirror node drag of the block from a handle outside the editable. */
export function startBlockDrag(editor: Editor, start: number, event: DragEvent): void {
  const { view } = editor;
  const selection = NodeSelection.create(view.state.doc, start);
  view.dispatch(view.state.tr.setSelection(selection));
  view.dragging = { slice: selection.content(), move: true };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData("text/plain", "");
    const dom = view.nodeDOM(start);
    if (dom instanceof HTMLElement) event.dataTransfer.setDragImage(dom, 0, 0);
  }
}

/** Alt+Shift+↑/↓ moves the block; Mod+/ opens its menu (the handle, from the keyboard). */
export const BlockKeys = Extension.create<{ openMenu: (start: number) => void }>({
  name: "blockKeys",
  addOptions() {
    return { openMenu: () => undefined };
  },
  addKeyboardShortcuts() {
    const move = (direction: -1 | 1) => () => {
      const start = selectionBlockStart(this.editor);
      return start != null && moveBlock(this.editor, start, direction) != null;
    };
    return {
      "Alt-Shift-ArrowUp": move(-1),
      "Alt-Shift-ArrowDown": move(1),
      "Mod-/": () => {
        const start = selectionBlockStart(this.editor);
        if (start == null) return false;
        this.options.openMenu(start);
        return true;
      },
    };
  },
});
