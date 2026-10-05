import * as React from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link2, Strikethrough } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";

import { useLabel } from "./labels";

const MARKS = ["bold", "italic", "strike", "code"] as const;
type MarkName = (typeof MARKS)[number];

/**
 * The floating format toolbar over a text selection: the kit ToggleGroup (a WAI-ARIA toolbar of
 * toggle buttons with pressed state) for bold / italic / strike / code, and a link field. Only the
 * marks the codec writes back exist here — there is no underline because Markdown has none.
 */
export function FormatToolbar({ editor, onEditLink }: { editor: Editor; onEditLink: () => void }) {
  const label = useLabel();
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      marks: MARKS.filter((mark) => e.isActive(mark)),
      link: (e.getAttributes("link").href as string | undefined) ?? null,
    }),
  });

  const toggle = (next: string[]) => {
    const chain = editor.chain().focus();
    for (const mark of MARKS) {
      const on = next.includes(mark);
      if (on === state.marks.includes(mark)) continue;
      if (mark === "bold") chain.toggleBold();
      else if (mark === "italic") chain.toggleItalic();
      else if (mark === "strike") chain.toggleStrike();
      else chain.toggleCode();
    }
    chain.run();
  };

  return (
    <BubbleMenu
      editor={editor}
      className="ui-block-editor-toolbar"
      shouldShow={({ editor: e, state: s }) =>
        e.isEditable &&
        !s.selection.empty &&
        !e.isActive("codeBlock") &&
        s.selection.content().size > 0
      }
      options={{ placement: "top" }}
    >
      <div className="ui-block-editor-toolbar-row">
        <ToggleGroup
          type="multiple"
          size="sm"
          aria-label={label("formatting")}
          value={state.marks}
          onValueChange={toggle}
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
        <Button
          size="icon-sm"
          variant={state.link ? "secondary" : "ghost"}
          aria-label={label("link")}
          aria-pressed={state.link != null}
          // The link drawer: text, URL and title, with open / remove.
          onClick={onEditLink}
        >
          <Link2 />
        </Button>
      </div>
    </BubbleMenu>
  );
}

export type { MarkName };
