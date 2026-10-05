import * as React from "react";
import type { Editor } from "@tiptap/core";
import { ArrowDown, ArrowUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@godxjp/ui/general";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";

import {
  blockStartAt,
  deleteBlock,
  duplicateBlock,
  focusBlock,
  moveBlock,
  selectionBlockStart,
  startBlockDrag,
} from "./blocks";
import type { BlockEditorCommand } from "./commands";
import { useLabel } from "./labels";

/**
 * The ⋮⋮ handle and the + beside the block under the pointer (or, on a touch screen and from the
 * keyboard, the block holding the caret). + adds a block below and opens the `/` menu there; ⋮⋮
 * drags the block, and a click (or Mod+/) opens its menu: turn into, duplicate, move, delete.
 */
export function BlockHandle({
  editor,
  host,
  turnInto,
  onAddBelow,
  menuRequest,
}: {
  editor: Editor;
  host: HTMLElement | null;
  turnInto: BlockEditorCommand[];
  onAddBelow: (start: number) => void;
  /** Set by the Mod+/ shortcut: open the menu for this block. */
  menuRequest: { start: number; nonce: number } | null;
}) {
  const label = useLabel();
  const [block, setBlock] = React.useState<{ start: number; top: number } | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pinned = React.useRef<number | null>(null);

  const place = React.useCallback(
    (start: number | null) => {
      if (start == null || !host) return setBlock(null);
      const dom = editor.view.nodeDOM(start);
      if (!(dom instanceof HTMLElement)) return setBlock(null);
      const top = dom.getBoundingClientRect().top - host.getBoundingClientRect().top;
      setBlock((prev) => (prev?.start === start && prev.top === top ? prev : { start, top }));
    },
    [editor, host],
  );

  // Pointer: the top-level block under the pointer's row.
  React.useEffect(() => {
    if (!host) return undefined;
    const onMove = (event: PointerEvent) => {
      if (menuOpen || event.pointerType === "touch") return;
      const children = [...editor.view.dom.children] as HTMLElement[];
      const row = children.find((child) => {
        const r = child.getBoundingClientRect();
        return event.clientY >= r.top && event.clientY <= r.bottom;
      });
      if (!row) return;
      place(blockStartAt(editor, editor.view.posAtDOM(row, 0)));
    };
    host.addEventListener("pointermove", onMove);
    return () => host.removeEventListener("pointermove", onMove);
  }, [editor, host, menuOpen, place]);

  // Caret: on a touch screen there is no hover, and the keyboard needs a block too.
  React.useEffect(() => {
    const onSelection = () => {
      if (!menuOpen && editor.isFocused) place(selectionBlockStart(editor));
    };
    editor.on("selectionUpdate", onSelection);
    editor.on("update", onSelection);
    return () => {
      editor.off("selectionUpdate", onSelection);
      editor.off("update", onSelection);
    };
  }, [editor, menuOpen, place]);

  React.useEffect(() => {
    if (!menuRequest) return;
    place(menuRequest.start);
    pinned.current = menuRequest.start;
    setMenuOpen(true);
  }, [menuRequest, place]);

  if (!block || !editor.isEditable) return null;
  const start = pinned.current ?? block.start;
  const run = (action: () => void) => () => {
    action();
    pinned.current = null;
  };

  return (
    <div className="ui-block-editor-handle" style={{ insetBlockStart: block.top }}>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label={label("addBlock")}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onAddBelow(block.start)}
      >
        <Plus />
      </Button>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (open) pinned.current = block.start;
          else pinned.current = null;
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={label("dragHandle")}
            draggable
            onDragStart={(event) => startBlockDrag(editor, block.start, event.nativeEvent)}
          >
            <GripVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" aria-label={label("blockActions")}>
          <DropdownMenuLabel>{label("blockActions")}</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{label("turnInto")}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {turnInto.map((command) => (
                <DropdownMenuItem
                  key={command.key}
                  onSelect={run(() => {
                    focusBlock(editor, start);
                    command.run(editor);
                  })}
                >
                  <span className="ui-block-editor-menu-icon" aria-hidden="true">
                    {command.icon}
                  </span>
                  {command.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={run(() => duplicateBlock(editor, start))}>
            <Copy aria-hidden="true" />
            {label("duplicate")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={run(() => void moveBlock(editor, start, -1))}>
            <ArrowUp aria-hidden="true" />
            {label("moveUp")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={run(() => void moveBlock(editor, start, 1))}>
            <ArrowDown aria-hidden="true" />
            {label("moveDown")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={run(() => deleteBlock(editor, start))}>
            <Trash2 aria-hidden="true" />
            {label("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
